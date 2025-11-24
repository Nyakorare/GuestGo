import supabase from '../config/supabase';
import { createMarkCompleteButton, showResolveReasonModal } from './MarkCompleteModal';

// Interface for flagged visit details
interface FlaggedVisitDetails {
  visit_id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone?: string;
  visitor_role: string;
  visit_date: string;
  purpose: string;
  is_guest: boolean;
  completed_at: string;
  completed_by: string;
  status: string;
  places: Array<{
    place_id: string;
    place_name?: string;
    place_description?: string;
    place_location?: string;
    status: string;
    completed_at?: string;
    completed_by?: string;
  }>;
  total_places: number;
  completed_places: number;
  gate_exit_scanned: boolean;
  note: string;
  history?: any[];
}

// Function to get user name by ID
async function getUserName(userId: string | undefined | null): Promise<string> {
  if (!userId) {
    return 'System';
  }
  
  try {
    const { data: user, error } = await supabase
      .from('user_roles')
      .select('first_name, last_name, email')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    
    if (!user) {
      return 'Unknown User';
    }
    
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user?.email) {
      return user.email;
    }
    return 'Unknown User';
  } catch (error) {
    console.error('Error fetching user name:', error);
    return 'Unknown User';
  }
}

// Function to format date and time
function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (error) {
    return 'Invalid Date';
  }
}

// Function to create the flagged visit modal HTML
export function createFlaggedVisitModal(): string {
  return `
    <div id="flaggedVisitModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Flagged Visit Details
            </h3>
          </div>
          <button 
            id="closeFlaggedVisitModal"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div id="flaggedVisitModalContent" class="space-y-4">
          <!-- Loading state -->
          <div class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
            <p class="mt-2 text-gray-600 dark:text-gray-400">Loading visit details...</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div id="flaggedVisitModalMarkCompleteBtn"></div>
          <button 
            id="closeFlaggedVisitModalBtn"
            class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  `;
}

// Function to populate the modal with visit details
export async function populateFlaggedVisitModal(visitDetails: FlaggedVisitDetails): Promise<void> {
  const modalContent = document.getElementById('flaggedVisitModalContent');
  if (!modalContent) return;

  try {
    // Get user names for completed_by
    const completedBy = await getUserName(visitDetails.completed_by || undefined);
    
    // Fetch actual place statuses from scheduled_visit_places table
    const { data: placeStatuses, error: placeError } = await supabase
      .from('scheduled_visit_places')
      .select(`
        place_id,
        status,
        completed_at,
        completed_by,
        places_to_visit (
          name,
          description,
          location
        )
      `)
      .eq('visit_id', visitDetails.visit_id);

    if (placeError) {
      console.error('Error fetching place statuses:', placeError);
      throw placeError;
    }

    // Process place data with actual statuses
    const processedPlaces = (placeStatuses || []).map((place: any) => ({
      place_id: place.place_id,
      place_name: place.places_to_visit?.name || 'Unknown Place',
      place_description: place.places_to_visit?.description,
      place_location: place.places_to_visit?.location,
      status: place.status,
      completed_at: place.completed_at,
      completed_by: place.completed_by
    }));

    // Calculate actual totals from the database
    const totalPlaces = processedPlaces.length;
    const completedPlaces = processedPlaces.filter((place: any) => place.status === 'completed').length;

    // Format the content
    const content = `
      <div class="space-y-6">
        <!-- Visit Overview -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-3">Visit Overview</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Visit ID:</span>
              <span class="ml-2 font-mono text-gray-900 dark:text-white">${visitDetails.visit_id}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Status:</span>
              <span class="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-semibold rounded-full">
                Completed (Flagged)
              </span>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Visitor:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${visitDetails.visitor_name}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Email:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${visitDetails.visitor_email}</span>
            </div>
            <div class="flex items-center">
              <span class="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
              <span id="flaggedVisitorPhone" class="ml-2 text-gray-900 dark:text-white">${visitDetails.visitor_phone || 'No phone provided'}</span>
              ${visitDetails.visitor_phone ? `
                <button 
                  id="copyFlaggedPhoneBtn"
                  class="ml-2 p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                  title="Copy phone number"
                  aria-label="Copy phone number"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M8 16h8a2 2 0 002-2v-4M8 16l-2 2m2-2l2 2" />
                  </svg>
                </button>
                <span id="copyFlaggedPhoneStatus" class="ml-2 text-xs text-green-600 dark:text-green-400 hidden">Copied!</span>
              ` : ''}
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Role:</span>
              <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-semibold rounded-full">
                ${visitDetails.visitor_role}
              </span>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Guest User:</span>
              <span class="ml-2 px-2 py-1 ${visitDetails.is_guest ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'} text-xs font-semibold rounded-full">
                ${visitDetails.is_guest ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Visit Date:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${formatDateTime(visitDetails.visit_date)}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Purpose:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${visitDetails.purpose}</span>
            </div>
          </div>
        </div>

        <!-- Completion Details -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-3">Completion Details</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Completed By:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${completedBy || 'System'}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Completed At:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${visitDetails.completed_at ? formatDateTime(visitDetails.completed_at) : 'Unknown'}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Exit Scan:</span>
              <span class="ml-2 px-2 py-1 ${visitDetails.gate_exit_scanned ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'} text-xs font-semibold rounded-full">
                ${visitDetails.gate_exit_scanned ? 'Completed' : 'Not Completed'}
              </span>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Note:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${visitDetails.note || 'No additional notes available'}</span>
            </div>
          </div>
        </div>

        <!-- Places Status -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-3">Places Status</h4>
          <div class="mb-3">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-700 dark:text-gray-300">Progress:</span>
              <span class="text-gray-900 dark:text-white font-medium">
                ${completedPlaces} of ${totalPlaces} places completed
              </span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                class="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style="width: ${totalPlaces > 0 ? (completedPlaces / totalPlaces) * 100 : 0}%"
              ></div>
            </div>
          </div>
          
          <div class="space-y-2">
            ${processedPlaces && processedPlaces.length > 0 ? processedPlaces.map((place: any) => `
              <div class="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded border">
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">${place.place_name}</div>
                  ${place.place_location ? `<div class="text-xs text-gray-500 dark:text-gray-400">${place.place_location}</div>` : ''}
                </div>
                <div class="flex items-center space-x-2">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full ${
                    place.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : place.status === 'failed'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }">
                    ${place.status === 'completed' ? 'Completed' : 
                      place.status === 'failed' ? 'Failed' : 
                      place.status === 'pending' ? 'Pending' : 
                      place.status.charAt(0).toUpperCase() + place.status.slice(1)}
                  </span>
                  ${place.completed_at ? `
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      ${formatDateTime(place.completed_at)}
                    </span>
                  ` : ''}
                </div>
              </div>
            `).join('') : `
              <div class="text-center py-4 text-gray-500 dark:text-gray-400">
                No places information available
              </div>
            `}
          </div>
        </div>

        <!-- Visit History -->
        ${visitDetails.history && Array.isArray(visitDetails.history) && visitDetails.history.length > 0 ? `
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-3">Visit History</h4>
            <div class="space-y-2 max-h-60 overflow-y-auto">
              ${visitDetails.history.map((event: any) => {
                try {
                  const eventType = event.event ? event.event.charAt(0).toUpperCase() + event.event.slice(1) : 'Event';
                  const eventTime = event.timestamp ? formatDateTime(event.timestamp) : '';
                  let details = '';
                  
                  if (event.details) {
                    if (event.details.by) {
                      details += `<span class='text-xs text-gray-500 dark:text-gray-400'>(By: ${event.details.by})</span> `;
                    }
                    if (event.details.note) {
                      details += `<span class='text-xs text-gray-500 dark:text-gray-400'>Note: ${event.details.note}</span> `;
                    }
                    if (event.details.reason) {
                      details += `<span class='text-xs text-red-500 dark:text-red-400'>Reason: ${event.details.reason}</span> `;
                    }
                    if (event.details.auto_marked) {
                      details += `<span class='text-xs text-orange-500 dark:text-orange-400'>(Auto-marked by system)</span> `;
                    }
                  }
                  
                  return `
                    <div class="p-2 bg-white dark:bg-gray-600 rounded border">
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <span class="font-semibold text-sm text-gray-900 dark:text-white">${eventType}</span>
                          <div class="text-xs text-gray-500 dark:text-gray-400">${eventTime}</div>
                          ${details ? `<div class="mt-1">${details}</div>` : ''}
                        </div>
                      </div>
                    </div>
                  `;
                } catch (error) {
                  console.error('Error processing history event:', error, event);
                  return `
                    <div class="p-2 bg-white dark:bg-gray-600 rounded border">
                      <span class="font-semibold text-sm text-red-600 dark:text-red-400">Error processing event</span>
                    </div>
                  `;
                }
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    modalContent.innerHTML = content;

    // Add mark complete button if visit is in completed_flagged status
    const markCompleteBtnContainer = document.getElementById('flaggedVisitModalMarkCompleteBtn');
    if (markCompleteBtnContainer && visitDetails.status === 'completed_flagged') {
      markCompleteBtnContainer.innerHTML = createMarkCompleteButton(visitDetails.visit_id);
      // Setup the modal listener when button is added
      setTimeout(() => {
        const markCompleteBtn = document.getElementById(`markCompleteBtn-${visitDetails.visit_id}`);
        if (markCompleteBtn) {
          markCompleteBtn.addEventListener('click', () => {
            showResolveReasonModal(visitDetails.visit_id);
          });
        }
      }, 100);
    }
  } catch (error) {
    console.error('Error populating flagged visit modal:', error);
    modalContent.innerHTML = `
      <div class="text-center py-8">
        <div class="text-red-500 text-4xl mb-4">⚠️</div>
        <p class="text-red-600 dark:text-red-400 font-medium">Error loading visit details</p>
        <p class="text-gray-600 dark:text-gray-400 text-sm mt-2">Please try again or contact support if the problem persists.</p>
      </div>
    `;
  }
}

// Function to show the flagged visit modal
export function showFlaggedVisitModal(): void {
  const modal = document.getElementById('flaggedVisitModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

// Function to hide the flagged visit modal
export function hideFlaggedVisitModal(): void {
  const modal = document.getElementById('flaggedVisitModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Function to setup event listeners for the modal
export function setupFlaggedVisitModalListeners(): void {
  // Close modal when clicking the close button
  const closeBtn = document.getElementById('closeFlaggedVisitModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideFlaggedVisitModal);
  }

  // Close modal when clicking the close button in footer
  const closeFooterBtn = document.getElementById('closeFlaggedVisitModalBtn');
  if (closeFooterBtn) {
    closeFooterBtn.addEventListener('click', hideFlaggedVisitModal);
  }

  // Close modal when clicking outside
  const modal = document.getElementById('flaggedVisitModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideFlaggedVisitModal();
      }
    });
  }

  // Close modal with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('flaggedVisitModal');
      if (modal && !modal.classList.contains('hidden')) {
        hideFlaggedVisitModal();
      }
    }
  });

  // Copy phone number to clipboard (delegated for dynamic content)
  const modalContent = document.getElementById('flaggedVisitModalContent');
  if (modalContent) {
    modalContent.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      const copyBtn = target.closest('#copyFlaggedPhoneBtn');
      if (!copyBtn) return;
      const phoneEl = document.getElementById('flaggedVisitorPhone');
      const statusEl = document.getElementById('copyFlaggedPhoneStatus');
      const phone = phoneEl?.textContent?.trim();
      if (!phone || phone === 'No phone provided') return;
      try {
        await navigator.clipboard.writeText(phone);
        if (statusEl) {
          statusEl.classList.remove('hidden');
          setTimeout(() => statusEl.classList.add('hidden'), 1500);
        }
      } catch (err) {
        console.error('Failed to copy phone number:', err);
      }
    });
  }
}

// Main function to display flagged visit details
export async function displayFlaggedVisitDetails(visitId: string): Promise<void> {
  try {
    // Validate visit ID
    if (!visitId || visitId === 'unknown' || visitId === 'undefined') {
      throw new Error('Invalid visit ID provided');
    }
    
    // Show the modal first
    showFlaggedVisitModal();
    
    // Fetch visit details from the logs
    const { data: logs, error } = await supabase
      .from('logs')
      .select('*')
      .eq('action', 'visit_completed_flagged')
      .contains('details', { visit_id: visitId })
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    
    if (logs && logs.length > 0) {
      const log = logs[0];
      const details = log.details as FlaggedVisitDetails;
      
      // Get the scheduled visit data to extract phone number
      try {
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('scheduled_visits')
          .select('visitor_phone')
          .eq('id', visitId)
          .single();
        
        if (!scheduleError && scheduleData) {
          // Enrich the details with phone number from the scheduled visit
          details.visitor_phone = scheduleData.visitor_phone;
        }
      } catch (error) {
        console.error('Error fetching phone number from scheduled visit:', error);
      }
      
      // Populate the modal with the details
      await populateFlaggedVisitModal(details);
    } else {
      // Try to find in scheduled_visits table as fallback
      const { data: visits, error: visitError } = await supabase
        .from('scheduled_visits')
        .select('*')
        .eq('id', visitId)
        .single();

      if (visitError) throw visitError;
      
      if (visits) {
        // Fetch place information from scheduled_visit_places table
        const { data: placeData, error: placeError } = await supabase
          .from('scheduled_visit_places')
          .select(`
            place_id,
            status,
            completed_at,
            completed_by,
            places_to_visit (
              name,
              description,
              location
            )
          `)
          .eq('visit_id', visitId);

        if (placeError) {
          console.error('Error fetching place data:', placeError);
        }

        // Convert scheduled visit data to flagged visit format
        const flaggedVisitData: FlaggedVisitDetails = {
          visit_id: visits.id || 'Unknown',
          visitor_name: `${visits.visitor_first_name || ''} ${visits.visitor_last_name || ''}`.trim() || 'Unknown Visitor',
          visitor_email: visits.visitor_email || 'No email provided',
          visitor_phone: visits.visitor_phone || undefined,
          visitor_role: visits.visitor_role || 'guest',
          visit_date: visits.visit_date || new Date().toISOString(),
          purpose: visits.purpose || 'No purpose specified',
          is_guest: visits.visitor_role === 'guest',
          completed_at: visits.completed_at || new Date().toISOString(),
          completed_by: visits.completed_by || undefined,
          status: visits.status || 'completed_flagged',
          places: placeData || [], // Use actual place data from scheduled_visit_places
          total_places: placeData ? placeData.length : 0,
          completed_places: placeData ? placeData.filter((place: any) => place.status === 'completed').length : 0,
          gate_exit_scanned: visits.gate_exit_scanned || false,
          note: 'Visit completed (flagged) - process started and personnel finished their part, but visitor did not complete the full process',
          history: []
        };
        
        await populateFlaggedVisitModal(flaggedVisitData);
      } else {
        throw new Error('Visit not found');
      }
    }
  } catch (error) {
    console.error('Error displaying flagged visit details:', error);
    const modalContent = document.getElementById('flaggedVisitModalContent');
    if (modalContent) {
      modalContent.innerHTML = `
        <div class="text-center py-8">
          <div class="text-red-500 text-4xl mb-4">⚠️</div>
          <p class="text-red-600 dark:text-red-400 font-medium">Error loading visit details</p>
          <p class="text-gray-600 dark:text-gray-400 text-sm mt-2">${error instanceof Error ? error.message : 'Unknown error occurred'}</p>
        </div>
      `;
    }
  }
}