import supabase from '../../config/supabase';

interface GuardAssignedGate {
  gate_id: string;
  gate_name: string;
  gate_type: 'entrance' | 'exit' | 'both';
  gate_status: 'open' | 'closed';
  gate_location?: string | null;
  assigned_at?: string | null;
}

let currentAssignedGate: GuardAssignedGate | null = null;

export function renderGuardGateAssignments(): string {
  return `
    <div>
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Assigned Gate Settings</h2>
        <button
          id="guardGateRefreshBtn"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
        >
          Refresh
        </button>
      </div>

      <div id="guardGateAssignmentCard" class="space-y-4">
        <div class="text-center py-8 text-gray-500 dark:text-gray-400">Loading assigned gate...</div>
      </div>
    </div>
  `;
}

export function setupGuardGateAssignmentsEventListeners(): void {
  const refreshBtn = document.getElementById('guardGateRefreshBtn');
  refreshBtn?.addEventListener('click', loadGuardGateAssignment);
  loadGuardGateAssignment();
}

async function loadGuardGateAssignment(): Promise<void> {
  const card = document.getElementById('guardGateAssignmentCard');
  if (!card) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const [assignedRes, gatesRes] = await Promise.all([
      supabase.rpc('get_assigned_gate_for_guard', {
        p_guard_user_id: user.id,
        p_requested_by: user.id
      })
    ]);

    if (assignedRes.error) throw assignedRes.error;

    currentAssignedGate = (assignedRes.data && assignedRes.data.length > 0) ? assignedRes.data[0] : null;

    renderAssignmentCard();
  } catch (error) {
    console.error('Error loading guard gate assignment:', error);
    card.innerHTML = `<div class="text-center py-8 text-red-600 dark:text-red-400">Failed to load assignment.</div>`;
  }
}

function renderAssignmentCard(): void {
  const card = document.getElementById('guardGateAssignmentCard');
  if (!card) return;

  if (!currentAssignedGate) {
    card.innerHTML = `
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <p class="text-gray-700 dark:text-gray-300 mb-1">No gate is currently assigned to your account.</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">Ask an admin to assign you to a gate. You can only edit type/status after assignment.</p>
      </div>
    `;
  } else {
    card.innerHTML = `
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="space-y-2">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${currentAssignedGate.gate_name}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">Type: ${currentAssignedGate.gate_type}</p>
            <p class="text-sm text-gray-600 dark:text-gray-300">Status: ${currentAssignedGate.gate_status}</p>
            ${currentAssignedGate.gate_location ? `<p class="text-sm text-gray-600 dark:text-gray-300">Location: ${currentAssignedGate.gate_location}</p>` : ''}
          </div>
          <button
            id="guardEditGateAssignmentBtn"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Edit Gate Settings
          </button>
        </div>
      </div>
    `;
  }

  const editBtn = document.getElementById('guardEditGateAssignmentBtn');
  editBtn?.addEventListener('click', showGuardAssignmentModal);
}

function showGuardAssignmentModal(): void {
  if (!currentAssignedGate) return;

  const modalHtml = `
    <div id="guardAssignmentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Edit Gate Settings</h3>
            <button id="closeGuardAssignmentModalBtn" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <form id="guardAssignmentForm" class="space-y-4">
            <div>
              <label for="guardGateTypeSelect" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gate Type</label>
              <select id="guardGateTypeSelect" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="entrance" ${currentAssignedGate.gate_type === 'entrance' ? 'selected' : ''}>Entrance</option>
                <option value="exit" ${currentAssignedGate.gate_type === 'exit' ? 'selected' : ''}>Exit</option>
                <option value="both" ${currentAssignedGate.gate_type === 'both' ? 'selected' : ''}>Both</option>
              </select>
            </div>
            <div>
              <label for="guardGateStatusSelect" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select id="guardGateStatusSelect" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="open" ${currentAssignedGate.gate_status === 'open' ? 'selected' : ''}>Open</option>
                <option value="closed" ${currentAssignedGate.gate_status === 'closed' ? 'selected' : ''}>Closed</option>
              </select>
            </div>
            <div class="flex gap-3">
              <button type="submit" class="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Save</button>
              <button type="button" id="cancelGuardAssignmentBtn" class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  document.getElementById('closeGuardAssignmentModalBtn')?.addEventListener('click', closeGuardAssignmentModal);
  document.getElementById('cancelGuardAssignmentBtn')?.addEventListener('click', closeGuardAssignmentModal);
  document.getElementById('guardAssignmentForm')?.addEventListener('submit', saveGuardAssignment);
}

function closeGuardAssignmentModal(): void {
  const modal = document.getElementById('guardAssignmentModal');
  modal?.remove();
}

async function saveGuardAssignment(e: Event): Promise<void> {
  e.preventDefault();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    if (!currentAssignedGate) {
      closeGuardAssignmentModal();
      showNotification('No assigned gate found.', 'error');
      return;
    }

    const selectedGateType = (document.getElementById('guardGateTypeSelect') as HTMLSelectElement).value as 'entrance' | 'exit' | 'both';
    const selectedStatus = (document.getElementById('guardGateStatusSelect') as HTMLSelectElement).value as 'open' | 'closed';

    const { error } = await supabase.rpc('update_assigned_guard_gate_settings', {
      p_guard_user_id: user.id,
      p_requested_by: user.id,
      p_gate_type: selectedGateType,
      p_status: selectedStatus
    });

    if (error) throw error;

    closeGuardAssignmentModal();
    await loadGuardGateAssignment();
    showNotification('Gate settings updated successfully.', 'success');
  } catch (error) {
    console.error('Error updating guard gate settings:', error);
    showNotification('Failed to update gate settings.', 'error');
  }
}

function showNotification(message: string, type: 'success' | 'error'): void {
  if (typeof (window as any).showNotification === 'function') {
    (window as any).showNotification(message, type);
    return;
  }
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}
