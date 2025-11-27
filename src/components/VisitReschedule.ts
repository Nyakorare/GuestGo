import supabase from '../config/supabase';
import { showNotification } from '../pages/dashboard/index';

export interface VisitorRescheduleContext {
  visitId: string;
  visitDate: string;
  purpose?: string;
}

export interface PersonnelRescheduleRequest {
  visit_id: string;
  visitor_first_name: string;
  visitor_last_name: string;
  visitor_email: string;
  visitor_phone: string;
  visit_date: string;
  original_visit_date: string | null;
  purpose: string;
  other_purpose: string | null;
  reschedule_reason: string | null;
  reschedule_status: string | null;
  reschedule_requested_at: string | null;
  places: Array<{
    place_id: string;
    place_name: string;
    place_location: string | null;
  }>;
}

// === Visitor side ===

export async function requestVisitReschedule(context: VisitorRescheduleContext): Promise<void> {
  const reason = await showVisitorRescheduleReasonModal(context);
  if (!reason) {
    return;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showNotification('You must be logged in to request a reschedule.', 'error');
      return;
    }

    const { error } = await supabase.rpc('request_visit_reschedule', {
      p_visit_id: context.visitId,
      p_reason: reason,
      p_requesting_user_id: user.id,
    });

    if (error) {
      console.error('Error requesting reschedule:', error);
      showNotification(error.message || 'Unable to request reschedule.', 'error');
      return;
    }

    showNotification('Reschedule request sent. Personnel will review your request.', 'success');
  } catch (err: any) {
    console.error('Unexpected error requesting reschedule:', err);
    showNotification('Unexpected error requesting reschedule.', 'error');
  }
}

async function showVisitorRescheduleReasonModal(context: VisitorRescheduleContext): Promise<string | null> {
  return new Promise((resolve) => {
    const existing = document.getElementById('visitorRescheduleModal');
    if (existing) {
      existing.remove();
    }

    const modalHtml = `
      <div id="visitorRescheduleModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
        <div class="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold tracking-wide text-blue-600 dark:text-blue-300 uppercase mb-1">Request reschedule</p>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Why do you need to reschedule?</h3>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This request will be reviewed by the personnel in charge. You can only request a reschedule once for this visit.
              </p>
            </div>
            <button id="visitorRescheduleClose" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="px-6 py-4 space-y-4">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              <p class="font-medium">Current schedule:</p>
              <p class="mt-1 text-gray-600 dark:text-gray-400">
                ${new Date(context.visitDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              ${context.purpose ? `<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Purpose: ${context.purpose}</p>` : ''}
            </div>
            <div>
              <label for="visitorRescheduleReason" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Reason for reschedule <span class="text-red-500">*</span>
              </label>
              <textarea
                id="visitorRescheduleReason"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Briefly explain why you need to change your schedule..."
              ></textarea>
              <p id="visitorRescheduleError" class="mt-1 text-xs text-red-500 hidden"></p>
            </div>
          </div>
          <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:justify-end gap-2">
            <button
              id="visitorRescheduleCancel"
              class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            >
              Cancel
            </button>
            <button
              id="visitorRescheduleSubmit"
              class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Send Request
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('visitorRescheduleModal');
    const closeBtn = document.getElementById('visitorRescheduleClose');
    const cancelBtn = document.getElementById('visitorRescheduleCancel');
    const submitBtn = document.getElementById('visitorRescheduleSubmit') as HTMLButtonElement | null;
    const reasonInput = document.getElementById('visitorRescheduleReason') as HTMLTextAreaElement | null;
    const errorEl = document.getElementById('visitorRescheduleError');

    const cleanup = (value: string | null) => {
      modal?.remove();
      resolve(value);
    };

    const handleClose = () => cleanup(null);

    closeBtn?.addEventListener('click', handleClose);
    cancelBtn?.addEventListener('click', handleClose);
    modal?.addEventListener('click', (event) => {
      if (event.target === modal) {
        handleClose();
      }
    });

    submitBtn?.addEventListener('click', () => {
      if (!reasonInput) {
        cleanup(null);
        return;
      }
      const value = reasonInput.value.trim();
      if (value.length < 10) {
        if (errorEl) {
          errorEl.textContent = 'Please provide a brief explanation (at least 10 characters).';
          errorEl.classList.remove('hidden');
        }
        return;
      }
      cleanup(value);
    });
  });
}

// === Personnel side ===

export async function fetchPersonnelRescheduleRequests(): Promise<PersonnelRescheduleRequest[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showNotification('You must be logged in as personnel to view requests.', 'error');
    return [];
  }

  try {
    const { data, error } = await supabase.rpc('get_personnel_reschedule_requests', {
      p_personnel_id: user.id,
    });

    if (error) {
      console.error('Error fetching reschedule requests:', error);
      showNotification(error.message || 'Unable to load reschedule requests.', 'error');
      return [];
    }

    return (data || []) as PersonnelRescheduleRequest[];
  } catch (err: any) {
    console.error('Unexpected error fetching reschedule requests:', err);
    showNotification('Unexpected error fetching reschedule requests.', 'error');
    return [];
  }
}

export async function processPersonnelRescheduleDecision(
  request: PersonnelRescheduleRequest,
  decision: 'accept' | 'decline'
): Promise<void> {
  const result = await showPersonnelRescheduleDecisionModal(request, decision);
  if (!result) {
    return;
  }

  try {
    const payload: any = {
      p_visit_id: request.visit_id,
      p_personnel_id: null,
      p_decision: decision,
      p_new_visit_date: result.newDate || null,
      p_note: result.note || null,
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showNotification('You must be logged in to perform this action.', 'error');
      return;
    }
    payload.p_personnel_id = user.id;

    const { error } = await supabase.rpc('process_visit_reschedule', payload);

    if (error) {
      console.error('Error processing reschedule:', error);
      showNotification(error.message || 'Unable to process reschedule request.', 'error');
      return;
    }

    if (decision === 'accept') {
      showNotification('Reschedule accepted and visit date updated.', 'success');
    } else {
      showNotification('Reschedule request declined. Original visit date is kept.', 'success');
    }
  } catch (err: any) {
    console.error('Unexpected error processing reschedule:', err);
    showNotification('Unexpected error processing reschedule.', 'error');
  }
}

interface PersonnelDecisionResult {
  newDate?: string;
  note?: string;
}

async function showPersonnelRescheduleDecisionModal(
  request: PersonnelRescheduleRequest,
  decision: 'accept' | 'decline'
): Promise<PersonnelDecisionResult | null> {
  return new Promise((resolve) => {
    const existing = document.getElementById('personnelRescheduleModal');
    if (existing) {
      existing.remove();
    }

    const isAccept = decision === 'accept';

    const modalHtml = `
      <div id="personnelRescheduleModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
        <div class="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold tracking-wide text-${isAccept ? 'green' : 'red'}-600 dark:text-${isAccept ? 'green' : 'red'}-300 uppercase mb-1">
                ${isAccept ? 'Accept reschedule' : 'Decline reschedule'}
              </p>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                ${isAccept ? 'Choose a new visit date' : 'Confirm decline of reschedule'}
              </h3>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                ${isAccept
                  ? 'Select a new date that still respects user weekly limits and place visit limits.'
                  : 'The visit will remain on its original date if you decline.'}
              </p>
            </div>
            <button id="personnelRescheduleClose" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="px-6 py-4 space-y-4">
            <div class="text-sm text-gray-700 dark:text-gray-200 space-y-1">
              <p class="font-medium">
                Visitor: ${request.visitor_first_name} ${request.visitor_last_name}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Current date: ${new Date(request.visit_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              ${request.original_visit_date ? `
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Original date: ${new Date(request.original_visit_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              ` : ''}
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Reason: ${request.reschedule_reason || 'No reason provided'}
              </p>
              ${request.places.length ? `
                <div class="mt-2 flex flex-wrap gap-2">
                  ${request.places.map(place => `
                    <span class="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 rounded-full">
                      ${place.place_name}
                    </span>
                  `).join('')}
                </div>
              ` : ''}
            </div>

            ${isAccept ? `
              <div>
                <label for="personnelRescheduleDate" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  New visit date <span class="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="personnelRescheduleDate"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p id="personnelRescheduleDateError" class="mt-1 text-xs text-red-500 hidden"></p>
              </div>
            ` : ''}

            <div>
              <label for="personnelRescheduleNote" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                ${isAccept ? 'Optional note to visitor' : 'Reason / note (optional)'}
              </label>
              <textarea
                id="personnelRescheduleNote"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="${isAccept ? 'Optional message that will be logged with this decision.' : 'Explain briefly why you are declining (optional).'}"
              ></textarea>
            </div>
          </div>
          <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:justify-end gap-2">
            <button
              id="personnelRescheduleCancel"
              class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            >
              Cancel
            </button>
            <button
              id="personnelRescheduleConfirm"
              class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white ${isAccept ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${isAccept ? 'green' : 'red'}-500 dark:focus:ring-offset-gray-900"
            >
              ${isAccept ? 'Accept & Update Date' : 'Confirm Decline'}
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('personnelRescheduleModal');
    const closeBtn = document.getElementById('personnelRescheduleClose');
    const cancelBtn = document.getElementById('personnelRescheduleCancel');
    const confirmBtn = document.getElementById('personnelRescheduleConfirm');
    const dateInput = document.getElementById('personnelRescheduleDate') as HTMLInputElement | null;
    const dateError = document.getElementById('personnelRescheduleDateError');
    const noteInput = document.getElementById('personnelRescheduleNote') as HTMLTextAreaElement | null;

    const cleanup = (value: PersonnelDecisionResult | null) => {
      modal?.remove();
      resolve(value);
    };

    const handleClose = () => cleanup(null);

    closeBtn?.addEventListener('click', handleClose);
    cancelBtn?.addEventListener('click', handleClose);
    modal?.addEventListener('click', (event) => {
      if (event.target === modal) {
        handleClose();
      }
    });

    if (isAccept && dateInput) {
      // Set min/max to mirror scheduling rules (today..+1 month) on client side
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = `${today.getMonth() + 1}`.padStart(2, '0');
      const dd = `${today.getDate()}`.padStart(2, '0');
      const minDate = `${yyyy}-${mm}-${dd}`;

      const max = new Date();
      max.setMonth(max.getMonth() + 1);
      const yyyyMax = max.getFullYear();
      const mmMax = `${max.getMonth() + 1}`.padStart(2, '0');
      const ddMax = `${max.getDate()}`.padStart(2, '0');
      const maxDate = `${yyyyMax}-${mmMax}-${ddMax}`;

      dateInput.min = minDate;
      dateInput.max = maxDate;
    }

    confirmBtn?.addEventListener('click', () => {
      const note = noteInput?.value?.trim() || undefined;

      if (isAccept) {
        if (!dateInput || !dateInput.value) {
          if (dateError) {
            dateError.textContent = 'Please choose a new date.';
            dateError.classList.remove('hidden');
          }
          return;
        }
        if (dateError) {
          dateError.classList.add('hidden');
        }
        cleanup({
          newDate: dateInput.value,
          note,
        });
      } else {
        cleanup({
          note,
        });
      }
    });
  });
}


