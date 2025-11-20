import supabase from '../config/supabase';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
const INACTIVITY_TIMEOUT_LABEL = formatTime(INACTIVITY_TIMEOUT);
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
let sessionTimerInterval: ReturnType<typeof setInterval> | null = null;
let sessionStartTime: number | null = null;
let lastActivityTime: number = Date.now();

/**
 * Formats time in milliseconds to MM:SS format
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Updates the session timer display in the navbar
 */
function updateSessionTimerDisplay() {
  const timerElement = document.getElementById('session-timer');
  if (!timerElement || !sessionStartTime) return;

  const elapsed = Date.now() - sessionStartTime;
  timerElement.textContent = formatTime(elapsed);
}

/**
 * Shows the session timer in the navbar
 */
function showSessionTimer() {
  const timerElement = document.getElementById('session-timer');
  const timerContainer = document.getElementById('session-timer-container');
  if (timerElement && timerContainer) {
    timerContainer.classList.remove('hidden');
    updateSessionTimerDisplay();
    updateSessionTimerTooltip();
  }
}

/**
 * Hides the session timer in the navbar
 */
function hideSessionTimer() {
  const timerContainer = document.getElementById('session-timer-container');
  if (timerContainer) {
    timerContainer.classList.add('hidden');
  }
}

/**
 * Updates the hover tooltip for the session timer
 */
function updateSessionTimerTooltip() {
  const tooltipTextElement = document.getElementById('session-timer-tooltip-text');
  const timerContainer = document.getElementById('session-timer-container');

  if (tooltipTextElement) {
    tooltipTextElement.textContent = `If this timer reaches ${INACTIVITY_TIMEOUT_LABEL} without any activity, you'll be logged out for security. Move your mouse, tap, or type to keep your session active.`;
  }

  if (timerContainer) {
    timerContainer.setAttribute(
      'aria-description',
      `Session auto-logout triggers at ${INACTIVITY_TIMEOUT_LABEL} of inactivity.`
    );
  }
}

/**
 * Resets the inactivity timer
 */
function resetInactivityTimer() {
  // Clear existing timer
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  // Update last activity time
  lastActivityTime = Date.now();

  // Set new timer
  inactivityTimer = setTimeout(() => {
    handleInactivityTimeout();
  }, INACTIVITY_TIMEOUT);
}

/**
 * Shows the inactivity logout modal
 */
function showInactivityLogoutModal() {
  // Remove any existing modal
  const existingModal = document.getElementById('inactivity-logout-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal HTML
  const modalHTML = `
    <div id="inactivity-logout-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div class="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <!-- Header -->
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Session Expired</h3>
            <button 
              id="closeInactivityModalBtn"
              class="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="mb-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  You have been logged out due to inactivity. For security reasons, your session expires after ${INACTIVITY_TIMEOUT_LABEL} of inactivity.
                </p>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <div class="flex justify-end">
            <button 
              id="acknowledgeInactivityBtn"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Lock body scroll while modal is open
  document.body.classList.add('overflow-hidden');

  // Setup event listeners
  const modal = document.getElementById('inactivity-logout-modal');
  const closeBtn = document.getElementById('closeInactivityModalBtn');
  const acknowledgeBtn = document.getElementById('acknowledgeInactivityBtn');

  const closeModal = async () => {
    if (modal) {
      modal.remove();
    }
    // Restore body scroll
    document.body.classList.remove('overflow-hidden');
    
    // Log out the user
    await supabase.auth.signOut();
    
    // Redirect to home page
    window.location.hash = '/';
    
    // Reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 50);
  };

  closeBtn?.addEventListener('click', closeModal);
  acknowledgeBtn?.addEventListener('click', closeModal);

  // Close on background click
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on escape key
  const escapeHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && modal) {
      closeModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

/**
 * Handles inactivity timeout by logging out the user
 */
async function handleInactivityTimeout() {
  // Clear timers
  clearAllTimers();
  
  // Hide session timer
  hideSessionTimer();

  // Show inactivity logout modal
  showInactivityLogoutModal();
}

/**
 * Clears all timers
 */
function clearAllTimers() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  
  if (sessionTimerInterval) {
    clearInterval(sessionTimerInterval);
    sessionTimerInterval = null;
  }
  
  sessionStartTime = null;
}

/**
 * Initializes session management for a logged-in user
 */
export function initializeSessionManager() {
  // Check if user is logged in
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      startSession();
    } else {
      stopSession();
    }
  });

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      startSession();
    } else {
      stopSession();
    }
  });
}

/**
 * Starts session tracking
 */
function startSession() {
  // Reset timers if already running
  stopSession();

  // Set session start time
  sessionStartTime = Date.now();
  lastActivityTime = Date.now();

  // Show session timer
  showSessionTimer();

  // Start inactivity timer
  resetInactivityTimer();

  // Start session timer interval (update every second)
  sessionTimerInterval = setInterval(() => {
    updateSessionTimerDisplay();
  }, 1000);

  // Set up activity listeners
  setupActivityListeners();
}

/**
 * Stops session tracking
 */
function stopSession() {
  clearAllTimers();
  hideSessionTimer();
  removeActivityListeners();
}

/**
 * Sets up listeners for user activity
 */
function setupActivityListeners() {
  const events = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'keydown'
  ];

  events.forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
  });
}

/**
 * Removes activity listeners
 */
function removeActivityListeners() {
  const events = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'keydown'
  ];

  events.forEach(event => {
    document.removeEventListener(event, resetInactivityTimer, true);
  });
}

