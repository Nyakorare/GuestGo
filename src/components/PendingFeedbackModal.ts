import { showNotification } from '../pages/dashboard/index';

export interface PendingFeedbackVisit {
  visitId: string;
  visitorName: string;
  visitDate: string;
  purpose?: string;
  places: string[];
}

export function showPendingFeedbackModal(visits: PendingFeedbackVisit[]): void {
  if (!visits.length) {
    return;
  }

  const existingModal = document.getElementById('pendingFeedbackModal');
  if (existingModal) {
    existingModal.remove();
  }

  const visitLabel = visits.length === 1 ? 'visit' : 'visits';

  const visitsList = visits.map(visit => `
    <div class="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Completed on</p>
          <p class="text-sm font-semibold text-gray-900 dark:text-white">${formatVisitDate(visit.visitDate)}</p>
          <p class="text-base text-gray-700 dark:text-gray-300 mt-1">
            ${visit.purpose || 'Scheduled visit'}
          </p>
          ${visit.places.length ? `
            <div class="mt-3 flex flex-wrap gap-2">
              ${visit.places.map(place => `
                <span class="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 rounded-full">
                  ${place}
                </span>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div class="flex flex-col items-stretch sm:items-end gap-2 min-w-[150px]">
          <span class="text-sm text-gray-500 dark:text-gray-400">Visitor</span>
          <p class="text-sm font-semibold text-gray-900 dark:text-white">${visit.visitorName}</p>
          <button 
            data-visit-id="${visit.visitId}"
            class="mt-2 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
          >
            Take Survey
          </button>
        </div>
      </div>
    </div>
  `).join('');

  const modalHTML = `
    <div id="pendingFeedbackModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4">
      <div class="w-full max-w-4xl relative">
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div class="p-6 sm:p-8">
            <div class="flex items-start justify-between mb-6">
              <div>
                <p class="text-xs font-semibold tracking-wide text-blue-600 dark:text-blue-300 uppercase mb-1">Feedback reminder</p>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">We'd love to hear about your visit</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  You have ${visits.length} completed ${visitLabel} waiting for a quick feedback survey.
                </p>
              </div>
              <button
                id="closePendingFeedbackModal"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close"
              >
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-6">
              <p class="text-sm text-blue-800 dark:text-blue-100">
                Your insights help us improve GuestGo for everyone. Each survey takes less than a minute to complete.
              </p>
            </div>

            <div class="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              ${visitsList}
            </div>

            <div class="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <button
                id="remindLaterPendingFeedback"
                class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
              >
                Remind me later
              </button>
              <div class="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-right">
                Thank you for helping us improve GuestGo.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.body.classList.add('overflow-hidden');

  setupPendingFeedbackModalListeners(visits);
}

function setupPendingFeedbackModalListeners(visits: PendingFeedbackVisit[]): void {
  const modal = document.getElementById('pendingFeedbackModal');
  const closeBtn = document.getElementById('closePendingFeedbackModal');
  const remindLaterBtn = document.getElementById('remindLaterPendingFeedback');
  const actionButtons = modal?.querySelectorAll<HTMLButtonElement>('button[data-visit-id]') || [];

  const handleClose = () => closePendingFeedbackModal();

  modal?.addEventListener('click', (event) => {
    if (event.target === modal) {
      closePendingFeedbackModal();
    }
  });

  closeBtn?.addEventListener('click', handleClose);
  remindLaterBtn?.addEventListener('click', handleClose);

  actionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const visitId = button.getAttribute('data-visit-id');
      if (!visitId) {
        return;
      }

      const visit = visits.find(item => item.visitId === visitId);
      if (!visit) {
        return;
      }

      const openFeedbackSurvey = (window as any).openFeedbackSurvey;
      if (typeof openFeedbackSurvey === 'function') {
        openFeedbackSurvey(visit.visitId, visit.visitorName, visit.visitDate, visit.places);
        closePendingFeedbackModal();
      } else {
        showNotification('Unable to open feedback survey. Please refresh the page and try again.', 'error');
      }
    });
  });
}

export function closePendingFeedbackModal(): void {
  const modal = document.getElementById('pendingFeedbackModal');
  if (modal) {
    modal.remove();
  }

  document.body.classList.remove('overflow-hidden');
}

function formatVisitDate(dateValue?: string): string {
  if (!dateValue) {
    return 'Date unavailable';
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date unavailable';
  }

  return parsedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

