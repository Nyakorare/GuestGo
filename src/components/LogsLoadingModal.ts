// Logs Loading Modal Component
// Shows a loading animation while logs are being loaded

/**
 * Creates the logs loading modal HTML
 */
export function createLogsLoadingModal(): string {
  return `
    <div id="logsLoadingModal" class="hidden fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-[9999] flex items-center justify-center transition-opacity duration-300" style="opacity: 0;">
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300">
        <!-- Loading Animation Container -->
        <div class="flex flex-col items-center justify-center space-y-6">
          <!-- Spinner -->
          <div class="relative">
            <div class="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
            <div class="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          
          <!-- Loading Text -->
          <div class="text-center space-y-2">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              Loading Logs
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Please wait while we fetch your logs...
            </p>
          </div>
          
          <!-- Progress Dots Animation -->
          <div class="flex space-x-2">
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Shows the logs loading modal
 */
export function showLogsLoadingModal(): void {
  const modal = document.getElementById('logsLoadingModal');
  if (modal) {
    modal.classList.remove('hidden');
    // Add fade-in animation
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 10);
  }
}

/**
 * Hides the logs loading modal
 */
export function hideLogsLoadingModal(): void {
  const modal = document.getElementById('logsLoadingModal');
  if (modal) {
    // Add fade-out animation
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  }
}

/**
 * Initializes the modal by ensuring it exists in the DOM
 * Should be called when the dashboard is rendered
 */
export function initializeLogsLoadingModal(): void {
  // Check if modal already exists
  if (!document.getElementById('logsLoadingModal')) {
    // Append modal to body
    document.body.insertAdjacentHTML('beforeend', createLogsLoadingModal());
  }
}

