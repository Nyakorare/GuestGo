// Temporary Exit Face Verification
// This module handles face verification for temporary exit in the guard dashboard.
// It compares the current face to the entrance scan but does not save anything.

import supabase from '../config/supabase';
import {
  showVerificationError,
  showVerificationSuccess,
  showVerificationWarning
} from './verificationResultNotification';

/**
 * Retrieves the entrance face image for a visit
 */
async function getEntranceFaceImage(visitId: string): Promise<string | null> {
  try {
    // Anchor lookup to the exact scheduled visit entrance metadata first.
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
      .select('face_image_data, scanned_at, scanned_by')
      .eq('visit_id', visitId)
      .eq('scan_type', 'entrance')
      .not('face_image_data', 'is', null)
      .order('scanned_at', { ascending: false });

    if (error || !entranceScans || entranceScans.length === 0) {
      console.error('Error retrieving entrance face image:', error);
      return null;
    }

    // Decrypt the image data if it's encrypted
    // The stored image is already at 400x400 for verification purposes, so use it directly
    const { processFaceImageForDisplay } = await import('./imageCompression');

    const entranceAt = visitRow.gate_entrance_scanned_at
      ? new Date(visitRow.gate_entrance_scanned_at).getTime()
      : null;
    const entranceBy = visitRow.gate_entrance_scanned_by || null;

    // Prefer exact guard match and nearest timestamp to the visit's entrance metadata.
    const candidateScans = entranceBy
      ? entranceScans.filter((scan) => scan.scanned_by === entranceBy)
      : entranceScans;

    const orderedCandidates = [...candidateScans].sort((a, b) => {
      if (!entranceAt) return 0;
      const aTime = new Date(a.scanned_at).getTime();
      const bTime = new Date(b.scanned_at).getTime();
      return Math.abs(aTime - entranceAt) - Math.abs(bTime - entranceAt);
    });

    for (const scan of orderedCandidates) {
      const storedImageData = scan.face_image_data;
      if (!storedImageData || typeof storedImageData !== 'string') {
        continue;
      }

      const decryptedImage = processFaceImageForDisplay(storedImageData);
      if (decryptedImage && decryptedImage.startsWith('data:image/')) {
        return decryptedImage;
      }
    }

    console.warn('No valid entrance face image data URL found for the exact visit entrance scan.');
    return null;
  } catch (error) {
    console.error('Error in getEntranceFaceImage:', error);
    return null;
  }
}

/**
 * Verifies faces using Python AI API
 */
async function verifyFaces(entranceFaceImage: string, exitFaceImage: string): Promise<{ match: boolean; similarity: number; error?: string; serviceUnavailable?: boolean }> {
  try {
    // Validate that both images are valid base64 data URLs
    if (!entranceFaceImage || !entranceFaceImage.startsWith('data:image/')) {
      return { match: false, similarity: 0, error: 'Invalid entrance face image format' };
    }
    if (!exitFaceImage || !exitFaceImage.startsWith('data:image/')) {
      return { match: false, similarity: 0, error: 'Invalid exit face image format' };
    }

    const { 
      LOCAL_API_URL, 
      DEPLOYED_API_URL, 
      setApiUrlPreference 
    } = await import('../config/python-api');

    const performVerification = async (apiUrl: string) => {
      try {
        const response = await fetch(`${apiUrl}/metrics/verify-images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            base_image: entranceFaceImage,
            probe_image: exitFaceImage
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || 'Face verification failed');
        }

        return response.json();
      } catch (fetchError) {
        // Re-throw network errors as TypeError so they can be identified by isNetworkError
        if (fetchError instanceof TypeError || 
            (fetchError instanceof Error && 
             (fetchError.message.includes('Failed to fetch') || 
              fetchError.message.includes('ERR_CONNECTION_REFUSED') ||
              fetchError.message.includes('NetworkError')))) {
          throw new TypeError('Network error: Connection refused or service unavailable');
        }
        // Re-throw other errors as-is
        throw fetchError;
      }
    };

    const handleResult = (result: any) => {
      console.log('Temporary Exit Face Verification - handleResult called with:', JSON.stringify(result, null, 2));
      
      if (!result) {
        console.error('handleResult: result is null or undefined');
        return {
          match: false,
          similarity: 0,
          error: 'Invalid response from face verification service'
        };
      }

      if (!result.base?.found || !result.probe?.found) {
        console.warn('handleResult: Face not detected', {
          baseFound: result.base?.found,
          probeFound: result.probe?.found
        });
        return { 
          match: false, 
          similarity: 0, 
          error: !result.base?.found ? 'Entrance face not detected' : 'Current face not detected' 
        };
      }
  
      const threshold = 0.55;
      const similarity = result.similarity || 0;
      const isMatch = result.match && similarity >= threshold;
      
      console.log('handleResult: Verification details', {
        match: result.match,
        similarity: similarity,
        threshold: threshold,
        isMatch: isMatch
      });
  
      return {
        match: isMatch,
        similarity: similarity
      };
    };

    // Helper function to check if an error is a network error
    const isNetworkError = (error: any): boolean => {
      if (error instanceof TypeError) {
        return true;
      }
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        const errorStack = error.stack?.toLowerCase() || '';
        return errorMessage.includes('failed to fetch') ||
               errorMessage.includes('connection refused') ||
               errorMessage.includes('network') ||
               errorStack.includes('connection refused') ||
               errorStack.includes('err_network');
      }
      
      return false;
    };

    // Always check local API first, regardless of preferences
    try {
      console.log('Temporary Exit Face Verification: Checking local AI service first...');
      const result = await performVerification(LOCAL_API_URL);
      console.log('Temporary Exit Face Verification: Local AI service responded successfully');
      setApiUrlPreference('local');
      return handleResult(result);
    } catch (localError) {
      // If local API fails with a network error, try deployed API
      if (isNetworkError(localError)) {
        console.warn('Temporary Exit Face Verification: Local AI API unreachable, falling back to deployed endpoint.');
        try {
          const fallbackResult = await performVerification(DEPLOYED_API_URL);
          console.log('Temporary Exit Face Verification: Deployed AI service responded successfully');
          setApiUrlPreference('deployed');
          return handleResult(fallbackResult);
        } catch (fallbackError) {
          // Only log as warning for network errors
          if (isNetworkError(fallbackError)) {
            console.warn('Temporary Exit Face Verification: Face verification service unavailable.');
          } else {
            console.error('Temporary Exit Face Verification: Deployed AI API verification failed with non-network error:', fallbackError);
          }
          // Return service unavailable flag
          return {
            match: false,
            similarity: 0,
            error: isNetworkError(fallbackError) 
              ? 'Face verification service unavailable' 
              : (fallbackError instanceof Error ? fallbackError.message : 'Face verification service unavailable'),
            serviceUnavailable: isNetworkError(fallbackError)
          };
        }
      } else {
        // If local API fails with a non-network error (e.g., invalid response), throw it
        throw localError;
      }
    }
  } catch (error) {
    // Only log non-network errors as errors
    const isConnectionError = error instanceof TypeError || 
      (error instanceof Error && 
       (error.message.includes('Failed to fetch') || 
        error.message.includes('ERR_CONNECTION_REFUSED') ||
        error.message.includes('NetworkError') ||
        error.message.includes('Connection refused')));
    
    if (!isConnectionError) {
      console.error('Error verifying faces for temporary exit:', error);
    } else {
      console.warn('Temporary Exit Face Verification: Face verification service unavailable.');
    }
    
    return { 
      match: false, 
      similarity: 0, 
      error: isConnectionError 
        ? 'Face verification service unavailable'
        : (error instanceof Error ? error.message : 'Face verification service unavailable'),
      serviceUnavailable: isConnectionError
    };
  }
}

/**
 * Verifies face for temporary exit
 * Compares current face to entrance scan but does not save anything
 * @param visitId - The visit ID to verify
 * @returns Promise<{success: boolean, error?: string}> - Success status and optional error message
 */
export async function verifyTemporaryExitFace(visitId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get entrance face image
    const entranceFaceImage = await getEntranceFaceImage(visitId);
    
    if (!entranceFaceImage) {
      showVerificationError('Face verification failed: no saved entrance face for this scanned visit QR.');
      return {
        success: false,
        error: 'Unable to retrieve entrance face image for verification. Please ensure the entrance was scanned with face detection.'
      };
    }

    // Open face detection modal to capture current face
    const { openFaceDetectionModal } = await import('./AI-Face-Detection/blazefaceModal');
    const faceResult = await openFaceDetectionModal();
    
    if (!faceResult || !faceResult.success || !faceResult.croppedImageDataUrl) {
      showVerificationWarning('Face verification cancelled or no face detected. Please try again.');
      return {
        success: false,
        error: 'Face detection was not completed. Please try again.'
      };
    }

    // Compress current face image for verification
    const { compressImageDataUrl } = await import('./imageCompression');
    const compressedCurrentImage = await compressImageDataUrl(faceResult.croppedImageDataUrl, 0.8, 400, 400);

    // Verify faces match
    let verificationResult;
    try {
      verificationResult = await verifyFaces(entranceFaceImage, compressedCurrentImage);
      console.log('Temporary Exit Face Verification result:', verificationResult);
    } catch (verifyError) {
      console.error('Error during temporary exit face verification:', verifyError);
      return {
        success: false,
        error: 'An error occurred during face verification. Please try again.'
      };
    }

    // If service is unavailable, block temporary exit (unlike exit which allows it)
    if (verificationResult.serviceUnavailable) {
      showVerificationError('Face verification service is unavailable. Temporary exit is blocked.');
      return {
        success: false,
        error: 'Face verification service is not available. Please ensure the Python AI service is running.'
      };
    }

    // Check for other errors
    if (verificationResult.error) {
      console.error('Temporary Exit Face Verification error:', verificationResult.error);
      showVerificationError(`Face verification error: ${verificationResult.error}.`);
      return {
        success: false,
        error: `${verificationResult.error}. Please retake the photo.`
      };
    }

    // Check if faces match
    if (!verificationResult.match) {
      const similarityPercent = (verificationResult.similarity * 100).toFixed(1);
      console.warn(`Temporary Exit Face Verification failed: similarity ${similarityPercent}%`);
      
      showVerificationWarning(`Face verification failed: ${similarityPercent}% similarity. Please retake the photo.`);
      
      return {
        success: false,
        error: `Face does not match the entrance picture. Similarity: ${similarityPercent}%. Please retake the photo.`
      };
    }

    // Faces match - allow temporary exit
    const similarityPercent = (verificationResult.similarity * 100).toFixed(1);
    console.log(`Temporary Exit Face Verification successful. Similarity: ${similarityPercent}%`);
    showVerificationSuccess(`Face verified successfully (${similarityPercent}% match).`);
    
    return {
      success: true
    };

  } catch (error) {
    console.error('Error in verifyTemporaryExitFace:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred during face verification.'
    };
  }
}

