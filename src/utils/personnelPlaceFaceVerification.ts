import supabase from '../config/supabase';
import {
  showVerificationError,
  showVerificationSuccess,
  showVerificationWarning
} from './verificationResultNotification';

async function getEntranceFaceImage(visitId: string): Promise<string | null> {
  try {
    const { data: visitRow, error: visitError } = await supabase
      .from('scheduled_visits')
      .select('gate_entrance_scanned, gate_entrance_scanned_at, gate_entrance_scanned_by')
      .eq('id', visitId)
      .single();

    if (visitError || !visitRow?.gate_entrance_scanned) {
      console.error('Error retrieving visit entrance metadata:', visitError);
      return null;
    }

    const { data: entranceScans, error } = await supabase
      .from('gate_scans')
      .select('face_image_data, scanned_at, scanned_by, face_detection_confidence')
      .eq('visit_id', visitId)
      .eq('scan_type', 'entrance')
      .not('face_image_data', 'is', null)
      .order('scanned_at', { ascending: false });

    if (error || !entranceScans || entranceScans.length === 0) {
      console.error('Error retrieving entrance face image:', error);
      return null;
    }

    const { processFaceImageForDisplay } = await import('./imageCompression');

    const entranceAt = visitRow.gate_entrance_scanned_at
      ? new Date(visitRow.gate_entrance_scanned_at).getTime()
      : null;
    const entranceBy = visitRow.gate_entrance_scanned_by || null;

    const orderedCandidates = [...entranceScans].sort((a, b) => {
      const score = (scan: any): number => {
        let total = 0;
        if (entranceBy && scan.scanned_by === entranceBy) total += 1000;
        if (entranceAt) {
          const scanTime = new Date(scan.scanned_at).getTime();
          const diffMs = Math.abs(scanTime - entranceAt);
          total += Math.max(0, 600000 - diffMs) / 1000;
        }
        const confidence = typeof scan.face_detection_confidence === 'number'
          ? scan.face_detection_confidence
          : 0;
        total += confidence * 100;
        return total;
      };

      return score(b) - score(a);
    });

    for (const scan of orderedCandidates) {
      const storedImageData = scan.face_image_data;
      if (!storedImageData || typeof storedImageData !== 'string' || storedImageData.length < 100) {
        continue;
      }

      const decryptedImage = processFaceImageForDisplay(storedImageData);
      if (decryptedImage && decryptedImage.startsWith('data:image/')) {
        return decryptedImage;
      }
    }

    return null;
  } catch (error) {
    console.error('Error in getEntranceFaceImage for personnel place verification:', error);
    return null;
  }
}

async function verifyFaces(
  entranceFaceImage: string,
  currentFaceImage: string
): Promise<{ match: boolean; similarity: number; error?: string; serviceUnavailable?: boolean }> {
  try {
    if (!entranceFaceImage || !entranceFaceImage.startsWith('data:image/')) {
      return { match: false, similarity: 0, error: 'Invalid entrance face image format' };
    }
    if (!currentFaceImage || !currentFaceImage.startsWith('data:image/')) {
      return { match: false, similarity: 0, error: 'Invalid current face image format' };
    }

    const { compressImageDataUrl } = await import('./imageCompression');
    const normalizedEntrance = await compressImageDataUrl(entranceFaceImage, 0.92, 512, 512).catch(() => entranceFaceImage);
    const normalizedProbe = await compressImageDataUrl(currentFaceImage, 0.92, 512, 512).catch(() => currentFaceImage);

    const {
      LOCAL_API_URL,
      DEPLOYED_API_URL,
      setApiUrlPreference
    } = await import('../config/python-api');

    const performVerification = async (apiUrl: string, baseImage: string, probeImage: string) => {
      const response = await fetch(`${apiUrl}/metrics/verify-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_image: baseImage,
          probe_image: probeImage
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Face verification failed');
      }

      return response.json();
    };

    const isNetworkError = (error: unknown): boolean => {
      if (error instanceof TypeError) return true;
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        return (
          message.includes('failed to fetch') ||
          message.includes('connection refused') ||
          message.includes('network')
        );
      }
      return false;
    };

    const handleResult = (result: any) => {
      if (!result) {
        return {
          match: false,
          similarity: 0,
          error: 'Invalid response from face verification service'
        };
      }

      if (!result.base?.found || !result.probe?.found) {
        return {
          match: false,
          similarity: 0,
          error: !result.base?.found ? 'Entrance face not detected' : 'Current face not detected'
        };
      }

      // 50% threshold requested for personnel place verification.
      const threshold = 0.5;
      const similarity = result.similarity || 0;
      const isMatch = result.match && similarity >= threshold;

      return {
        match: isMatch,
        similarity
      };
    };

    try {
      let result = await performVerification(LOCAL_API_URL, normalizedEntrance, normalizedProbe);
      if (!result?.base?.found || !result?.probe?.found) {
        result = await performVerification(LOCAL_API_URL, entranceFaceImage, currentFaceImage);
      }
      setApiUrlPreference('local');
      return handleResult(result);
    } catch (localError) {
      if (!isNetworkError(localError)) {
        throw localError;
      }

      try {
        let fallbackResult = await performVerification(DEPLOYED_API_URL, normalizedEntrance, normalizedProbe);
        if (!fallbackResult?.base?.found || !fallbackResult?.probe?.found) {
          fallbackResult = await performVerification(DEPLOYED_API_URL, entranceFaceImage, currentFaceImage);
        }
        setApiUrlPreference('deployed');
        return handleResult(fallbackResult);
      } catch (fallbackError) {
        return {
          match: false,
          similarity: 0,
          error: isNetworkError(fallbackError)
            ? 'Face verification service unavailable'
            : (fallbackError instanceof Error ? fallbackError.message : 'Face verification service unavailable'),
          serviceUnavailable: isNetworkError(fallbackError)
        };
      }
    }
  } catch (error) {
    const serviceUnavailable = error instanceof TypeError;
    return {
      match: false,
      similarity: 0,
      error: serviceUnavailable
        ? 'Face verification service unavailable'
        : (error instanceof Error ? error.message : 'Face verification failed'),
      serviceUnavailable
    };
  }
}

export async function verifyPersonnelPlaceFace(
  visitId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const entranceFaceImage = await getEntranceFaceImage(visitId);
    if (!entranceFaceImage) {
      showVerificationError('Face verification failed: no saved entrance face for this visit.');
      return {
        success: false,
        error: 'Unable to retrieve entrance face image for verification.'
      };
    }

    const { openFaceDetectionModal } = await import('./AI-Face-Detection/blazefaceModal');
    const faceResult = await openFaceDetectionModal({
      referenceImageDataUrl: entranceFaceImage,
      referenceTitle: 'Saved Entrance Face',
      referenceSubtitle: 'Personnel place verification reference'
    });

    if (!faceResult || !faceResult.success || !faceResult.croppedImageDataUrl) {
      showVerificationWarning('Face verification cancelled or no face detected. Please try again.');
      return {
        success: false,
        error: 'Face detection was not completed.'
      };
    }

    const { compressImageDataUrl } = await import('./imageCompression');
    const compressedCurrentImage = await compressImageDataUrl(faceResult.croppedImageDataUrl, 0.8, 400, 400);
    const verificationResult = await verifyFaces(entranceFaceImage, compressedCurrentImage);

    if (verificationResult.serviceUnavailable) {
      showVerificationError('Face verification service is unavailable. Mark complete is blocked.');
      return {
        success: false,
        error: 'Face verification service is unavailable.'
      };
    }

    if (verificationResult.error) {
      showVerificationError(`Face verification error: ${verificationResult.error}.`);
      return {
        success: false,
        error: verificationResult.error
      };
    }

    if (!verificationResult.match) {
      const similarityPercent = (verificationResult.similarity * 100).toFixed(1);
      showVerificationWarning(`Face verification failed: ${similarityPercent}% similarity (needs at least 50%).`);
      return {
        success: false,
        error: `Face does not match the entrance picture. Similarity: ${similarityPercent}%.`
      };
    }

    const similarityPercent = (verificationResult.similarity * 100).toFixed(1);
    showVerificationSuccess(`Face verified successfully (${similarityPercent}% match).`);
    return { success: true };
  } catch (error) {
    console.error('Error in verifyPersonnelPlaceFace:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred during face verification.'
    };
  }
}
