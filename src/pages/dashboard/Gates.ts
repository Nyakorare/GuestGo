import supabase from '../../config/supabase';
import { generateGateQRCode, openPrintableGateCard, type GateQRData } from '../../utils/qrCode';

interface Gate {
  id: string;
  name: string;
  description?: string;
  location?: string;
  gate_type: 'entrance' | 'exit' | 'both';
  status: 'open' | 'closed';
  created_by?: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
  creator_name?: string;
  updater_name?: string;
}

let allGates: Gate[] = [];
let filteredGates: Gate[] = [];

export function renderGates(): string {
  return `
    <div>
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Gates Management</h2>
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-4">
          <!-- Search and Filter Section -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3">
            <!-- Search Input -->
            <div class="relative">
              <input 
                type="text" 
                id="gatesSearchInput"
                placeholder="Search gates..."
                class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
              >
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
            <!-- Status Filter -->
            <select 
              id="gateStatusFilter"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
            >
              <option value="all">All Status</option>
              <option value="open">Open Only</option>
              <option value="closed">Closed Only</option>
            </select>
            <!-- Type Filter -->
            <select 
              id="gateTypeFilter"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
            >
              <option value="all">All Types</option>
              <option value="entrance">Entrance Only</option>
              <option value="exit">Exit Only</option>
              <option value="both">Both</option>
            </select>
          </div>
          <button 
            id="addGateBtn"
            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 w-full sm:w-auto"
          >
            Add New Gate
          </button>
        </div>
      </div>
      
      <div id="gatesList" class="space-y-4">
        <!-- Gates will be loaded here -->
      </div>
    </div>
  `;
}

export async function loadGates(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: gates, error } = await supabase.rpc('get_all_gates', {
      p_user_id: user.id
    });

    if (error) {
      throw error;
    }

    allGates = gates || [];
    filteredGates = [...allGates];
    renderGatesList();
  } catch (error) {
    console.error('Error loading gates:', error);
    showNotification('Failed to load gates. Please try again.', 'error');
  }
}

function renderGatesList(): void {
  const gatesListElement = document.getElementById('gatesList');
  if (!gatesListElement) return;

  if (filteredGates.length === 0) {
    gatesListElement.innerHTML = `
      <div class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No gates found</h3>
        <p class="text-gray-500 dark:text-gray-400">Get started by creating your first gate.</p>
      </div>
    `;
    return;
  }

  gatesListElement.innerHTML = filteredGates.map(gate => `
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${gate.name}</h3>
            <span class="status-badge status-${gate.status}">${gate.status}</span>
            <span class="type-badge type-${gate.gate_type}">${gate.gate_type}</span>
          </div>
          
          ${gate.description ? `
            <p class="text-gray-600 dark:text-gray-300 text-sm mb-2">${gate.description}</p>
          ` : ''}
          
          ${gate.location ? `
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-2">📍 ${gate.location}</p>
          ` : ''}
          
          <div class="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>Created: ${new Date(gate.created_at).toLocaleDateString()}</span>
            ${gate.creator_name ? `<span>by ${gate.creator_name}</span>` : ''}
            ${gate.updated_at !== gate.created_at ? `
              <span>Updated: ${new Date(gate.updated_at).toLocaleDateString()}</span>
              ${gate.updater_name ? `<span>by ${gate.updater_name}</span>` : ''}
            ` : ''}
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-2">
          <button 
            onclick="window.gateActions.toggleGateStatus('${gate.id}', '${gate.status}')"
            class="px-3 py-1 text-sm rounded-md font-medium transition-colors ${
              gate.status === 'open' 
                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800' 
                : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
            }"
          >
            ${gate.status === 'open' ? 'Close' : 'Open'}
          </button>
          
          <button 
            onclick="window.gateActions.generateQRCode('${gate.id}')"
            class="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md font-medium transition-colors dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
          >
            QR Code
          </button>
          
          <button 
            onclick="window.gateActions.editGate('${gate.id}')"
            class="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md font-medium transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Edit
          </button>
          
          <button 
            onclick="window.gateActions.viewGateDetails('${gate.id}')"
            class="px-3 py-1 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-md font-medium transition-colors dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800"
          >
            View Details
          </button>
          
          <button 
            onclick="window.gateActions.deleteGate('${gate.id}', '${gate.name}')"
            class="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-md font-medium transition-colors dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function applySearchAndFilter(): void {
  const searchTerm = (document.getElementById('gatesSearchInput') as HTMLInputElement)?.value.toLowerCase() || '';
  const statusFilter = (document.getElementById('gateStatusFilter') as HTMLSelectElement)?.value || 'all';
  const typeFilter = (document.getElementById('gateTypeFilter') as HTMLSelectElement)?.value || 'all';

  filteredGates = allGates.filter(gate => {
    const matchesSearch = gate.name.toLowerCase().includes(searchTerm) ||
                         (gate.description && gate.description.toLowerCase().includes(searchTerm)) ||
                         (gate.location && gate.location.toLowerCase().includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || gate.status === statusFilter;
    const matchesType = typeFilter === 'all' || gate.gate_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  renderGatesList();
}

// Gate Actions
export const gateActions = {
  async toggleGateStatus(gateId: string, currentStatus: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newStatus = currentStatus === 'open' ? 'closed' : 'open';
      
      const { error } = await supabase.rpc('update_gate_status', {
        p_gate_id: gateId,
        p_status: newStatus,
        p_updated_by: user.id
      });

      if (error) {
        throw error;
      }

      showNotification(`Gate status updated to ${newStatus}`, 'success');
      await loadGates();
    } catch (error) {
      console.error('Error updating gate status:', error);
      showNotification('Failed to update gate status. Please try again.', 'error');
    }
  },

  async generateQRCode(gateId: string): Promise<void> {
    try {
      const gate = allGates.find(g => g.id === gateId);
      if (!gate) {
        throw new Error('Gate not found');
      }

      const gateData: GateQRData = {
        gateId: gate.id,
        gateName: gate.name,
        gateDescription: gate.description,
        gateLocation: gate.location,
        gateType: gate.gate_type,
        status: gate.status,
        createdAt: gate.created_at,
        updatedAt: gate.updated_at
      };

      const qrCodeDataUrl = await generateGateQRCode(gateData);
      openPrintableGateCard(gateData, qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      showNotification('Failed to generate QR code. Please try again.', 'error');
    }
  },

  async editGate(gateId: string): Promise<void> {
    const gate = allGates.find(g => g.id === gateId);
    if (!gate) {
      showNotification('Gate not found', 'error');
      return;
    }

    showEditGateModal(gate);
  },

  async deleteGate(gateId: string, gateName: string): Promise<void> {
    if (!confirm(`Are you sure you want to delete the gate "${gateName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.rpc('delete_gate', {
        p_gate_id: gateId,
        p_deleted_by: user.id
      });

      if (error) {
        throw error;
      }

      showNotification('Gate deleted successfully', 'success');
      await loadGates();
    } catch (error) {
      console.error('Error deleting gate:', error);
      showNotification('Failed to delete gate. Please try again.', 'error');
    }
  },

  viewGateDetails(gateId: string): void {
    window.location.hash = `/gate/${gateId}`;
  }
};

function showAddGateModal(): void {
  const modalHtml = `
    <div id="addGateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add New Gate</h3>
            <button onclick="closeModal('addGateModal')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form id="addGateForm" class="space-y-4">
            <div>
              <label for="gateName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gate Name *
              </label>
              <input 
                type="text" 
                id="gateName" 
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter gate name"
              >
            </div>
            
            <div>
              <label for="gateDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea 
                id="gateDescription" 
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter gate description (optional)"
              ></textarea>
            </div>
            
            <div>
              <label for="gateLocation" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input 
                type="text" 
                id="gateLocation" 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter gate location (optional)"
              >
            </div>
            
            <div>
              <label for="gateType" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gate Type *
              </label>
              <select 
                id="gateType" 
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="both">Both (Entrance & Exit)</option>
                <option value="entrance">Entrance Only</option>
                <option value="exit">Exit Only</option>
              </select>
            </div>
            
            <div class="flex gap-3 pt-4">
              <button 
                type="submit"
                class="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Create Gate
              </button>
              <button 
                type="button"
                onclick="closeModal('addGateModal')"
                class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  setupAddGateForm();
}

function showEditGateModal(gate: Gate): void {
  const modalHtml = `
    <div id="editGateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Edit Gate</h3>
            <button onclick="closeModal('editGateModal')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form id="editGateForm" class="space-y-4">
            <input type="hidden" id="editGateId" value="${gate.id}">
            
            <div>
              <label for="editGateName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gate Name *
              </label>
              <input 
                type="text" 
                id="editGateName" 
                value="${gate.name}"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter gate name"
              >
            </div>
            
            <div>
              <label for="editGateDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea 
                id="editGateDescription" 
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter gate description (optional)"
              >${gate.description || ''}</textarea>
            </div>
            
            <div>
              <label for="editGateLocation" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input 
                type="text" 
                id="editGateLocation" 
                value="${gate.location || ''}"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter gate location (optional)"
              >
            </div>
            
            <div>
              <label for="editGateType" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gate Type *
              </label>
              <select 
                id="editGateType" 
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="both" ${gate.gate_type === 'both' ? 'selected' : ''}>Both (Entrance & Exit)</option>
                <option value="entrance" ${gate.gate_type === 'entrance' ? 'selected' : ''}>Entrance Only</option>
                <option value="exit" ${gate.gate_type === 'exit' ? 'selected' : ''}>Exit Only</option>
              </select>
            </div>
            
            <div class="flex gap-3 pt-4">
              <button 
                type="submit"
                class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Update Gate
              </button>
              <button 
                type="button"
                onclick="closeModal('editGateModal')"
                class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  setupEditGateForm();
}

function setupAddGateForm(): void {
  const form = document.getElementById('addGateForm') as HTMLFormElement;
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const name = (document.getElementById('gateName') as HTMLInputElement).value.trim();
    const description = (document.getElementById('gateDescription') as HTMLTextAreaElement).value.trim();
    const location = (document.getElementById('gateLocation') as HTMLInputElement).value.trim();
    const gateType = (document.getElementById('gateType') as HTMLSelectElement).value as 'entrance' | 'exit' | 'both';

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: gateId, error } = await supabase.rpc('create_gate', {
        p_name: name,
        p_created_by: user.id,
        p_description: description || null,
        p_location: location || null,
        p_gate_type: gateType
      });

      if (error) {
        throw error;
      }

      showNotification('Gate created successfully', 'success');
      closeModal('addGateModal');
      await loadGates();
    } catch (error) {
      console.error('Error creating gate:', error);
      showNotification('Failed to create gate. Please try again.', 'error');
    }
  });
}

function setupEditGateForm(): void {
  const form = document.getElementById('editGateForm') as HTMLFormElement;
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const gateId = (document.getElementById('editGateId') as HTMLInputElement).value;
    const name = (document.getElementById('editGateName') as HTMLInputElement).value.trim();
    const description = (document.getElementById('editGateDescription') as HTMLTextAreaElement).value.trim();
    const location = (document.getElementById('editGateLocation') as HTMLInputElement).value.trim();
    const gateType = (document.getElementById('editGateType') as HTMLSelectElement).value as 'entrance' | 'exit' | 'both';

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.rpc('update_gate', {
        p_gate_id: gateId,
        p_updated_by: user.id,
        p_name: name,
        p_description: description || null,
        p_location: location || null,
        p_gate_type: gateType
      });

      if (error) {
        throw error;
      }

      showNotification('Gate updated successfully', 'success');
      closeModal('editGateModal');
      await loadGates();
    } catch (error) {
      console.error('Error updating gate:', error);
      showNotification('Failed to update gate. Please try again.', 'error');
    }
  });
}

function closeModal(modalId: string): void {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.remove();
  }
}

function showNotification(message: string, type: 'success' | 'error'): void {
  // Use the existing notification system from the dashboard
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
  } else {
    // Fallback notification
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Setup event listeners when the component is loaded
export function setupGatesEventListeners(): void {
  // Add gate button
  const addGateBtn = document.getElementById('addGateBtn');
  addGateBtn?.addEventListener('click', showAddGateModal);

  // Search and filter inputs
  const searchInput = document.getElementById('gatesSearchInput');
  const statusFilter = document.getElementById('gateStatusFilter');
  const typeFilter = document.getElementById('gateTypeFilter');

  searchInput?.addEventListener('input', applySearchAndFilter);
  statusFilter?.addEventListener('change', applySearchAndFilter);
  typeFilter?.addEventListener('change', applySearchAndFilter);

  // Make gateActions available globally
  (window as any).gateActions = gateActions;
  (window as any).closeModal = closeModal;

  // Load gates initially
  loadGates();
}

 