import supabase from '../config/supabase';

/**
 * Place On-Hold Component
 * Handles the on-hold functionality for marking places complete in the personnel tab
 */

interface OnHoldState {
  visitId: string;
  placeId: string;
  expiresAt: string; // ISO timestamp
  setAt: string; // ISO timestamp
}

const ON_HOLD_STORAGE_KEY = 'place_on_hold_states';

/**
 * Get all on-hold states from localStorage
 */
function getOnHoldStates(): OnHoldState[] {
  try {
    const stored = localStorage.getItem(ON_HOLD_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading on-hold states:', error);
    return [];
  }
}

/**
 * Save on-hold states to localStorage
 */
function saveOnHoldStates(states: OnHoldState[]): void {
  try {
    localStorage.setItem(ON_HOLD_STORAGE_KEY, JSON.stringify(states));
  } catch (error) {
    console.error('Error saving on-hold states:', error);
  }
}

/**
 * Check if a place is currently on-hold
 */
export function isPlaceOnHold(visitId: string, placeId: string): boolean {
  const states = getOnHoldStates();
  const now = new Date();
  
  // Clean up expired holds
  const activeStates = states.filter(state => {
    if (state.visitId === visitId && state.placeId === placeId) {
      const expiresAt = new Date(state.expiresAt);
      return expiresAt > now;
    }
    return true;
  });
  
  // Update storage if we removed expired holds
  if (activeStates.length !== states.length) {
    saveOnHoldStates(activeStates);
  }
  
  // Check if this specific place is on-hold
  return activeStates.some(
    state => state.visitId === visitId && 
             state.placeId === placeId && 
             new Date(state.expiresAt) > now
  );
}

/**
 * Get the expiration time for a place on-hold
 */
export function getOnHoldExpiration(visitId: string, placeId: string): Date | null {
  const states = getOnHoldStates();
  const state = states.find(
    s => s.visitId === visitId && s.placeId === placeId
  );
  
  if (state) {
    const expiresAt = new Date(state.expiresAt);
    const now = new Date();
    if (expiresAt > now) {
      return expiresAt;
    }
  }
  
  return null;
}

/**
 * Set a place on-hold for a specified duration
 */
export function setPlaceOnHold(visitId: string, placeId: string, hours: number): void {
  const states = getOnHoldStates();
  const now = new Date();
  
  // Calculate expiration time (must not exceed 11:50 PM today)
  const today = new Date();
  today.setHours(23, 50, 0, 0); // 11:50 PM today
  const expirationTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
  
  // Ensure expiration doesn't exceed 11:50 PM today
  const finalExpiration = expirationTime > today ? today : expirationTime;
  
  // Remove any existing on-hold state for this place
  const filteredStates = states.filter(
    s => !(s.visitId === visitId && s.placeId === placeId)
  );
  
  // Add new on-hold state
  const newState: OnHoldState = {
    visitId,
    placeId,
    expiresAt: finalExpiration.toISOString(),
    setAt: now.toISOString()
  };
  
  filteredStates.push(newState);
  saveOnHoldStates(filteredStates);
}

/**
 * Remove on-hold state for a place
 */
export function removePlaceOnHold(visitId: string, placeId: string): void {
  const states = getOnHoldStates();
  const filteredStates = states.filter(
    s => !(s.visitId === visitId && s.placeId === placeId)
  );
  saveOnHoldStates(filteredStates);
}

/**
 * Clean up expired on-hold states
 */
export function cleanupExpiredHolds(): void {
  const states = getOnHoldStates();
  const now = new Date();
  const activeStates = states.filter(state => {
    const expiresAt = new Date(state.expiresAt);
    return expiresAt > now;
  });
  
  if (activeStates.length !== states.length) {
    saveOnHoldStates(activeStates);
  }
}

/**
 * Show the on-hold duration modal
 */
export function showOnHoldModal(visitId: string, placeId: string, onConfirm: () => void): void {
  // Remove any existing modal
  const existingModal = document.getElementById('onHoldModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Get current time and calculate max time (11:50 PM today)
  const now = new Date();
  const today = new Date();
  today.setHours(23, 50, 0, 0);
  const maxHours = Math.max(0, (today.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  const modalHTML = `
    <div id="onHoldModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Set Place On-Hold</h3>
          <button id="closeOnHoldModalBtn" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Set the duration (in hours) before the "Mark Place Complete" button becomes available again.
          </p>
          
          <div>
            <label for="onHoldHours" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration (hours)
            </label>
            <input
              type="number"
              id="onHoldHours"
              min="0.5"
              max="${maxHours.toFixed(1)}"
              step="0.5"
              value="1"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Maximum: ${maxHours.toFixed(1)} hours (until 11:50 PM today)
            </p>
          </div>
          
          <div id="onHoldError" class="hidden p-3 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 rounded-md text-sm">
          </div>
        </div>
        
        <div class="mt-6 flex justify-end gap-3">
          <button
            id="cancelOnHoldBtn"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            id="confirmOnHoldBtn"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Set On-Hold
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  const modal = document.getElementById('onHoldModal');
  const hoursInput = document.getElementById('onHoldHours') as HTMLInputElement;
  const errorDiv = document.getElementById('onHoldError');
  const closeBtn = document.getElementById('closeOnHoldModalBtn');
  const cancelBtn = document.getElementById('cancelOnHoldBtn');
  const confirmBtn = document.getElementById('confirmOnHoldBtn');
  
  const closeModal = () => {
    modal?.remove();
  };
  
  const validateAndConfirm = () => {
    const hours = parseFloat(hoursInput.value);
    
    // Validation
    if (isNaN(hours) || hours <= 0) {
      if (errorDiv) {
        errorDiv.textContent = 'Please enter a valid number of hours (greater than 0).';
        errorDiv.classList.remove('hidden');
      }
      return;
    }
    
    if (hours > maxHours) {
      if (errorDiv) {
        errorDiv.textContent = `Duration cannot exceed ${maxHours.toFixed(1)} hours (11:50 PM today).`;
        errorDiv.classList.remove('hidden');
      }
      return;
    }
    
    // Calculate expiration time
    const expirationTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
    if (expirationTime > today) {
      if (errorDiv) {
        errorDiv.textContent = 'Duration cannot extend past 11:50 PM today.';
        errorDiv.classList.remove('hidden');
      }
      return;
    }
    
    // Set on-hold
    setPlaceOnHold(visitId, placeId, hours);
    closeModal();
    onConfirm();
  };
  
  // Event listeners
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  confirmBtn?.addEventListener('click', validateAndConfirm);
  
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  hoursInput?.addEventListener('input', () => {
    if (errorDiv) {
      errorDiv.classList.add('hidden');
    }
  });
  
  hoursInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      validateAndConfirm();
    }
  });
  
  // Focus the input
  setTimeout(() => hoursInput?.focus(), 100);
}

/**
 * Create the on-hold button HTML
 */
export function createOnHoldButton(visitId: string, placeId: string, onHoldSet: () => void): string {
  return `
    <button
      onclick="window.setPlaceOnHoldFromButton('${visitId}', '${placeId}')"
      class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
      title="Set place on-hold to temporarily disable 'Mark Place Complete'"
    >
      On-Hold
    </button>
  `;
}

/**
 * Initialize the on-hold functionality
 * This should be called when the page loads
 */
export function initializePlaceOnHold(): void {
  // Clean up expired holds on initialization
  cleanupExpiredHolds();
  
  // Set up global function for button onclick
  (window as any).setPlaceOnHoldFromButton = function(visitId: string, placeId: string) {
    showOnHoldModal(visitId, placeId, () => {
      // Refresh the page or update the UI after setting on-hold
      // This will be handled by the calling code
      if (typeof (window as any).refreshPersonnelView === 'function') {
        (window as any).refreshPersonnelView();
      } else if (typeof (window as any).loadScheduledVisits === 'function') {
        // For dashboard personnel tab
        (window as any).loadScheduledVisits();
      } else {
        // Fallback: reload the page
        window.location.reload();
      }
    });
  };
  
  // Set up periodic cleanup (every 5 minutes)
  setInterval(() => {
    cleanupExpiredHolds();
  }, 5 * 60 * 1000);
}

/**
 * Modify the "Mark Place Complete" button to be disabled when on-hold
 * Returns the modified button HTML with disabled state if on-hold
 */
export function modifyMarkCompleteButton(
  originalButtonHTML: string,
  visitId: string,
  placeId: string
): string {
  if (isPlaceOnHold(visitId, placeId)) {
    const expiration = getOnHoldExpiration(visitId, placeId);
    const expirationTime = expiration ? new Date(expiration).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : '';
    
    // Replace the button with a disabled version
    return originalButtonHTML
      .replace(/onclick="[^"]*"/, 'disabled')
      .replace(/class="[^"]*"/, 'class="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed text-sm font-medium"')
      .replace(/>Mark Place Complete</, `>Mark Place Complete (On-Hold until ${expirationTime})<`);
  }
  
  return originalButtonHTML;
}

