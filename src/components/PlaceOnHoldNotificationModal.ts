import { isPlaceOnHold, getOnHoldExpiration } from './PlaceOnHold';

/**
 * Place On-Hold Notification Modal
 * Shows visitors when places in their visit are on-hold and how long they need to wait
 */

interface OnHoldPlaceInfo {
  placeId: string;
  placeName: string;
  placeLocation?: string;
  expirationTime: Date;
  timeRemaining: string;
}

/**
 * Calculate time remaining until expiration
 */
function calculateTimeRemaining(expirationTime: Date): string {
  const now = new Date();
  const diff = expirationTime.getTime() - now.getTime();
  
  if (diff <= 0) {
    return 'Available now';
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
}

/**
 * Check if any places in a visit are on-hold
 */
export function checkVisitPlacesOnHold(visitId: string, places: any[]): OnHoldPlaceInfo[] {
  const onHoldPlaces: OnHoldPlaceInfo[] = [];
  
  if (!places || places.length === 0) {
    return onHoldPlaces;
  }
  
  places.forEach(place => {
    const placeId = place.place_id || place.id;
    if (!placeId) {
      console.warn('Place missing place_id or id:', place);
      return;
    }
    
    if (isPlaceOnHold(visitId, placeId)) {
      const expiration = getOnHoldExpiration(visitId, placeId);
      if (expiration) {
        const placeName = place.places_to_visit?.name || place.place_name || 'Unknown Place';
        const placeLocation = place.places_to_visit?.location || place.place_location;
        
        onHoldPlaces.push({
          placeId,
          placeName,
          placeLocation,
          expirationTime: expiration,
          timeRemaining: calculateTimeRemaining(expiration)
        });
      }
    }
  });
  
  return onHoldPlaces;
}

/**
 * Show the on-hold notification modal
 */
export function showPlaceOnHoldNotificationModal(visitId: string, places: any[]): void {
  const onHoldPlaces = checkVisitPlacesOnHold(visitId, places);
  
  console.log('PlaceOnHoldNotification: Checked places', { 
    visitId, 
    totalPlaces: places.length, 
    onHoldCount: onHoldPlaces.length,
    onHoldPlaces: onHoldPlaces.map(p => ({ name: p.placeName, timeRemaining: p.timeRemaining }))
  });
  
  // Don't show modal if no places are on-hold
  if (onHoldPlaces.length === 0) {
    console.log('PlaceOnHoldNotification: No places on-hold, modal not shown');
    return;
  }
  
  console.log('PlaceOnHoldNotification: Showing modal for', onHoldPlaces.length, 'place(s)');
  
  // Remove any existing modal
  const existingModal = document.getElementById('placeOnHoldNotificationModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Format expiration times
  const placesList = onHoldPlaces.map(place => {
    const expirationTimeStr = place.expirationTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `
      <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800" data-place-id="${place.placeId}">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-1">${place.placeName}</h4>
            ${place.placeLocation ? `<p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${place.placeLocation}</p>` : ''}
            <div class="space-y-1">
              <p class="text-sm text-gray-700 dark:text-gray-300">
                <span class="font-medium">Wait time remaining:</span> 
                <span class="text-orange-600 dark:text-orange-400 font-semibold time-remaining">${place.timeRemaining}</span>
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Available again at: <span class="font-medium expiration-time">${expirationTimeStr}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  const modalHTML = `
    <div id="placeOnHoldNotificationModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Place(s) On-Hold</h3>
            </div>
            <button
              id="closePlaceOnHoldNotificationBtn"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Content -->
          <div class="space-y-4">
            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p class="text-sm text-gray-700 dark:text-gray-300">
                <span class="font-semibold">Notice:</span> Some places in your visit are currently on-hold. 
                Please wait for the specified duration before returning to these places.
              </p>
            </div>
            
            <div class="space-y-3">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                On-Hold Places (${onHoldPlaces.length}):
              </h4>
              ${placesList}
            </div>
            
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p class="text-xs text-gray-600 dark:text-gray-400">
                <span class="font-medium">Note:</span> You can check back later or refresh this page to see updated wait times. 
                The place(s) will be available again once the hold period expires.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="mt-6 flex justify-end">
            <button
              id="acknowledgePlaceOnHoldBtn"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  const modal = document.getElementById('placeOnHoldNotificationModal');
  const closeBtn = document.getElementById('closePlaceOnHoldNotificationBtn');
  const acknowledgeBtn = document.getElementById('acknowledgePlaceOnHoldBtn');
  
  const closeModal = () => {
    modal?.remove();
  };
  
  // Event listeners
  closeBtn?.addEventListener('click', closeModal);
  acknowledgeBtn?.addEventListener('click', closeModal);
  
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // Auto-update time remaining every minute
  const updateInterval = setInterval(() => {
    if (!modal || !document.body.contains(modal)) {
      clearInterval(updateInterval);
      return;
    }
    
    // Re-check on-hold places and update display
    const updatedOnHoldPlaces = checkVisitPlacesOnHold(visitId, places);
    
    if (updatedOnHoldPlaces.length === 0) {
      // All holds expired, close modal
      clearInterval(updateInterval);
      closeModal();
      return;
    }
    
    // Update time remaining for each place
    updatedOnHoldPlaces.forEach(place => {
      const placeElement = modal.querySelector(`[data-place-id="${place.placeId}"]`);
      if (placeElement) {
        const timeRemainingEl = placeElement.querySelector('.time-remaining');
        const expirationTimeEl = placeElement.querySelector('.expiration-time');
        if (timeRemainingEl) {
          timeRemainingEl.textContent = place.timeRemaining;
        }
        if (expirationTimeEl) {
          expirationTimeEl.textContent = place.expirationTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          });
        }
      }
    });
  }, 60000); // Update every minute
}

/**
 * Initialize the notification modal check
 * Call this when displaying visit details in visitor dashboard or track schedule
 */
export function checkAndShowPlaceOnHoldNotification(visitId: string, places: any[]): void {
  if (!visitId || !places || places.length === 0) {
    console.log('PlaceOnHoldNotification: No visit ID or places provided');
    return;
  }
  
  console.log('PlaceOnHoldNotification: Checking for on-hold places', { visitId, placesCount: places.length });
  
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    showPlaceOnHoldNotificationModal(visitId, places);
  }, 500);
}

