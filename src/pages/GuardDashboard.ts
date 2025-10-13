import supabase from '../config/supabase';
import { parseQRCodeData, type VisitQRData } from '../utils/qrCode';
import jsQR from 'jsqr';

export function GuardDashboardPage() {
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
              <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Guard Dashboard</h1>
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
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">Point your camera at a scheduled visit QR code to log entrance or exit</p>
          </div>
          
          <!-- Camera Feed -->
          <div class="relative">
            <video 
              id="guardVideo" 
              class="w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto rounded-lg border-2 border-gray-300 dark:border-gray-600"
              autoplay
              muted
              playsinline
            ></video>
            <canvas id="guardCanvas" class="hidden"></canvas>
            
            <!-- Scanner Overlay -->
            <div id="guardScannerOverlay" class="absolute inset-0 max-w-xs sm:max-w-md md:max-w-lg mx-auto flex items-center justify-center pointer-events-none hidden">
              <div class="w-48 h-48 sm:w-64 sm:h-64 border-2 border-blue-500 rounded-lg relative">
                <div class="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                <div class="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                <div class="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                <div class="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
                
                <!-- Scanning Animation -->
                <div id="guardScanningLine" class="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>
                
                <!-- Focus Indicator -->
                <div id="guardFocusIndicator" class="absolute inset-0 border-2 border-green-500 rounded-lg opacity-0 transition-opacity duration-300"></div>
              </div>
            </div>
            
            <!-- Live Feedback -->
            <div id="guardLiveFeedback" class="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium max-w-xs w-full sm:max-w-md">
              <div class="flex items-center space-x-2">
                <div id="guardFeedbackIcon" class="w-4 h-4">
                  <svg class="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                  </svg>
                </div>
                <span id="guardFeedbackText">Position QR code in frame</span>
              </div>
            </div>
          </div>
          
          <!-- Controls -->
          <div class="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
            <button 
              id="guardStartScanBtn"
              class="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              Start Scanner
            </button>
            <button 
              id="guardStopScanBtn"
              class="w-full sm:w-auto px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 font-medium hidden"
            >
              Stop Scanner
            </button>
            <button 
              id="guardSwitchCameraBtn"
              class="w-full sm:w-auto px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              Switch Camera
            </button>
          </div>
          
          <!-- Status -->
          <div id="guardScannerStatus" class="text-center mt-4">
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Click "Start Scanner" to begin</p>
            <div id="guardPerformanceIndicator" class="hidden mt-2">
              <p class="text-xs text-blue-600 dark:text-blue-400">
                Scan Rate: <span id="guardScanRate">0</span> FPS • 
                Interval: <span id="guardScanInterval">100</span>ms
              </p>
            </div>
          </div>
        </div>

        <!-- QR Data Preview Section -->
        <div id="guardQrPreviewSection" class="hidden bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-6 mb-6">
          <div class="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
            <h2 class="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Visit QR Code Detected</h2>
            <div class="flex space-x-2">
              <button 
                id="guardProcessQRBtn"
                class="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Process</span>
              </button>
              <button 
                id="guardRescanBtn"
                class="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
              >
                Rescan
              </button>
            </div>
          </div>
          <div id="guardQrPreviewContent" class="space-y-4">
            <!-- QR preview content will be populated here -->
          </div>
        </div>


        <!-- Success/Error Messages -->
        <div id="guardMessageSection" class="hidden">
          <!-- Success/Error messages will be shown here -->
        </div>
      </div>
    </div>
  `;
}

// Guard QR Scanner functionality
let guardStream: MediaStream | null = null;
let guardScanning = false;
let guardCurrentFacingMode = 'environment';
let guardLastScanTime = 0;
let guardScanInterval = 100;
let guardConsecutiveFailures = 0;
let guardMaxConsecutiveFailures = 10;
let guardCanvas: HTMLCanvasElement | null = null;
let guardCtx: CanvasRenderingContext2D | null = null;
let guardImageData: ImageData | null = null;
let guardScanCount = 0;
let guardLastPerformanceUpdate = 0;
let guardDetectedQRData: string | null = null;
let guardEmptyQRTimeout: NodeJS.Timeout | null = null;
let guardCurrentVisitData: VisitQRData | null = null;

export function initializeGuardDashboard() {
  const startScanBtn = document.getElementById('guardStartScanBtn');
  const stopScanBtn = document.getElementById('guardStopScanBtn');
  const switchCameraBtn = document.getElementById('guardSwitchCameraBtn');
  const refreshPageBtn = document.getElementById('refreshPageBtn');
  const processQRBtn = document.getElementById('guardProcessQRBtn');
  const rescanBtn = document.getElementById('guardRescanBtn');
  const newScanBtn = document.getElementById('guardNewScanBtn');

  startScanBtn?.addEventListener('click', startGuardScanner);
  stopScanBtn?.addEventListener('click', stopGuardScanner);
  switchCameraBtn?.addEventListener('click', switchGuardCamera);
  refreshPageBtn?.addEventListener('click', () => window.location.reload());
  processQRBtn?.addEventListener('click', processGuardDetectedQR);
  rescanBtn?.addEventListener('click', rescanGuardQR);
  newScanBtn?.addEventListener('click', resetGuardScanner);

  // Auto-start scanner when page loads
  setTimeout(() => {
    startGuardScanner();
  }, 1000);
}

async function startGuardScanner() {
  try {
    const video = document.getElementById('guardVideo') as HTMLVideoElement;
    const canvas = document.getElementById('guardCanvas') as HTMLCanvasElement;
    const status = document.getElementById('guardScannerStatus');
    const startBtn = document.getElementById('guardStartScanBtn');
    const stopBtn = document.getElementById('guardStopScanBtn');

    if (!video || !canvas || !status || !startBtn || !stopBtn) return;

    // Initialize canvas context once
    guardCtx = canvas.getContext('2d');
    if (!guardCtx) {
      throw new Error('Could not get canvas context');
    }

    // Request camera access
    guardStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: guardCurrentFacingMode,
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
        focusMode: 'continuous',
        exposureMode: 'continuous',
        whiteBalanceMode: 'continuous'
      }
    });

    video.srcObject = guardStream;
    
    // Show loading state while camera initializes
    if (status) status.innerHTML = '<p class="text-sm text-blue-600 dark:text-blue-400">Initializing camera...</p>';
    if (startBtn) startBtn.classList.add('hidden');
    if (stopBtn) stopBtn.classList.remove('hidden');
    
    // Wait for video to be ready before showing overlay and starting scan
    video.onloadedmetadata = () => {
      // Show the scanner overlay now that camera is ready
      const scannerOverlay = document.getElementById('guardScannerOverlay');
      if (scannerOverlay) {
        scannerOverlay.classList.remove('hidden');
      }
      
      guardScanning = true;
      guardConsecutiveFailures = 0;
      guardScanInterval = 100;
      guardScanCount = 0;
      guardLastPerformanceUpdate = Date.now();
      
      // Show performance indicator
      const performanceIndicator = document.getElementById('guardPerformanceIndicator');
      if (performanceIndicator) {
        performanceIndicator.classList.remove('hidden');
      }

      // Update UI status
      status.innerHTML = '<p class="text-sm text-green-600 dark:text-green-400">Scanner active - Point camera at QR code</p>';

      // Initialize live feedback
      updateGuardLiveFeedback('Position QR code in frame', 'searching');

      // Start scanning loop
      guardScanLoop();
    };

    // Handle video loading errors
    video.onerror = () => {
      console.error('Error loading video stream');
      showGuardError('Camera Error', 'Failed to load camera feed. Please try again.');
    };

  } catch (error) {
    console.error('Error starting guard scanner:', error);
    showGuardError('Camera access denied', 'Please allow camera access to use the QR scanner.');
  }
}

function stopGuardScanner() {
  if (guardStream) {
    guardStream.getTracks().forEach(track => track.stop());
    guardStream = null;
  }
  
  guardScanning = false;
  
  // Clear timeout
  if (guardEmptyQRTimeout) {
    clearTimeout(guardEmptyQRTimeout);
    guardEmptyQRTimeout = null;
  }
  
  // Reset scanner state
  guardConsecutiveFailures = 0;
  guardScanInterval = 100;
  guardLastScanTime = 0;
  guardScanCount = 0;
  
  // Hide performance indicator
  const performanceIndicator = document.getElementById('guardPerformanceIndicator');
  if (performanceIndicator) {
    performanceIndicator.classList.add('hidden');
  }
  
  const video = document.getElementById('guardVideo') as HTMLVideoElement;
  const status = document.getElementById('guardScannerStatus');
  const startBtn = document.getElementById('guardStartScanBtn');
  const stopBtn = document.getElementById('guardStopScanBtn');
  const scannerOverlay = document.getElementById('guardScannerOverlay');

  if (video) video.srcObject = null;
  if (status) status.innerHTML = '<p class="text-sm text-gray-600 dark:text-gray-400">Scanner stopped</p>';
  if (startBtn) startBtn.classList.remove('hidden');
  if (stopBtn) stopBtn.classList.add('hidden');
  if (scannerOverlay) scannerOverlay.classList.add('hidden');
  
  // Reset live feedback
  updateGuardLiveFeedback('Scanner stopped', 'error');
}

async function switchGuardCamera() {
  guardCurrentFacingMode = guardCurrentFacingMode === 'environment' ? 'user' : 'environment';
  
  if (guardScanning) {
    stopGuardScanner();
    setTimeout(() => {
      startGuardScanner();
    }, 500);
  }
}

function guardScanLoop() {
  if (!guardScanning) return;

  const video = document.getElementById('guardVideo') as HTMLVideoElement;
  const canvas = document.getElementById('guardCanvas') as HTMLCanvasElement;

  if (!video || !canvas || !guardCtx || video.readyState !== video.HAVE_ENOUGH_DATA) {
    requestAnimationFrame(guardScanLoop);
    return;
  }

  const currentTime = Date.now();
  
  // Adaptive scanning frequency
  if (currentTime - guardLastScanTime < guardScanInterval) {
    requestAnimationFrame(guardScanLoop);
    return;
  }

  // Set canvas dimensions only if they changed
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  // Draw video frame to canvas
  guardCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  // Get image data for QR code detection
  guardImageData = guardCtx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Use jsQR for detection
  const code = jsQR(guardImageData.data, guardImageData.width, guardImageData.height, {
    inversionAttempts: "dontInvert",
  });
  
  // Update performance metrics
  guardScanCount++;
  const now = Date.now();
  if (now - guardLastPerformanceUpdate >= 1000) {
    const fps = Math.round((guardScanCount * 1000) / (now - guardLastPerformanceUpdate));
    const scanRateElement = document.getElementById('guardScanRate');
    const scanIntervalElement = document.getElementById('guardScanInterval');
    
    if (scanRateElement) scanRateElement.textContent = fps.toString();
    if (scanIntervalElement) scanIntervalElement.textContent = guardScanInterval.toString();
    
    guardScanCount = 0;
    guardLastPerformanceUpdate = now;
  }
  
  if (code) {
    // QR code detected!
    console.log('Guard QR Code detected:', code.data);
    
    // Validate QR data
    if (!code.data || code.data.trim() === '') {
      console.warn('QR code detected but contains no data');
      updateGuardLiveFeedback('Invalid QR code - no data found', 'error');
      guardConsecutiveFailures++;
      
      if (guardEmptyQRTimeout) {
        clearTimeout(guardEmptyQRTimeout);
      }
      guardEmptyQRTimeout = setTimeout(() => {
        updateGuardLiveFeedback('Position QR code in frame', 'searching');
        guardConsecutiveFailures = 0;
        guardScanInterval = 100;
      }, 3000);
      
      requestAnimationFrame(guardScanLoop);
      return;
    }
    
    // Clear timeout
    if (guardEmptyQRTimeout) {
      clearTimeout(guardEmptyQRTimeout);
      guardEmptyQRTimeout = null;
    }
    
    // Store the detected QR data
    guardDetectedQRData = code.data;
    
    // Show success feedback
    updateGuardLiveFeedback('QR code detected!', 'success');
    
    // Stop scanning
    stopGuardScanner();
    
    // Show QR preview
    showGuardQRPreview(code.data);
    
    return;
  }
  
  // Increment consecutive failures
  guardConsecutiveFailures++;
  
  // Adaptive scan interval
  if (guardConsecutiveFailures > guardMaxConsecutiveFailures) {
    guardScanInterval = Math.min(guardScanInterval * 1.2, 300);
  } else if (guardConsecutiveFailures < 3) {
    guardScanInterval = Math.max(guardScanInterval * 0.9, 50);
  }
  
  // Check for potential QR patterns
  const hasPotentialQR = checkGuardForPotentialQRPattern(guardImageData);
  if (hasPotentialQR) {
    updateGuardLiveFeedback('QR code pattern detected - hold steady', 'detecting');
    guardScanInterval = Math.max(guardScanInterval * 0.8, 30);
    guardConsecutiveFailures = Math.max(0, guardConsecutiveFailures - 2);
  } else {
    updateGuardLiveFeedback('Position QR code in frame', 'searching');
  }
  
  guardLastScanTime = currentTime;
  
  // Continue scanning
  requestAnimationFrame(guardScanLoop);
}

function showGuardQRPreview(qrData: string) {
  const scannerSection = document.getElementById('scannerSection');
  const qrPreviewSection = document.getElementById('guardQrPreviewSection');
  const qrPreviewContent = document.getElementById('guardQrPreviewContent');
  
  if (!scannerSection || !qrPreviewSection || !qrPreviewContent) return;
  
  // Validate QR data
  if (!qrData || qrData.trim() === '') {
    showGuardError('Invalid QR Code', 'The scanned QR code contains no data or is corrupted.');
    return;
  }
  
  // Hide scanner, show preview
  scannerSection.classList.add('hidden');
  qrPreviewSection.classList.remove('hidden');
  
  try {
    // Try to parse the QR data as JSON
    const parsedData = JSON.parse(qrData);
    
    // Check if it's a visit QR code
    if (parsedData.type === 'visit' && parsedData.id) {
      // Simple visit QR code - fetch full data
      fetchGuardVisitData(parsedData.id);
    } else if (parsedData.visitId && parsedData.visitorName) {
      // Full visit QR code
      guardCurrentVisitData = parsedData;
      showGuardVisitDetails(parsedData);
    } else {
      showGuardError('Invalid QR Code', 'This QR code is not a valid visit code.');
    }
  } catch (error) {
    showGuardError('Invalid QR Code', 'The QR code data could not be processed.');
  }
}

async function fetchGuardVisitData(visitId: string) {
  try {
    const { data: visits, error } = await supabase
      .from('scheduled_visits')
      .select(`
        *,
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
      showGuardError('Visit Not Found', 'The visit associated with this QR code could not be found.');
      return;
    }

    if (!visits) {
      showGuardError('Visit Not Found', 'The visit associated with this QR code could not be found.');
      return;
    }

    // Transform the data
    const places = visits.scheduled_visit_places?.map((svp: any) => ({
      placeId: svp.places_to_visit?.id || '',
      placeName: svp.places_to_visit?.name || 'Unknown Place',
      placeLocation: svp.places_to_visit?.location || '',
      status: svp.status || 'pending',
    })) || [];

    const visitData = {
      visitId: visits.id,
      visitorName: `${visits.visitor_first_name} ${visits.visitor_last_name}`,
      visitorEmail: visits.visitor_email,
      visitDate: visits.visit_date,
      purpose: visits.purpose,
      places: places,
      status: visits.status,
      scheduledAt: visits.scheduled_at,
      // Extra fields used by guard modal logic
      gateEntranceScanned: visits.gate_entrance_scanned === true,
      gateExitScanned: visits.gate_exit_scanned === true
    } as any;

    guardCurrentVisitData = visitData;
    showGuardVisitDetails(visitData);
  } catch (error) {
    console.error('Error fetching visit data:', error);
    showGuardError('Error', 'Could not fetch visit details.');
  }
}

function showGuardVisitDetails(visitData: VisitQRData) {
  // Show confirmation modal similar to personnel scanning
  showGuardVisitConfirmationModal(visitData);
}

function showGuardVisitConfirmationModal(visitData: VisitQRData) {
  const visitDate = new Date(visitData.visitDate);
  const scheduledDate = new Date(visitData.scheduledAt);
  
  // Date logic for validation
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const visitDateOnly = new Date(visitData.visitDate);
  visitDateOnly.setHours(0, 0, 0, 0);
  const isFuture = visitDateOnly.getTime() > today.getTime();
  const isPast = visitDateOnly.getTime() < today.getTime();
  const isToday = visitDateOnly.getTime() === today.getTime();

  // Determine which actions are needed based on place completion
  const placeStatuses = (visitData.places || []).map(p => (p.status || '').toLowerCase());
  const isCompletedStatus = (s: string) => ['completed', 'completed_flagged', 'cancelled', 'failed', 'unsuccessful'].includes(s);
  const allPlacesCompleted = placeStatuses.length > 0 && placeStatuses.every(isCompletedStatus);
  const noneStarted = placeStatuses.length > 0 && placeStatuses.every(s => s === 'pending');
  const midProgress = !noneStarted && !allPlacesCompleted;

  // Gate state (from fetched visit)
  const gateEntranceScanned = (visitData as any).gateEntranceScanned === true;

  const isTemporaryExit = (visitData.status === 'temporary_exit');
  const shouldEnableEntrance = (isToday && !gateEntranceScanned && noneStarted) || isTemporaryExit;
  const shouldEnableExit = isToday && gateEntranceScanned && allPlacesCompleted;
  const shouldEnableTemporaryExit = isToday && gateEntranceScanned && visitData.status !== 'temporary_exit' && !allPlacesCompleted;
  const shouldDisableBoth = isFuture || isPast || (gateEntranceScanned && !allPlacesCompleted) || midProgress || (!shouldEnableEntrance && !shouldEnableExit && !shouldEnableTemporaryExit);

  // Create modal HTML
  const modalHTML = `
    <div id="guardVisitModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <!-- Header -->
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Visit Confirmation - Guard View</h3>
            <div class="flex items-center space-x-2">
              <button 
                id="refreshGuardModalBtn"
                class="text-blue-400 hover:text-blue-500 focus:outline-none p-1"
                title="Refresh data"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
              <button 
                id="closeGuardModalBtn"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          ${isFuture ? `
            <!-- Future Date Notice -->
            <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4 flex items-center">
              <svg class="h-5 w-5 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7V7a1 1 0 112 0v4a1 1 0 01-1 1H9a1 1 0 110-2h1z" clip-rule="evenodd" /></svg>
              <div>
                <h4 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Scheduled for Future Date</h4>
                <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  This visit is scheduled for <strong>${visitDate.toLocaleDateString()}</strong>. You can only log entrance/exit on the scheduled date.
                </p>
              </div>
            </div>
          ` : ''}

          ${isPast ? `
            <!-- Past Date Notice -->
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 flex items-center">
              <svg class="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
              <div>
                <h4 class="text-sm font-medium text-red-800 dark:text-red-200">Visit Date Passed</h4>
                <p class="text-sm text-red-700 dark:text-red-300 mt-1">
                  This visit is already past the scheduled date. Please verify the visit details before logging.
                </p>
              </div>
            </div>
          ` : ''}

          <!-- Visit Information -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ${visitData.visitorName}
            </h4>
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

          <!-- Places Section -->
          ${visitData.places.length > 0 ? `
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
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

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <button 
              id="guardEntranceConfirmBtn"
              class="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-md ${shouldEnableEntrance ? 'hover:bg-green-700' : 'opacity-50 cursor-not-allowed'} transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
              ${shouldEnableEntrance ? '' : 'disabled'}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
              <span>Log Entrance</span>
            </button>
            <button 
              id="guardTempExitBtn"
              class="w-full sm:w-auto px-6 py-3 bg-amber-600 text-white rounded-md ${shouldEnableTemporaryExit ? 'hover:bg-amber-700' : 'opacity-50 cursor-not-allowed'} transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
              ${shouldEnableTemporaryExit ? '' : 'disabled'}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v8m4-4H8" />
              </svg>
              <span>Temporary Exit</span>
            </button>
            <button 
              id="guardExitConfirmBtn"
              class="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-md ${shouldEnableExit ? 'hover:bg-red-700' : 'opacity-50 cursor-not-allowed'} transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
              ${shouldEnableExit ? '' : 'disabled'}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
              </svg>
              <span>Log Exit</span>
            </button>
            <button 
              id="guardCancelBtn"
              class="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
          </div>

          <!-- Status Message -->
          <div id="guardModalStatus" class="mt-4 text-center ${shouldDisableBoth && !isFuture && !isPast ? '' : 'hidden'}">
            ${shouldDisableBoth && !isFuture && !isPast ? `
              <div class="p-3 rounded-md bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                <p class="text-sm font-medium">${gateEntranceScanned && !allPlacesCompleted ? 'Place to visit still pending' : 'Finish the scheduled places first'}</p>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Add event listeners
  const modal = document.getElementById('guardVisitModal');
  const closeBtn = document.getElementById('closeGuardModalBtn');
  const cancelBtn = document.getElementById('guardCancelBtn');
  const entranceBtn = document.getElementById('guardEntranceConfirmBtn');
  const tempExitBtn = document.getElementById('guardTempExitBtn');
  const exitBtn = document.getElementById('guardExitConfirmBtn');
  const refreshBtn = document.getElementById('refreshGuardModalBtn');

  const closeModal = () => {
    if (modal) {
      modal.remove();
    }
    // Reset scanner
    resetGuardScanner();
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
    
    await refreshGuardModal(visitData.visitId);
  };

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  entranceBtn?.addEventListener('click', () => {
    // Do not close/reset before logging to preserve visit data
    logGuardAction('entrance', visitData);
  });
  tempExitBtn?.addEventListener('click', () => {
    logGuardAction('temporary_exit', visitData);
  });
  exitBtn?.addEventListener('click', () => {
    // Do not close/reset before logging to preserve visit data
    logGuardAction('exit', visitData);
  });
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
  const qrPreviewSection = document.getElementById('guardQrPreviewSection');
  if (qrPreviewSection) {
    qrPreviewSection.classList.add('hidden');
  }
}

async function logGuardAction(action: 'entrance' | 'exit' | 'temporary_exit', visitDataOverride?: VisitQRData) {
  const activeVisit = visitDataOverride || guardCurrentVisitData;
  if (!activeVisit) {
    showGuardError('Error', 'No visit data available.');
    return;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showGuardError('Authentication Required', 'You must be logged in to log actions.');
      return;
    }

    // Log the guard action (only for entrance/exit which backend supports)
    if (action === 'entrance' || action === 'exit') {
      const { error } = await supabase.rpc('log_guard_action', {
        p_visit_id: activeVisit.visitId,
        p_action: action,
        p_guard_id: user.id
      });

      if (error) {
        console.error('Error logging guard action:', error);
        showGuardError('Logging Error', `Error logging ${action}: ${error.message}`);
        return;
      }
    }

    // If entrance was logged by a guard, also mark the visit as entrance scanned
    if (action === 'entrance') {
      try {
        // If returning from temporary exit, call resume function; else, mark entrance scanned
        if (activeVisit.status === 'temporary_exit') {
          const { error: resumeError } = await supabase.rpc('resume_visit_after_temporary_exit', {
            p_visit_id: activeVisit.visitId,
            p_actor: user.id
          });
          if (resumeError) {
            console.error('Error resuming visit from temporary exit:', resumeError);
          }
        }

        const { error: updateError } = await supabase
          .from('scheduled_visits')
          .update({
            gate_entrance_scanned: true,
            gate_entrance_scanned_at: new Date().toISOString(),
            gate_entrance_scanned_by: user.id
          })
          .eq('id', activeVisit.visitId);

        if (updateError) {
          console.error('Error updating entrance scanned fields:', updateError);
          // Non-fatal; continue
        }
      } catch (e) {
        console.error('Unexpected error updating gate entrance scanned:', e);
      }
    }

    // When temporary exit is logged, call backend helper to set status and log
    if (action === 'temporary_exit') {
      try {
        const { error: rpcError } = await supabase.rpc('set_temporary_exit', {
          p_visit_id: activeVisit.visitId,
          p_guard_id: user.id
        });
        if (rpcError) {
          console.error('Error setting temporary exit via RPC:', rpcError);
          showGuardError('Error', 'Could not set temporary exit status.');
          return;
        }
      } catch (e) {
        console.error('Unexpected error setting temporary exit via RPC:', e);
      }
    }

    // When exit is logged, mark gate exit fields and move visit to completed flow
    if (action === 'exit') {
      try {
        const hasFlaggedPlace = Array.isArray(activeVisit.places)
          ? activeVisit.places.some(p => (p.status || '').toLowerCase() === 'completed_flagged')
          : false;
        const finalStatus = hasFlaggedPlace ? 'completed_flagged' : 'completed';

        const { error: updateExitError } = await supabase
          .from('scheduled_visits')
          .update({
            gate_exit_scanned: true,
            gate_exit_scanned_at: new Date().toISOString(),
            gate_exit_scanned_by: user.id,
            status: finalStatus
          })
          .eq('id', activeVisit.visitId);

        if (updateExitError) {
          console.error('Error updating exit scanned/status fields:', updateExitError);
          // Non-fatal; continue
        }
      } catch (e) {
        console.error('Unexpected error updating gate exit scanned/status:', e);
      }
    }

    // Close modal on successful entrance (and exit for consistency)
    const openModal = document.getElementById('guardVisitModal');
    if (openModal) {
      openModal.remove();
    }

    // Show success message
    showGuardSuccess(`${action.charAt(0).toUpperCase() + action.slice(1).replace('_',' ')} logged successfully for ${activeVisit.visitorName}!`);

    // Reset scanner after successful logging
    setTimeout(() => {
      resetGuardScanner();
    }, 2000);

  } catch (error) {
    console.error('Error in logGuardAction:', error);
    showGuardError('Error', `Error logging ${action}.`);
  }
}

// Helper function to refresh the guard modal with updated data
async function refreshGuardModal(visitId: string) {
  try {
    console.log('Refreshing guard modal for visit:', visitId);
    
    // Small delay to ensure database transaction is complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Fetch fresh data from database
    const updatedVisitData = await fetchGuardVisitData(visitId);
    
    if (updatedVisitData) {
      console.log('Updated visit data:', updatedVisitData);
      
      // Remove old modal
      const oldModal = document.getElementById('guardVisitModal');
      if (oldModal) {
        oldModal.remove();
      }
      
      // Show new modal with updated data
      showGuardVisitConfirmationModal(updatedVisitData);
      
      console.log('Guard modal refreshed successfully');
    } else {
      console.error('Failed to fetch updated visit data');
      showGuardModalStatus('Error: Could not refresh visit data', 'error');
    }
  } catch (error) {
    console.error('Error refreshing guard modal:', error);
    showGuardModalStatus('Error refreshing modal', 'error');
  }
}

// Helper function to show status messages in guard modal
function showGuardModalStatus(message: string, type: 'success' | 'error') {
  const statusDiv = document.getElementById('guardModalStatus');
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

function processGuardDetectedQR() {
  if (guardDetectedQRData) {
    // Hide preview and process
    const qrPreviewSection = document.getElementById('guardQrPreviewSection');
    if (qrPreviewSection) {
      qrPreviewSection.classList.add('hidden');
    }
    
    // Process the QR code data
    showGuardQRPreview(guardDetectedQRData);
  }
}

function rescanGuardQR() {
  // Hide preview and restart scanner
  const qrPreviewSection = document.getElementById('guardQrPreviewSection');
  const scannerSection = document.getElementById('scannerSection');
  
  if (qrPreviewSection) qrPreviewSection.classList.add('hidden');
  if (scannerSection) scannerSection.classList.remove('hidden');
  
  // Reset detected data
  guardDetectedQRData = null;
  guardCurrentVisitData = null;
  
  // Restart scanner
  startGuardScanner();
}

function resetGuardScanner() {
  // Hide all sections except scanner
  const scannerSection = document.getElementById('scannerSection');
  const qrPreviewSection = document.getElementById('guardQrPreviewSection');
  const messageSection = document.getElementById('guardMessageSection');
  const scannerOverlay = document.getElementById('guardScannerOverlay');
  
  if (scannerSection) scannerSection.classList.remove('hidden');
  if (qrPreviewSection) qrPreviewSection.classList.add('hidden');
  if (messageSection) messageSection.classList.add('hidden');
  if (scannerOverlay) scannerOverlay.classList.add('hidden');
  
  // Clear timeout
  if (guardEmptyQRTimeout) {
    clearTimeout(guardEmptyQRTimeout);
    guardEmptyQRTimeout = null;
  }
  
  // Reset scanner state
  guardConsecutiveFailures = 0;
  guardScanInterval = 100;
  guardLastScanTime = 0;
  guardDetectedQRData = null;
  guardCurrentVisitData = null;
  
  // Restart scanner
  if (!guardScanning) {
    startGuardScanner();
  }
}

function showGuardSuccess(message: string) {
  const messageSection = document.getElementById('guardMessageSection');
  if (messageSection) {
    messageSection.classList.remove('hidden');
    messageSection.innerHTML = `
      <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800 dark:text-green-200">Success</h3>
            <div class="mt-2 text-sm text-green-700 dark:text-green-300">
              <p>${message}</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Hide message after 3 seconds
    setTimeout(() => {
      messageSection.classList.add('hidden');
    }, 3000);
  }
}

function showGuardError(title: string, message: string) {
  const messageSection = document.getElementById('guardMessageSection');
  if (messageSection) {
    messageSection.classList.remove('hidden');
    messageSection.innerHTML = `
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">${title}</h3>
            <div class="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>${message}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

function updateGuardLiveFeedback(message: string, type: 'searching' | 'detecting' | 'success' | 'error') {
  const feedbackText = document.getElementById('guardFeedbackText');
  const feedbackIcon = document.getElementById('guardFeedbackIcon');
  const focusIndicator = document.getElementById('guardFocusIndicator');
  const scanningLine = document.getElementById('guardScanningLine');
  
  if (feedbackText) {
    feedbackText.textContent = message;
  }
  
  if (feedbackIcon) {
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
    
    const path = feedbackIcon?.querySelector('path');
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

function checkGuardForPotentialQRPattern(imageData: ImageData): boolean {
  const { data, width, height } = imageData;
  
  // Focus on center area where QR codes are most likely to be
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const scanArea = Math.min(width, height) * 0.6;
  const startX = Math.max(0, centerX - scanArea / 2);
  const endX = Math.min(width, centerX + scanArea / 2);
  const startY = Math.max(0, centerY - scanArea / 2);
  const endY = Math.min(height, centerY + scanArea / 2);
  
  let highContrastPixels = 0;
  let totalPixels = 0;
  const threshold = 40;
  
  // Sample every 4th pixel for better performance
  for (let y = startY; y < endY; y += 4) {
    for (let x = startX; x < endX; x += 4) {
      totalPixels++;
      const idx = (y * width + x) * 4;
      
      // Use luminance for better contrast detection
      const current = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      
      // Check horizontal contrast
      if (x + 4 < endX) {
        const right = data[idx + 4] * 0.299 + data[idx + 5] * 0.587 + data[idx + 6] * 0.114;
        const horizontalDiff = Math.abs(current - right);
        
        if (horizontalDiff > threshold) {
          highContrastPixels++;
          continue;
        }
      }
      
      // Check vertical contrast
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
  
  const contrastRatio = highContrastPixels / totalPixels;
  return contrastRatio > 0.08;
}
