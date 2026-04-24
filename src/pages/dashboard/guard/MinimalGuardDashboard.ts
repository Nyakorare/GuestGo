function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderMinimalGuardDashboard(): string {
  return `
    <div class="border border-gray-200 dark:border-gray-700 rounded-lg">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Scan History</h2>
        <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
          <p id="guardExpectedVisitorsTodayText" class="text-sm text-gray-700 dark:text-gray-300">
            Expected visitors today: <span id="guardExpectedVisitorsTodayCount">0</span>
          </p>
          <button
            id="refreshGuardBtn"
            class="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Refresh
          </button>
        </div>
      </div>

      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            type="text"
            id="guardSearchInput"
            placeholder="Search by action, visit ID, or date..."
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          >
          <select
            id="guardActionFilter"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Actions</option>
            <option value="entrance">Entrance</option>
            <option value="exit">Exit</option>
            <option value="temporary_exit">Temporary Exit</option>
          </select>
        </div>
      </div>

      <div class="p-4">
        <div class="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div id="guardAnalyticsContainer" class="xl:col-span-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4"></div>

          <div class="xl:col-span-8 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-700/40 text-left text-gray-700 dark:text-gray-300">
                  <tr>
                    <th class="px-4 py-3 font-medium">Action</th>
                    <th class="px-4 py-3 font-medium">Visit ID</th>
                    <th class="px-4 py-3 font-medium">Timestamp</th>
                    <th class="px-4 py-3 font-medium text-right">Details</th>
                  </tr>
                </thead>
                <tbody id="guardScanHistoryList" class="divide-y divide-gray-200 dark:divide-gray-700"></tbody>
              </table>
            </div>

            <div id="guardScanHistoryPagination" class="p-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <button id="guardPrevPageBtn" class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 disabled:opacity-50">
                Previous
              </button>
              <span id="guardPageInfo" class="text-sm text-gray-700 dark:text-gray-300">Page 1</span>
              <button id="guardNextPageBtn" class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderGuardScanHistoryRows(scanHistory: any[]): string {
  return scanHistory.map((scan) => {
    const details = scan.details || {};
    const normalizedAction = (details.action || '').toLowerCase() || (scan.action === 'visit_temporary_exit' ? 'temporary_exit' : 'unknown');
    const visitId = details.visit_id || 'Unknown';
    const timestamp = new Date(scan.created_at);

    const actionLabel = normalizedAction === 'temporary_exit'
      ? 'Temporary Exit'
      : normalizedAction.charAt(0).toUpperCase() + normalizedAction.slice(1);

    const actionBadgeClass =
      normalizedAction === 'entrance'
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        : normalizedAction === 'exit'
          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          : normalizedAction === 'temporary_exit'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';

    return `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
        <td class="px-4 py-3">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${actionBadgeClass}">
            ${escapeHtml(actionLabel)}
          </span>
        </td>
        <td class="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
          ${escapeHtml(String(visitId))}
        </td>
        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">
          ${escapeHtml(`${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`)}
        </td>
        <td class="px-4 py-3 text-right">
          <button
            onclick="viewGuardScanDetails('${escapeHtml(String(scan.id))}')"
            class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            View
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

