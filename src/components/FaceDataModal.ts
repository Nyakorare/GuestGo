/**
 * Face Data Modal Component
 * Displays saved face image data from gate scans
 */

import { processFaceImageForDisplay } from '../utils/imageCompression';

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
  loadFaceData(props.visitId, props.scanType);

  return modal;
}

async function loadFaceData(visitId: string, scanType: 'entrance' | 'exit') {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );

    // Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Current user:', user?.id);
    if (userError) {
      console.error('User auth error:', userError);
    }

    // Check if the visit belongs to the current user
    const { data: visitData, error: visitError } = await supabase
      .from('scheduled_visits')
      .select('id, visitor_user_id')
      .eq('id', visitId)
      .single();
    
    console.log('Visit data:', visitData);
    if (visitError) {
      console.error('Visit query error:', visitError);
    }

    // First, get the scan ID for the visit and scan type
    console.log('Querying gate_scans for visit:', visitId, 'scan_type:', scanType);
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
      throw new Error('No face data found for this scan');
    }

    const scanId = scanIds[0].id;
    console.log('Found scan ID:', scanId);

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
