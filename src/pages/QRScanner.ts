import supabase from '../config/supabase';
import { parseQRCodeData, type VisitQRData } from '../utils/qrCode';
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
                onclick="window.history.back()"
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
            <div class="absolute inset-0 max-w-xs sm:max-w-md md:max-w-lg mx-auto flex items-center justify-center pointer-events-none">
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
          </div>
        </div>

        <!-- Manual Input Modal -->
        <div id="manualInputModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-10 mx-auto p-3 sm:p-5 border w-full max-w-sm sm:max-w-md md:max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
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

export function initializeQRScanner() {
  const startScanBtn = document.getElementById('startScanBtn');
  const stopScanBtn = document.getElementById('stopScanBtn');
  const switchCameraBtn = document.getElementById('switchCameraBtn');
  const refreshPageBtn = document.getElementById('refreshPageBtn');
  const manualInputBtn = document.getElementById('manualInputBtn');
  const closeManualModalBtn = document.getElementById('closeManualModalBtn');
  const closeManualBtn = document.getElementById('closeManualBtn');
  const processManualBtn = document.getElementById('processManualBtn');
  const newScanBtn = document.getElementById('newScanBtn');

  startScanBtn?.addEventListener('click', startScanner);
  stopScanBtn?.addEventListener('click', stopScanner);
  switchCameraBtn?.addEventListener('click', switchCamera);
  refreshPageBtn?.addEventListener('click', () => window.location.reload());
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

    // Initialize live feedback
    updateLiveFeedback('Position QR code in frame', 'searching');

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
      
      // Show success feedback
      updateLiveFeedback('QR code detected!', 'success');
      
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
    
    // Check for potential QR code patterns (dark/light transitions)
    const hasPotentialQR = checkForPotentialQRPattern(imageData);
    if (hasPotentialQR) {
      updateLiveFeedback('QR code pattern detected - hold steady', 'detecting');
    } else {
      updateLiveFeedback('Position QR code in frame', 'searching');
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

async function fetchVisitDataFromDatabase(visitId: string, currentUserId?: string): Promise<VisitQRData & { places: any[] } | null> {
  try {
    // Fetch visit data from Supabase
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
      scheduledAt: visits.scheduled_at
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

  // Create modal HTML
  const modalHTML = `
    <div id="personnelVisitModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <!-- Header -->
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Visit Details - Personnel View</h3>
            <button 
              id="closePersonnelModalBtn"
              class="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
                    visitData.status === 'unsuccessful' || visitData.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    visitData.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }">
                    ${visitData.status.charAt(0).toUpperCase() + visitData.status.slice(1)}
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
                          place.status === 'unsuccessful' || place.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          place.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }">
                          ${place.status.charAt(0).toUpperCase() + place.status.slice(1)}
                        </span>
                        ${!isFuture && place.status === 'pending' && place.isAssignedToCurrentUser ? `
                          <button 
                            onclick="completeVisitPlace('${visitData.visitId}', '${place.placeId}')"
                            class="ml-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-xs font-medium"
                          >
                            Mark Complete
                          </button>
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

  const closeModal = () => {
    if (modal) {
      modal.remove();
    }
    // Refresh the page when modal is closed
    window.location.reload();
  };

  closeBtn1?.addEventListener('click', closeModal);
  closeBtn2?.addEventListener('click', closeModal);

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
  
  // Simple edge detection to find potential QR code patterns
  // Look for areas with high contrast (dark/light transitions)
  let highContrastPixels = 0;
  const threshold = 50; // Minimum difference for contrast
  
  for (let y = 1; y < height - 1; y += 2) { // Sample every other row for performance
    for (let x = 1; x < width - 1; x += 2) { // Sample every other column for performance
      const idx = (y * width + x) * 4;
      const current = data[idx]; // Use red channel for grayscale approximation
      
      // Check horizontal contrast
      const left = data[idx - 4];
      const right = data[idx + 4];
      const horizontalDiff = Math.abs(current - left) + Math.abs(current - right);
      
      // Check vertical contrast
      const top = data[(y - 1) * width * 4 + x * 4];
      const bottom = data[(y + 1) * width * 4 + x * 4];
      const verticalDiff = Math.abs(current - top) + Math.abs(current - bottom);
      
      if (horizontalDiff > threshold || verticalDiff > threshold) {
        highContrastPixels++;
      }
    }
  }
  
  // If we have enough high-contrast pixels, it might be a QR code
  const totalSampledPixels = Math.floor((width * height) / 4);
  const contrastRatio = highContrastPixels / totalSampledPixels;
  
  return contrastRatio > 0.1; // 10% of pixels should have high contrast
}

// Global functions for personnel to complete visits (accessible from onclick)
(window as any).completeVisitPlace = async function(visitId: string, placeId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showPersonnelModalStatus('Error: User not authenticated', 'error');
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
    
    // Refresh the modal with updated data
    setTimeout(async () => {
      const updatedVisitData = await fetchVisitDataFromDatabase(visitId);
      if (updatedVisitData) {
        // Remove old modal and show new one
        const oldModal = document.getElementById('personnelVisitModal');
        if (oldModal) {
          oldModal.remove();
        }
        showPersonnelVisitModal(updatedVisitData, user.id);
      }
    }, 1000);

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
    
    // Refresh the modal with updated data
    setTimeout(async () => {
      const updatedVisitData = await fetchVisitDataFromDatabase(visitId);
      if (updatedVisitData) {
        // Remove old modal and show new one
        const oldModal = document.getElementById('personnelVisitModal');
        if (oldModal) {
          oldModal.remove();
        }
        showPersonnelVisitModal(updatedVisitData, user.id);
      }
    }, 1000);

  } catch (error) {
    console.error('Error completing visit:', error);
    showPersonnelModalStatus('Error completing visit', 'error');
  }
};

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