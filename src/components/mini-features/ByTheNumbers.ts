import { VisitLocationsStatCard } from './VisitLocationsStatModal';

export function ByTheNumbers() {
  return `
    <div class="mb-8 sm:mb-12 md:mb-20 mt-4 sm:mt-6 md:mt-8">
      <h2 class="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-center animate-fade-in-up px-2" style="animation-delay:3s;">By the Numbers</h2>
      <p class="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
        Key metrics showcasing the impact and scale of our GuestGo system
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 px-2">
        
        <!-- Total Visits -->
        <div class="stat-card group relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-lg p-6 sm:p-8 text-center hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 ease-out border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
          <div class="relative z-10">
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
              <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
              </svg>
            </div>
            <div id="stat-total-visits" class="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2 counter">0</div>
            <div class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Total Visits</div>
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">All scheduled visits tracked</p>
          </div>
        </div>

        <!-- Completed Today -->
        <div class="stat-card group relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-lg p-6 sm:p-8 text-center hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 ease-out border-2 border-transparent hover:border-green-300 dark:hover:border-green-700 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-green-200 dark:bg-green-800 rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
          <div class="relative z-10">
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
              <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div id="stat-completed-today" class="text-3xl sm:text-4xl md:text-5xl font-bold text-green-600 dark:text-green-400 mb-2 counter">0</div>
            <div class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Completed Today</div>
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Visits finished today</p>
          </div>
        </div>

        ${VisitLocationsStatCard()}

        <!-- Success Rate -->
        <div class="stat-card group relative bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl shadow-lg p-6 sm:p-8 text-center hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 ease-out border-2 border-transparent hover:border-orange-300 dark:hover:border-orange-700 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-orange-200 dark:bg-orange-800 rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
          <div class="relative z-10">
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
              <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <div id="stat-success-rate" class="text-3xl sm:text-4xl md:text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2 counter">0%</div>
            <div class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Success Rate</div>
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Successful visit completions</p>
          </div>
        </div>

      </div>
    </div>
  `;
}

