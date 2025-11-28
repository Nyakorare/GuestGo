import type { PersonnelRescheduleRequest } from './VisitReschedule';

export function showPendingRescheduleModal(requests: PersonnelRescheduleRequest[]): void {
  if (!requests || requests.length === 0) {
    return;
  }

  const existing = document.getElementById('pendingRescheduleModal');
  if (existing) {
    existing.remove();
  }

  const totalRequests = requests.length;

  // Collect unique place names across all requests
  const placeNames = new Set<string>();
  requests.forEach((req) => {
    (req.places || []).forEach((place) => {
      if (place.place_name) {
        placeNames.add(place.place_name);
      }
    });
  });

  const placeLabels = Array.from(placeNames);

  const summaryLabel =
    totalRequests === 1
      ? 'There is 1 pending reschedule request'
      : `There are ${totalRequests} pending reschedule requests`;

  const placesLabel =
    placeLabels.length === 0
      ? ''
      : placeLabels.length === 1
        ? `for ${placeLabels[0]}.`
        : `across these places: ${placeLabels.join(', ')}.`;

  const modalHtml = `
    <style>
      @keyframes pendingRescheduleModalBounce {
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
      @keyframes pendingRescheduleFadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes pendingRescheduleFadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
      @keyframes pendingRescheduleModalBounceClose {
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
      .pending-reschedule-modal-bounce {
        animation: pendingRescheduleModalBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
      }
      .pending-reschedule-modal-bounce-close {
        animation: pendingRescheduleModalBounceClose 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
      }
      #pendingRescheduleModal {
        animation: pendingRescheduleFadeIn 0.3s ease-out forwards;
      }
      #pendingRescheduleModal.pending-reschedule-fade-out {
        animation: pendingRescheduleFadeOut 0.4s ease-out forwards;
      }
    </style>
    <div id="pendingRescheduleModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4" style="opacity: 0;">
      <div class="w-full max-w-xl relative">
        <div id="pendingRescheduleModalContent" class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden" style="transform: scale(0.3); opacity: 0;">
          <div class="p-6 sm:p-8">
            <div class="flex items-start justify-between mb-4">
              <div>
                <p class="text-xs font-semibold tracking-wide text-amber-600 dark:text-amber-300 uppercase mb-1">
                  Reschedule requests
                </p>
                <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  You have pending reschedule requests
                </h3>
                <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  ${summaryLabel} ${placesLabel}
                </p>
              </div>
              <button
                id="closePendingRescheduleModal"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close"
              >
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="mt-4 space-y-3">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Review these requests so visitors know whether their schedule has been accepted or needs to be moved.
              </p>
              <div class="flex flex-wrap gap-2">
                ${(requests || [])
                  .slice(0, 3)
                  .map((req) => {
                    const date = req.visit_date
                      ? new Date(req.visit_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Date not set';
                    const places =
                      req.places && req.places.length
                        ? req.places
                            .map((p) => p.place_name)
                            .filter(Boolean)
                            .join(', ')
                        : 'Your assigned place';
                    return `
                      <div class="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-800">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p class="text-sm font-semibold text-gray-900 dark:text-white">
                              ${req.visitor_first_name} ${req.visitor_last_name}
                            </p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                              ${date} • ${places}
                            </p>
                          </div>
                          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Pending
                          </span>
                        </div>
                      </div>
                    `;
                  })
                  .join('')}
                ${
                  requests.length > 3
                    ? `
                    <p class="w-full text-xs text-gray-500 dark:text-gray-400 mt-1">
                      And ${requests.length - 3} more pending request${requests.length - 3 === 1 ? '' : 's'}.
                    </p>
                  `
                    : ''
                }
              </div>
            </div>

            <div class="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                id="remindLaterPendingReschedule"
                class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
              >
                Remind me later
              </button>
              <button
                id="viewPendingRescheduleRequests"
                class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
              >
                Review requests
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  document.body.classList.add('overflow-hidden');

  // Trigger bounce animation
  setTimeout(() => {
    const content = document.getElementById('pendingRescheduleModalContent');
    if (content) {
      content.classList.add('pending-reschedule-modal-bounce');
      (content as HTMLElement).style.opacity = '1';
    }
  }, 10);

  setupPendingRescheduleModalListeners();
}

function setupPendingRescheduleModalListeners(): void {
  const modal = document.getElementById('pendingRescheduleModal');
  const content = document.getElementById('pendingRescheduleModalContent');
  const closeBtn = document.getElementById('closePendingRescheduleModal');
  const remindLaterBtn = document.getElementById('remindLaterPendingReschedule');
  const viewRequestsBtn = document.getElementById('viewPendingRescheduleRequests');

  const closeModal = (navigateToRequests: boolean) => {
    if (!modal || !content) {
      return;
    }

    content.classList.remove('pending-reschedule-modal-bounce');
    content.classList.add('pending-reschedule-modal-bounce-close');
    modal.classList.add('pending-reschedule-fade-out');

    setTimeout(() => {
      modal.remove();
      document.body.classList.remove('overflow-hidden');

      if (navigateToRequests) {
        const requestsTab = document.getElementById('requestsTab') as HTMLButtonElement | null;
        if (requestsTab) {
          requestsTab.click();
        }
      }
    }, 400);
  };

  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === modal) {
      closeModal(false);
    }
  };

  modal?.addEventListener('click', handleBackdropClick);
  closeBtn?.addEventListener('click', () => closeModal(false));
  remindLaterBtn?.addEventListener('click', () => closeModal(false));
  viewRequestsBtn?.addEventListener('click', () => closeModal(true));
}


