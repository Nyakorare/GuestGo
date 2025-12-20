import supabase from '../config/supabase';

/**
 * Shows a modal notification displaying the count of pending and in_progress visits scheduled for today
 * Only displays if there are pending or in_progress visits for today
 */
export async function showTodayPendingVisitsModal(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return;
    }

    // Check if user is personnel
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'personnel') {
      return;
    }

    // Get today's date in Philippine time (same method as dashboard)
    let todayStr: string | null = null;
    try {
      const { data: philippineDate } = await supabase.rpc('get_philippine_date');
      if (philippineDate) {
        // Format date string consistently with dashboard
        if (typeof philippineDate === 'string') {
          todayStr = philippineDate.split('T')[0];
        } else if (philippineDate instanceof Date) {
          todayStr = philippineDate.toISOString().split('T')[0];
        } else {
          const parsed = new Date(philippineDate);
          todayStr = isNaN(parsed.getTime()) ? null : parsed.toISOString().split('T')[0];
        }
      }
    } catch (error) {
      console.error('Error getting Philippine date:', error);
      return;
    }
    
    if (!todayStr) {
      return;
    }

    // Get personnel's scheduled visits
    const { data: visits, error } = await supabase.rpc('get_personnel_scheduled_visits', {
      p_personnel_id: user.id
    });

    if (error) {
      console.error('Error loading visits for today pending notification:', error);
      return;
    }

    // Helper function to filter visits by date and status
    const filterTodayVisitsByStatus = (status: string) => {
      return (visits || []).filter((visit: any) => {
        if (!visit.visit_date) return false;
        
        let visitDateStr: string | null = null;
        if (typeof visit.visit_date === 'string') {
          visitDateStr = visit.visit_date.split('T')[0];
        } else if (visit.visit_date instanceof Date) {
          visitDateStr = visit.visit_date.toISOString().split('T')[0];
        } else {
          try {
            const parsed = new Date(visit.visit_date);
            visitDateStr = isNaN(parsed.getTime()) ? null : parsed.toISOString().split('T')[0];
          } catch {
            return false;
          }
        }
        
        return visitDateStr === todayStr && visit.status === status;
      });
    };

    // Filter for today's pending visits
    const todayPendingVisits = filterTodayVisitsByStatus('pending');
    
    // Filter for today's in_progress visits
    const todayInProgressVisits = filterTodayVisitsByStatus('in_progress');

    // Count unique visits (by visit_id) to avoid counting the same visit multiple times
    // if personnel is assigned to multiple places in the same visit
    const countUniqueVisits = (visitsList: any[]) => {
      const uniqueVisitIds = new Set(
        visitsList
          .map((visit: any) => visit.visit_id || visit.visitId)
          .filter((id: any) => id != null)
      );
      return uniqueVisitIds.size;
    };

    const pendingCount = countUniqueVisits(todayPendingVisits);
    const inProgressCount = countUniqueVisits(todayInProgressVisits);

    // Don't show modal if there are no pending or in_progress visits
    if (pendingCount === 0 && inProgressCount === 0) {
      return;
    }

    // Determine which tab should be active by default
    // If pending has visits, show pending; otherwise show in_progress
    const defaultActiveTab = pendingCount > 0 ? 'pending' : 'inProgress';

    // Remove existing modal if present
    const existingModal = document.getElementById('todayPendingVisitsModal');
    if (existingModal) {
      existingModal.remove();
    }

    const modalHTML = `
      <style>
        @keyframes modalBounce {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        @keyframes modalBounceClose {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          30% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(0.3);
            opacity: 0;
          }
        }
        @keyframes pulseCount {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        .modal-bounce-animation {
          animation: modalBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        .modal-bounce-close-animation {
          animation: modalBounceClose 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        #todayPendingVisitsModal {
          animation: fadeIn 0.3s ease-out forwards;
        }
        #todayPendingVisitsModal.fade-out {
          animation: fadeOut 0.4s ease-out forwards;
        }
        .pulse-count {
          animation: pulseCount 2s ease-in-out infinite;
        }
        .tab-button {
          transition: all 0.2s ease;
        }
        .tab-button.active {
          border-bottom: 2px solid;
        }
        .tab-content {
          display: none;
        }
        .tab-content.active {
          display: block;
        }
      </style>
      <div id="todayPendingVisitsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4" style="opacity: 0;">
        <div class="w-full max-w-md relative">
          <div id="todayPendingVisitsModalContent" class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden" style="transform: scale(0.3); opacity: 0;">
            <div class="p-6 sm:p-8">
              <div class="flex items-start justify-between mb-6">
                <div class="flex-1">
                  <p class="text-xs font-semibold tracking-wide text-orange-600 dark:text-orange-300 uppercase mb-1">Today's Schedule</p>
                  <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Today's Visits</h3>
                </div>
                <button
                  id="closeTodayPendingVisitsModal"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-4"
                  aria-label="Close"
                >
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Tabs -->
              <div class="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                  id="pendingTabButton"
                  class="tab-button flex-1 py-3 px-4 text-center font-semibold text-gray-700 dark:text-gray-300 border-b-2 ${defaultActiveTab === 'pending' ? 'border-orange-500 dark:border-orange-400 active' : 'border-transparent'}"
                  data-tab="pending"
                >
                  Pending
                  ${pendingCount > 0 ? `<span class="ml-2 px-2 py-0.5 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">${pendingCount}</span>` : ''}
                </button>
                <button
                  id="inProgressTabButton"
                  class="tab-button flex-1 py-3 px-4 text-center font-semibold text-gray-700 dark:text-gray-300 border-b-2 ${defaultActiveTab === 'inProgress' ? 'border-yellow-500 dark:border-yellow-400 active' : 'border-transparent'}"
                  data-tab="inProgress"
                >
                  In Progress
                  ${inProgressCount > 0 ? `<span class="ml-2 px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full">${inProgressCount}</span>` : ''}
                </button>
              </div>

              <!-- Pending Tab Content -->
              <div id="pendingTabContent" class="tab-content ${defaultActiveTab === 'pending' ? 'active' : ''}">
                <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl p-6 mb-6 text-center">
                  <div class="flex items-center justify-center mb-4">
                    <div class="bg-orange-500 rounded-full p-4">
                      <svg class="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="pulse-count">
                    <p class="text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">${pendingCount}</p>
                  </div>
                  <p class="text-lg text-orange-800 dark:text-orange-100 font-medium">
                    ${pendingCount === 1 ? 'Pending visit' : 'Pending visits'} scheduled for today
                  </p>
                </div>

                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-6">
                  <p class="text-sm text-blue-800 dark:text-blue-100 text-center">
                    Check the "Visits" tab to view and manage your scheduled ${pendingCount === 1 ? 'visit' : 'visits'}.
                  </p>
                </div>
              </div>

              <!-- In Progress Tab Content -->
              <div id="inProgressTabContent" class="tab-content ${defaultActiveTab === 'inProgress' ? 'active' : ''}">
                <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-xl p-6 mb-6 text-center">
                  <div class="flex items-center justify-center mb-4">
                    <div class="bg-yellow-500 rounded-full p-4">
                      <svg class="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div class="pulse-count">
                    <p class="text-5xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">${inProgressCount}</p>
                  </div>
                  <p class="text-lg text-yellow-800 dark:text-yellow-100 font-medium">
                    ${inProgressCount === 1 ? 'Visit in progress' : 'Visits in progress'} for today
                  </p>
                </div>

                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-6">
                  <p class="text-sm text-blue-800 dark:text-blue-100 text-center">
                    Check the "Visits" tab to view and manage your ${inProgressCount === 1 ? 'visit' : 'visits'} in progress.
                  </p>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  id="viewVisitsTodayPendingVisits"
                  class="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                >
                  View Visits
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.classList.add('overflow-hidden');

    // Trigger bounce animation after modal is inserted
    setTimeout(() => {
      const modalContent = document.getElementById('todayPendingVisitsModalContent');
      if (modalContent) {
        modalContent.classList.add('modal-bounce-animation');
      }
    }, 10);

    setupTodayPendingVisitsModalListeners();
  } catch (error) {
    console.error('Error showing today pending visits modal:', error);
  }
}

function setupTodayPendingVisitsModalListeners(): void {
  const modal = document.getElementById('todayPendingVisitsModal');
  const closeBtn = document.getElementById('closeTodayPendingVisitsModal');
  const viewVisitsBtn = document.getElementById('viewVisitsTodayPendingVisits');
  const pendingTabButton = document.getElementById('pendingTabButton');
  const inProgressTabButton = document.getElementById('inProgressTabButton');
  const pendingTabContent = document.getElementById('pendingTabContent');
  const inProgressTabContent = document.getElementById('inProgressTabContent');

  const handleClose = () => closeTodayPendingVisitsModal();

  modal?.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeTodayPendingVisitsModal();
    }
  });

  closeBtn?.addEventListener('click', handleClose);
  
  viewVisitsBtn?.addEventListener('click', async () => {
    closeTodayPendingVisitsModal();
    
    // Navigate to visits tab after a short delay to allow modal to close
    setTimeout(() => {
      const visitsTab = document.getElementById('visitsTab') as HTMLButtonElement;
      if (visitsTab && !visitsTab.disabled) {
        visitsTab.click();
      }
    }, 100);
  });

  // Tab switching functionality
  const switchTab = (tabName: 'pending' | 'inProgress') => {
    // Update button states
    if (pendingTabButton && inProgressTabButton) {
      if (tabName === 'pending') {
        pendingTabButton.classList.add('active', 'border-orange-500', 'dark:border-orange-400');
        pendingTabButton.classList.remove('border-transparent');
        inProgressTabButton.classList.remove('active', 'border-yellow-500', 'dark:border-yellow-400');
        inProgressTabButton.classList.add('border-transparent');
      } else {
        inProgressTabButton.classList.add('active', 'border-yellow-500', 'dark:border-yellow-400');
        inProgressTabButton.classList.remove('border-transparent');
        pendingTabButton.classList.remove('active', 'border-orange-500', 'dark:border-orange-400');
        pendingTabButton.classList.add('border-transparent');
      }
    }

    // Update content visibility
    if (pendingTabContent && inProgressTabContent) {
      if (tabName === 'pending') {
        pendingTabContent.classList.add('active');
        inProgressTabContent.classList.remove('active');
      } else {
        inProgressTabContent.classList.add('active');
        pendingTabContent.classList.remove('active');
      }
    }
  };

  pendingTabButton?.addEventListener('click', () => switchTab('pending'));
  inProgressTabButton?.addEventListener('click', () => switchTab('inProgress'));
}

export function closeTodayPendingVisitsModal(): void {
  const modal = document.getElementById('todayPendingVisitsModal');
  const modalContent = document.getElementById('todayPendingVisitsModalContent');
  
  if (!modal || !modalContent) {
    return;
  }

  // Add close animations
  modalContent.classList.remove('modal-bounce-animation');
  modalContent.classList.add('modal-bounce-close-animation');
  modal.classList.add('fade-out');

  // Wait for animation to complete before removing from DOM
  setTimeout(() => {
    modal.remove();
    document.body.classList.remove('overflow-hidden');
  }, 400); // Match animation duration
}
