import supabase from '../config/supabase';
import { generateGateQRCode, openPrintableGateCard, type GateQRData } from '../utils/qrCode';

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

export function GatePage(gateId: string) {
  return `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="mb-6">
        <a href="/dashboard" class="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Dashboard
        </a>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gate Details</h1>
      </div>
      
      <div id="gateContent" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600 dark:text-gray-400">Loading gate details...</p>
        </div>
      </div>
    </div>
  `;
}

export async function loadGateDetails(gateId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      window.location.href = '/';
      return;
    }

    const { data: gates, error } = await supabase.rpc('get_gate_by_id', {
      p_gate_id: gateId,
      p_user_id: user.id
    });

    if (error) {
      throw error;
    }

    if (!gates || gates.length === 0) {
      showGateError('Gate not found');
      return;
    }

    const gate = gates[0] as Gate;
    renderGateDetails(gate);
  } catch (error) {
    console.error('Error loading gate details:', error);
    showGateError('Failed to load gate details');
  }
}

function renderGateDetails(gate: Gate): void {
  const gateContent = document.getElementById('gateContent');
  if (!gateContent) return;

  gateContent.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Gate Information -->
      <div>
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">${gate.name}</h2>
          <span class="status-badge status-${gate.status}">${gate.status}</span>
          <span class="type-badge type-${gate.gate_type}">${gate.gate_type}</span>
        </div>
        
        ${gate.description ? `
          <div class="mb-4">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</h3>
            <p class="text-gray-900 dark:text-white">${gate.description}</p>
          </div>
        ` : ''}
        
        ${gate.location ? `
          <div class="mb-4">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</h3>
            <p class="text-gray-900 dark:text-white flex items-center">
              <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              ${gate.location}
            </p>
          </div>
        ` : ''}
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created</h3>
            <p class="text-sm text-gray-900 dark:text-white">${new Date(gate.created_at).toLocaleDateString()}</p>
            ${gate.creator_name ? `<p class="text-xs text-gray-500 dark:text-gray-400">by ${gate.creator_name}</p>` : ''}
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Updated</h3>
            <p class="text-sm text-gray-900 dark:text-white">${new Date(gate.updated_at).toLocaleDateString()}</p>
            ${gate.updater_name ? `<p class="text-xs text-gray-500 dark:text-gray-400">by ${gate.updater_name}</p>` : ''}
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <button 
            onclick="window.gatePageActions.toggleGateStatus('${gate.id}', '${gate.status}')"
            class="px-4 py-2 rounded-md font-medium transition-colors ${
              gate.status === 'open' 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }"
          >
            ${gate.status === 'open' ? 'Close Gate' : 'Open Gate'}
          </button>
          
          <button 
            onclick="window.gatePageActions.printGateCard('${gate.id}')"
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium transition-colors"
          >
            Print Gate Card
          </button>
        </div>
      </div>
      
      <!-- QR Code Section -->
      <div class="flex flex-col items-center justify-center">
        <div id="qrCodeContainer" class="text-center">
          <div class="mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">QR Code</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Scan this QR code to view gate details</p>
          </div>
          
          <div id="qrCodeDisplay" class="bg-white p-4 rounded-lg shadow-md inline-block">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-2 text-sm text-gray-500">Generating QR code...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Generate QR code
  generateQRCodeForGate(gate);
}

async function generateQRCodeForGate(gate: Gate): Promise<void> {
  try {
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
    
    const qrCodeDisplay = document.getElementById('qrCodeDisplay');
    if (qrCodeDisplay) {
      qrCodeDisplay.innerHTML = `
        <img src="${qrCodeDataUrl}" alt="Gate QR Code" class="w-48 h-48 mx-auto">
        <p class="mt-2 text-xs text-gray-500">Gate ID: ${gate.id}</p>
      `;
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    const qrCodeDisplay = document.getElementById('qrCodeDisplay');
    if (qrCodeDisplay) {
      qrCodeDisplay.innerHTML = `
        <div class="text-red-600">
          <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <p class="text-sm">Failed to generate QR code</p>
        </div>
      `;
    }
  }
}

function showGateError(message: string): void {
  const gateContent = document.getElementById('gateContent');
  if (!gateContent) return;

  gateContent.innerHTML = `
    <div class="text-center py-12">
      <div class="text-red-600 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Error</h3>
      <p class="text-gray-500 dark:text-gray-400">${message}</p>
      <button 
        onclick="window.location.href='/dashboard'"
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
      >
        Back to Dashboard
      </button>
    </div>
  `;
}

// Gate Page Actions
export const gatePageActions = {
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
      
      // Reload the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error('Error updating gate status:', error);
      showNotification('Failed to update gate status. Please try again.', 'error');
    }
  },



  async printGateCard(gateId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: gates, error } = await supabase.rpc('get_gate_by_id', {
        p_gate_id: gateId,
        p_user_id: user.id
      });

      if (error || !gates || gates.length === 0) {
        throw new Error('Gate not found');
      }

      const gate = gates[0] as Gate;
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
      console.error('Error printing gate card:', error);
      showNotification('Failed to print gate card. Please try again.', 'error');
    }
  }
};

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

// Setup when the page is loaded
export function setupGatePage(gateId: string): void {
  // Make actions available globally
  (window as any).gatePageActions = gatePageActions;
  
  // Load gate details
  loadGateDetails(gateId);
} 