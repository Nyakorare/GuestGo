export function VisitProgress() {
  return `
    <div class="mb-8 track-fade-in track-fade-in-delay-3">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center track-icon-float">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Visit Progress</h3>
      </div>
      <div class="track-card bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border-2 border-gray-300 dark:border-gray-600 shadow-lg">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <span class="text-sm font-bold text-gray-700 dark:text-gray-300">Overall Progress</span>
          <span id="progressPercentage" class="text-lg font-bold text-blue-600 dark:text-blue-400">0%</span>
        </div>
        <div class="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3 mb-3 shadow-inner">
          <div id="progressBar" class="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500 shadow-lg" style="width: 0%"></div>
        </div>
        <div class="text-sm font-medium text-gray-600 dark:text-gray-400">
          <span id="completedPlaces" class="text-blue-600 dark:text-blue-400 font-bold">0</span> of <span id="totalPlaces" class="font-bold">0</span> places completed
        </div>
      </div>
    </div>
  `;
}

