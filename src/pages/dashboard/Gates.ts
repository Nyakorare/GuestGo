import supabase from '../../config/supabase';
import { generateGateQRCode, openPrintableGateCard, type GateQRData } from '../../utils/qrCode';
import { generateSimpleGateQRCode } from '../../utils/qrCode';

interface Gate {
  id: string;
  name: string;
  description?: string;
  location?: string;
  image_url?: string;
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
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-gray-600 group">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-start gap-4 flex-1">
          <div class="flex-shrink-0">
            <div class="mb-1">
              <p class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Current Status</p>
              <p class="text-xs font-semibold ${
                gate.status === 'open'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }">
                ${gate.status === 'open' ? 'Open' : 'Closed'}
              </p>
            </div>
            <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
              ${gate.image_url ? `
                <img src="${gate.image_url}" alt="${gate.name}" class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="w-full h-full flex items-center justify-center text-gray-400" style="display: none;">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              ` : `
                <div class="w-full h-full flex items-center justify-center text-gray-400">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              `}
            </div>
            <button 
              onclick="window.gateActions.changeGateImage('${gate.id}')"
              class="mt-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Change Image
            </button>
          </div>
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
        showNotification('Gate not found', 'error');
        return;
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

      // Use simple QR code generation for better scanning reliability
      const qrCodeDataUrl = await generateSimpleGateQRCode(gate.id);
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
  },

  async changeGateImage(gateId: string): Promise<void> {
    const gate = allGates.find(g => g.id === gateId);
    if (!gate) {
      showNotification('Gate not found', 'error');
      return;
    }

    showChangeImageModal(gate);
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
              <label for="gateImageUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image URL
              </label>
              <input 
                type="url" 
                id="gateImageUrl" 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter image URL (optional)"
              >
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">You can add an image later by editing the gate</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Image
              </label>
              <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                <input 
                  type="file" 
                  id="addGateImageFile" 
                  accept="image/*"
                  class="hidden"
                >
                <label for="addGateImageFile" class="cursor-pointer">
                  <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Click to upload or drag and drop</p>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                </label>
              </div>
              <div id="addGateUploadPreview" class="mt-2 hidden">
                <img id="addGatePreviewImage" class="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600" alt="Preview">
                <button type="button" id="addGateRemoveUpload" class="mt-1 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                  Remove
                </button>
              </div>
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
              <label for="editGateImageUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image URL
              </label>
              <input 
                type="url" 
                id="editGateImageUrl" 
                value="${gate.image_url || ''}"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter image URL (optional)"
              >
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Or use the "Change Image" button for a dedicated image editor</p>
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

function showChangeImageModal(gate: Gate): void {
  const modalHtml = `
    <div id="changeImageModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Change Gate Image</h3>
            <button onclick="closeModal('changeImageModal')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="mb-4">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Gate: <span class="font-medium text-gray-900 dark:text-white">${gate.name}</span></p>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Image</label>
              <div class="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                ${gate.image_url ? `
                  <img src="${gate.image_url}" alt="${gate.name}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                  <div class="w-full h-full flex items-center justify-center text-gray-400" style="display: none;">
                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                ` : `
                  <div class="w-full h-full flex items-center justify-center text-gray-400">
                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                `}
              </div>
            </div>
          </div>
          
          <form id="changeImageForm" class="space-y-4">
            <input type="hidden" id="changeImageGateId" value="${gate.id}">
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Image
              </label>
              <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                <input 
                  type="file" 
                  id="imageFile" 
                  accept="image/*"
                  class="hidden"
                >
                <label for="imageFile" class="cursor-pointer">
                  <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Click to upload or drag and drop</p>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                </label>
              </div>
              <div id="uploadPreview" class="mt-2 hidden">
                <img id="previewImage" class="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600" alt="Preview">
                <button type="button" id="removeUpload" class="mt-1 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                  Remove
                </button>
              </div>
            </div>
            
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span>
              </div>
            </div>
            
            <div>
              <label for="imageUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image URL
              </label>
              <input 
                type="url" 
                id="imageUrl" 
                value="${gate.image_url || ''}"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter image URL (optional)"
              >
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave empty to remove the current image</p>
            </div>
            
            <div class="flex gap-3 pt-4">
              <button 
                type="submit"
                class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Update Image
              </button>
              <button 
                type="button"
                onclick="closeModal('changeImageModal')"
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
  setupChangeImageForm();
}

function setupAddGateForm(): void {
  const form = document.getElementById('addGateForm') as HTMLFormElement;
  const fileInput = document.getElementById('addGateImageFile') as HTMLInputElement;
  const urlInput = document.getElementById('gateImageUrl') as HTMLInputElement;
  const previewDiv = document.getElementById('addGateUploadPreview') as HTMLDivElement;
  const previewImage = document.getElementById('addGatePreviewImage') as HTMLImageElement;
  const removeButton = document.getElementById('addGateRemoveUpload') as HTMLButtonElement;
  const uploadArea = document.querySelector('#addGateForm .border-dashed') as HTMLDivElement;
  
  if (!form) return;

  let uploadedImageUrl: string | null = null;

  // Handle file upload and preview
  fileInput?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    handleFileUpload(file);
  });

  // Drag and drop functionality
  uploadArea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20');
  });

  uploadArea?.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20');
  });

  uploadArea?.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20');
    
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  });

  function handleFileUpload(file: File | undefined) {
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('File size must be less than 5MB', 'error');
      fileInput.value = '';
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file', 'error');
      fileInput.value = '';
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      uploadedImageUrl = result;
      previewImage.src = result;
      previewDiv.classList.remove('hidden');
      
      // Clear URL input when file is selected
      urlInput.value = '';
      
      // Disable both upload and URL input
      disableInputs();
    };
    reader.readAsDataURL(file);
  }

  function disableInputs() {
    // Disable file input
    fileInput.disabled = true;
    fileInput.parentElement?.classList.add('opacity-50', 'pointer-events-none');
    
    // Disable URL input
    urlInput.disabled = true;
    urlInput.classList.add('opacity-50', 'cursor-not-allowed');
  }

  function enableInputs() {
    // Enable file input
    fileInput.disabled = false;
    fileInput.parentElement?.classList.remove('opacity-50', 'pointer-events-none');
    
    // Enable URL input
    urlInput.disabled = false;
    urlInput.classList.remove('opacity-50', 'cursor-not-allowed');
  }

  // Handle remove upload
  removeButton?.addEventListener('click', () => {
    fileInput.value = '';
    uploadedImageUrl = null;
    previewDiv.classList.add('hidden');
    enableInputs(); // Re-enable inputs after removing
  });

  // Handle URL input changes
  urlInput?.addEventListener('input', () => {
    if (urlInput.value.trim()) {
      // Clear file input when URL is entered
      fileInput.value = '';
      uploadedImageUrl = null;
      previewDiv.classList.add('hidden');
      enableInputs(); // Re-enable inputs after entering URL
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const name = (document.getElementById('gateName') as HTMLInputElement).value.trim();
    const description = (document.getElementById('gateDescription') as HTMLTextAreaElement).value.trim();
    const location = (document.getElementById('gateLocation') as HTMLInputElement).value.trim();
    const imageUrl = urlInput.value.trim();
    const gateType = (document.getElementById('gateType') as HTMLSelectElement).value as 'entrance' | 'exit' | 'both';

    // Use uploaded image URL if available, otherwise use the URL input
    const finalImageUrl = uploadedImageUrl || imageUrl || null;

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
        p_image_url: finalImageUrl,
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
    const imageUrl = (document.getElementById('editGateImageUrl') as HTMLInputElement).value.trim();
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
        p_image_url: imageUrl || null,
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

function setupChangeImageForm(): void {
  const form = document.getElementById('changeImageForm') as HTMLFormElement;
  const fileInput = document.getElementById('imageFile') as HTMLInputElement;
  const urlInput = document.getElementById('imageUrl') as HTMLInputElement;
  const previewDiv = document.getElementById('uploadPreview') as HTMLDivElement;
  const previewImage = document.getElementById('previewImage') as HTMLImageElement;
  const removeButton = document.getElementById('removeUpload') as HTMLButtonElement;
  const uploadArea = document.querySelector('.border-dashed') as HTMLDivElement;
  
  if (!form) return;

  let uploadedImageUrl: string | null = null;

  // Handle file upload and preview
  fileInput?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    handleFileUpload(file);
  });

  // Drag and drop functionality
  uploadArea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20');
  });

  uploadArea?.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20');
  });

  uploadArea?.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20');
    
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  });

  function handleFileUpload(file: File | undefined) {
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('File size must be less than 5MB', 'error');
      fileInput.value = '';
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file', 'error');
      fileInput.value = '';
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      uploadedImageUrl = result;
      previewImage.src = result;
      previewDiv.classList.remove('hidden');
      
      // Clear URL input when file is selected
      urlInput.value = '';
      
      // Disable both upload and URL input
      disableInputs();
    };
    reader.readAsDataURL(file);
  }

  function disableInputs() {
    // Disable file input
    fileInput.disabled = true;
    fileInput.parentElement?.classList.add('opacity-50', 'pointer-events-none');
    
    // Disable URL input
    urlInput.disabled = true;
    urlInput.classList.add('opacity-50', 'cursor-not-allowed');
  }

  function enableInputs() {
    // Enable file input
    fileInput.disabled = false;
    fileInput.parentElement?.classList.remove('opacity-50', 'pointer-events-none');
    
    // Enable URL input
    urlInput.disabled = false;
    urlInput.classList.remove('opacity-50', 'cursor-not-allowed');
  }

  // Handle remove upload
  removeButton?.addEventListener('click', () => {
    fileInput.value = '';
    uploadedImageUrl = null;
    previewDiv.classList.add('hidden');
    enableInputs(); // Re-enable inputs after removing
  });

  // Handle URL input changes
  urlInput?.addEventListener('input', () => {
    if (urlInput.value.trim()) {
      // Clear file input when URL is entered
      fileInput.value = '';
      uploadedImageUrl = null;
      previewDiv.classList.add('hidden');
      enableInputs(); // Re-enable inputs after entering URL
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const gateId = (document.getElementById('changeImageGateId') as HTMLInputElement).value;
    const imageUrl = urlInput.value.trim();
    
    // Use uploaded image URL if available, otherwise use the URL input
    const finalImageUrl = uploadedImageUrl || imageUrl || null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch existing gate details to satisfy required RPC parameters
      const existingGate = allGates.find(g => g.id === gateId);
      if (!existingGate) {
        throw new Error('Gate not found');
      }

      const { error } = await supabase.rpc('update_gate', {
        p_gate_id: gateId,
        p_name: existingGate.name,
        p_description: existingGate.description || null,
        p_location: existingGate.location || null,
        p_image_url: finalImageUrl,
        p_gate_type: existingGate.gate_type,
        p_updated_by: user.id
      });

      if (error) {
        throw error;
      }

      showNotification('Gate image updated successfully', 'success');
      closeModal('changeImageModal');
      await loadGates();
    } catch (error) {
      console.error('Error updating gate image:', error);
      showNotification('Failed to update gate image. Please try again.', 'error');
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