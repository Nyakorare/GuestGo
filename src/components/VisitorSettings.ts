// Storage key for visitor settings
const VISITOR_SETTINGS_KEY = 'visitor_scan_buttons_enabled';

/**
 * Get the current state of scan buttons (enabled/disabled)
 * @returns boolean - true if scan buttons are enabled, false otherwise
 */
export function getScanButtonsEnabled(): boolean {
  const stored = localStorage.getItem(VISITOR_SETTINGS_KEY);
  // Default to enabled if not set
  return stored === null ? true : stored === 'true';
}

/**
 * Set the state of scan buttons (enabled/disabled)
 * @param enabled - boolean indicating if scan buttons should be enabled
 */
export function setScanButtonsEnabled(enabled: boolean): void {
  localStorage.setItem(VISITOR_SETTINGS_KEY, enabled.toString());
}

/**
 * Check if scan buttons should be shown for visitor dashboard
 * @returns boolean - true if buttons should be shown, false otherwise
 */
export function shouldShowScanButtons(): boolean {
  return getScanButtonsEnabled();
}

/**
 * Load and render the visitor settings content
 */
export async function loadVisitorSettings(): Promise<void> {
  const visitorSettingsContent = document.getElementById('visitorSettingsContent');
  if (!visitorSettingsContent) return;

  const isEnabled = getScanButtonsEnabled();

  visitorSettingsContent.innerHTML = `
    <div class="flex flex-col gap-6">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Visitor Settings</h2>
      </div>

      <!-- Settings Section -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div class="space-y-6">
          <!-- Scan Buttons Toggle -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Scan Entrance/Exit Buttons
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Enable or disable the scan entrance/exit buttons for all visitor dashboards. 
                When disabled, visitors will not be able to see or use the scan buttons.
              </p>
            </div>
            <div class="flex items-center">
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="scanButtonsToggle"
                  class="sr-only peer"
                  ${isEnabled ? 'checked' : ''}
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 transition-colors duration-300"></div>
                <span id="toggleLabel" class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300 transition-colors duration-300">
                  ${isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>
          </div>

          <!-- Status Indicator -->
          <div id="statusIndicator" class="p-4 ${isEnabled ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'} rounded-lg border transition-all duration-300">
            <div class="flex items-center gap-2">
              <svg id="statusIcon" class="w-5 h-5 ${isEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path id="statusIconPath" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${isEnabled ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'}" class="transition-all duration-300"></path>
              </svg>
              <span id="statusText" class="text-sm font-medium ${isEnabled ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'} transition-colors duration-300">
                Scan buttons are currently ${isEnabled ? 'enabled' : 'disabled'} for all visitor dashboards.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Setup toggle event listener
  const toggle = document.getElementById('scanButtonsToggle') as HTMLInputElement;
  if (toggle) {
    toggle.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      const enabled = target.checked;
      
      setScanButtonsEnabled(enabled);
      
      // Get all elements that need updating
      const statusIndicator = document.getElementById('statusIndicator');
      const statusText = document.getElementById('statusText');
      const toggleLabel = document.getElementById('toggleLabel');
      const icon = document.getElementById('statusIcon') as SVGElement;
      const iconPath = icon?.querySelector('#statusIconPath') as SVGPathElement;

      // Add fade-out animation
      if (statusIndicator) {
        statusIndicator.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        statusIndicator.style.opacity = '0.6';
        statusIndicator.style.transform = 'scale(0.98)';
      }
      if (statusText) {
        statusText.style.transition = 'opacity 0.2s ease';
        statusText.style.opacity = '0';
      }
      if (toggleLabel) {
        toggleLabel.style.transition = 'opacity 0.2s ease';
        toggleLabel.style.opacity = '0';
      }
      if (icon) {
        icon.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        icon.style.opacity = '0';
        icon.style.transform = 'scale(0.9)';
      }

      // Update content after fade-out
      setTimeout(() => {
        // Update status text
        if (statusText) {
          statusText.textContent = `Scan buttons are currently ${enabled ? 'enabled' : 'disabled'} for all visitor dashboards.`;
          statusText.className = `text-sm font-medium transition-colors duration-300 ${enabled ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`;
        }

        // Update toggle label
        if (toggleLabel) {
          toggleLabel.textContent = enabled ? 'Enabled' : 'Disabled';
        }

        // Update status indicator
        if (statusIndicator) {
          statusIndicator.className = `p-4 transition-all duration-300 rounded-lg border ${enabled ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`;
        }

        // Update icon
        if (icon) {
          icon.setAttribute('class', `w-5 h-5 transition-colors duration-300 ${enabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`);
          if (iconPath) {
            iconPath.setAttribute('d', enabled ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z');
          }
        }

        // Fade in with slight delay for smooth transition
        setTimeout(() => {
          if (statusIndicator) {
            statusIndicator.style.opacity = '1';
            statusIndicator.style.transform = 'scale(1)';
          }
          if (statusText) {
            statusText.style.opacity = '1';
          }
          if (toggleLabel) {
            toggleLabel.style.opacity = '1';
          }
          if (icon) {
            icon.style.opacity = '1';
            icon.style.transform = 'scale(1)';
          }
        }, 50);
      }, 200);

      // Show notification
      showNotification(
        `Scan buttons ${enabled ? 'enabled' : 'disabled'} for all visitor dashboards`,
        enabled ? 'success' : 'info'
      );

      // Reload visitor dashboard if it's currently visible
      const visitorContent = document.getElementById('visitorContent');
      if (visitorContent && !visitorContent.classList.contains('hidden')) {
        // Trigger a refresh of visitor dashboard
        const refreshBtn = document.getElementById('refreshVisitorBtn');
        if (refreshBtn) {
          refreshBtn.click();
        }
      }
    });
  }
}

/**
 * Show a notification message
 */
function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
    type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  } text-white`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

