export function renderMinimalLogsDashboard(): string {
  return `
    <div id="logsContent" class="hidden bg-white dark:bg-gray-800 shadow rounded-lg p-3 sm:p-5 min-h-[calc(100vh-13rem)]">
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-4 h-full">
        <aside id="logsAnalyticsPane" class="xl:col-span-3 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/60 dark:bg-gray-900/30 h-full">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Logs Analytics</h2>
          <div id="logsGraphCard" class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 mb-3">
            <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-2">
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Activity Trend</p>
              <div id="logsAnalyticsTypeFilterWrap" class="w-full sm:w-auto">
                <label for="logsAnalyticsTypeFilter" class="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">Analytics View</label>
                <select id="logsAnalyticsTypeFilter" class="w-full sm:w-56 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:ring-blue-500 focus:border-blue-500">
                  <option value="overview">Overview</option>
                  <option value="daily_activity">Daily Activity (7 Days)</option>
                  <option value="action_breakdown">Action Breakdown</option>
                  <option value="hourly_activity">Hourly Activity</option>
                  <option value="face_detection_avg">Face Detection Average</option>
                  <option value="vface_verification_avg">VFace Verification Average</option>
                  <option value="place_insights">Place Insights</option>
                  <option value="guest_insights">Guest Insights</option>
                  <option value="time_insights">Time Insights</option>
                  <option value="outcome_insights">Outcome Insights</option>
                </select>
              </div>
            </div>
            <div id="logsAnalyticsChart" class="h-32">
              <p class="text-xs text-gray-500 dark:text-gray-400">No data</p>
            </div>
          </div>
          <div id="logsAnalyticsDetails" class="space-y-3">
            <div class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Visible Logs</p>
              <p id="logsAnalyticsTotal" class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">0</p>
            </div>
            <div class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Today</p>
              <p id="logsAnalyticsToday" class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">0</p>
            </div>
            <div class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Unresolved Flagged Visits</p>
              <p id="logsAnalyticsFlagged" class="text-2xl font-semibold text-amber-700 dark:text-amber-400 mt-1">0</p>
            </div>
            <div class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Top Actions</p>
              <div id="logsAnalyticsTopActions" class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p class="text-xs text-gray-500 dark:text-gray-400">No data</p>
              </div>
            </div>
            <div id="logsAnalyticsInsightsPanel" class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 md:col-span-2 xl:col-span-3">
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Analytics</p>
              <div id="logsStatisticsTabContent" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 text-sm text-gray-700 dark:text-gray-300">
                <p class="text-xs text-gray-500 dark:text-gray-400">No data</p>
              </div>
            </div>
          </div>
        </aside>

        <section id="logsMainPane" class="xl:col-span-9 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 h-full flex flex-col">
          <div class="flex flex-col gap-4 mb-4">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">System Logs</h2>
              <button
                id="refreshLogsBtn"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                Refresh Logs
              </button>
            </div>

            <div class="flex flex-row flex-wrap gap-2">
              <button id="logsTabAll" class="px-3 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 text-sm">All</button>
              <button id="logsTabGate" class="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">Gate</button>
              <button id="logsTabPlace" class="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">Place</button>
              <button id="logsTabPersonnel" class="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">Personnel</button>
              <button id="logsTabAccount" class="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">Account</button>
              <button id="logsTabSchedules" class="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">Schedules</button>
              <button id="logsTabFeedback" class="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">Feedback</button>
            </div>

            <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-3">
              <div class="flex flex-col md:flex-row gap-3 md:items-end">
                <div class="relative flex-1">
                  <label for="logsSearchInput" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Logs</label>
                  <input
                    type="text"
                    id="logsSearchInput"
                    placeholder="Search by user, action, or details..."
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                  >
                </div>
                <div class="flex-shrink-0">
                  <button
                    id="logsFiltersDropdownBtn"
                    class="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Filters
                    <svg class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              <div id="logsFiltersDropdown" class="hidden relative">
                <div class="absolute z-20 right-0 w-full sm:w-auto min-w-[280px] max-w-full sm:max-w-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg p-4 space-y-4">
                  <div class="flex-1">
                    <label for="actionFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Action Type</label>
                    <select id="actionFilter" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full">
                      <option value="all">All Actions</option>
                    </select>
                  </div>
                  <div class="flex-1">
                    <label for="logsGenderFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                    <select id="logsGenderFilter" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full">
                      <option value="all">All Genders</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="unknown">Unknown / Not Set</option>
                    </select>
                  </div>
                  <div class="flex flex-col sm:flex-row gap-4">
                    <div class="flex-1">
                      <label for="logsStartDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                      <input type="date" id="logsStartDate" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full">
                    </div>
                    <div class="flex-1">
                      <label for="logsEndDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                      <input type="date" id="logsEndDate" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full">
                    </div>
                  </div>
                  <div class="flex flex-col sm:flex-row gap-2 sm:items-end">
                    <button id="clearLogsDateFilterBtn" class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm">Clear Dates</button>
                    <button id="cleanupVisitsBtn" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm">Cleanup Past Visits</button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div id="logsList" class="logs-container flex-1 min-h-0"></div>
          <div id="logsPagination" class="mt-3"></div>
        </section>
      </div>
    </div>
  `;
}
