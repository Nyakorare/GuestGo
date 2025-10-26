import supabase from '../config/supabase';
import { parseQRCodeData, type VisitQRData } from '../utils/qrCode';
import { openFaceDetectionModal, type FaceDetectionOutcome } from '../utils/AI-Face-Detection/blazefaceModal';
import { compressImageDataUrl } from '../utils/imageCompression';
import jsQR from 'jsqr';

export function QRScannerPage() {
  return `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div class="flex flex-col sm:flex-row justify-between items-center py-4 space-y-2 sm:space-y-0">
            <div class="flex items-center w-full sm:w-auto justify-between sm:justify-start">
              <button 
                onclick="window.location.hash = '/dashboard'; window.location.reload();"
                class="mr-2 sm:mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">QR Code Scanner</h1>
            </div>
            <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <button 
                id="refreshPageBtn"
                class="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm font-medium flex items-center justify-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>Refresh</span>
              </button>
              <button 
                id="manualInputBtn"
                class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                Manual Input
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
        <!-- Scanner Section -->
        <div id="scannerSection" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-6 mb-6">
          <div class="text-center mb-6">
            <h2 class="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">Scan Visit QR Code</h2>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">Point your camera at a GuestGo visit QR code to view details</p>
          </div>
          
          <!-- Camera Feed -->
          <div class="relative">
            <video 
              id="qrVideo" 
              class="w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto rounded-lg border-2 border-gray-300 dark:border-gray-600"
              autoplay
              muted
              playsinline
            ></video>
            <canvas id="qrCanvas" class="hidden"></canvas>
            
            <!-- Scanner Overlay -->
            <div id="scannerOverlay" class="absolute inset-0 max-w-xs sm:max-w-md md:max-w-lg mx-auto flex items-center justify-center pointer-events-none hidden">
              <div class="w-48 h-48 sm:w-64 sm:h-64 border-2 border-blue-500 rounded-lg relative">
                <div class="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                <div class="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                <div class="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                <div class="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
                
                <!-- Scanning Animation -->
                <div id="scanningLine" class="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>
                
                <!-- Focus Indicator -->
                <div id="focusIndicator" class="absolute inset-0 border-2 border-green-500 rounded-lg opacity-0 transition-opacity duration-300"></div>
              </div>
            </div>
            
            <!-- Live Feedback -->
            <div id="liveFeedback" class="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium max-w-xs w-full sm:max-w-md">
              <div class="flex items-center space-x-2">
                <div id="feedbackIcon" class="w-4 h-4">
                  <svg class="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                  </svg>
                </div>
                <span id="feedbackText">Position QR code in frame</span>
              </div>
            </div>
          </div>
          
          <!-- Controls -->
          <div class="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
            <button 
              id="startScanBtn"
              class="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              Start Scanner
            </button>
            <button 
              id="stopScanBtn"
              class="w-full sm:w-auto px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 font-medium hidden"
            >
              Stop Scanner
            </button>
            <button 
              id="switchCameraBtn"
              class="w-full sm:w-auto px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              Switch Camera
            </button>
          </div>
          
          <!-- Status -->
          <div id="scannerStatus" class="text-center mt-4">
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Click "Start Scanner" to begin</p>
            <div id="performanceIndicator" class="hidden mt-2">
              <p class="text-xs text-blue-600 dark:text-blue-400">
                Scan Rate: <span id="scanRate">0</span> FPS • 
                Interval: <span id="scanInterval">100</span>ms
              </p>
            </div>
          </div>
        </div>

        <!-- Manual Input Modal -->
        <div id="manualInputModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-10 mx-auto p-3 sm:p-5 border w-full max-w-sm sm:max-w-md md:max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div class="mt-3">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Manual Visit ID Input</h3>
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
                    Enter scheduled_visit_id
                  </label>
                  <textarea 
                    id="qrDataInput"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="4"
                    placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                  ></textarea>
                </div>
                <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button 
                    id="closeManualBtn"
                    class="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button 
                    id="processManualBtn"
                    class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Process
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- QR Data Preview Section -->
        <div id="qrPreviewSection" class="hidden bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-6 mb-6">
          <div class="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
            <h2 class="text-base sm:text-lg font-medium text-gray-900 dark:text-white">QR Code Detected</h2>
            <div class="flex space-x-2">
              <button 
                id="processQRBtn"
                class="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Process</span>
              </button>
              <button 
                id="rescanBtn"
                class="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
              >
                Rescan
              </button>
            </div>
          </div>
          <div id="qrPreviewContent" class="space-y-4">
            <!-- QR preview content will be populated here -->
          </div>
        </div>

        <!-- Results Section -->
        <div id="resultsSection" class="hidden bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-6">
          <div class="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
            <h2 class="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Visit Details</h2>
            <button 
              id="newScanBtn"
              class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
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
let lastScanTime = 0;
let scanInterval = 100; // Scan every 100ms for better performance
let consecutiveFailures = 0;
let maxConsecutiveFailures = 10; // Reduce scan frequency after many failures
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let imageData: ImageData | null = null;
let scanCount = 0;
let lastPerformanceUpdate = 0;
let detectedQRData: string | null = null;
let emptyQRTimeout: NodeJS.Timeout | null = null; // Timeout for empty QR detection
let isGateScanning = false; // Flag to indicate if we're scanning for gate entrance
let visitIdForGateScan: string | null = null; // Visit ID when scanning for gate entrance

export function initializeQRScanner() {
  // Check if we're scanning for gate entrance
  const urlParams = new URLSearchParams(window.location.search);
  const visitId = urlParams.get('visitId');
  
  if (visitId) {
    isGateScanning = true;
    visitIdForGateScan = visitId;
    updateScannerForGateMode();
  }
  
  const startScanBtn = document.getElementById('startScanBtn');
  const stopScanBtn = document.getElementById('stopScanBtn');
  const switchCameraBtn = document.getElementById('switchCameraBtn');
  const refreshPageBtn = document.getElementById('refreshPageBtn');
  const manualInputBtn = document.getElementById('manualInputBtn');
  const closeManualModalBtn = document.getElementById('closeManualModalBtn');
  const closeManualBtn = document.getElementById('closeManualBtn');
  const processManualBtn = document.getElementById('processManualBtn');
  const newScanBtn = document.getElementById('newScanBtn');
  const processQRBtn = document.getElementById('processQRBtn');
  const rescanBtn = document.getElementById('rescanBtn');

  startScanBtn?.addEventListener('click', startScanner);
  stopScanBtn?.addEventListener('click', stopScanner);
  switchCameraBtn?.addEventListener('click', switchCamera);
  refreshPageBtn?.addEventListener('click', () => window.location.reload());
  manualInputBtn?.addEventListener('click', showManualInputModal);
  closeManualModalBtn?.addEventListener('click', hideManualInputModal);
  closeManualBtn?.addEventListener('click', hideManualInputModal);
  processManualBtn?.addEventListener('click', processManualInput);
  newScanBtn?.addEventListener('click', resetScanner);
  processQRBtn?.addEventListener('click', processDetectedQR);
  rescanBtn?.addEventListener('click', rescanQR);

  // Auto-start scanner when page loads
  setTimeout(() => {
    startScanner();
  }, 1000);
}

// Function to update scanner UI for gate scanning mode
function updateScannerForGateMode() {
  const scannerTitle = document.querySelector('#scannerSection h2');
  const scannerDescription = document.querySelector('#scannerSection p');
  
  if (scannerTitle) {
    scannerTitle.textContent = 'Scan Gate QR Code';
  }
  
  if (scannerDescription) {
    scannerDescription.textContent = 'Point your camera at a gate QR code to log your entrance';
  }
  
  // Update the header title
  const headerTitle = document.querySelector('h1');
  if (headerTitle) {
    headerTitle.textContent = 'Gate QR Code Scanner';
  }
}

async function startScanner() {
  try {
    const video = document.getElementById('qrVideo') as HTMLVideoElement;
    const canvas = document.getElementById('qrCanvas') as HTMLCanvasElement;
    const status = document.getElementById('scannerStatus');
    const startBtn = document.getElementById('startScanBtn');
    const stopBtn = document.getElementById('stopScanBtn');

    if (!video || !canvas || !status || !startBtn || !stopBtn) return;

    // Initialize canvas context once
    ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Request camera access with optimized settings for QR scanning
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: currentFacingMode,
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
        // Optimize for QR code scanning
        focusMode: 'continuous',
        exposureMode: 'continuous',
        whiteBalanceMode: 'continuous'
      }
    });

    video.srcObject = stream;
    
    // Show loading state while camera initializes
    if (status) status.innerHTML = '<p class="text-sm text-blue-600 dark:text-blue-400">Initializing camera...</p>';
    if (startBtn) startBtn.classList.add('hidden');
    if (stopBtn) stopBtn.classList.remove('hidden');
    
    // Wait for video to be ready before showing overlay and starting scan
    video.onloadedmetadata = () => {
      // Show the scanner overlay now that camera is ready
      const scannerOverlay = document.getElementById('scannerOverlay');
      if (scannerOverlay) {
        scannerOverlay.classList.remove('hidden');
      }
      
      scanning = true;
      consecutiveFailures = 0;
      scanInterval = 100; // Reset scan interval
      scanCount = 0;
      lastPerformanceUpdate = Date.now();
      
      // Show performance indicator
      const performanceIndicator = document.getElementById('performanceIndicator');
      if (performanceIndicator) {
        performanceIndicator.classList.remove('hidden');
      }

      // Update UI status
      status.innerHTML = '<p class="text-sm text-green-600 dark:text-green-400">Scanner active - Point camera at QR code</p>';

      // Initialize live feedback
      updateLiveFeedback('Position QR code in frame', 'searching');

      // Start scanning loop
      scanLoop();
    };

    // Handle video loading errors
    video.onerror = () => {
      console.error('Error loading video stream');
      showError('Camera Error', 'Failed to load camera feed. Please try again.');
    };

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
  
  // Clear timeout
  if (emptyQRTimeout) {
    clearTimeout(emptyQRTimeout);
    emptyQRTimeout = null;
  }
  
  // Reset scanner state
  consecutiveFailures = 0;
  scanInterval = 100;
  lastScanTime = 0;
  scanCount = 0;
  
  // Hide performance indicator
  const performanceIndicator = document.getElementById('performanceIndicator');
  if (performanceIndicator) {
    performanceIndicator.classList.add('hidden');
  }
  
  const video = document.getElementById('qrVideo') as HTMLVideoElement;
  const status = document.getElementById('scannerStatus');
  const startBtn = document.getElementById('startScanBtn');
  const stopBtn = document.getElementById('stopScanBtn');
  const scannerOverlay = document.getElementById('scannerOverlay');

  if (video) video.srcObject = null;
  if (status) status.innerHTML = '<p class="text-sm text-gray-600 dark:text-gray-400">Scanner stopped</p>';
  if (startBtn) startBtn.classList.remove('hidden');
  if (stopBtn) stopBtn.classList.add('hidden');
  if (scannerOverlay) scannerOverlay.classList.add('hidden');
  
  // Reset live feedback
  updateLiveFeedback('Scanner stopped', 'error');
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

  if (!video || !canvas || !ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
    requestAnimationFrame(scanLoop);
    return;
  }

  const currentTime = Date.now();
  
  // Adaptive scanning frequency based on consecutive failures
  if (currentTime - lastScanTime < scanInterval) {
    requestAnimationFrame(scanLoop);
    return;
  }

  // Set canvas dimensions only if they changed
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  // Draw video frame to canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  // Get image data for QR code detection
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Use jsQR with optimized settings for faster detection
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "dontInvert",
  });
  
  // Update performance metrics
  scanCount++;
  const now = Date.now();
  if (now - lastPerformanceUpdate >= 1000) { // Update every second
    const fps = Math.round((scanCount * 1000) / (now - lastPerformanceUpdate));
    const scanRateElement = document.getElementById('scanRate');
    const scanIntervalElement = document.getElementById('scanInterval');
    
    if (scanRateElement) scanRateElement.textContent = fps.toString();
    if (scanIntervalElement) scanIntervalElement.textContent = scanInterval.toString();
    
    scanCount = 0;
    lastPerformanceUpdate = now;
  }
  
  if (code) {
    // QR code detected!
    console.log('QR Code detected:', code.data);
    
    // Validate that the QR code contains actual data
    if (!code.data || code.data.trim() === '') {
      console.warn('QR code detected but contains no data');
      updateLiveFeedback('Invalid QR code - no data found', 'error');
      consecutiveFailures++;
      
      // Set a timeout to reset if we keep getting empty QR codes
      if (emptyQRTimeout) {
        clearTimeout(emptyQRTimeout);
      }
      emptyQRTimeout = setTimeout(() => {
        console.log('Resetting scanner due to repeated empty QR codes');
        updateLiveFeedback('Position QR code in frame', 'searching');
        consecutiveFailures = 0;
        scanInterval = 100;
      }, 3000); // Reset after 3 seconds of empty QR codes
      
      requestAnimationFrame(scanLoop);
      return;
    }
    
    // Clear any existing timeout since we have valid data
    if (emptyQRTimeout) {
      clearTimeout(emptyQRTimeout);
      emptyQRTimeout = null;
    }
    
    // Store the detected QR data
    detectedQRData = code.data;
    
    // Show success feedback
    updateLiveFeedback('QR code detected!', 'success');
    
    // Stop scanning
    stopScanner();
    
    // Show QR preview instead of immediately processing
    showQRPreview(code.data);
    
    return;
  }
  
  // Increment consecutive failures
  consecutiveFailures++;
  
  // Adaptive scan interval: slow down if many failures, speed up if few
  if (consecutiveFailures > maxConsecutiveFailures) {
    scanInterval = Math.min(scanInterval * 1.2, 300); // Max 300ms interval
  } else if (consecutiveFailures < 3) {
    scanInterval = Math.max(scanInterval * 0.9, 50); // Min 50ms interval
  }
  
  // Check for potential QR code patterns (dark/light transitions)
  const hasPotentialQR = checkForPotentialQRPattern(imageData);
  if (hasPotentialQR) {
    updateLiveFeedback('QR code pattern detected - hold steady', 'detecting');
    // Speed up scanning when potential QR is detected
    scanInterval = Math.max(scanInterval * 0.8, 30);
    consecutiveFailures = Math.max(0, consecutiveFailures - 2); // Reduce failure count
  } else {
    updateLiveFeedback('Position QR code in frame', 'searching');
  }
  
  lastScanTime = currentTime;
  
  // Continue scanning
  requestAnimationFrame(scanLoop);
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
  const manualId = input.value.trim();
  
  if (!manualId) {
    showError('Invalid Input', 'Please enter the scheduled_visit_id.');
    return;
  }
  
  hideManualInputModal();
  try {
    // If in gate scanning mode, fall back to existing QR/code flow
    if (isGateScanning && visitIdForGateScan) {
      await processGateQRCode(manualId);
      return;
    }

    const fetchedVisitData = await fetchVisitDataFromDatabase(manualId);
    if (fetchedVisitData) {
      displayVisitDetails(fetchedVisitData);
    } else {
      showError('Visit Not Found', 'No visit found for the provided scheduled_visit_id.');
    }
  } catch (error) {
    console.error('Error processing manual visit ID:', error);
    showError('Lookup Error', 'There was a problem fetching the visit by ID.');
  }
}

function resetScanner() {
  // Hide results and error sections
  const resultsSection = document.getElementById('resultsSection');
  const errorSection = document.getElementById('errorSection');
  const scannerSection = document.getElementById('scannerSection');
  const qrPreviewSection = document.getElementById('qrPreviewSection');
  const scannerOverlay = document.getElementById('scannerOverlay');
  
  if (resultsSection) resultsSection.classList.add('hidden');
  if (errorSection) errorSection.classList.add('hidden');
  if (qrPreviewSection) qrPreviewSection.classList.add('hidden');
  if (scannerSection) scannerSection.classList.remove('hidden');
  if (scannerOverlay) scannerOverlay.classList.add('hidden');
  
  // Clear timeout
  if (emptyQRTimeout) {
    clearTimeout(emptyQRTimeout);
    emptyQRTimeout = null;
  }
  
  // Reset scanner state
  consecutiveFailures = 0;
  scanInterval = 100;
  lastScanTime = 0;
  detectedQRData = null;
  
  // Restart scanner
  if (!scanning) {
    startScanner();
  }
}

function showQRPreview(qrData: string) {
  const scannerSection = document.getElementById('scannerSection');
  const qrPreviewSection = document.getElementById('qrPreviewSection');
  const qrPreviewContent = document.getElementById('qrPreviewContent');
  
  if (!scannerSection || !qrPreviewSection || !qrPreviewContent) return;
  
  // Validate QR data
  if (!qrData || qrData.trim() === '') {
    console.error('Invalid QR data received:', qrData);
    showError('Invalid QR Code', 'The scanned QR code contains no data or is corrupted.');
    return;
  }
  
  // Hide scanner, show preview
  scannerSection.classList.add('hidden');
  qrPreviewSection.classList.remove('hidden');
  
  try {
    // Try to parse the QR data as JSON
    const parsedData = JSON.parse(qrData);
    
    // Determine the type of QR code and show appropriate preview
    if (parsedData.type === 'visit' && parsedData.id) {
      // Simple visit QR code
      qrPreviewContent.innerHTML = `
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <div>
              <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100">Visit QR Code</h3>
              <p class="text-sm text-blue-700 dark:text-blue-300">Visit ID: ${parsedData.id}</p>
              <p class="text-xs text-blue-600 dark:text-blue-400">Timestamp: ${new Date(parsedData.timestamp).toLocaleString()}</p>
            </div>
          </div>
          <div class="mt-3">
            <button 
              onclick="toggleQRData('visit-qr-data')"
              class="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
            >
              <span>See QR Code Data</span>
              <svg id="visit-qr-data-icon" class="w-4 h-4 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div id="visit-qr-data" class="hidden mt-2 p-3 bg-white dark:bg-gray-800 rounded border">
              <p class="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">${qrData}</p>
            </div>
          </div>
        </div>
      `;
    } else if (parsedData.visitId && parsedData.visitorName) {
      // Full visit QR code
      qrPreviewContent.innerHTML = `
        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <div>
              <h3 class="text-lg font-semibold text-green-900 dark:text-green-100">Visit Details</h3>
              <p class="text-sm text-green-700 dark:text-green-300"><strong>Visitor:</strong> ${parsedData.visitorName}</p>
              <p class="text-sm text-green-700 dark:text-green-300"><strong>Email:</strong> ${parsedData.visitorEmail}</p>
              <p class="text-sm text-green-700 dark:text-green-300"><strong>Purpose:</strong> ${parsedData.purpose}</p>
              <p class="text-sm text-green-700 dark:text-green-300"><strong>Status:</strong> ${parsedData.status}</p>
              <p class="text-sm text-green-700 dark:text-green-300"><strong>Places:</strong> ${parsedData.places?.length || 0} locations</p>
            </div>
          </div>
          <div class="mt-3">
            <button 
              onclick="toggleQRData('full-visit-qr-data')"
              class="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-200"
            >
              <span>See QR Code Data</span>
              <svg id="full-visit-qr-data-icon" class="w-4 h-4 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div id="full-visit-qr-data" class="hidden mt-2 p-3 bg-white dark:bg-gray-800 rounded border">
              <p class="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">${qrData}</p>
            </div>
          </div>
        </div>
      `;
    } else if (parsedData.type === 'gate' && parsedData.id) {
      // Gate QR code
      qrPreviewContent.innerHTML = `
        <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
            </svg>
            <div>
              <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100">Gate QR Code</h3>
              <p class="text-sm text-purple-700 dark:text-purple-300">Gate ID: ${parsedData.id}</p>
              <p class="text-xs text-purple-600 dark:text-purple-400">Timestamp: ${new Date(parsedData.timestamp).toLocaleString()}</p>
            </div>
          </div>
          <div class="mt-3">
            <button 
              onclick="toggleQRData('gate-qr-data')"
              class="flex items-center space-x-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors duration-200"
            >
              <span>See QR Code Data</span>
              <svg id="gate-qr-data-icon" class="w-4 h-4 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div id="gate-qr-data" class="hidden mt-2 p-3 bg-white dark:bg-gray-800 rounded border">
              <p class="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">${qrData}</p>
            </div>
          </div>
        </div>
      `;
    } else {
      // Unknown QR code format
      qrPreviewContent.innerHTML = `
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <div>
              <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100">Unknown QR Code Format</h3>
              <p class="text-sm text-yellow-700 dark:text-yellow-300">This QR code doesn't match expected GuestGo formats</p>
            </div>
          </div>
          <div class="mt-3">
            <button 
              onclick="toggleQRData('unknown-qr-data')"
              class="flex items-center space-x-2 text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors duration-200"
            >
              <span>See QR Code Data</span>
              <svg id="unknown-qr-data-icon" class="w-4 h-4 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div id="unknown-qr-data" class="hidden mt-2 p-3 bg-white dark:bg-gray-800 rounded border">
              <p class="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">${qrData}</p>
            </div>
          </div>
        </div>
      `;
    }
  } catch (error) {
    // Raw text QR code
    qrPreviewContent.innerHTML = `
      <div class="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <div class="flex items-center space-x-3">
          <svg class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Raw Text QR Code</h3>
            <p class="text-sm text-gray-700 dark:text-gray-300">This appears to be a text-based QR code</p>
          </div>
        </div>
        <div class="mt-3">
          <button 
            onclick="toggleQRData('raw-text-qr-data')"
            class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <span>See QR Code Data</span>
            <svg id="raw-text-qr-data-icon" class="w-4 h-4 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          <div id="raw-text-qr-data" class="hidden mt-2 p-3 bg-white dark:bg-gray-800 rounded border">
            <p class="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">${qrData}</p>
          </div>
        </div>
      </div>
    `;
  }
}

function processDetectedQR() {
  if (detectedQRData) {
    // Hide preview and show results
    const qrPreviewSection = document.getElementById('qrPreviewSection');
    if (qrPreviewSection) {
      qrPreviewSection.classList.add('hidden');
    }
    
    // Process the QR code data
    processQRCodeData(detectedQRData);
  }
}

function rescanQR() {
  // Hide preview and restart scanner
  const qrPreviewSection = document.getElementById('qrPreviewSection');
  const scannerSection = document.getElementById('scannerSection');
  
  if (qrPreviewSection) qrPreviewSection.classList.add('hidden');
  if (scannerSection) scannerSection.classList.remove('hidden');
  
  // Reset detected data
  detectedQRData = null;
  
  // Restart scanner
  startScanner();
}

async function processQRCodeData(qrData: string) {
  try {
    // Validate QR data
    if (!qrData || qrData.trim() === '') {
      console.error('Empty QR data received in processQRCodeData');
      showError('Invalid QR Code', 'The QR code contains no data or is corrupted.');
      return;
    }
    
    console.log('Processing QR data:', qrData);
    
    // Check if we're in gate scanning mode
    if (isGateScanning && visitIdForGateScan) {
      await processGateQRCode(qrData);
      return;
    }
    
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

// Function to process gate QR code for entrance scanning
async function processGateQRCode(qrData: string) {
  try {
    const parsed = JSON.parse(qrData);
    
    // Check if it's a gate QR code
    if (parsed.type === 'gate' && parsed.id) {
      // Process the gate scan
      await processGateScan(parsed.id);
    } else {
      showError('Invalid Gate QR Code', 'This QR code is not a valid gate code. Please scan a gate QR code.');
    }
  } catch (error) {
    console.error('Error processing gate QR code:', error);
    showError('Invalid Gate QR Code', 'The gate QR code data could not be processed.');
  }
}

// Function to process gate scan
async function processGateScan(gateId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('Authentication Required', 'You must be logged in to scan gates.');
      return;
    }

    if (!visitIdForGateScan) {
      showError('Visit ID Missing', 'Visit ID is missing. Please try again.');
      return;
    }

    // Show face detection modal before processing gate scan
    await showFaceDetectionForGateScan(gateId);
  } catch (error) {
    console.error('Error in processGateScan:', error);
    showError('Gate Scan Error', 'Error processing gate scan.');
  }
}

// Function to show face detection modal for gate scanning
async function showFaceDetectionForGateScan(gateId: string) {
  try {
    // Show loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'faceDetectionLoading';
    loadingOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    loadingOverlay.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Preparing face detection...</p>
      </div>
    `;
    document.body.appendChild(loadingOverlay);

    // Open face detection modal
    const faceResult: FaceDetectionOutcome = await openFaceDetectionModal();
    
    // Remove loading overlay
    loadingOverlay.remove();

    if (faceResult.success && faceResult.imageDataUrl) {
      // Process the gate scan with face data
      await processGateScanWithFaceData(gateId, faceResult);
    } else {
      // Face detection failed or was cancelled
      showError('Face Detection Required', 'Face detection is required to scan the gate entrance. Please try again.');
    }
  } catch (error) {
    console.error('Error in face detection for gate scan:', error);
    showError('Face Detection Error', 'Error during face detection. Please try again.');
  }
}

// Function to process gate scan with face data
async function processGateScanWithFaceData(gateId: string, faceResult: FaceDetectionOutcome) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('Authentication Required', 'You must be logged in to scan gates.');
      return;
    }

    if (!visitIdForGateScan) {
      showError('Visit ID Missing', 'Visit ID is missing. Please try again.');
      return;
    }

    // Prepare face image data for storage
    let faceImageData = null;
    let faceDetectionMetadata = null;

    if (faceResult.imageDataUrl) {
      // Compress the face image for storage
      const compressedImage = await compressImageDataUrl(faceResult.imageDataUrl, 0.8, 400, 400);
      faceImageData = compressedImage;
      
      // Prepare metadata
      faceDetectionMetadata = {
        timestamp: new Date().toISOString(),
        confidence: faceResult.confidence || 0,
        boundingBox: faceResult.detections?.[0] || null,
        originalSize: faceResult.imageDataUrl.length,
        compressedSize: compressedImage.length
      };
    }

    // Call the gate scanning function with face data
    const { error } = await supabase.rpc('scan_gate_entrance_with_face', {
      p_visit_id: visitIdForGateScan,
      p_gate_id: gateId,
      p_scanned_by: user.id,
      p_face_image_data: faceImageData,
      p_face_detection_confidence: faceResult.confidence || 0,
      p_face_detection_metadata: faceDetectionMetadata,
      p_ip_address: null,
      p_user_agent: navigator.userAgent,
      p_location_data: null
    });

    if (error) {
      console.error('Error scanning gate with face data:', error);
      showError('Gate Scan Error', `Error scanning gate: ${error.message}`);
      return;
    }

    // Show success message
    showGateScanSuccess();
  } catch (error) {
    console.error('Error in processGateScanWithFaceData:', error);
    showError('Gate Scan Error', 'Error processing gate scan with face data.');
  }
}

// Function to show gate scan success
function showGateScanSuccess() {
  const resultsSection = document.getElementById('resultsSection');
  const scannerSection = document.getElementById('scannerSection');
  const qrPreviewSection = document.getElementById('qrPreviewSection');
  
  if (resultsSection && scannerSection && qrPreviewSection) {
    scannerSection.classList.add('hidden');
    qrPreviewSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    
    resultsSection.innerHTML = `
      <div class="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
        <h2 class="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Gate Entrance Scanned Successfully!</h2>
        <button 
          id="backToDashboardBtn"
          class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
        >
          Back to Dashboard
        </button>
      </div>
      <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800 dark:text-green-200">Gate entrance logged successfully!</h3>
            <div class="mt-2 text-sm text-green-700 dark:text-green-300">
              <p>Your gate entrance has been recorded for visit ID: ${visitIdForGateScan?.substring(0, 8)}...</p>
              <p class="mt-1">You can now complete your visit in the dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add event listener for back to dashboard button
    const backBtn = document.getElementById('backToDashboardBtn');
    backBtn?.addEventListener('click', () => {
      window.location.hash = '/dashboard';
      window.location.reload();
    });
  }
}

async function fetchVisitDataFromDatabase(visitId: string, currentUserId?: string): Promise<VisitQRData & { places: any[] } | null> {
  try {
    // Fetch visit data from Supabase
    const { data: visits, error } = await supabase
      .from('scheduled_visits')
      .select(`
        id,
        visitor_first_name,
        visitor_last_name,
        visitor_email,
        visit_date,
        purpose,
        status,
        scheduled_at,
        gate_entrance_scanned,
        gate_exit_scanned,
        scheduled_visit_places (
          *,
          places_to_visit (
            id,
            name,
            description,
            location
          )
        )
      `)
      .eq('id', visitId)
      .single();

    if (error) {
      console.error('Error fetching visit data:', error);
      return null;
    }

    if (!visits) {
      return null;
    }

    // Transform the data to match VisitQRData interface
    let places = visits.scheduled_visit_places?.map((svp: any) => ({
      placeId: svp.places_to_visit?.id || '',
      placeName: svp.places_to_visit?.name || 'Unknown Place',
      placeLocation: svp.places_to_visit?.location || '',
      status: svp.status || 'pending',
    })) || [];

    // If currentUserId is provided, check assignments for each place
    if (currentUserId) {
      // Get all place IDs
      const placeIds = places.map(p => p.placeId);
      if (placeIds.length > 0) {
        const { data: assignments, error: assignError } = await supabase
          .from('place_personnel')
          .select('place_id')
          .eq('personnel_id', currentUserId)
          .in('place_id', placeIds);
        if (!assignError && assignments) {
          const assignedPlaceIds = new Set(assignments.map(a => a.place_id));
          places = places.map(place => ({
            ...place,
            isAssignedToCurrentUser: assignedPlaceIds.has(place.placeId)
          }));
        }
      }
    }

    return {
      visitId: visits.id,
      visitorName: `${visits.visitor_first_name} ${visits.visitor_last_name}`,
      visitorEmail: visits.visitor_email,
      visitDate: visits.visit_date,
      purpose: visits.purpose,
      places: places,
      status: visits.status,
      scheduledAt: visits.scheduled_at,
      gate_entrance_scanned: Boolean(visits.gate_entrance_scanned),
      gate_exit_scanned: Boolean(visits.gate_exit_scanned)
    };
  } catch (error) {
    console.error('Error fetching visit data:', error);
    return null;
  }
}

async function displayVisitDetails(visitData: VisitQRData) {
  // Check if current user is personnel
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showError('Authentication Required', 'Please log in to view visit details.');
    return;
  }

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const isPersonnel = roleData?.role === 'personnel';

  if (isPersonnel) {
    // Fetch visit data again with assignment info for this user
    const visitWithAssignments = await fetchVisitDataFromDatabase(visitData.visitId, user.id);
    if (visitWithAssignments) {
      showPersonnelVisitModal(visitWithAssignments, user.id);
    } else {
      showError('Visit Not Found', 'Could not load visit details.');
    }
  } else {
    // Show regular results for non-personnel users
    showRegularVisitDetails(visitData);
  }
}

function showPersonnelVisitModal(visitData: VisitQRData & { places: any[] }, currentUserId: string) {
  const isCompleted = visitData.status === 'completed';
  const isTemporaryExit = visitData.status === 'temporary_exit';
  const hasEntranceScan = Boolean((visitData as any).gate_entrance_scanned);
  const requiresEntranceBeforeCompletion = visitData.status === 'pending' && !hasEntranceScan;
  // Date logic
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const visitDate = new Date(visitData.visitDate);
  visitDate.setHours(0, 0, 0, 0);
  const isFuture = visitDate.getTime() > today.getTime();
  const isPast = visitDate.getTime() < today.getTime();
  const isToday = visitDate.getTime() === today.getTime();

  // Message logic
  let dateNotice = '';
  let disableComplete = false;
  if (isFuture) {
    dateNotice = `<div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4 flex items-center">
      <svg class="h-5 w-5 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7V7a1 1 0 112 0v4a1 1 0 01-1 1H9a1 1 0 110-2h1z" clip-rule="evenodd" /></svg>
      <div>
        <h4 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Scheduled for Future Date</h4>
        <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
          This visit is scheduled for <strong>${visitDate.toLocaleDateString()}</strong>. You can only complete it on the scheduled date.
        </p>
      </div>
    </div>`;
    disableComplete = true;
  } else if (isPast) {
    dateNotice = `<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 flex items-center">
      <svg class="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
      <div>
        <h4 class="text-sm font-medium text-red-800 dark:text-red-200">Visit Date Passed</h4>
        <p class="text-sm text-red-700 dark:text-red-300 mt-1">
          This visit is already past the scheduled date and is marked as unsuccessful.
        </p>
      </div>
    </div>`;
    disableComplete = true;
  }

  // Temporary exit notice disables completion
  let statusNotice = '';
  if (!isCompleted && isTemporaryExit) {
    statusNotice = `<div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4 flex items-center">
      <svg class="h-5 w-5 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7V7a1 1 0 112 0v4a1 1 0 01-1 1H9a1 1 0 110-2h1z" clip-rule="evenodd" /></svg>
      <div>
        <h4 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Temporary Exit</h4>
        <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
          The visitor is currently on a temporary exit. Marking places as complete is disabled until they re-enter.
        </p>
      </div>
    </div>`;
    disableComplete = true;
  }

  // Pending visit without entrance scan disables completion
  if (!isCompleted && requiresEntranceBeforeCompletion) {
    statusNotice += `<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 flex items-center">
      <svg class="h-5 w-5 text-blue-400 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 9a1 1 0 100 2h4a1 1 0 100-2H8z" clip-rule="evenodd" /></svg>
      <div>
        <h4 class="text-sm font-medium text-blue-800 dark:text-blue-200">Entrance Scan Required</h4>
        <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
          This scheduled visit is still pending and has no recorded entrance at the gate. Please scan the entrance gate first before marking any place as complete.
        </p>
      </div>
    </div>`;
    disableComplete = true;
  }

  // Create modal HTML
  const modalHTML = `
    <div id="personnelVisitModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <!-- Header -->
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Visit Details - Personnel View</h3>
            <div class="flex items-center space-x-2">
              <button 
                id="refreshPersonnelModalBtn"
                class="text-blue-400 hover:text-blue-500 focus:outline-none p-1"
                title="Refresh data"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
              <button 
                id="closePersonnelModalBtn"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          ${isCompleted ? `
            <!-- Completion Notice -->
            <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h4 class="text-sm font-medium text-green-800 dark:text-green-200">Visit Already Completed</h4>
                  <p class="text-sm text-green-700 dark:text-green-300 mt-1">
                    This visit has already been completed. No further action is required.
                  </p>
                </div>
              </div>
            </div>
          ` : ''}

          ${!isCompleted && dateNotice ? dateNotice : ''}
          ${!isCompleted && statusNotice ? statusNotice : ''}

          <!-- Visit Information -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ${visitData.visitorName}
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-600 dark:text-gray-400"><strong>Email:</strong> ${visitData.visitorEmail}</p>
                <p class="text-gray-600 dark:text-gray-400"><strong>Visit Date:</strong> ${new Date(visitData.visitDate).toLocaleDateString()}</p>
                <p class="text-gray-600 dark:text-gray-400"><strong>Purpose:</strong> ${visitData.purpose}</p>
              </div>
              <div>
                <p class="text-gray-600 dark:text-gray-400"><strong>Status:</strong> 
                  <span class="px-2 py-1 rounded-full text-xs font-medium ${
                    visitData.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    visitData.status === 'completed_flagged' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    visitData.status === 'unsuccessful' || visitData.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    visitData.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }">
                    ${visitData.status === 'completed_flagged' ? 'Completed (Flagged)' : visitData.status.charAt(0).toUpperCase() + visitData.status.slice(1)}
                  </span>
                </p>
                <p class="text-gray-600 dark:text-gray-400"><strong>Scheduled:</strong> ${new Date(visitData.scheduledAt).toLocaleDateString()} at ${new Date(visitData.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>

          <!-- Places Section -->
          ${visitData.places.length > 0 ? `
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Places to Visit (${visitData.places.length})
              </h4>
              <div class="space-y-3">
                ${(() => {
                  const assignedCount = visitData.places.filter(place => place.isAssignedToCurrentUser).length;
                  let placesHtml = visitData.places.map((place, index) => `
                    <div class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div class="flex-1">
                        <h5 class="text-sm font-medium text-gray-900 dark:text-white">${place.placeName}</h5>
                        ${place.placeLocation ? `<p class="text-xs text-gray-600 dark:text-gray-400">📍 ${place.placeLocation}</p>` : ''}
                      </div>
                      <div class="flex items-center space-x-2">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${
                          place.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          place.status === 'completed_flagged' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          place.status === 'unsuccessful' || place.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          place.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }">
                          ${place.status === 'completed_flagged' ? 'Completed (Flagged)' : place.status.charAt(0).toUpperCase() + place.status.slice(1)}
                        </span>
                        ${!isFuture && place.status === 'pending' && place.isAssignedToCurrentUser ? `
                          ${visitData.status === 'completed_flagged' ? `
                            <button 
                              disabled
                              class="ml-2 px-3 py-1 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed text-xs font-medium"
                              title="Visit is Completed (Flagged). You cannot mark places complete."
                            >
                              Mark Complete
                            </button>
                          ` : isTemporaryExit ? `
                            <button 
                              disabled
                              class="ml-2 px-3 py-1 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed text-xs font-medium"
                              title="Visitor is on temporary exit. You cannot mark places complete until re-entry."
                            >
                              Mark Complete
                            </button>
                          ` : requiresEntranceBeforeCompletion ? `
                            <button 
                              disabled
                              class="ml-2 px-3 py-1 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed text-xs font-medium"
                              title="Entrance scan required at gate before completing places."
                            >
                              Mark Complete
                            </button>
                          ` : `
                            <button 
                              onclick="completeVisitPlace('${visitData.visitId}', '${place.placeId}')"
                              class="ml-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-xs font-medium"
                            >
                              Mark Complete
                            </button>
                          `}
                        ` : ''}
                      </div>
                    </div>
                  `).join('');
                  if (visitData.places.length > 1 && assignedCount === 0) {
                    placesHtml += `<div class='mt-2 text-center text-sm text-red-600 dark:text-red-400 font-medium'>You are not assigned to any department in this visit.</div>`;
                  }
                  return placesHtml;
                })()}
              </div>
            </div>
          ` : `
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center mb-4">
              <p class="text-gray-600 dark:text-gray-400">No places assigned to this visit</p>
            </div>
          `}

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3">
            <button 
              id="closePersonnelModalBtn2"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200"
            >
              Close
            </button>
          </div>

          <!-- Status Message -->
          <div id="personnelModalStatus" class="mt-4 text-center hidden">
            <!-- Status messages will be shown here -->
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Add event listeners
  const modal = document.getElementById('personnelVisitModal');
  const closeBtn1 = document.getElementById('closePersonnelModalBtn');
  const closeBtn2 = document.getElementById('closePersonnelModalBtn2');
  const refreshBtn = document.getElementById('refreshPersonnelModalBtn');

  const closeModal = () => {
    if (modal) {
      modal.remove();
    }
    // Refresh the page when modal is closed
    window.location.reload();
  };

  const refreshModal = async () => {
    if (refreshBtn) {
      // Show loading state
      refreshBtn.innerHTML = `
        <svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      `;
      refreshBtn.setAttribute('disabled', 'true');
    }
    
    await refreshPersonnelModal(visitData.visitId, currentUserId);
  };

  closeBtn1?.addEventListener('click', closeModal);
  closeBtn2?.addEventListener('click', closeModal);
  refreshBtn?.addEventListener('click', refreshModal);

  // Close on background click
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Hide scanner section
  const scannerSection = document.getElementById('scannerSection');
  if (scannerSection) {
    scannerSection.classList.add('hidden');
  }
  
  // Hide QR preview section
  const qrPreviewSection = document.getElementById('qrPreviewSection');
  if (qrPreviewSection) {
    qrPreviewSection.classList.add('hidden');
  }
}

function showRegularVisitDetails(visitData: VisitQRData) {
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
              visitData.status === 'completed_flagged' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
              visitData.status === 'unsuccessful' || visitData.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
              visitData.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }">
              ${visitData.status === 'completed_flagged' ? 'Completed (Flagged)' : visitData.status.charAt(0).toUpperCase() + visitData.status.slice(1)}
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
                  place.status === 'completed_flagged' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                  place.status === 'unsuccessful' || place.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  place.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }">
                  ${place.status === 'completed_flagged' ? 'Completed (Flagged)' : place.status.charAt(0).toUpperCase() + place.status.slice(1)}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : `
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center mb-4">
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

// Live feedback functions
function updateLiveFeedback(message: string, type: 'searching' | 'detecting' | 'success' | 'error') {
  const feedbackText = document.getElementById('feedbackText');
  const feedbackIcon = document.getElementById('feedbackIcon');
  const focusIndicator = document.getElementById('focusIndicator');
  const scanningLine = document.getElementById('scanningLine');
  
  if (feedbackText) {
    feedbackText.textContent = message;
  }
  
  if (feedbackIcon) {
    // Update icon based on type
    let iconPath = '';
    switch (type) {
      case 'searching':
        iconPath = 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z';
        break;
      case 'detecting':
        iconPath = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
        break;
      case 'success':
        iconPath = 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z';
        break;
      case 'error':
        iconPath = 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z';
        break;
    }
    
    const path = feedbackIcon.querySelector('path');
    if (path) {
      path.setAttribute('d', iconPath);
    }
  }
  
  // Update focus indicator
  if (focusIndicator) {
    if (type === 'detecting' || type === 'success') {
      focusIndicator.classList.remove('opacity-0');
      focusIndicator.classList.add('opacity-100');
    } else {
      focusIndicator.classList.remove('opacity-100');
      focusIndicator.classList.add('opacity-0');
    }
  }
  
  // Update scanning line animation
  if (scanningLine) {
    if (type === 'detecting') {
      scanningLine.classList.add('animate-pulse');
      scanningLine.classList.remove('animate-bounce');
    } else if (type === 'success') {
      scanningLine.classList.remove('animate-pulse');
      scanningLine.classList.add('animate-bounce');
    } else {
      scanningLine.classList.remove('animate-pulse', 'animate-bounce');
    }
  }
}

function checkForPotentialQRPattern(imageData: ImageData): boolean {
  const { data, width, height } = imageData;
  
  // Optimized edge detection for QR code patterns
  // Focus on center area where QR codes are most likely to be
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const scanArea = Math.min(width, height) * 0.6; // Focus on 60% of the smaller dimension
  const startX = Math.max(0, centerX - scanArea / 2);
  const endX = Math.min(width, centerX + scanArea / 2);
  const startY = Math.max(0, centerY - scanArea / 2);
  const endY = Math.min(height, centerY + scanArea / 2);
  
  let highContrastPixels = 0;
  let totalPixels = 0;
  const threshold = 40; // Lower threshold for better sensitivity
  
  // Sample every 4th pixel for better performance
  for (let y = startY; y < endY; y += 4) {
    for (let x = startX; x < endX; x += 4) {
      totalPixels++;
      const idx = (y * width + x) * 4;
      
      // Use luminance for better contrast detection
      const current = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      
      // Check horizontal contrast (simplified)
      if (x + 4 < endX) {
        const right = data[idx + 4] * 0.299 + data[idx + 5] * 0.587 + data[idx + 6] * 0.114;
        const horizontalDiff = Math.abs(current - right);
        
        if (horizontalDiff > threshold) {
          highContrastPixels++;
          continue; // Skip vertical check if horizontal already found
        }
      }
      
      // Check vertical contrast (simplified)
      if (y + 4 < endY) {
        const bottom = data[(y + 4) * width * 4 + x * 4] * 0.299 + 
                      data[(y + 4) * width * 4 + x * 4 + 1] * 0.587 + 
                      data[(y + 4) * width * 4 + x * 4 + 2] * 0.114;
        const verticalDiff = Math.abs(current - bottom);
        
        if (verticalDiff > threshold) {
          highContrastPixels++;
        }
      }
    }
  }
  
  // More sensitive threshold for smaller scan area
  const contrastRatio = highContrastPixels / totalPixels;
  return contrastRatio > 0.08; // 8% of pixels should have high contrast
}

// Global functions for personnel to complete visits (accessible from onclick)
(window as any).completeVisitPlace = async function(visitId: string, placeId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showPersonnelModalStatus('Error: User not authenticated', 'error');
      return;
    }

    // Guard: prevent completion if visit is currently in temporary_exit status
    const visitData = await fetchVisitDataFromDatabase(visitId, user.id);
    if (visitData && visitData.status === 'temporary_exit') {
      showPersonnelModalStatus('Cannot complete while visitor is on temporary exit. Please scan re-entry first.', 'error');
      return;
    }

    // Guard: prevent completion for pending visit without entrance gate scanned
    try {
      const { data: gateCheck, error: gateCheckError } = await supabase
        .from('scheduled_visits')
        .select('status, gate_entrance_scanned')
        .eq('id', visitId)
        .single();
      if (!gateCheckError && gateCheck && gateCheck.status === 'pending' && !gateCheck.gate_entrance_scanned) {
        showPersonnelModalStatus('Entrance scan required at gate before completing places.', 'error');
        return;
      }
    } catch (e) {
      // If gate check fails, fail closed to be safe
      showPersonnelModalStatus('Unable to verify entrance scan. Please try again after scanning entrance.', 'error');
      return;
    }

    // Call the RPC function to complete the place
    const { data, error } = await supabase.rpc('complete_visit_place', {
      p_visit_id: visitId,
      p_place_id: placeId,
      p_completed_by: user.id
    });

    if (error) {
      console.error('Error completing visit place:', error);
      showPersonnelModalStatus('Error: ' + error.message, 'error');
      return;
    }

    showPersonnelModalStatus('Place marked as completed successfully!', 'success');
    
    // Refresh the modal with updated data immediately
    await refreshPersonnelModal(visitId, user.id);

  } catch (error) {
    console.error('Error completing visit place:', error);
    showPersonnelModalStatus('Error completing place', 'error');
  }
};

(window as any).completeEntireVisit = async function(visitId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showPersonnelModalStatus('Error: User not authenticated', 'error');
      return;
    }

    // Call the RPC function to complete the entire visit
    const { data, error } = await supabase.rpc('complete_visit', {
      p_visit_id: visitId,
      p_completed_by: user.id
    });

    if (error) {
      console.error('Error completing visit:', error);
      showPersonnelModalStatus('Error: ' + error.message, 'error');
      return;
    }

    showPersonnelModalStatus('Visit completed successfully!', 'success');
    
    // Refresh the modal with updated data immediately
    await refreshPersonnelModal(visitId, user.id);

  } catch (error) {
    console.error('Error completing visit:', error);
    showPersonnelModalStatus('Error completing visit', 'error');
  }
};

// Helper function to refresh the personnel modal with updated data
async function refreshPersonnelModal(visitId: string, userId: string) {
  try {
    console.log('Refreshing personnel modal for visit:', visitId, 'user:', userId);
    
    // Small delay to ensure database transaction is complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Fetch fresh data from database
    const updatedVisitData = await fetchVisitDataFromDatabase(visitId, userId);
    
    if (updatedVisitData) {
      console.log('Updated visit data:', updatedVisitData);
      console.log('Places with assignments:', updatedVisitData.places.map(p => ({
        placeName: p.placeName,
        isAssigned: p.isAssignedToCurrentUser,
        status: p.status
      })));
      
      // Remove old modal
      const oldModal = document.getElementById('personnelVisitModal');
      if (oldModal) {
        oldModal.remove();
      }
      
      // Show new modal with updated data
      showPersonnelVisitModal(updatedVisitData, userId);
      
      console.log('Modal refreshed successfully');
    } else {
      console.error('Failed to fetch updated visit data');
      showPersonnelModalStatus('Error: Could not refresh visit data', 'error');
    }
  } catch (error) {
    console.error('Error refreshing personnel modal:', error);
    showPersonnelModalStatus('Error refreshing modal', 'error');
  }
}

// Helper function to show status messages in personnel modal
function showPersonnelModalStatus(message: string, type: 'success' | 'error') {
  const statusDiv = document.getElementById('personnelModalStatus');
  if (statusDiv) {
    statusDiv.classList.remove('hidden');
    statusDiv.innerHTML = `
      <div class="p-3 rounded-md ${
        type === 'success' 
          ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200' 
          : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200'
      }">
        <p class="text-sm font-medium">${message}</p>
      </div>
    `;
    
    // Hide the message after 3 seconds
    setTimeout(() => {
      statusDiv.classList.add('hidden');
    }, 3000);
  }
}

// Function to toggle QR data dropdown
function toggleQRData(elementId: string) {
  const dataElement = document.getElementById(elementId);
  const iconElement = document.getElementById(elementId + '-icon');
  
  if (dataElement && iconElement) {
    const isHidden = dataElement.classList.contains('hidden');
    
    if (isHidden) {
      // Show the data
      dataElement.classList.remove('hidden');
      iconElement.classList.add('rotate-180');
    } else {
      // Hide the data
      dataElement.classList.add('hidden');
      iconElement.classList.remove('rotate-180');
    }
  }
}

// Make toggleQRData function available globally
(window as any).toggleQRData = toggleQRData;