export function GateScanningStatus() {
  return `
    <div class="mb-8 track-fade-in track-fade-in-delay-3">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center track-icon-float">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Gate Scanning Status</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="track-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-5 border-2 border-blue-200 dark:border-blue-700 shadow-lg">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-bold text-gray-700 dark:text-gray-300">Entrance Scan</span>
            <span id="entranceScanStatus" class="inline-flex px-3 py-1 text-xs font-semibold rounded-full"></span>
          </div>
          <p id="entranceScanTime" class="mb-4 text-xs text-gray-600 dark:text-gray-400"></p>
          <button 
            id="scanEntranceBtn"
            class="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 track-button-glow"
            disabled
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
            </svg>
            Scan Entrance
          </button>
        </div>
        <div class="track-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-5 border-2 border-blue-200 dark:border-blue-700 shadow-lg">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-bold text-gray-700 dark:text-gray-300">Exit Scan</span>
            <span id="exitScanStatus" class="inline-flex px-3 py-1 text-xs font-semibold rounded-full"></span>
          </div>
          <p id="exitScanTime" class="mb-4 text-xs text-gray-600 dark:text-gray-400"></p>
          <button 
            id="scanExitBtn"
            class="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 track-button-glow"
            disabled
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Scan Exit
          </button>
        </div>
      </div>
      <!-- View Face Images Button (for non-logged-in scheduled visits) -->
      <div id="viewFaceImagesContainer" class="hidden mt-5">
        <button 
          id="viewFaceImagesBtn"
          class="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 track-button-glow"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          View Face Images
        </button>
      </div>
    </div>
  `;
}

