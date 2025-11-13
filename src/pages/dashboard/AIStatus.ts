import { safeJsonParse } from '../../utils/safe-json-parse';
import { LOCAL_API_URL, DEPLOYED_API_URL, getApiUrlPreference, setApiUrlPreference } from '../../config/python-api';

interface ServiceStatus {
  status: 'running' | 'error' | 'checking';
  api_connected: boolean;
  main_app_connected: boolean;
  frontend_connected: boolean;
  main_app_url: string;
  api_version: string;
  endpoints: string[];
  connectivity: {
    python_service: boolean;
    main_application: boolean;
    bidirectional: boolean;
  };
  environment?: string;
  is_local?: boolean;
  is_deployed?: boolean;
}

export function renderAIStatus(): string {
  // Always show local service section
  const localServiceSection = `
        <!-- Local Service Status -->
        <div id="localServiceSection" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold uppercase tracking-wide text-white">
                Local
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Local Development</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">${LOCAL_API_URL}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span id="localActiveBadge" class="hidden px-2 py-1 text-xs font-semibold rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">Active</span>
            </div>
          </div>
          
          <div id="localStatusCard" class="mb-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div class="flex items-center gap-3">
              <span class="spinner inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
              <div class="text-sm font-medium text-gray-600 dark:text-gray-300">Checking connectivity…</div>
            </div>
          </div>

          <div id="localStatusDetails" class="hidden space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">API Status</p>
                <p id="localApiStatus" class="text-sm font-semibold text-gray-900 dark:text-white">-</p>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Main App</p>
                <p id="localMainApp" class="text-sm font-semibold text-gray-900 dark:text-white">-</p>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Bidirectional</p>
                <p id="localBidirectional" class="text-sm font-semibold text-gray-900 dark:text-white">-</p>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">API Version</p>
                <p id="localApiVersion" class="text-sm font-semibold text-gray-900 dark:text-white">-</p>
              </div>
            </div>
            <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Main App URL</p>
              <p id="localMainAppUrl" class="text-sm font-semibold text-blue-600 dark:text-blue-400 break-words">-</p>
            </div>
          </div>
        </div>
  `;

  return `
    <div>
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">AI Service Status</h2>
        <button 
          id="refreshAIStatusBtn"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Refresh Status
        </button>
      </div>

      <div id="aiStatusGrid" class="grid gap-6 md:grid-cols-2">
        ${localServiceSection}
        <!-- Deployed Service Status -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-blue-200 dark:border-blue-700">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold uppercase tracking-wide text-white">
                Live
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Deployed Service</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">${DEPLOYED_API_URL}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span id="deployedActiveBadge" class="hidden px-2 py-1 text-xs font-semibold rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">Active</span>
            </div>
          </div>
          
          <div id="deployedStatusCard" class="mb-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div class="flex items-center gap-3">
              <span class="spinner inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
              <div class="text-sm font-medium text-gray-600 dark:text-gray-300">Checking connectivity…</div>
            </div>
          </div>

          <div id="deployedStatusDetails" class="hidden space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">API Status</p>
                <p id="deployedApiStatus" class="text-sm font-semibold text-gray-900 dark:text-white">-</p>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Main App</p>
                <p id="deployedMainApp" class="text-sm font-semibold text-gray-900 dark:text-white">-</p>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Bidirectional</p>
                <p id="deployedBidirectional" class="text-sm font-semibold text-gray-900 dark:text-white">-</p>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">API Version</p>
                <p id="deployedApiVersion" class="text-sm font-semibold text-gray-900 dark:text-white">-</p>
              </div>
            </div>
            <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Main App URL</p>
              <p id="deployedMainAppUrl" class="text-sm font-semibold text-blue-600 dark:text-blue-400 break-words">-</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>Last checked: <span id="lastChecked" class="font-medium">-</span></p>
      </div>
    </div>
  `;
}

async function checkServiceStatus(apiUrl: string): Promise<ServiceStatus | null> {
  try {
    const response = await fetch(`${apiUrl}/status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    const data = await safeJsonParse<ServiceStatus>(response, apiUrl);
    return data;
  } catch (error) {
    console.error(`Error checking service at ${apiUrl}:`, error);
    return null;
  }
}

function updateStatusCard(
  cardId: string,
  detailsId: string,
  status: ServiceStatus | null,
  prefix: 'local' | 'deployed'
): void {
  const statusCard = document.getElementById(cardId);
  const statusDetails = document.getElementById(detailsId);

  if (!statusCard) return;

  if (!status) {
    statusCard.className = 'mb-4 p-4 rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20';
    statusCard.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-red-600 dark:text-red-400">❌</span>
        <div class="text-sm font-medium text-red-700 dark:text-red-300">Service unavailable</div>
      </div>
    `;
    if (statusDetails) statusDetails.classList.add('hidden');
    return;
  }

  const frontendConnected = status.main_app_connected === true || status.frontend_connected === true;
  const bidirectional = status.connectivity?.bidirectional === true;

  let cardClass = 'mb-4 p-4 rounded-lg border';
  let icon = 'ℹ️';
  let title = 'Status';
  let description = 'Checking service status...';

  if (status.status === 'running' && status.api_connected) {
    if (frontendConnected && bidirectional) {
      cardClass += ' border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20';
      icon = '✅';
      title = 'Fully Connected';
      description = 'AI service is online and has bidirectional communication with the main application.';
    } else if (frontendConnected) {
      cardClass += ' border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20';
      icon = '⚠️';
      title = 'Partial Connection';
      description = 'AI service is running but the main application has not confirmed bidirectional callbacks yet.';
    } else {
      cardClass += ' border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20';
      icon = '⚠️';
      title = 'Waiting for Frontend';
      description = 'AI service is running. Waiting for the main application to reach the status endpoint.';
    }
  } else {
    cardClass += ' border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20';
    icon = '❌';
    title = 'Service Error';
    description = `API returned an error: ${(status as any).error || 'Unknown error.'}`;
  }

  statusCard.className = cardClass;
  statusCard.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="text-xl">${icon}</div>
      <div class="flex-1">
        <p class="text-xs font-semibold uppercase tracking-wide mb-1">${title}</p>
        <p class="text-sm leading-6">${description}</p>
      </div>
    </div>
  `;

  if (statusDetails) {
    statusDetails.classList.remove('hidden');
    
    // Update status details
    const apiStatusEl = document.getElementById(`${prefix}ApiStatus`);
    const mainAppEl = document.getElementById(`${prefix}MainApp`);
    const bidirectionalEl = document.getElementById(`${prefix}Bidirectional`);
    const apiVersionEl = document.getElementById(`${prefix}ApiVersion`);
    const mainAppUrlEl = document.getElementById(`${prefix}MainAppUrl`);

    if (apiStatusEl) apiStatusEl.textContent = status.api_connected ? 'Connected' : 'Disconnected';
    if (mainAppEl) mainAppEl.textContent = frontendConnected ? 'Yes' : 'No';
    if (bidirectionalEl) bidirectionalEl.textContent = bidirectional ? 'Yes' : 'No';
    if (apiVersionEl) apiVersionEl.textContent = status.api_version || 'Unknown';
    if (mainAppUrlEl) mainAppUrlEl.textContent = status.main_app_url || '-';
  }
}

export async function loadAIStatus(): Promise<void> {
  const lastChecked = document.getElementById('lastChecked');

  if (lastChecked) {
    lastChecked.textContent = new Date().toLocaleTimeString();
  }

  // Always check both services in parallel
  const [localStatus, deployedStatus] = await Promise.all([
    checkServiceStatus(LOCAL_API_URL),
    checkServiceStatus(DEPLOYED_API_URL)
  ]);

  // Check if local service is online (status === 'running' and api_connected)
  const isLocalOnline = localStatus && localStatus.status === 'running' && localStatus.api_connected;
  
  // Always show both service sections - no need to hide/show them
  // Both sections are always visible regardless of availability

  updateStatusCard('localStatusCard', 'localStatusDetails', localStatus, 'local');
  updateStatusCard('deployedStatusCard', 'deployedStatusDetails', deployedStatus, 'deployed');
  
  // Automatically set preference based on availability: prefer local if available
  if (isLocalOnline) {
    setApiUrlPreference('local');
  } else if (deployedStatus && deployedStatus.status === 'running' && deployedStatus.api_connected) {
    // Only set to deployed if local is not available and deployed is available
    setApiUrlPreference('deployed');
  }
  
  // Update active badges with actual status
  updateActiveBadges(isLocalOnline, deployedStatus && deployedStatus.status === 'running' && deployedStatus.api_connected);
}

function updateActiveBadges(localIsOnline: boolean = false, deployedIsOnline: boolean = false): void {
  const preference = getApiUrlPreference();
  
  // Determine which service is active: prefer local if available, otherwise use deployed
  const isUsingLocal = (preference === 'local') || (preference === null && localIsOnline) || (preference !== 'deployed' && localIsOnline);
  
  const localActiveBadge = document.getElementById('localActiveBadge');
  const deployedActiveBadge = document.getElementById('deployedActiveBadge');
  
  if (localActiveBadge) {
    if (isUsingLocal && localIsOnline) {
      localActiveBadge.classList.remove('hidden');
    } else {
      localActiveBadge.classList.add('hidden');
    }
  }
  
  if (deployedActiveBadge) {
    if (!isUsingLocal && deployedIsOnline) {
      deployedActiveBadge.classList.remove('hidden');
    } else {
      deployedActiveBadge.classList.add('hidden');
    }
  }
}

export function setupAIStatusEventListeners(): void {
  const refreshBtn = document.getElementById('refreshAIStatusBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadAIStatus();
    });
  }
  
  // Load status on mount
  loadAIStatus();
}

