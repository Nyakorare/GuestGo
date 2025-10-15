import supabase from '../config/supabase';
import { showNotification } from '../pages/dashboard/index';
import { showLoadingOverlay, hideLoadingOverlay } from '../utils/loadingOverlay';
import { generateSimpleVisitQRCode, openPrintableVisitCard } from '../utils/qrCode';
import type { VisitQRData } from '../utils/qrCode';
import jsQR from 'jsqr';

export function TrackSchedulePage() {
  return `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Track Schedule
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Enter your scheduled visit ID to view your visit progress and details
          </p>
        </div>

        <!-- Visit ID Input Section -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div class="max-w-md mx-auto">
            <label for="visitIdInput" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Scheduled Visit ID
            </label>
            <div class="flex gap-2">
              <input
                type="text"
                id="visitIdInput"
                placeholder="Enter your visit ID..."
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                id="trackVisitBtn"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Track Visit
              </button>
            </div>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              You can find your visit ID in the confirmation email or the QR code modal after scheduling.
            </p>
          </div>
        </div>

        <!-- Visit Details Section -->
        <div id="visitDetailsSection" class="hidden">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                Visit Details
              </h2>
              <button
                id="printVisitCardBtn"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Print Visit Card
              </button>
            </div>

            <!-- Visit Information -->
            <div id="visitInfo" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <!-- Left Column -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Visit ID</label>
                  <p id="displayVisitId" class="mt-1 text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded"></p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Visitor Name</label>
                  <p id="displayVisitorName" class="mt-1 text-sm text-gray-900 dark:text-white"></p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <p id="displayVisitorEmail" class="mt-1 text-sm text-gray-900 dark:text-white"></p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <p id="displayVisitorPhone" class="mt-1 text-sm text-gray-900 dark:text-white"></p>
                </div>
              </div>

              <!-- Right Column -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Visit Date</label>
                  <p id="displayVisitDate" class="mt-1 text-sm text-gray-900 dark:text-white"></p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Purpose</label>
                  <p id="displayPurpose" class="mt-1 text-sm text-gray-900 dark:text-white"></p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <span id="displayStatus" class="mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full"></span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Scheduled At</label>
                  <p id="displayScheduledAt" class="mt-1 text-sm text-gray-900 dark:text-white"></p>
                </div>
              </div>
            </div>

            <!-- Places to Visit -->
            <div class="mb-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Places to Visit</h3>
              <div id="visitPlacesList" class="space-y-3">
                <!-- Places will be populated here -->
              </div>
            </div>

            <!-- Progress Section -->
            <div class="mb-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Visit Progress</h3>
              <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                  <span id="progressPercentage" class="text-sm font-medium text-gray-900 dark:text-white">0%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div id="progressBar" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
                <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span id="completedPlaces">0</span> of <span id="totalPlaces">0</span> places completed
                </div>
              </div>
            </div>

            <!-- Gate Scanning Status -->
            <div class="mb-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Gate Scanning Status</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Entrance Scan</span>
                    <span id="entranceScanStatus" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"></span>
                  </div>
                  <p id="entranceScanTime" class="mt-1 text-xs text-gray-500 dark:text-gray-400"></p>
                  <div class="mt-3">
                    <button 
                      id="scanEntranceBtn"
                      class="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled
                    >
                      <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
                      </svg>
                      Scan Entrance
                    </button>
                  </div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Exit Scan</span>
                    <span id="exitScanStatus" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"></span>
                  </div>
                  <p id="exitScanTime" class="mt-1 text-xs text-gray-500 dark:text-gray-400"></p>
                  <div class="mt-3">
                    <button 
                      id="scanExitBtn"
                      class="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled
                    >
                      <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                      Scan Exit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- QR Code Section -->
            <div class="text-center">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Visit QR Code</h3>
              <div id="qrCodeContainer" class="inline-block p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                <!-- QR code will be generated here -->
              </div>
              <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Show this QR code at the gate for scanning
              </p>
            </div>
          </div>
        </div>

        <!-- No Visit Found Message -->
        <div id="noVisitFound" class="hidden text-center py-12">
          <div class="text-gray-500 dark:text-gray-400">
            <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p class="text-lg font-medium">Visit not found</p>
            <p class="text-sm">Please check your visit ID and try again.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Initialize the Track Schedule page
export function initTrackSchedulePage() {
  // Set up event listeners
  setupTrackScheduleEventListeners();
}

// Set up event listeners for the Track Schedule page
function setupTrackScheduleEventListeners() {
  const trackVisitBtn = document.getElementById('trackVisitBtn');
  const visitIdInput = document.getElementById('visitIdInput') as HTMLInputElement;
  const printVisitCardBtn = document.getElementById('printVisitCardBtn');
  const scanEntranceBtn = document.getElementById('scanEntranceBtn');
  const scanExitBtn = document.getElementById('scanExitBtn');

  // Track visit button click
  trackVisitBtn?.addEventListener('click', async () => {
    const visitId = visitIdInput?.value.trim();
    if (!visitId) {
      showNotification('Please enter a visit ID', 'error');
      return;
    }

    await trackVisit(visitId);
  });

  // Enter key press on input
  visitIdInput?.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      const visitId = visitIdInput.value.trim();
      if (!visitId) {
        showNotification('Please enter a visit ID', 'error');
        return;
      }

      await trackVisit(visitId);
    }
  });

  // Print visit card button
  printVisitCardBtn?.addEventListener('click', async () => {
    const visitId = visitIdInput?.value.trim();
    if (!visitId) {
      showNotification('No visit ID available', 'error');
      return;
    }

    await printVisitCard(visitId);
  });

  // Scan entrance button
  scanEntranceBtn?.addEventListener('click', async () => {
    const visitId = visitIdInput?.value.trim();
    if (!visitId) {
      showNotification('No visit ID available', 'error');
      return;
    }

    showGateScanningModal(visitId);
  });

  // Scan exit button
  scanExitBtn?.addEventListener('click', async () => {
    const visitId = visitIdInput?.value.trim();
    if (!visitId) {
      showNotification('No visit ID available', 'error');
      return;
    }

    showGateExitScanningModal(visitId);
  });
}

// Track a visit by ID
async function trackVisit(visitId: string) {
  try {
    showLoadingOverlay('Loading visit details...');

    // Fetch visit data from the database
    const { data: visitData, error } = await supabase
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
      if (error.code === 'PGRST116') {
        // No rows returned
        showNoVisitFound();
        return;
      }
      throw error;
    }

    if (!visitData) {
      showNoVisitFound();
      return;
    }

    // Display visit details
    await displayVisitDetails(visitData);

    // Generate QR code only for valid visits
    if (visitData.status !== 'unsuccessful' && visitData.status !== 'completed_flagged') {
      await generateAndDisplayQRCode(visitData);
    } else {
      // For invalid visits, just show the invalid section
      addInvalidStickerToQR();
    }

    hideLoadingOverlay();
    showNotification('Visit details loaded successfully', 'success');

  } catch (error: any) {
    console.error('Error tracking visit:', error);
    hideLoadingOverlay();
    showNotification('Error loading visit details: ' + error.message, 'error');
  }
}

// Display visit details
async function displayVisitDetails(visitData: any) {
  // Show the visit details section
  const visitDetailsSection = document.getElementById('visitDetailsSection');
  const noVisitFound = document.getElementById('noVisitFound');
  
  if (visitDetailsSection) visitDetailsSection.classList.remove('hidden');
  if (noVisitFound) noVisitFound.classList.add('hidden');

  // Populate visit information
  const displayVisitId = document.getElementById('displayVisitId');
  const displayVisitorName = document.getElementById('displayVisitorName');
  const displayVisitorEmail = document.getElementById('displayVisitorEmail');
  const displayVisitorPhone = document.getElementById('displayVisitorPhone');
  const displayVisitDate = document.getElementById('displayVisitDate');
  const displayPurpose = document.getElementById('displayPurpose');
  const displayStatus = document.getElementById('displayStatus');
  const displayScheduledAt = document.getElementById('displayScheduledAt');

  if (displayVisitId) displayVisitId.textContent = visitData.id;
  if (displayVisitorName) displayVisitorName.textContent = `${visitData.visitor_first_name} ${visitData.visitor_last_name}`;
  if (displayVisitorEmail) displayVisitorEmail.textContent = visitData.visitor_email;
  if (displayVisitorPhone) displayVisitorPhone.textContent = visitData.visitor_phone;
  if (displayVisitDate) displayVisitDate.textContent = new Date(visitData.visit_date).toLocaleDateString();
  if (displayPurpose) displayPurpose.textContent = visitData.purpose;
  if (displayScheduledAt) displayScheduledAt.textContent = new Date(visitData.scheduled_at).toLocaleString();

  // Display status with appropriate styling
  if (displayStatus) {
    displayStatus.textContent = visitData.status;
    displayStatus.className = 'mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full';
    
    switch (visitData.status) {
      case 'pending':
        displayStatus.classList.add('bg-yellow-100', 'text-yellow-800', 'dark:bg-yellow-900', 'dark:text-yellow-200');
        break;
      case 'in_progress':
        displayStatus.classList.add('bg-blue-100', 'text-blue-800', 'dark:bg-blue-900', 'dark:text-blue-200');
        break;
      case 'completed':
        displayStatus.classList.add('bg-green-100', 'text-green-800', 'dark:bg-green-900', 'dark:text-green-200');
        break;
      case 'completed_flagged':
        displayStatus.classList.add('bg-orange-100', 'text-orange-800', 'dark:bg-orange-900', 'dark:text-orange-200');
        break;
      case 'unsuccessful':
        displayStatus.classList.add('bg-red-100', 'text-red-800', 'dark:bg-red-900', 'dark:text-red-200');
        break;
      default:
        displayStatus.classList.add('bg-gray-100', 'text-gray-800', 'dark:bg-gray-900', 'dark:text-gray-200');
    }
  }

  // Display places to visit
  displayPlaces(visitData.scheduled_visit_places);

  // Display progress
  displayProgress(visitData.scheduled_visit_places);

  // Display gate scanning status
  await displayGateScanningStatus(visitData);

  // Handle invalid statuses (unsuccessful or completed_flagged)
  if (visitData.status === 'unsuccessful' || visitData.status === 'completed_flagged') {
    disableAllButtons();
  }
}

// Display places to visit
function displayPlaces(places: any[]) {
  const placesList = document.getElementById('visitPlacesList');
  if (!placesList) return;

  if (places.length === 0) {
    placesList.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No places scheduled for this visit.</p>';
    return;
  }

  placesList.innerHTML = places.map(place => {
    const statusColor = getStatusColor(place.status);
    return `
      <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div>
          <h4 class="font-medium text-gray-900 dark:text-white">${place.places_to_visit?.name || 'Unknown Place'}</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">${place.places_to_visit?.location || ''}</p>
          ${place.places_to_visit?.description ? `<p class="text-xs text-gray-500 dark:text-gray-500 mt-1">${place.places_to_visit.description}</p>` : ''}
        </div>
        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}">
          ${place.status}
        </span>
      </div>
    `;
  }).join('');
}

// Get status color classes
function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'unsuccessful':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

// Display progress
function displayProgress(places: any[]) {
  const totalPlaces = places.length;
  const completedPlaces = places.filter(place => place.status === 'completed').length;
  const progressPercentage = totalPlaces > 0 ? Math.round((completedPlaces / totalPlaces) * 100) : 0;

  const progressBar = document.getElementById('progressBar');
  const progressPercentageEl = document.getElementById('progressPercentage');
  const completedPlacesEl = document.getElementById('completedPlaces');
  const totalPlacesEl = document.getElementById('totalPlaces');

  if (progressBar) {
    progressBar.style.width = `${progressPercentage}%`;
  }
  if (progressPercentageEl) {
    progressPercentageEl.textContent = `${progressPercentage}%`;
  }
  if (completedPlacesEl) {
    completedPlacesEl.textContent = completedPlaces.toString();
  }
  if (totalPlacesEl) {
    totalPlacesEl.textContent = totalPlaces.toString();
  }
}

// Display gate scanning status
async function displayGateScanningStatus(visitData: any) {
  const entranceScanStatus = document.getElementById('entranceScanStatus');
  const entranceScanTime = document.getElementById('entranceScanTime');
  const exitScanStatus = document.getElementById('exitScanStatus');
  const exitScanTime = document.getElementById('exitScanTime');
  const scanEntranceBtn = document.getElementById('scanEntranceBtn') as HTMLButtonElement;
  const scanExitBtn = document.getElementById('scanExitBtn') as HTMLButtonElement;

  // Entrance scan status
  if (entranceScanStatus) {
    if (visitData.gate_entrance_scanned) {
      entranceScanStatus.textContent = 'Scanned';
      entranceScanStatus.className = 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    } else {
      entranceScanStatus.textContent = 'Not Scanned';
      entranceScanStatus.className = 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  if (entranceScanTime) {
    if (visitData.gate_entrance_scanned_at) {
      entranceScanTime.textContent = `Scanned at: ${new Date(visitData.gate_entrance_scanned_at).toLocaleString()}`;
    } else {
      entranceScanTime.textContent = 'Not scanned yet';
    }
  }

  // Exit scan status
  if (exitScanStatus) {
    if (visitData.gate_exit_scanned) {
      exitScanStatus.textContent = 'Scanned';
      exitScanStatus.className = 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    } else {
      exitScanStatus.textContent = 'Not Scanned';
      exitScanStatus.className = 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  if (exitScanTime) {
    if (visitData.gate_exit_scanned_at) {
      exitScanTime.textContent = `Scanned at: ${new Date(visitData.gate_exit_scanned_at).toLocaleString()}`;
    } else {
      exitScanTime.textContent = 'Not scanned yet';
    }
  }

  // Update scan buttons based on user role and visit status
  await updateScanButtons(visitData, scanEntranceBtn, scanExitBtn);
}

// Update scan buttons based on user role and visit status
async function updateScanButtons(visitData: any, scanEntranceBtn: HTMLButtonElement | null, scanExitBtn: HTMLButtonElement | null) {
  try {
    // Check for invalid statuses first
    if (visitData.status === 'unsuccessful' || visitData.status === 'completed_flagged') {
      if (scanEntranceBtn) {
        scanEntranceBtn.disabled = true;
        scanEntranceBtn.classList.add('opacity-50', 'cursor-not-allowed');
        scanEntranceBtn.innerHTML = `
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Visit Invalid
        `;
      }
      if (scanExitBtn) {
        scanExitBtn.disabled = true;
        scanExitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        scanExitBtn.innerHTML = `
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Visit Invalid
        `;
      }
      return;
    }

    // Check if this is a guest visit (no user account) or visitor visit (has user account)
    const isGuestVisit = visitData.visitor_user_id === null;
    
    // Get current user and their role
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!isGuestVisit && !user) {
      // This is a visitor visit but user is not logged in - require login
      if (scanEntranceBtn) {
        scanEntranceBtn.disabled = true;
        scanEntranceBtn.textContent = 'Login Required';
      }
      if (scanExitBtn) {
        scanExitBtn.disabled = true;
        scanExitBtn.textContent = 'Login Required';
      }
      return;
    }

    let userRole = null;
    if (user) {
      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      userRole = roleData?.role;
    }

    // Enforce ownership for visitor-owned visits
    if (!isGuestVisit && user && user.id !== visitData.visitor_user_id) {
      if (scanEntranceBtn) {
        scanEntranceBtn.disabled = true;
        scanEntranceBtn.textContent = 'Login with the account used to create that scheduled visit';
      }
      if (scanExitBtn) {
        scanExitBtn.disabled = true;
        scanExitBtn.textContent = 'Login with the account used to create that scheduled visit';
      }
      return;
    }

    // Check if visit is for today
    const visitDate = new Date(visitData.visit_date).toDateString();
    const today = new Date().toDateString();
    const isToday = visitDate === today;

    // Update entrance scan button
    if (scanEntranceBtn) {
      const canScanEntrance = isToday && visitData.status === 'pending' && !visitData.gate_entrance_scanned;
      const isAuthorizedUser = isGuestVisit || (user && userRole === 'visitor' && user.id === visitData.visitor_user_id);
      
      if (canScanEntrance && isAuthorizedUser) {
        scanEntranceBtn.disabled = false;
        scanEntranceBtn.innerHTML = `
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
          </svg>
          Scan Entrance
        `;
      } else if (visitData.gate_entrance_scanned) {
        scanEntranceBtn.disabled = true;
        scanEntranceBtn.innerHTML = `
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Already Scanned
        `;
      } else if (!isToday) {
        scanEntranceBtn.disabled = true;
        scanEntranceBtn.textContent = 'Not Today';
      } else if (!isAuthorizedUser) {
        scanEntranceBtn.disabled = true;
        scanEntranceBtn.textContent = isGuestVisit ? 'Guest Only' : 'Visitor Only';
      } else {
        scanEntranceBtn.disabled = true;
        scanEntranceBtn.textContent = 'Not Available';
      }
    }

    // Update exit scan button
    if (scanExitBtn) {
      const allPlacesCompleted = Array.isArray(visitData.scheduled_visit_places)
        ? visitData.scheduled_visit_places.every((p: any) => p.status === 'completed')
        : false;
      const canScanExit = isToday && visitData.status === 'pending' && visitData.gate_entrance_scanned && !visitData.gate_exit_scanned && allPlacesCompleted;
      const isAuthorizedUser = isGuestVisit || (user && userRole === 'visitor' && user.id === visitData.visitor_user_id);
      
      if (canScanExit && isAuthorizedUser) {
        scanExitBtn.disabled = false;
        scanExitBtn.innerHTML = `
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Scan Exit
        `;
      } else if (visitData.gate_exit_scanned) {
        scanExitBtn.disabled = true;
        scanExitBtn.innerHTML = `
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Already Scanned
        `;
      } else if (!visitData.gate_entrance_scanned) {
        scanExitBtn.disabled = true;
        scanExitBtn.textContent = 'Entrance First';
      } else if (!allPlacesCompleted) {
        scanExitBtn.disabled = true;
        scanExitBtn.textContent = 'Complete all places first';
      } else if (!isToday) {
        scanExitBtn.disabled = true;
        scanExitBtn.textContent = 'Not Today';
      } else if (!isAuthorizedUser) {
        scanExitBtn.disabled = true;
        scanExitBtn.textContent = isGuestVisit ? 'Guest Only' : 'Visitor Only';
      } else {
        scanExitBtn.disabled = true;
        scanExitBtn.textContent = 'Not Available';
      }
    }
  } catch (error) {
    console.error('Error updating scan buttons:', error);
    // On error, disable both buttons
    if (scanEntranceBtn) {
      scanEntranceBtn.disabled = true;
      scanEntranceBtn.textContent = 'Error';
    }
    if (scanExitBtn) {
      scanExitBtn.disabled = true;
      scanExitBtn.textContent = 'Error';
    }
  }
}

// Generate and display QR code
async function generateAndDisplayQRCode(visitData: any) {
  try {
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    if (!qrCodeContainer) return;

    // Generate QR code
    const qrCodeDataUrl = await generateSimpleVisitQRCode(visitData.id);
    
    // Display QR code
    qrCodeContainer.innerHTML = `
      <img src="${qrCodeDataUrl}" alt="Visit QR Code" class="w-48 h-48 mx-auto" />
    `;
  } catch (error) {
    console.error('Error generating QR code:', error);
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    if (qrCodeContainer) {
      qrCodeContainer.innerHTML = '<p class="text-red-500">Error generating QR code</p>';
    }
  }
}

// Show no visit found message
function showNoVisitFound() {
  const visitDetailsSection = document.getElementById('visitDetailsSection');
  const noVisitFound = document.getElementById('noVisitFound');
  
  if (visitDetailsSection) visitDetailsSection.classList.add('hidden');
  if (noVisitFound) noVisitFound.classList.remove('hidden');
}

// Print visit card
async function printVisitCard(visitId: string) {
  try {
    showLoadingOverlay('Generating visit card...');

    // Fetch visit data
    const { data: visitData, error } = await supabase
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

    if (error || !visitData) {
      throw new Error('Visit not found');
    }

    // Prepare visit data for QR code
    const places = visitData.scheduled_visit_places.map((place: any) => ({
      placeId: place.place_id,
      placeName: place.places_to_visit?.name || 'Unknown Place',
      placeLocation: place.places_to_visit?.location || '',
      status: place.status
    }));

    const qrVisitData: VisitQRData = {
      visitId: visitData.id,
      visitorName: `${visitData.visitor_first_name} ${visitData.visitor_last_name}`,
      visitorEmail: visitData.visitor_email,
      visitDate: visitData.visit_date,
      purpose: visitData.purpose,
      places: places,
      status: visitData.status,
      scheduledAt: visitData.scheduled_at
    };

    // Generate QR code
    const qrCodeDataUrl = await generateSimpleVisitQRCode(visitData.id);

    // Use the same design as visitor dashboard
    openPrintableVisitCard(qrVisitData, qrCodeDataUrl);

    hideLoadingOverlay();
    showNotification('Visit card generated successfully!', 'success');

  } catch (error: any) {
    console.error('Error printing visit card:', error);
    hideLoadingOverlay();
    showNotification('Error generating visit card: ' + error.message, 'error');
  }
}

// Function to show gate scanning modal
function showGateScanningModal(visitId: string) {
  // Create modal HTML
  const modalHTML = `
    <div id="gateScanModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Scan Gate Entrance</h3>
            <button 
              id="closeGateScanModalBtn"
              class="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="text-center">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Scan a gate QR code to log your entrance for visit ID: ${visitId.substring(0, 8)}...
              </p>
              
              <!-- Camera Scanner Section -->
              <div id="cameraScannerSection" class="mb-4">
                <div class="relative">
                  <video 
                    id="gateScannerVideo" 
                    class="w-full h-64 bg-gray-900 rounded-lg"
                    autoplay 
                    playsinline
                  ></video>
                  <div id="gateScannerOverlay" class="absolute inset-0 flex items-center justify-center">
                    <div class="border-2 border-white rounded-lg p-2">
                      <div class="w-48 h-48 border-2 border-white rounded-lg"></div>
                    </div>
                  </div>
                  <div id="gateScannerStatus" class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Initializing camera...
                  </div>
                </div>
                
                <div class="mt-2 flex space-x-2">
                  <button 
                    id="startCameraBtn"
                    class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
                  >
                    Start Camera
                  </button>
                  <button 
                    id="stopCameraBtn"
                    class="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
                    style="display: none;"
                  >
                    Stop Camera
                  </button>
                </div>
              </div>
              
              <!-- Manual Input Section -->
              <div class="mb-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Or manually enter gate ID:</p>
                <div class="flex space-x-2">
                  <input 
                    type="text" 
                    id="manualGateIdInput"
                    placeholder="Enter gate ID..."
                    class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                  <button 
                    id="submitManualGateBtn"
                    class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
            
            <div id="gateScanError" class="hidden text-red-600 text-sm text-center"></div>
            <div id="gateScanSuccess" class="hidden text-green-600 text-sm text-center"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Setup event listeners
  const modal = document.getElementById('gateScanModal');
  const closeBtn = document.getElementById('closeGateScanModalBtn');
  const startCameraBtn = document.getElementById('startCameraBtn');
  const stopCameraBtn = document.getElementById('stopCameraBtn');
  const submitManualBtn = document.getElementById('submitManualGateBtn');
  const manualInput = document.getElementById('manualGateIdInput') as HTMLInputElement;
  const video = document.getElementById('gateScannerVideo') as HTMLVideoElement;
  const statusDiv = document.getElementById('gateScannerStatus');

  let stream: MediaStream | null = null;
  let animationFrameId: number | null = null;
  let isScanning = false;

  // Close modal
  closeBtn?.addEventListener('click', () => {
    stopCamera();
    modal?.remove();
  });

  // Close modal when clicking outside
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      stopCamera();
      modal.remove();
    }
  });

  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal) {
      stopCamera();
      modal.remove();
    }
  });

  // Start camera
  startCameraBtn?.addEventListener('click', async () => {
    await startCamera();
  });

  // Stop camera
  stopCameraBtn?.addEventListener('click', () => {
    stopCamera();
  });

  // Function to start camera
  async function startCamera() {
    try {
      if (statusDiv) statusDiv.textContent = 'Starting camera...';
      
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not available');
      }
      
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      
      if (startCameraBtn) startCameraBtn.style.display = 'none';
      if (stopCameraBtn) stopCameraBtn.style.display = 'block';
      if (statusDiv) statusDiv.textContent = 'Camera ready - scanning for QR codes...';
      
      isScanning = true;
      scanFrame();
    } catch (error) {
      console.error('Error starting camera:', error);
      if (statusDiv) statusDiv.textContent = 'Camera access denied';
      showGateScanError('Camera access denied. Please allow camera permissions or use manual input.');
    }
  }

  // Function to stop camera
  function stopCamera() {
    isScanning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    if (video) {
      video.srcObject = null;
    }
    if (startCameraBtn) startCameraBtn.style.display = 'block';
    if (stopCameraBtn) stopCameraBtn.style.display = 'none';
    if (statusDiv) statusDiv.textContent = 'Camera stopped';
  }

  // Function to scan video frames for QR codes
  function scanFrame() {
    if (!isScanning || !video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      if (isScanning) {
        animationFrameId = requestAnimationFrame(scanFrame);
      }
      return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      animationFrameId = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      console.log('QR Code detected:', code.data);
      if (statusDiv) statusDiv.textContent = 'QR Code detected! Processing...';
      
      // Process the QR code
      processGateQRCode(code.data);
      return;
    }
    
    animationFrameId = requestAnimationFrame(scanFrame);
  }

  // Function to process gate QR code
  async function processGateQRCode(qrData: string) {
    try {
      if (statusDiv) statusDiv.textContent = 'Processing QR code...';
      
      const parsed = JSON.parse(qrData);
      
      // Check if it's a gate QR code
      if (parsed.type === 'gate' && parsed.id) {
        stopCamera();
        await processGateScan(visitId, parsed.id);
      } else {
        if (statusDiv) statusDiv.textContent = 'Invalid gate QR code. Please try again.';
        showGateScanError('Invalid Gate QR Code', 'This QR code is not a valid gate code. Please scan a gate QR code.');
      }
    } catch (error) {
      console.error('Error processing gate QR code:', error);
      if (statusDiv) statusDiv.textContent = 'Invalid QR code. Please try again.';
      showGateScanError('Invalid Gate QR Code', 'The gate QR code data could not be processed.');
    }
  }

  // Submit manual gate ID
  submitManualBtn?.addEventListener('click', async () => {
    const gateId = manualInput?.value.trim();
    if (!gateId) {
      showGateScanError('Please enter a gate ID');
      return;
    }

    try {
      await processGateScan(visitId, gateId);
    } catch (error) {
      console.error('Error processing manual gate scan:', error);
      showGateScanError('Error processing gate scan');
    }
  });

  // Handle Enter key in manual input
  manualInput?.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      const gateId = manualInput.value.trim();
      if (!gateId) {
        showGateScanError('Please enter a gate ID');
        return;
      }

      try {
        await processGateScan(visitId, gateId);
      } catch (error) {
        console.error('Error processing manual gate scan:', error);
        showGateScanError('Error processing gate scan');
      }
    }
  });
}

// Function to show gate exit scanning modal
function showGateExitScanningModal(visitId: string) {
  // Create modal HTML
  const modalHTML = `
    <div id="gateExitScanModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Scan Gate Exit</h3>
            <button 
              id="closeGateExitScanModalBtn"
              class="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="text-center">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Scan a gate QR code to log the visitor's exit for visit ID: ${visitId.substring(0, 8)}...
              </p>
              
              <!-- Camera Scanner Section -->
              <div id="cameraExitScannerSection" class="mb-4">
                <div class="relative">
                  <video 
                    id="gateExitScannerVideo" 
                    class="w-full h-64 bg-gray-900 rounded-lg"
                    autoplay 
                    playsinline
                  ></video>
                  <div id="gateExitScannerOverlay" class="absolute inset-0 flex items-center justify-center">
                    <div class="border-2 border-white rounded-lg p-2">
                      <div class="w-48 h-48 border-2 border-white rounded-lg"></div>
                    </div>
                  </div>
                  <div id="gateExitScannerStatus" class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Initializing camera...
                  </div>
                </div>
                
                <div class="mt-2 flex space-x-2">
                  <button 
                    id="startExitCameraBtn"
                    class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
                  >
                    Start Camera
                  </button>
                  <button 
                    id="stopExitCameraBtn"
                    class="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
                    style="display: none;"
                  >
                    Stop Camera
                  </button>
                </div>
              </div>
              
              <!-- Manual Input Section -->
              <div class="mb-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Or manually enter gate ID:</p>
                <div class="flex space-x-2">
                  <input 
                    type="text" 
                    id="manualExitGateIdInput"
                    placeholder="Enter gate ID..."
                    class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                  <button 
                    id="submitManualExitGateBtn"
                    class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
            
            <div id="gateExitScanError" class="hidden text-red-600 text-sm text-center"></div>
            <div id="gateExitScanSuccess" class="hidden text-green-600 text-sm text-center"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Setup event listeners
  const modal = document.getElementById('gateExitScanModal');
  const closeBtn = document.getElementById('closeGateExitScanModalBtn');
  const startCameraBtn = document.getElementById('startExitCameraBtn');
  const stopCameraBtn = document.getElementById('stopExitCameraBtn');
  const submitManualBtn = document.getElementById('submitManualExitGateBtn');
  const manualInput = document.getElementById('manualExitGateIdInput') as HTMLInputElement;
  const video = document.getElementById('gateExitScannerVideo') as HTMLVideoElement;
  const statusDiv = document.getElementById('gateExitScannerStatus');

  let stream: MediaStream | null = null;
  let animationFrameId: number | null = null;
  let isScanning = false;

  // Close modal
  closeBtn?.addEventListener('click', () => {
    stopCamera();
    modal?.remove();
  });

  // Close modal when clicking outside
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      stopCamera();
      modal.remove();
    }
  });

  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal) {
      stopCamera();
      modal.remove();
    }
  });

  // Start camera
  startCameraBtn?.addEventListener('click', async () => {
    await startCamera();
  });

  // Stop camera
  stopCameraBtn?.addEventListener('click', () => {
    stopCamera();
  });

  // Function to start camera
  async function startCamera() {
    try {
      if (statusDiv) statusDiv.textContent = 'Starting camera...';
      
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not available');
      }
      
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      
      if (startCameraBtn) startCameraBtn.style.display = 'none';
      if (stopCameraBtn) stopCameraBtn.style.display = 'block';
      if (statusDiv) statusDiv.textContent = 'Camera ready - scanning for QR codes...';
      
      isScanning = true;
      scanFrame();
    } catch (error) {
      console.error('Error starting camera:', error);
      if (statusDiv) statusDiv.textContent = 'Camera access denied';
      showGateExitScanError('Camera access denied. Please allow camera permissions or use manual input.');
    }
  }

  // Function to stop camera
  function stopCamera() {
    isScanning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    if (video) {
      video.srcObject = null;
    }
    if (startCameraBtn) startCameraBtn.style.display = 'block';
    if (stopCameraBtn) stopCameraBtn.style.display = 'none';
    if (statusDiv) statusDiv.textContent = 'Camera stopped';
  }

  // Function to scan video frames for QR codes
  function scanFrame() {
    if (!isScanning || !video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      if (isScanning) {
        animationFrameId = requestAnimationFrame(scanFrame);
      }
      return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      animationFrameId = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      console.log('QR Code detected:', code.data);
      if (statusDiv) statusDiv.textContent = 'QR Code detected! Processing...';
      
      // Process the QR code
      processGateExitQRCode(code.data);
      return;
    }
    
    animationFrameId = requestAnimationFrame(scanFrame);
  }

  // Function to process gate exit QR code
  async function processGateExitQRCode(qrData: string) {
    try {
      if (statusDiv) statusDiv.textContent = 'Processing QR code...';
      
      const parsed = JSON.parse(qrData);
      
      // Check if it's a gate QR code
      if (parsed.type === 'gate' && parsed.id) {
        stopCamera();
        await processGateExitScan(visitId, parsed.id);
      } else {
        if (statusDiv) statusDiv.textContent = 'Invalid gate QR code. Please try again.';
        showGateExitScanError('Invalid Gate QR Code', 'This QR code is not a valid gate code. Please scan a gate QR code.');
      }
    } catch (error) {
      console.error('Error processing gate exit QR code:', error);
      if (statusDiv) statusDiv.textContent = 'Invalid QR code. Please try again.';
      showGateExitScanError('Invalid Gate QR Code', 'The gate QR code data could not be processed.');
    }
  }

  // Submit manual gate ID
  submitManualBtn?.addEventListener('click', async () => {
    const gateId = manualInput?.value.trim();
    if (!gateId) {
      showGateExitScanError('Please enter a gate ID');
      return;
    }

    try {
      await processGateExitScan(visitId, gateId);
    } catch (error) {
      console.error('Error processing manual gate exit scan:', error);
      showGateExitScanError('Error processing gate exit scan');
    }
  });

  // Handle Enter key in manual input
  manualInput?.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      const gateId = manualInput.value.trim();
      if (!gateId) {
        showGateExitScanError('Please enter a gate ID');
        return;
      }

      try {
        await processGateExitScan(visitId, gateId);
      } catch (error) {
        console.error('Error processing manual gate exit scan:', error);
        showGateExitScanError('Error processing gate exit scan');
      }
    }
  });
}

// Function to process gate scan
async function processGateScan(visitId: string, gateId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showGateScanError('You must be logged in to scan gates');
      return;
    }

    // Call the gate scanning function
    const { error } = await supabase.rpc('scan_gate_entrance', {
      p_visit_id: visitId,
      p_gate_id: gateId,
      p_scanned_by: user.id
    });

    if (error) {
      throw error;
    }

    // Show success message
    showGateScanSuccess('Gate entrance scanned successfully!');
    
    // Close modal after a delay
    setTimeout(() => {
      const modal = document.getElementById('gateScanModal');
      if (modal) {
        modal.remove();
      }
      // Refresh the visit details to show updated status
      const visitIdInput = document.getElementById('visitIdInput') as HTMLInputElement;
      if (visitIdInput?.value.trim()) {
        trackVisit(visitIdInput.value.trim());
      }
    }, 2000);

  } catch (error: any) {
    console.error('Error scanning gate entrance:', error);
    showGateScanError('Error scanning gate entrance: ' + error.message);
  }
}

// Function to process gate exit scan
async function processGateExitScan(visitId: string, gateId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showGateExitScanError('You must be logged in to scan gates');
      return;
    }

    // Call the gate exit scanning function
    const { error } = await supabase.rpc('scan_gate_exit', {
      p_visit_id: visitId,
      p_gate_id: gateId,
      p_scanned_by: user.id
    });

    if (error) {
      throw error;
    }

    // Show success message
    showGateExitScanSuccess('Gate exit scanned successfully! Visit completed!');
    
    // Close modal after a delay
    setTimeout(() => {
      const modal = document.getElementById('gateExitScanModal');
      if (modal) {
        modal.remove();
      }
      // Refresh the visit details to show updated status
      const visitIdInput = document.getElementById('visitIdInput') as HTMLInputElement;
      if (visitIdInput?.value.trim()) {
        trackVisit(visitIdInput.value.trim());
      }
    }, 2000);

  } catch (error: any) {
    console.error('Error scanning gate exit:', error);
    showGateExitScanError('Error scanning gate exit: ' + error.message);
  }
}

// Function to show gate scan error
function showGateScanError(message: string, title?: string) {
  const errorDiv = document.getElementById('gateScanError');
  const successDiv = document.getElementById('gateScanSuccess');
  
  if (errorDiv) {
    errorDiv.textContent = title ? `${title}: ${message}` : message;
    errorDiv.classList.remove('hidden');
  }
  
  if (successDiv) {
    successDiv.classList.add('hidden');
  }
}

// Function to show gate scan success
function showGateScanSuccess(message: string) {
  const errorDiv = document.getElementById('gateScanError');
  const successDiv = document.getElementById('gateScanSuccess');
  
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.classList.remove('hidden');
  }
  
  if (errorDiv) {
    errorDiv.classList.add('hidden');
  }
}

// Function to show gate exit scan error
function showGateExitScanError(message: string, title?: string) {
  const errorDiv = document.getElementById('gateExitScanError');
  const successDiv = document.getElementById('gateExitScanSuccess');
  
  if (errorDiv) {
    errorDiv.textContent = title ? `${title}: ${message}` : message;
    errorDiv.classList.remove('hidden');
  }
  
  if (successDiv) {
    successDiv.classList.add('hidden');
  }
}

// Function to show gate exit scan success
function showGateExitScanSuccess(message: string) {
  const errorDiv = document.getElementById('gateExitScanError');
  const successDiv = document.getElementById('gateExitScanSuccess');
  
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.classList.remove('hidden');
  }
  
  if (errorDiv) {
    errorDiv.classList.add('hidden');
  }
}

// Function to disable all buttons for invalid visit statuses
function disableAllButtons() {
  const printVisitCardBtn = document.getElementById('printVisitCardBtn') as HTMLButtonElement;
  const scanEntranceBtn = document.getElementById('scanEntranceBtn') as HTMLButtonElement;
  const scanExitBtn = document.getElementById('scanExitBtn') as HTMLButtonElement;

  // Disable print visit card button
  if (printVisitCardBtn) {
    printVisitCardBtn.disabled = true;
    printVisitCardBtn.classList.add('opacity-50', 'cursor-not-allowed');
    printVisitCardBtn.innerHTML = `
      <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
      Visit Invalid
    `;
  }

  // Disable scan entrance button
  if (scanEntranceBtn) {
    scanEntranceBtn.disabled = true;
    scanEntranceBtn.classList.add('opacity-50', 'cursor-not-allowed');
    scanEntranceBtn.innerHTML = `
      <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
      Visit Invalid
    `;
  }

  // Disable scan exit button
  if (scanExitBtn) {
    scanExitBtn.disabled = true;
    scanExitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    scanExitBtn.innerHTML = `
      <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
      Visit Invalid
    `;
  }
}

// Function to show INVALID section instead of QR code
function addInvalidStickerToQR() {
  const qrCodeContainer = document.getElementById('qrCodeContainer');
  if (!qrCodeContainer) return;

  // Check if already set to invalid
  if (qrCodeContainer.querySelector('.invalid-text')) return;

  // Find and update the QR code heading
  const qrCodeHeading = qrCodeContainer.parentElement?.querySelector('h3');
  if (qrCodeHeading) {
    qrCodeHeading.textContent = 'INVALID';
    qrCodeHeading.className = 'text-lg font-medium text-red-600 dark:text-red-400 mb-4';
  }

  // Set the container content to INVALID (no QR code generated)
  qrCodeContainer.innerHTML = `
    <div class="invalid-text w-48 h-48 bg-red-500 flex items-center justify-center rounded-lg">
      <div class="text-white text-center">
        <div class="text-4xl font-bold">INVALID</div>
      </div>
    </div>
  `;

  // Update the description text below
  const descriptionText = qrCodeContainer.parentElement?.querySelector('p');
  if (descriptionText) {
    descriptionText.textContent = 'This visit is invalid and cannot be used';
    descriptionText.className = 'mt-2 text-sm text-red-500 dark:text-red-400';
  }
}
