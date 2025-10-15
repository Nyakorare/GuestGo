import supabase from '../config/supabase';
import { showNotification } from '../pages/dashboard/index';
import { showLoadingOverlay, hideLoadingOverlay } from '../utils/loadingOverlay';
import { generateSimpleVisitQRCode } from '../utils/qrCode';
import type { VisitQRData } from '../utils/qrCode';

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
              <div id="placesList" class="space-y-3">
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
                </div>
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Exit Scan</span>
                    <span id="exitScanStatus" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"></span>
                  </div>
                  <p id="exitScanTime" class="mt-1 text-xs text-gray-500 dark:text-gray-400"></p>
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
    displayVisitDetails(visitData);

    // Generate QR code
    await generateAndDisplayQRCode(visitData);

    hideLoadingOverlay();
    showNotification('Visit details loaded successfully', 'success');

  } catch (error: any) {
    console.error('Error tracking visit:', error);
    hideLoadingOverlay();
    showNotification('Error loading visit details: ' + error.message, 'error');
  }
}

// Display visit details
function displayVisitDetails(visitData: any) {
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
  displayGateScanningStatus(visitData);
}

// Display places to visit
function displayPlaces(places: any[]) {
  const placesList = document.getElementById('placesList');
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
function displayGateScanningStatus(visitData: any) {
  const entranceScanStatus = document.getElementById('entranceScanStatus');
  const entranceScanTime = document.getElementById('entranceScanTime');
  const exitScanStatus = document.getElementById('exitScanStatus');
  const exitScanTime = document.getElementById('exitScanTime');

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

    // Open printable card (reuse existing function from dashboard)
    if ((window as any).openPrintableVisitCard) {
      (window as any).openPrintableVisitCard(qrVisitData, qrCodeDataUrl);
    } else {
      // Fallback: open in new window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Visit Card - ${visitData.id}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .card { border: 1px solid #ccc; padding: 20px; max-width: 400px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 20px; }
                .qr-code { text-align: center; margin: 20px 0; }
                .info { margin: 10px 0; }
                .label { font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <h2>GuestGo Visit Card</h2>
                </div>
                <div class="info">
                  <div class="label">Visit ID:</div>
                  <div>${visitData.id}</div>
                </div>
                <div class="info">
                  <div class="label">Visitor:</div>
                  <div>${visitData.visitor_first_name} ${visitData.visitor_last_name}</div>
                </div>
                <div class="info">
                  <div class="label">Date:</div>
                  <div>${new Date(visitData.visit_date).toLocaleDateString()}</div>
                </div>
                <div class="info">
                  <div class="label">Purpose:</div>
                  <div>${visitData.purpose}</div>
                </div>
                <div class="qr-code">
                  <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }

    hideLoadingOverlay();
    showNotification('Visit card generated successfully!', 'success');

  } catch (error: any) {
    console.error('Error printing visit card:', error);
    hideLoadingOverlay();
    showNotification('Error generating visit card: ' + error.message, 'error');
  }
}
