/**
 * Face Data Modal Component
 * Displays saved face image data from gate scans
 */

import { processFaceImageForDisplay } from '../utils/imageCompression';
import supabase from '../config/supabase';

export interface FaceDataModalProps {
  visitId: string;
  visitorName: string;
  scanType: 'entrance' | 'exit';
  onClose: () => void;
}

export function createFaceDataModal(props: FaceDataModalProps): HTMLElement {
  const modal = document.createElement('div');
  modal.id = 'faceDataModal';
  modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
  
  modal.innerHTML = `
    <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Face Data - ${props.scanType === 'entrance' ? 'Entrance' : 'Exit'} Scan
          </h3>
          <button 
            id="closeFaceDataModalBtn"
            class="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="mb-4">
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <div class="flex items-center space-x-2 mb-2">
              <svg class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="font-medium text-gray-900 dark:text-white">Visitor: ${props.visitorName}</span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Visit ID: ${props.visitId}
            </div>
          </div>

          <!-- Face Image Container -->
          <div class="text-center">
            <div id="faceImageContainer" class="mb-4">
              <div class="flex justify-center items-center h-48 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div class="text-sm text-gray-500 dark:text-gray-400">Loading face data...</div>
                </div>
              </div>
            </div>

            <!-- Face Verification Similarity (for exit scans) -->
            <div id="faceVerificationSimilarity" class="hidden bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
              <h4 class="font-medium text-green-800 dark:text-green-200 mb-2">Face Verification</h4>
              <div id="similarityDetails" class="text-sm text-green-700 dark:text-green-300 space-y-1">
                <!-- Similarity details will be populated here -->
              </div>
            </div>

            <!-- Face Detection Info -->
            <div id="faceDetectionInfo" class="hidden bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
              <h4 class="font-medium text-blue-800 dark:text-blue-200 mb-2">Face Detection Details</h4>
              <div id="detectionDetails" class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <!-- Detection details will be populated here -->
              </div>
            </div>

            <!-- Error Message -->
            <div id="faceDataError" class="hidden bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
              <div class="flex items-center">
                <svg class="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-red-800 dark:text-red-200 font-medium">Error loading face data</span>
              </div>
              <p id="faceDataErrorMessage" class="text-sm text-red-700 dark:text-red-300 mt-1"></p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end space-x-3">
          <button 
            id="closeFaceDataModalBtn2"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  const closeBtn1 = modal.querySelector('#closeFaceDataModalBtn');
  const closeBtn2 = modal.querySelector('#closeFaceDataModalBtn2');
  
  const closeModal = () => {
    modal.remove();
    props.onClose();
  };

  closeBtn1?.addEventListener('click', closeModal);
  closeBtn2?.addEventListener('click', closeModal);

  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Load face data
  loadFaceData(props.visitId, props.scanType, modal);

  return modal;
}

async function loadFaceData(visitId: string, scanType: 'entrance' | 'exit', modal?: HTMLElement) {
  try {
    // Check current user
    const { error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('User auth error:', userError);
    }

    // First, get the scan ID for the visit and scan type
    const { data: scanIds, error: scanIdError } = await supabase
      .from('gate_scans')
      .select('id')
      .eq('visit_id', visitId)
      .eq('scan_type', scanType)
      .order('scanned_at', { ascending: false })
      .limit(1);

    if (scanIdError) {
      console.error('Scan ID query error:', scanIdError);
      throw scanIdError;
    }

    if (!scanIds || scanIds.length === 0) {
      // Check if the visit has the scan flag set but no face data in gate_scans
      const { data: visitData, error: visitError } = await supabase
        .from('scheduled_visits')
        .select('gate_entrance_scanned, gate_exit_scanned')
        .eq('id', visitId)
        .single();
      
      if (visitError) {
        console.error('Visit query error:', visitError);
        throw new Error('No face data found for this scan');
      }
      
      // If the scan flag is set but no face data exists, show a message
      const hasScanFlag = scanType === 'entrance' ? visitData.gate_entrance_scanned : visitData.gate_exit_scanned;
      if (hasScanFlag) {
        const faceImageContainer = document.getElementById('faceImageContainer');
        const faceDetectionInfo = document.getElementById('faceDetectionInfo');
        const detectionDetails = document.getElementById('detectionDetails');
        
        if (faceImageContainer) {
          faceImageContainer.innerHTML = `
            <div class="text-center py-8">
              <div class="text-gray-500 dark:text-gray-400 mb-4">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Face Data Available</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  The ${scanType} scan was recorded but no face data was captured or stored.
                </p>
              </div>
            </div>
          `;
        }
        
        if (faceDetectionInfo) {
          faceDetectionInfo.innerHTML = `
            <div class="text-center py-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Face detection data is not available for this scan.
              </p>
            </div>
          `;
        }
        
        if (detectionDetails) {
          detectionDetails.innerHTML = `
            <div class="text-center py-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                No detection details are available.
              </p>
            </div>
          `;
        }
        
        return; // Exit early, don't throw error
      }
      
      throw new Error('No face data found for this scan');
    }

    const scanId = scanIds[0].id;

    // Now use the RPC function to get the full scan data with face image
    const { data: gateScans, error } = await supabase.rpc('get_gate_scan_with_face_image', {
      p_scan_id: scanId
    });

    if (error) {
      console.error('RPC query error:', error);
      throw error;
    }

    if (!gateScans || gateScans.length === 0) {
      throw new Error('No face data found for this scan');
    }

    const scan = gateScans[0];
    const faceImageContainer = document.getElementById('faceImageContainer');
    const faceDetectionInfo = document.getElementById('faceDetectionInfo');
    const detectionDetails = document.getElementById('detectionDetails');
    const faceDataError = document.getElementById('faceDataError');

    if (!faceImageContainer || !faceDetectionInfo || !detectionDetails || !faceDataError) {
      return;
    }

    if (scan.face_image_data) {
      try {
        // Decrypt and display the face image
        const decryptedDataUrl = processFaceImageForDisplay(scan.face_image_data);
        
        faceImageContainer.innerHTML = `
          <div class="flex justify-center">
            <img 
              src="${decryptedDataUrl}" 
              alt="Face image from ${scanType} scan"
              class="max-w-full max-h-48 rounded-lg shadow-md border-2 border-blue-300 dark:border-blue-600"
            />
          </div>
        `;

        // For exit scans, calculate similarity with entrance face
        if (scanType === 'exit') {
          await calculateAndDisplaySimilarity(visitId, decryptedDataUrl);
        }

        // Show detection info if available
        if (scan.face_detection_confidence || scan.face_detection_metadata) {
          let detailsHtml = '';
          
          if (scan.face_detection_confidence) {
            detailsHtml += `<div><strong>Confidence:</strong> ${(scan.face_detection_confidence * 100).toFixed(1)}%</div>`;
          }
          
          if (scan.face_detection_metadata) {
            const metadata = typeof scan.face_detection_metadata === 'string' 
              ? JSON.parse(scan.face_detection_metadata) 
              : scan.face_detection_metadata;
            
            if (metadata.timestamp) {
              const scanTime = new Date(metadata.timestamp).toLocaleString();
              detailsHtml += `<div><strong>Scanned at:</strong> ${scanTime}</div>`;
            }
            
            if (metadata.boundingBox) {
              detailsHtml += `<div><strong>Face Position:</strong> Detected</div>`;
            }
            
            if (metadata.originalSize && metadata.compressedSize) {
              const reduction = Math.round((1 - metadata.compressedSize / metadata.originalSize) * 100);
              detailsHtml += `<div><strong>Image Size:</strong> ${metadata.compressedSize} bytes (${reduction}% compressed)</div>`;
            }
          }
          
          if (scan.gate_name) {
            detailsHtml += `<div><strong>Gate:</strong> ${scan.gate_name}</div>`;
          }
          
          if (scan.scanned_at) {
            const scanTime = new Date(scan.scanned_at).toLocaleString();
            detailsHtml += `<div><strong>Scan Time:</strong> ${scanTime}</div>`;
          }
          
          detectionDetails.innerHTML = detailsHtml;
          faceDetectionInfo.classList.remove('hidden');
        }
        
      } catch (decryptError) {
        console.error('Error decrypting face image:', decryptError);
        showError('Failed to decrypt face image data');
      }
    } else {
      showError('No face image data available for this scan');
    }

  } catch (error) {
    console.error('Error loading face data:', error);
    showError(error instanceof Error ? error.message : 'Failed to load face data');
  }
}

async function calculateAndDisplaySimilarity(visitId: string, exitFaceImage: string) {
  try {
    // Get entrance face image
    const { data: entranceScans, error } = await supabase
      .from('gate_scans')
      .select('face_image_data')
      .eq('visit_id', visitId)
      .eq('scan_type', 'entrance')
      .order('scanned_at', { ascending: false })
      .limit(1);

    if (error || !entranceScans || entranceScans.length === 0) {
      console.log('No entrance face data found for comparison');
      return;
    }

    const storedImageData = entranceScans[0].face_image_data;
    if (!storedImageData) {
      console.log('Entrance face image data is empty');
      return;
    }

    // Decrypt the entrance face image
    // The stored image is already at 400x400 for verification purposes, so use it directly
    const entranceFaceImage = processFaceImageForDisplay(storedImageData);

    // Verify faces using Python AI API
    const similarityResult = await verifyFaces(entranceFaceImage, exitFaceImage);

    // Display similarity
    const faceVerificationSimilarity = document.getElementById('faceVerificationSimilarity');
    const similarityDetails = document.getElementById('similarityDetails');

    if (faceVerificationSimilarity && similarityDetails) {
      if (similarityResult.error) {
        similarityDetails.innerHTML = `
          <div class="text-yellow-700 dark:text-yellow-300">
            <strong>Verification Error:</strong> ${similarityResult.error}
          </div>
        `;
      } else {
        const similarityPercent = (similarityResult.similarity * 100).toFixed(1);
        const isMatch = similarityResult.match;
        
        similarityDetails.innerHTML = `
          <div class="flex items-center space-x-2">
            <span class="font-semibold">Similarity:</span>
            <span class="text-lg font-bold ${isMatch ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}">
              ${similarityPercent}%
            </span>
            ${isMatch ? '<span class="text-green-600 dark:text-green-400">✓ Match</span>' : '<span class="text-yellow-600 dark:text-yellow-400">⚠ Below threshold</span>'}
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Compared with entrance face image
          </div>
        `;
      }
      
      faceVerificationSimilarity.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error calculating similarity:', error);
  }
}

async function verifyFaces(entranceFaceImage: string, exitFaceImage: string): Promise<{ match: boolean; similarity: number; error?: string }> {
  try {
    // Validate that both images are valid base64 data URLs
    if (!entranceFaceImage || !entranceFaceImage.startsWith('data:image/')) {
      return { match: false, similarity: 0, error: 'Invalid entrance face image format' };
    }
    if (!exitFaceImage || !exitFaceImage.startsWith('data:image/')) {
      return { match: false, similarity: 0, error: 'Invalid exit face image format' };
    }

    const { 
      getEffectiveApiUrl, 
      LOCAL_API_URL, 
      DEPLOYED_API_URL, 
      setApiUrlPreference 
    } = await import('../config/python-api');

    const performVerification = async (apiUrl: string) => {
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
    };

    const handleResult = (result: any) => {
      if (!result.base?.found || !result.probe?.found) {
        return { 
          match: false, 
          similarity: 0, 
          error: !result.base?.found ? 'Entrance face not detected' : 'Exit face not detected' 
        };
      }
  
      const threshold = 0.55;
      const isMatch = result.match && result.similarity >= threshold;
  
      return {
        match: isMatch,
        similarity: result.similarity || 0
      };
    };

    const primaryApiUrl = getEffectiveApiUrl();

    try {
      const result = await performVerification(primaryApiUrl);
      return handleResult(result);
    } catch (primaryError) {
      const isLocalApi = primaryApiUrl === LOCAL_API_URL;
      const isNetworkError = primaryError instanceof TypeError || 
        (primaryError instanceof Error && primaryError.message.includes('Failed to fetch'));

      if (isLocalApi && isNetworkError) {
        console.warn('Local AI API unreachable, falling back to deployed endpoint.');
        try {
          setApiUrlPreference('deployed');
          const fallbackResult = await performVerification(DEPLOYED_API_URL);
          return handleResult(fallbackResult);
        } catch (fallbackError) {
          console.error('Fallback AI API verification failed:', fallbackError);
          throw fallbackError;
        }
      }

      throw primaryError;
    }
  } catch (error) {
    console.error('Error verifying faces:', error);
    return { 
      match: false, 
      similarity: 0, 
      error: error instanceof Error ? error.message : 'Face verification service unavailable' 
    };
  }
}

function showError(message: string) {
  const faceImageContainer = document.getElementById('faceImageContainer');
  const faceDataError = document.getElementById('faceDataError');
  const faceDataErrorMessage = document.getElementById('faceDataErrorMessage');

  if (faceImageContainer && faceDataError && faceDataErrorMessage) {
    faceImageContainer.innerHTML = `
      <div class="flex justify-center items-center h-48 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="text-sm text-red-500 dark:text-red-400">No face data available</div>
        </div>
      </div>
    `;
    
    faceDataErrorMessage.textContent = message;
    faceDataError.classList.remove('hidden');
  }
}
