import supabase from '../config/supabase';

// Helper function to show notifications
function showNotification(message: string, type: 'success' | 'error' | 'info'): void {
  // Use the existing notification system from the dashboard if available
  if (typeof (window as any).showNotification === 'function') {
    (window as any).showNotification(message, type);
  } else {
    // Fallback notification
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-md shadow-lg transition-all duration-300 ${
      type === 'success' 
        ? 'bg-green-500 text-white' 
        : type === 'error'
        ? 'bg-red-500 text-white'
        : 'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Interface for the resolve reason modal
interface ResolveReasonModal {
  visitId: string;
}

// Function to create the resolve reason modal HTML
function createResolveReasonModal(): string {
  return `
    <div id="resolveReasonModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Resolve Flagged Visit
            </h3>
          </div>
          <button 
            id="closeResolveReasonModal"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="space-y-4">
          <div class="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-blue-700 dark:text-blue-300">
                  Please provide a reason for resolving this flagged visit. This will mark the visit as completed and update the status accordingly.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label for="resolveReasonInput" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Resolving <span class="text-red-500">*</span>
            </label>
            <textarea
              id="resolveReasonInput"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter the reason for resolving this flagged visit (e.g., Visitor confirmed exit, Manual verification completed, etc.)"
              required
            ></textarea>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This reason will be logged in the visit history for audit purposes.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button 
            id="cancelResolveReasonBtn"
            class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Cancel
          </button>
          <button 
            id="confirmResolveReasonBtn"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Mark as Completed
          </button>
        </div>
      </div>
    </div>
  `;
}

// Function to show the resolve reason modal
export function showResolveReasonModal(visitId: string): void {
  // Ensure modal exists in DOM
  let modal = document.getElementById('resolveReasonModal');
  if (!modal) {
    document.body.insertAdjacentHTML('beforeend', createResolveReasonModal());
    modal = document.getElementById('resolveReasonModal');
    setupResolveReasonModalListeners();
  }

  if (modal) {
    // Clear previous input
    const reasonInput = document.getElementById('resolveReasonInput') as HTMLTextAreaElement;
    if (reasonInput) {
      reasonInput.value = '';
    }

    // Store visit ID in modal data attribute
    modal.setAttribute('data-visit-id', visitId);
    
    // Update the confirm button to use the current visit ID
    const confirmBtn = document.getElementById('confirmResolveReasonBtn');
    if (confirmBtn) {
      // Remove old event listeners by cloning and replacing
      const newConfirmBtn = confirmBtn.cloneNode(true);
      confirmBtn.parentNode?.replaceChild(newConfirmBtn, confirmBtn);
      (newConfirmBtn as HTMLButtonElement).addEventListener('click', async () => {
        await handleResolveVisit(visitId);
      });
    }
    
    modal.classList.remove('hidden');
    
    // Focus on the textarea
    setTimeout(() => {
      if (reasonInput) {
        reasonInput.focus();
      }
    }, 100);
  }
}

// Function to hide the resolve reason modal
function hideResolveReasonModal(): void {
  const modal = document.getElementById('resolveReasonModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Function to setup event listeners for the modal
function setupResolveReasonModalListeners(): void {
  // Close modal when clicking the close button
  const closeBtn = document.getElementById('closeResolveReasonModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideResolveReasonModal);
  }

  // Close modal when clicking cancel button
  const cancelBtn = document.getElementById('cancelResolveReasonBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', hideResolveReasonModal);
  }

  // Close modal when clicking outside
  const modal = document.getElementById('resolveReasonModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideResolveReasonModal();
      }
    });
  }

  // Close modal with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('resolveReasonModal');
      if (modal && !modal.classList.contains('hidden')) {
        hideResolveReasonModal();
      }
    }
  });

  // Handle Enter key in textarea (Ctrl+Enter to submit)
  const reasonInput = document.getElementById('resolveReasonInput') as HTMLTextAreaElement;
  if (reasonInput) {
    reasonInput.addEventListener('keydown', async (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        const modal = document.getElementById('resolveReasonModal');
        const visitId = modal?.getAttribute('data-visit-id');
        if (visitId) {
          await handleResolveVisit(visitId);
        }
      }
    });
  }
}

// Function to handle resolving the visit
async function handleResolveVisit(visitId: string): Promise<void> {
  try {
    const reasonInput = document.getElementById('resolveReasonInput') as HTMLTextAreaElement;
    if (!reasonInput) {
      showNotification('Error: Reason input not found', 'error');
      return;
    }

    const reason = reasonInput.value.trim();
    if (!reason) {
      showNotification('Please provide a reason for resolving this visit', 'error');
      reasonInput.focus();
      return;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showNotification('You must be logged in to resolve visits', 'error');
      return;
    }

    // Disable the confirm button to prevent double submission
    const confirmBtn = document.getElementById('confirmResolveReasonBtn') as HTMLButtonElement;
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Processing...';
    }

    // Update the scheduled visit status from completed_flagged to completed
    const { data: visitData, error: visitError } = await supabase
      .from('scheduled_visits')
      .select('*')
      .eq('id', visitId)
      .eq('status', 'completed_flagged')
      .single();

    if (visitError || !visitData) {
      throw new Error(visitError?.message || 'Visit not found or not in flagged status');
    }

    // Update ONLY the visit status from completed_flagged to completed
    // This does not create a new scheduled visit, just updates the existing one
    const { error: updateError } = await supabase
      .from('scheduled_visits')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: user.id
      })
      .eq('id', visitId)
      .eq('status', 'completed_flagged'); // Ensure we only update flagged visits

    if (updateError) {
      throw updateError;
    }

    // Update the visit_completed_flagged log entry if it exists
    // Check both visit_completed_flagged action and visit_scheduled with completed_flagged status
    const { data: flaggedLogs, error: logQueryError } = await supabase
      .from('logs')
      .select('*')
      .in('action', ['visit_completed_flagged', 'visit_scheduled'])
      .order('created_at', { ascending: false });

    if (logQueryError) {
      console.error('Error querying logs:', logQueryError);
      throw new Error(`Failed to query logs: ${logQueryError.message}`);
    }

    console.log(`Found ${flaggedLogs?.length || 0} logs to check`);
    console.log('Looking for visit ID:', visitId);

    // Debug: Log all visit_ids found in the logs
    if (flaggedLogs && flaggedLogs.length > 0) {
      console.log('Visit IDs found in logs:');
      flaggedLogs.forEach((log: any, index: number) => {
        const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
        console.log(`  Log ${index + 1}:`, {
          logId: log.id,
          action: log.action,
          visit_id: details?.visit_id,
          current_status: details?.current_status,
          hasHistory: Array.isArray(details?.history)
        });
      });
    }

    // Find the log entry that matches this visit ID and is flagged
    const matchingLog = flaggedLogs?.find((log: any) => {
      const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
      const visitIdMatch = details?.visit_id === visitId;
      
      // Check if it's a flagged log (either action is visit_completed_flagged OR current_status is completed_flagged)
      const isFlagged = log.action === 'visit_completed_flagged' || 
                       details?.current_status === 'completed_flagged' ||
                       (Array.isArray(details?.history) && details.history.some((event: any) => event.event === 'completed_flagged'));
      
      const matches = visitIdMatch && isFlagged;
      
      if (visitIdMatch) {
        console.log('Found log with matching visit_id:', {
          logId: log.id,
          action: log.action,
          current_status: details?.current_status,
          isFlagged: isFlagged,
          matches: matches
        });
      }
      
      return matches;
    });

    if (matchingLog) {
      console.log('Updating log:', matchingLog.id);
      const log = matchingLog;
      const details = typeof log.details === 'string' ? JSON.parse(log.details) : (log.details as any);
      const history = Array.isArray(details.history) ? [...details.history] : [];
      
      // Check if resolution already exists to avoid duplicates
      const hasResolution = history.some((event: any) => event.event === 'visit_resolved');
      
      if (!hasResolution) {
        history.push({
          event: 'visit_resolved',
          timestamp: new Date().toISOString(),
          details: {
            by: user.id,
            reason: reason,
            resolved_from: 'completed_flagged',
            resolved_to: 'completed'
          }
        });
      }

      // Update the log with resolution information using JSONB operations
      // We need to update the details JSONB field properly
      const updatedDetails = {
        ...details,
        history: history,
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: user.id,
        resolution_reason: reason,
        current_status: 'completed' // Update current_status to completed
      };

      // Use direct update - Supabase should handle JSONB automatically
      console.log('Attempting to update log with details:', {
        logId: log.id,
        resolved: updatedDetails.resolved,
        hasHistory: Array.isArray(updatedDetails.history),
        historyLength: updatedDetails.history?.length
      });

      // Update both the action field and the details
      const { data: updateResult, error: updateLogError } = await supabase
        .from('logs')
        .update({
          action: 'visit_completed', // Change the action to visit_completed
          details: updatedDetails as any
        })
        .eq('id', log.id)
        .select();

      if (updateLogError) {
        console.error('Error updating log:', updateLogError);
        console.error('Log ID:', log.id);
        console.error('Updated details:', JSON.stringify(updatedDetails, null, 2));
        throw new Error(`Failed to update log: ${updateLogError.message}`);
      }

      console.log('Update result:', updateResult);

      // Verify the update worked by re-fetching
      const { data: verifyLog, error: verifyError } = await supabase
        .from('logs')
        .select('details, action')
        .eq('id', log.id)
        .single();

      if (verifyError) {
        console.error('Error verifying log update:', verifyError);
        throw new Error(`Failed to verify log update: ${verifyError.message}`);
      } else {
        const verifiedDetails = typeof verifyLog.details === 'string' 
          ? JSON.parse(verifyLog.details) 
          : verifyLog.details;
        console.log('Log update verified:', {
          logId: log.id,
          action: verifyLog.action,
          resolved: verifiedDetails?.resolved,
          current_status: verifiedDetails?.current_status,
          hasResolutionReason: !!verifiedDetails?.resolution_reason
        });
        
        if (!verifiedDetails?.resolved) {
          console.error('ERROR: Log update did not persist! Details:', verifiedDetails);
          throw new Error('Log update did not persist correctly. Please check database permissions.');
        }
      }
    } else {
      console.warn('No matching log found for visit:', visitId);
    }

    showNotification('Visit marked as completed successfully!', 'success');
    
    // Close the modal
    hideResolveReasonModal();
    
    // Close the flagged visit modal if it's open
    const flaggedModal = document.getElementById('flaggedVisitModal');
    if (flaggedModal) {
      flaggedModal.classList.add('hidden');
    }

    // Refresh logs without reloading the page
    // Reload logs from database to get the updated log entry
    if (typeof (window as any).loadLogs === 'function') {
      try {
        await (window as any).loadLogs();
      } catch (error) {
        console.error('Error reloading logs:', error);
        // If loadLogs fails, just render existing logs
        if (typeof (window as any).renderLogs === 'function') {
          await (window as any).renderLogs();
        }
      }
    } else if (typeof (window as any).renderLogs === 'function') {
      // If loadLogs is not available, just re-render existing logs
      await (window as any).renderLogs();
    }
    // No page reload - logs are updated in place
  } catch (error) {
    console.error('Error resolving visit:', error);
    showNotification(
      `Error resolving visit: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error'
    );

    // Re-enable the confirm button
    const confirmBtn = document.getElementById('confirmResolveReasonBtn') as HTMLButtonElement;
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Mark as Completed';
    }
  }
}

// Export function to create mark complete button
export function createMarkCompleteButton(visitId: string): string {
  return `
    <button 
      id="markCompleteBtn-${visitId}"
      class="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center space-x-2"
      data-visit-id="${visitId}"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span>Mark as Completed</span>
    </button>
  `;
}

// Make showResolveReasonModal available globally for onclick handlers
(window as any).showResolveReasonModal = showResolveReasonModal;

