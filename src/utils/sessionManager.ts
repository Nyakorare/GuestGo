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
 * Handles inactivity timeout by logging out the user
 */
async function handleInactivityTimeout() {
  // Clear timers
  clearAllTimers();
  
  // Hide session timer
  hideSessionTimer();

  // Log out the user
  await supabase.auth.signOut();
  
  // Redirect to home page
  window.location.hash = '/';
  
  // Reload after a short delay
  setTimeout(() => {
    window.location.reload();
  }, 50);
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

