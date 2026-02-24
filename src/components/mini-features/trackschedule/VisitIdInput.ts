export function VisitIdInput() {
  return `
    <div class="track-card track-fade-in track-fade-in-delay-1 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl shadow-xl p-6 sm:p-8 mb-4 border-2 border-blue-100 dark:border-blue-800">
      <div class="max-w-md mx-auto">
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-3 shadow-lg track-icon-float">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <label for="visitIdInput" class="block text-base font-bold text-gray-900 dark:text-white mb-2">
            Scheduled Visit ID
          </label>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            id="visitIdInput"
            placeholder="Enter your visit ID..."
            class="flex-1 w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            id="trackVisitBtn"
            class="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 track-button-glow"
          >
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              Track
            </span>
          </button>
        </div>
        <p class="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          You can find your visit ID in the confirmation email or the QR code modal after scheduling.
        </p>
      </div>
    </div>
  `;
}

