import supabase from '../config/supabase';
import { showNotification } from '../pages/dashboard/index';
import { showLoadingOverlay, hideLoadingOverlay } from '../utils/loadingOverlay';
import { generateSimpleVisitQRCode, openPrintableVisitCard } from '../utils/qrCode';
import type { VisitQRData } from '../utils/qrCode';
import jsQR from 'jsqr';
import { VisitIdInput } from '../components/mini-features/trackschedule/VisitIdInput';
import { VisitInformation } from '../components/mini-features/trackschedule/VisitInformation';
import { PlacesToVisit } from '../components/mini-features/trackschedule/PlacesToVisit';
import { VisitProgress } from '../components/mini-features/trackschedule/VisitProgress';
import { GateScanningStatus } from '../components/mini-features/trackschedule/GateScanningStatus';
import { VisitQRCode } from '../components/mini-features/trackschedule/VisitQRCode';
import { NoVisitFound } from '../components/mini-features/trackschedule/NoVisitFound';
import { checkAndShowPlaceOnHoldNotification } from '../components/PlaceOnHoldNotificationModal';
import { Footer } from '../components/mini-features/Footer';

export function TrackSchedulePage() {
  return `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-10 relative overflow-hidden">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-24 -right-16 w-72 h-72 bg-gradient-to-br from-indigo-500/30 via-blue-400/20 to-purple-500/30 blur-3xl animate-pulse-slow"></div>
        <div class="absolute -bottom-24 -left-16 w-72 h-72 bg-gradient-to-br from-emerald-500/20 via-cyan-400/20 to-blue-500/20 blur-3xl animate-pulse-slow delay-500"></div>
      </div>
      <div class="relative z-10 w-full px-4 sm:px-8 lg:px-16 xl:px-24 2xl:px-32 space-y-10">
        <!-- Header -->
        <div class="text-center mb-4 track-fade-in">
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Track Schedule
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Enter your scheduled visit ID to view your visit progress and details
          </p>
        </div>

        ${VisitIdInput()}

        <!-- Visit Details Section -->
        <div id="visitDetailsSection" class="hidden track-fade-in track-fade-in-delay-2">
          <div class="track-card bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900/50 rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg track-icon-float">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  Visit Details
                </h2>
              </div>
              <button
                id="printVisitCardBtn"
                class="px-5 py-2.5 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 track-button-glow"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                </svg>
                Print Visit Card
              </button>
            </div>

            ${VisitInformation()}

            ${PlacesToVisit()}

            ${VisitProgress()}

            ${GateScanningStatus()}

            ${VisitQRCode()}

            <!-- Feedback Survey Button (for non-logged-in completed visits) -->
            <div id="feedbackSurveyContainer" class="hidden mt-8 track-fade-in track-fade-in-delay-5">
              <div class="track-card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-700">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Share Your Feedback
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Help us improve by sharing your experience with this visit
                    </p>
                  </div>
                  <button 
                    id="feedbackSurveyBtn"
                    class="ml-4 px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 track-button-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Feedback Survey
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        ${NoVisitFound()}
      </div>
      ${Footer()}
    </div>
  `;
}

// Initialize the Track Schedule page
export function initTrackSchedulePage() {
  // Set up event listeners
  setupTrackScheduleEventListeners();

  // Setup scroll to top button
  import('../components/DocumentationNavigationButtons').then(({ setupScrollToTopButton }) => {
    setupScrollToTopButton();
  });
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

  // View face images button
  const viewFaceImagesBtn = document.getElementById('viewFaceImagesBtn');
  viewFaceImagesBtn?.addEventListener('click', async () => {
    const visitId = visitIdInput?.value.trim();
    if (!visitId) {
      showNotification('No visit ID available', 'error');
      return;
    }

    await showFaceImagesModal(visitId);
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

  // Check and show on-hold notification if any places are on-hold
  if (visitData.scheduled_visit_places && visitData.scheduled_visit_places.length > 0) {
    checkAndShowPlaceOnHoldNotification(visitData.id, visitData.scheduled_visit_places);
  }

  // Handle invalid statuses (unsuccessful or completed_flagged)
  if (visitData.status === 'unsuccessful' || visitData.status === 'completed_flagged') {
    disableAllButtons();
  }

  // Show/hide feedback survey button for non-logged-in completed visits
  await displayFeedbackSurveyButton(visitData);
}

// Display feedback survey button for non-logged-in completed visits
async function displayFeedbackSurveyButton(visitData: any) {
  const feedbackContainer = document.getElementById('feedbackSurveyContainer');
  const feedbackBtn = document.getElementById('feedbackSurveyBtn') as HTMLButtonElement;
  
  if (!feedbackContainer || !feedbackBtn) return;

  // Check if this is a non-logged-in visit (guest visit) and if it's completed
  const isGuestVisit = visitData.visitor_user_id === null;
  const isCompleted = visitData.status === 'completed';

  if (isGuestVisit && isCompleted) {
    // Show the feedback container
    feedbackContainer.classList.remove('hidden');

    // Get places names for the feedback survey
    const places = (visitData.scheduled_visit_places || []).map((place: any) => 
      place.places_to_visit?.name || 'Unknown Place'
    );

    // Set up the button click handler
    feedbackBtn.onclick = async () => {
      await openFeedbackSurveyForTrackSchedule(
        visitData.id,
        `${visitData.visitor_first_name} ${visitData.visitor_last_name}`,
        visitData.visit_date,
        places
      );
    };

    // Check if feedback already exists and update button state
    await updateFeedbackButtonStateForTrackSchedule(visitData.id, feedbackBtn);
  } else {
    // Hide the feedback container for logged-in visits or non-completed visits
    feedbackContainer.classList.add('hidden');
  }
}

// Open feedback survey for track schedule (non-logged-in users)
async function openFeedbackSurveyForTrackSchedule(
  visitId: string, 
  visitorName: string, 
  visitDate: string, 
  places: string[]
) {
  try {
    // Import the feedback survey modal
    const { showFeedbackSurveyModal, hasFeedbackForVisit } = await import('../components/FeedbackSurveyModal');
    
    // Check if feedback already exists for this visit
    const feedbackExists = await hasFeedbackForVisit(visitId);
    
    if (feedbackExists) {
      showNotification('Feedback has already been submitted for this visit.', 'success');
      // Update button state
      const feedbackBtn = document.getElementById('feedbackSurveyBtn') as HTMLButtonElement;
      if (feedbackBtn) {
        await updateFeedbackButtonStateForTrackSchedule(visitId, feedbackBtn);
      }
      return;
    }
    
    // Show the feedback survey modal
    showFeedbackSurveyModal({
      visitId,
      visitorName,
      visitDate,
      places
    });
    
  } catch (error) {
    console.error('Error opening feedback survey:', error);
    showNotification('Error opening feedback survey. Please try again.', 'error');
  }
}

// Update feedback button state for track schedule
async function updateFeedbackButtonStateForTrackSchedule(visitId: string, button: HTMLButtonElement) {
  try {
    const { hasFeedbackForVisit } = await import('../components/FeedbackSurveyModal');
    const feedbackExists = await hasFeedbackForVisit(visitId);
    
    if (feedbackExists) {
      button.disabled = true;
      button.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Feedback Submitted
      `;
      button.className = button.className.replace('from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700', 'from-green-600 to-emerald-600');
    } else {
      button.disabled = false;
      button.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        Feedback Survey
      `;
      button.className = button.className.replace('from-green-600 to-emerald-600', 'from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700');
    }
  } catch (error) {
    console.error('Error updating feedback button state:', error);
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
      <div class="track-card flex flex-col gap-3 sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200/70 dark:border-gray-600/70">
        <div class="w-full sm:flex-1">
          <h4 class="font-semibold text-gray-900 dark:text-white">${place.places_to_visit?.name || 'Unknown Place'}</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">${place.places_to_visit?.location || ''}</p>
          ${place.places_to_visit?.description ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${place.places_to_visit.description}</p>` : ''}
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

  // Show/hide view face images button for non-logged-in scheduled visits
  const viewFaceImagesContainer = document.getElementById('viewFaceImagesContainer');
  const isGuestVisit = visitData.visitor_user_id === null;
  
  if (viewFaceImagesContainer) {
    // Show button only for guest visits (non-logged-in scheduled visits)
    if (isGuestVisit) {
      viewFaceImagesContainer.classList.remove('hidden');
    } else {
      viewFaceImagesContainer.classList.add('hidden');
    }
  }
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

    // Show face detection modal before processing gate scan
    await showFaceDetectionForGateScan(visitId, gateId);
  } catch (error: any) {
    console.error('Error scanning gate entrance:', error);
    showGateScanError('Error scanning gate entrance: ' + error.message);
  }
}

// Function to show face detection modal for gate scanning
async function showFaceDetectionForGateScan(visitId: string, gateId: string) {
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
    const { openFaceDetectionModal } = await import('../utils/AI-Face-Detection/blazefaceModal');
    const faceResult = await openFaceDetectionModal();
    
    // Remove loading overlay
    loadingOverlay.remove();

    if (faceResult.success && faceResult.croppedImageDataUrl) {
      // Process the gate scan with face data
      await processGateScanWithFaceData(visitId, gateId, faceResult);
    } else {
      // Face detection failed or was cancelled
      showGateScanError('Face detection is required to scan the gate entrance. Please try again.');
    }
  } catch (error) {
    console.error('Error in face detection for gate scan:', error);
    showGateScanError('Error during face detection. Please try again.');
  }
}

// Function to process gate scan with face data
async function processGateScanWithFaceData(visitId: string, gateId: string, faceResult: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showGateScanError('You must be logged in to scan gates');
      return;
    }

    // Prepare face image data for storage
    let faceImageData = null;
    let faceDetectionMetadata = null;
    let faceDetectionConfidence = null;

    if (faceResult.croppedImageDataUrl) {
      // Compress the cropped face image for storage
      const { compressImageDataUrl } = await import('../utils/imageCompression');
      const compressedImage = await compressImageDataUrl(faceResult.croppedImageDataUrl, 0.8, 400, 400);
      faceImageData = compressedImage;
      
      // Set confidence only if face data exists
      // Handle case where confidence might be an array (extract first element)
      if (faceResult.confidence !== null && faceResult.confidence !== undefined) {
        faceDetectionConfidence = Array.isArray(faceResult.confidence) 
          ? (faceResult.confidence[0] ?? null)
          : (typeof faceResult.confidence === 'number' ? faceResult.confidence : null);
      }
      
      // Prepare metadata
      faceDetectionMetadata = {
        timestamp: new Date().toISOString(),
        confidence: faceDetectionConfidence,
        boundingBox: faceResult.detections?.[0] || null,
        originalSize: faceResult.croppedImageDataUrl.length,
        compressedSize: compressedImage.length
      };
    }

    // Call the gate scanning function with face data
    const { error } = await supabase.rpc('scan_gate_entrance_with_face', {
      p_visit_id: visitId,
      p_gate_id: gateId,
      p_scanned_by: user.id,
      p_face_image_data: faceImageData,
      p_face_detection_confidence: faceDetectionConfidence,
      p_face_detection_metadata: faceDetectionMetadata,
      p_ip_address: null,
      p_user_agent: navigator.userAgent,
      p_location_data: null
    });

    if (error) {
      console.error('Error scanning gate with face data:', error);
      showGateScanError(`Error scanning gate: ${error.message}`);
      return;
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
    console.error('Error in processGateScanWithFaceData:', error);
    showGateScanError('Error processing gate scan with face data.');
  }
}

// Function to show face images modal for entrance and exit
async function showFaceImagesModal(visitId: string) {
  try {
    // Get visit data to get visitor name
    const { data: visitData, error: visitError } = await supabase
      .from('scheduled_visits')
      .select('visitor_first_name, visitor_last_name, visitor_email')
      .eq('id', visitId)
      .single();

    if (visitError || !visitData) {
      showNotification('Error loading visit data', 'error');
      return;
    }

    const visitorName = visitData.visitor_first_name && visitData.visitor_last_name
      ? `${visitData.visitor_first_name} ${visitData.visitor_last_name}`
      : visitData.visitor_email || 'Visitor';

    // Get entrance and exit face images
    const { data: scans, error: scansError } = await supabase
      .from('gate_scans')
      .select('scan_type, face_image_data, face_detection_confidence, face_detection_metadata, scanned_at')
      .eq('visit_id', visitId)
      .in('scan_type', ['entrance', 'exit'])
      .order('scanned_at', { ascending: true });

    if (scansError) {
      console.error('Error loading face images:', scansError);
      showNotification('Error loading face images', 'error');
      return;
    }

    const entranceScan = scans?.find(s => s.scan_type === 'entrance');
    const exitScan = scans?.find(s => s.scan_type === 'exit');

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'faceImagesModal';
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    
    modal.innerHTML = `
      <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <!-- Header -->
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Face Images - Entrance & Exit
            </h3>
            <button 
              id="closeFaceImagesModalBtn"
              class="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Visitor Info -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <div class="flex items-center space-x-2 mb-2">
              <svg class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="font-medium text-gray-900 dark:text-white">Visitor: ${visitorName}</span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Visit ID: ${visitId.substring(0, 8)}...
            </div>
          </div>

          <!-- Face Images Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <!-- Entrance Face -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-700">
              <h4 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
                Entrance Face
              </h4>
              <div id="entranceFaceContainer" class="flex justify-center items-center h-48 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div class="text-sm text-gray-500 dark:text-gray-400">${entranceScan ? 'Loading...' : 'No entrance face image available'}</div>
                </div>
              </div>
              ${entranceScan && entranceScan.face_detection_confidence ? `
                <div class="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Confidence: ${(entranceScan.face_detection_confidence * 100).toFixed(1)}%
                </div>
              ` : ''}
            </div>

            <!-- Exit Face -->
            <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-700">
              <h4 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Exit Face
              </h4>
              <div id="exitFaceContainer" class="flex justify-center items-center h-48 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div class="text-sm text-gray-500 dark:text-gray-400">${exitScan ? 'Loading...' : 'No exit face image available'}</div>
                </div>
              </div>
              ${exitScan && exitScan.face_detection_confidence ? `
                <div class="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Confidence: ${(exitScan.face_detection_confidence * 100).toFixed(1)}%
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end space-x-3">
            <button 
              id="closeFaceImagesModalBtn2"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    const closeBtn1 = modal.querySelector('#closeFaceImagesModalBtn');
    const closeBtn2 = modal.querySelector('#closeFaceImagesModalBtn2');
    
    const closeModal = () => {
      modal.remove();
    };

    closeBtn1?.addEventListener('click', closeModal);
    closeBtn2?.addEventListener('click', closeModal);

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Load and display face images
    const { processFaceImageForDisplay } = await import('../utils/imageCompression');
    const entranceContainer = modal.querySelector('#entranceFaceContainer');
    const exitContainer = modal.querySelector('#exitFaceContainer');

    if (entranceScan && entranceScan.face_image_data && entranceContainer) {
      try {
        const decryptedImage = processFaceImageForDisplay(entranceScan.face_image_data);
        entranceContainer.innerHTML = `
          <img 
            src="${decryptedImage}" 
            alt="Entrance face image"
            class="max-w-full max-h-48 rounded-lg shadow-md border-2 border-blue-300 dark:border-blue-600"
          />
        `;
      } catch (error) {
        console.error('Error processing entrance face image:', error);
        entranceContainer.innerHTML = `
          <div class="text-center">
            <div class="text-sm text-red-500 dark:text-red-400">Error loading entrance face image</div>
          </div>
        `;
      }
    }

    if (exitScan && exitScan.face_image_data && exitContainer) {
      try {
        const decryptedImage = processFaceImageForDisplay(exitScan.face_image_data);
        exitContainer.innerHTML = `
          <img 
            src="${decryptedImage}" 
            alt="Exit face image"
            class="max-w-full max-h-48 rounded-lg shadow-md border-2 border-purple-300 dark:border-purple-600"
          />
        `;
      } catch (error) {
        console.error('Error processing exit face image:', error);
        exitContainer.innerHTML = `
          <div class="text-center">
            <div class="text-sm text-red-500 dark:text-red-400">Error loading exit face image</div>
          </div>
        `;
      }
    }

  } catch (error) {
    console.error('Error showing face images modal:', error);
    showNotification('Error displaying face images', 'error');
  }
}

// Function to retrieve entrance face image for verification
async function getEntranceFaceImage(visitId: string): Promise<string | null> {
  try {
    // Get the entrance scan for this visit
    const { data: entranceScans, error } = await supabase
      .from('gate_scans')
      .select('face_image_data')
      .eq('visit_id', visitId)
      .eq('scan_type', 'entrance')
      .order('scanned_at', { ascending: false })
      .limit(1);

    if (error || !entranceScans || entranceScans.length === 0) {
      console.error('Error retrieving entrance face image:', error);
      return null;
    }

    const storedImageData = entranceScans[0].face_image_data;
    if (!storedImageData) {
      return null;
    }

    // Decrypt the image data if it's encrypted
    // The stored image is already at 400x400 for verification purposes, so use it directly
    const { processFaceImageForDisplay } = await import('../utils/imageCompression');
    const decryptedImage = processFaceImageForDisplay(storedImageData);
    
    return decryptedImage;
  } catch (error) {
    console.error('Error in getEntranceFaceImage:', error);
    return null;
  }
}

// Function to verify faces using Python AI API
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
      // When using local API, treat any TypeError (which fetch throws on network errors) as a network issue
      // This includes connection refused, failed to fetch, etc.
      let isNetworkError = primaryError instanceof TypeError;
      
      // Also check for explicit network error messages
      if (!isNetworkError && primaryError instanceof Error) {
        const errorMessage = primaryError.message.toLowerCase();
        const errorStack = primaryError.stack?.toLowerCase() || '';
        if (errorMessage.includes('failed to fetch') ||
            errorMessage.includes('connection refused') ||
            errorMessage.includes('network') ||
            errorStack.includes('connection refused') ||
            errorStack.includes('err_network')) {
          isNetworkError = true;
        }
      }

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

// Function to show face detection for exit gate scan
async function showFaceDetectionForExitGateScan(visitId: string, gateId: string) {
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

    // Retrieve entrance face image first
    const entranceFaceImage = await getEntranceFaceImage(visitId);
    
    if (!entranceFaceImage) {
      loadingOverlay.remove();
      showGateExitScanError('Entrance face data not found', 'Unable to retrieve entrance face image for verification. Please ensure the entrance was scanned with face detection.');
      return;
    }

    // Open face detection modal
    const { openFaceDetectionModal } = await import('../utils/AI-Face-Detection/blazefaceModal');
    const faceResult = await openFaceDetectionModal();
    
    // Remove loading overlay
    loadingOverlay.remove();

    if (faceResult.success && faceResult.croppedImageDataUrl) {
      // Process the exit gate scan with face verification
      await processGateExitScanWithFaceVerification(visitId, gateId, faceResult, entranceFaceImage);
    } else {
      // Face detection failed or was cancelled
      showGateExitScanError('Face detection is required to scan the gate exit. Please try again.');
    }
  } catch (error) {
    console.error('Error in face detection for exit gate scan:', error);
    showGateExitScanError('Error during face detection. Please try again.');
  }
}

// Function to process gate exit scan with face verification
async function processGateExitScanWithFaceVerification(
  visitId: string, 
  gateId: string, 
  faceResult: any, 
  entranceFaceImage: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showGateExitScanError('You must be logged in to scan gates');
      return;
    }

    // Prepare exit face image data
    let exitFaceImageData = null;
    let faceDetectionMetadata = null;
    let faceDetectionConfidence = null;

    if (faceResult.croppedImageDataUrl) {
      // Compress the cropped face image for storage
      const { compressImageDataUrl } = await import('../utils/imageCompression');
      const compressedImage = await compressImageDataUrl(faceResult.croppedImageDataUrl, 0.8, 400, 400);
      exitFaceImageData = compressedImage;
      
      // Handle case where confidence might be an array (extract first element)
      if (faceResult.confidence !== null && faceResult.confidence !== undefined) {
        faceDetectionConfidence = Array.isArray(faceResult.confidence) 
          ? (faceResult.confidence[0] ?? null)
          : (typeof faceResult.confidence === 'number' ? faceResult.confidence : null);
      }
      
      // Prepare metadata
      faceDetectionMetadata = {
        timestamp: new Date().toISOString(),
        confidence: faceDetectionConfidence,
        boundingBox: faceResult.detections?.[0] || null,
        originalSize: faceResult.croppedImageDataUrl.length,
        compressedSize: compressedImage.length
      };

      // Verify faces match
      const verificationResult = await verifyFaces(entranceFaceImage, compressedImage);

      if (verificationResult.error) {
        showGateExitScanError('Face Verification Error', `${verificationResult.error}. Please retake the photo.`);
        
        // Reopen face detection modal to allow retry
        setTimeout(async () => {
          try {
            await showFaceDetectionForExitGateScan(visitId, gateId);
          } catch (error) {
            console.error('Error reopening face detection modal:', error);
            showGateExitScanError('Error', 'Failed to reopen face detection. Please try again.');
          }
        }, 1000); // Wait 1 second before reopening to let user see the error message
        
        return;
      }

      if (!verificationResult.match) {
        const similarityPercent = (verificationResult.similarity * 100).toFixed(1);
        showGateExitScanError(
          'Face Verification Failed', 
          `Face does not match the entrance picture. Similarity: ${similarityPercent}%. Please retake the photo.`
        );
        
        // Reopen face detection modal to allow retry
        setTimeout(async () => {
          try {
            await showFaceDetectionForExitGateScan(visitId, gateId);
          } catch (error) {
            console.error('Error reopening face detection modal:', error);
            showGateExitScanError('Error', 'Failed to reopen face detection. Please try again.');
          }
        }, 1000); // Wait 1 second before reopening to let user see the error message
        
        return;
      }

      // Faces match, proceed with exit scan
      const similarityPercent = (verificationResult.similarity * 100).toFixed(1);
      console.log(`Face verification successful. Similarity: ${similarityPercent}%`);
      
      // Store similarity for success message
      const verificationSimilarity = similarityPercent;
      
      // Call the gate exit scanning function with face data
      const { error } = await supabase.rpc('scan_gate_exit', {
        p_visit_id: visitId,
        p_gate_id: gateId,
        p_scanned_by: user.id,
        p_face_image_data: exitFaceImageData,
        p_face_detection_confidence: faceDetectionConfidence,
        p_face_detection_metadata: faceDetectionMetadata
      });

      if (error) {
        throw error;
      }

      // Send completion email (don't fail if email sending fails)
      try {
        await sendVisitCompletionEmailHelper(visitId);
      } catch (emailError) {
        console.error('Error sending completion email:', emailError);
        // Don't show error to user - email failure shouldn't block visit completion
      }

      // Show success message with similarity percentage
      showGateExitScanSuccess(`Gate exit scanned successfully! Face verified with ${verificationSimilarity}% similarity match. Visit completed!`);
      
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
    } else {
      showGateExitScanError('Face detection failed', 'Unable to capture face image. Please try again.');
      return;
    }

  } catch (error: any) {
    console.error('Error scanning gate exit:', error);
    showGateExitScanError('Error scanning gate exit: ' + error.message);
  }
}

// Function to process gate exit scan (updated to use face detection)
async function processGateExitScan(visitId: string, gateId: string) {
  try {
    // Show face detection modal for exit scan
    await showFaceDetectionForExitGateScan(visitId, gateId);
  } catch (error: any) {
    console.error('Error in processGateExitScan:', error);
    showGateExitScanError('Error processing gate exit scan');
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

// Function to refresh track schedule feedback button state (called after feedback submission)
(window as any).refreshTrackScheduleFeedbackButton = async function(visitId: string) {
  const feedbackBtn = document.getElementById('feedbackSurveyBtn') as HTMLButtonElement;
  if (feedbackBtn) {
    await updateFeedbackButtonStateForTrackSchedule(visitId, feedbackBtn);
  }
};

// Helper function to send visit completion email
async function sendVisitCompletionEmailHelper(visitId: string): Promise<void> {
  try {
    // Fetch visit data with places
    const { data: visitData, error: visitError } = await supabase
      .from('scheduled_visits')
      .select(`
        id,
        visitor_first_name,
        visitor_last_name,
        visitor_email,
        visitor_role,
        visit_date,
        purpose,
        scheduled_visit_places (
          place_id,
          places_to_visit (
            id,
            name,
            location
          )
        )
      `)
      .eq('id', visitId)
      .single();

    if (visitError || !visitData) {
      console.error('Error fetching visit data for email:', visitError);
      return;
    }

    // Transform places data
    const places = (visitData.scheduled_visit_places || []).map((svp: any) => ({
      placeId: svp.places_to_visit?.id || svp.place_id,
      placeName: svp.places_to_visit?.name || 'Unknown Place',
      placeLocation: svp.places_to_visit?.location || null,
    }));

    // Import and send completion email
    const { sendVisitCompletionEmail } = await import('../config/completionEmail');
    
    await sendVisitCompletionEmail({
      visitId: visitData.id,
      visitorFirstName: visitData.visitor_first_name,
      visitorLastName: visitData.visitor_last_name,
      visitorEmail: visitData.visitor_email,
      visitorRole: visitData.visitor_role as 'guest' | 'visitor',
      visitDate: visitData.visit_date,
      purpose: visitData.purpose,
      places: places,
    });
  } catch (error) {
    console.error('Error in sendVisitCompletionEmailHelper:', error);
    // Don't throw - email failure shouldn't block visit completion
  }
}
