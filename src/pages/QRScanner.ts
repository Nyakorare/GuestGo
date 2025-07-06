import supabase from '../config/supabase';
import { parseQRCodeData, type VisitQRData } from '../utils/qrCode';
import jsQR from 'jsqr';

export function QRScannerPage() {
  return `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center">
              <button 
                onclick="window.history.back()"
                class="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">QR Code Scanner</h1>
            </div>
            <div class="flex items-center space-x-4">
              <button 
                id="manualInputBtn"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                Manual Input
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Scanner Section -->
        <div id="scannerSection" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div class="text-center mb-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Scan Visit QR Code</h2>
            <p class="text-gray-600 dark:text-gray-400">Point your camera at a GuestGo visit QR code to view details</p>
          </div>
          
          <!-- Camera Feed -->
          <div class="relative">
            <video 
              id="qrVideo" 
              class="w-full max-w-md mx-auto rounded-lg border-2 border-gray-300 dark:border-gray-600"
              autoplay
              muted
              playsinline
            ></video>
            <canvas id="qrCanvas" class="hidden"></canvas>
            
            <!-- Scanner Overlay -->
            <div class="absolute inset-0 max-w-md mx-auto flex items-center justify-center pointer-events-none">
              <div class="w-64 h-64 border-2 border-blue-500 rounded-lg relative">
                <div class="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                <div class="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                <div class="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                <div class="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
              </div>
            </div>
          </div>
          
          <!-- Controls -->
          <div class="flex justify-center space-x-4 mt-6">
            <button 
              id="startScanBtn"
              class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              Start Scanner
            </button>
            <button 
              id="stopScanBtn"
              class="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 font-medium hidden"
            >
              Stop Scanner
            </button>
            <button 
              id="switchCameraBtn"
              class="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              Switch Camera
            </button>
          </div>
          
          <!-- Status -->
          <div id="scannerStatus" class="text-center mt-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Click "Start Scanner" to begin</p>
          </div>
        </div>

        <!-- Manual Input Modal -->
        <div id="manualInputModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div class="mt-3">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Manual QR Code Input</h3>
                <button 
                  id="closeManualModalBtn"
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="space-y-4">
                <div>
                  <label for="qrDataInput" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Paste QR Code Data
                  </label>
                  <textarea 
                    id="qrDataInput"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="4"
                    placeholder="Paste the QR code data here..."
                  ></textarea>
                </div>
                <div class="flex justify-end space-x-3">
                  <button 
                    id="closeManualBtn"
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button 
                    id="processManualBtn"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Process
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Results Section -->
        <div id="resultsSection" class="hidden bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Visit Details</h2>
            <button 
              id="newScanBtn"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              New Scan
            </button>
          </div>
          <div id="visitDetails" class="space-y-4">
            <!-- Visit details will be populated here -->
          </div>
        </div>

        <!-- Error Section -->
        <div id="errorSection" class="hidden bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200" id="errorTitle">Error</h3>
              <div class="mt-2 text-sm text-red-700 dark:text-red-300" id="errorMessage">
                <!-- Error message will be populated here -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// QR Scanner functionality
let stream: MediaStream | null = null;
let scanning = false;
let currentFacingMode = 'environment'; // Start with back camera

export function initializeQRScanner() {
  const startScanBtn = document.getElementById('startScanBtn');
  const stopScanBtn = document.getElementById('stopScanBtn');
  const switchCameraBtn = document.getElementById('switchCameraBtn');
  const manualInputBtn = document.getElementById('manualInputBtn');
  const closeManualModalBtn = document.getElementById('closeManualModalBtn');
  const closeManualBtn = document.getElementById('closeManualBtn');
  const processManualBtn = document.getElementById('processManualBtn');
  const newScanBtn = document.getElementById('newScanBtn');

  startScanBtn?.addEventListener('click', startScanner);
  stopScanBtn?.addEventListener('click', stopScanner);
  switchCameraBtn?.addEventListener('click', switchCamera);
  manualInputBtn?.addEventListener('click', showManualInputModal);
  closeManualModalBtn?.addEventListener('click', hideManualInputModal);
  closeManualBtn?.addEventListener('click', hideManualInputModal);
  processManualBtn?.addEventListener('click', processManualInput);
  newScanBtn?.addEventListener('click', resetScanner);

  // Auto-start scanner when page loads
  setTimeout(() => {
    startScanner();
  }, 1000);
}

async function startScanner() {
  try {
    const video = document.getElementById('qrVideo') as HTMLVideoElement;
    const status = document.getElementById('scannerStatus');
    const startBtn = document.getElementById('startScanBtn');
    const stopBtn = document.getElementById('stopScanBtn');

    if (!video || !status || !startBtn || !stopBtn) return;

    // Request camera access
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: currentFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    video.srcObject = stream;
    scanning = true;

    // Update UI
    startBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');
    status.innerHTML = '<p class="text-sm text-green-600 dark:text-green-400">Scanner active - Point camera at QR code</p>';

    // Start scanning loop
    scanLoop();

  } catch (error) {
    console.error('Error starting scanner:', error);
    showError('Camera access denied', 'Please allow camera access to use the QR scanner.');
  }
}

function stopScanner() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  
  scanning = false;
  
  const video = document.getElementById('qrVideo') as HTMLVideoElement;
  const status = document.getElementById('scannerStatus');
  const startBtn = document.getElementById('startScanBtn');
  const stopBtn = document.getElementById('stopScanBtn');

  if (video) video.srcObject = null;
  if (status) status.innerHTML = '<p class="text-sm text-gray-600 dark:text-gray-400">Scanner stopped</p>';
  if (startBtn) startBtn.classList.remove('hidden');
  if (stopBtn) stopBtn.classList.add('hidden');
}

async function switchCamera() {
  currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
  
  if (scanning) {
    stopScanner();
    setTimeout(() => {
      startScanner();
    }, 500);
  }
}

function scanLoop() {
  if (!scanning) return;

  const video = document.getElementById('qrVideo') as HTMLVideoElement;
  const canvas = document.getElementById('qrCanvas') as HTMLCanvasElement;

  if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
    requestAnimationFrame(scanLoop);
    return;
  }

  // Set canvas dimensions
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Draw video frame to canvas
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data for QR code detection
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Use jsQR to detect QR codes
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    
    if (code) {
      // QR code detected!
      console.log('QR Code detected:', code.data);
      
      // Stop scanning
      stopScanner();
      
      // Process the QR code data
      processQRCodeData(code.data);
      
      // Show success feedback
      const status = document.getElementById('scannerStatus');
      if (status) {
        status.innerHTML = '<p class="text-sm text-green-600 dark:text-green-400">QR Code detected! Processing...</p>';
      }
      
      return;
    }
    
    // Continue scanning
    requestAnimationFrame(scanLoop);
  }
}

function showManualInputModal() {
  const modal = document.getElementById('manualInputModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function hideManualInputModal() {
  const modal = document.getElementById('manualInputModal');
  const input = document.getElementById('qrDataInput') as HTMLTextAreaElement;
  
  if (modal) {
    modal.classList.add('hidden');
  }
  
  if (input) {
    input.value = '';
  }
}

async function processManualInput() {
  const input = document.getElementById('qrDataInput') as HTMLTextAreaElement;
  const qrData = input.value.trim();
  
  if (!qrData) {
    showError('Invalid Input', 'Please enter QR code data.');
    return;
  }
  
  hideManualInputModal();
  await processQRCodeData(qrData);
}

function resetScanner() {
  // Hide results and error sections
  const resultsSection = document.getElementById('resultsSection');
  const errorSection = document.getElementById('errorSection');
  const scannerSection = document.getElementById('scannerSection');
  
  if (resultsSection) resultsSection.classList.add('hidden');
  if (errorSection) errorSection.classList.add('hidden');
  if (scannerSection) scannerSection.classList.remove('hidden');
  
  // Restart scanner
  if (!scanning) {
    startScanner();
  }
}

async function processQRCodeData(qrData: string) {
  try {
    // Parse QR code data
    const visitData = parseQRCodeData(qrData);
    
    if (visitData) {
      // Display visit details
      displayVisitDetails(visitData);
    } else {
      // Try to fetch visit data from database using visit ID
      const parsed = JSON.parse(qrData);
      if (parsed.type === 'visit' && parsed.id) {
        const fetchedVisitData = await fetchVisitDataFromDatabase(parsed.id);
        if (fetchedVisitData) {
          displayVisitDetails(fetchedVisitData);
        } else {
          showError('Visit Not Found', 'The visit associated with this QR code could not be found.');
        }
      } else {
        showError('Invalid QR Code', 'This QR code is not a valid GuestGo visit code.');
      }
    }
  } catch (error) {
    console.error('Error processing QR code data:', error);
    showError('Invalid QR Code', 'The QR code data could not be processed.');
  }
}

async function fetchVisitDataFromDatabase(visitId: string): Promise<VisitQRData | null> {
  try {
    // This would need to be implemented based on your database structure
    // For now, returning null as placeholder
    console.log('Fetching visit data for ID:', visitId);
    return null;
  } catch (error) {
    console.error('Error fetching visit data:', error);
    return null;
  }
}

function displayVisitDetails(visitData: VisitQRData) {
  const resultsSection = document.getElementById('resultsSection');
  const scannerSection = document.getElementById('scannerSection');
  const visitDetails = document.getElementById('visitDetails');
  
  if (!resultsSection || !scannerSection || !visitDetails) return;
  
  // Hide scanner, show results
  scannerSection.classList.add('hidden');
  resultsSection.classList.remove('hidden');
  
  const visitDate = new Date(visitData.visitDate);
  const scheduledDate = new Date(visitData.scheduledAt);
  
  visitDetails.innerHTML = `
    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        ${visitData.visitorName}
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-gray-600 dark:text-gray-400"><strong>Email:</strong> ${visitData.visitorEmail}</p>
          <p class="text-gray-600 dark:text-gray-400"><strong>Visit Date:</strong> ${visitDate.toLocaleDateString()}</p>
          <p class="text-gray-600 dark:text-gray-400"><strong>Purpose:</strong> ${visitData.purpose}</p>
        </div>
        <div>
          <p class="text-gray-600 dark:text-gray-400"><strong>Status:</strong> 
            <span class="px-2 py-1 rounded-full text-xs font-medium ${
              visitData.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              visitData.status === 'unsuccessful' || visitData.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
              visitData.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }">
              ${visitData.status.charAt(0).toUpperCase() + visitData.status.slice(1)}
            </span>
          </p>
          <p class="text-gray-600 dark:text-gray-400"><strong>Scheduled:</strong> ${scheduledDate.toLocaleDateString()} at ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
    </div>
    
    ${visitData.places.length > 0 ? `
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-3">
          Places to Visit (${visitData.places.length})
        </h4>
        <div class="space-y-3">
          ${visitData.places.map(place => `
            <div class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <div class="flex-1">
                <h5 class="text-sm font-medium text-gray-900 dark:text-white">${place.placeName}</h5>
                ${place.placeLocation ? `<p class="text-xs text-gray-600 dark:text-gray-400">📍 ${place.placeLocation}</p>` : ''}
              </div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${
                  place.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  place.status === 'unsuccessful' || place.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  place.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }">
                  ${place.status.charAt(0).toUpperCase() + place.status.slice(1)}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : `
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
        <p class="text-gray-600 dark:text-gray-400">No places assigned to this visit</p>
      </div>
    `}
    
    <div class="mt-4 text-center">
      <p class="text-xs text-gray-500 dark:text-gray-400">
        QR Code scanned on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
      </p>
    </div>
  `;
}

function showError(title: string, message: string) {
  const errorSection = document.getElementById('errorSection');
  const errorTitle = document.getElementById('errorTitle');
  const errorMessage = document.getElementById('errorMessage');
  const scannerSection = document.getElementById('scannerSection');
  
  if (errorSection && errorTitle && errorMessage && scannerSection) {
    errorTitle.textContent = title;
    errorMessage.textContent = message;
    
    scannerSection.classList.add('hidden');
    errorSection.classList.remove('hidden');
  }
} 