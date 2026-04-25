function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderMinimalVisitorDashboard(): string {
  return `
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-4 h-full items-stretch">
      <aside class="xl:col-span-3 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/60 dark:bg-gray-900/30 h-full">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Visitor Analytics</h2>
        <div class="space-y-3">
          <div class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
            <div class="flex items-center justify-between gap-2">
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Visits Trend</p>
              <select
                id="visitorAnalyticsRangeFilter"
                class="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                <option value="last_7_days" selected>Last 7 days</option>
                <option value="last_30_days">Last 30 days</option>
              </select>
            </div>
            <div id="visitorAnalyticsChart" class="mt-2 h-32">
              <p class="text-xs text-gray-500 dark:text-gray-400">No data</p>
            </div>
          </div>
          <div class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Visible Visits</p>
            <p id="visitorAnalyticsVisible" class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">0</p>
          </div>
          <div class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Today</p>
            <p id="visitorAnalyticsToday" class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">0</p>
          </div>
          <div class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Upcoming</p>
            <p id="visitorAnalyticsUpcoming" class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">0</p>
          </div>
          <div class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Past</p>
            <p id="visitorAnalyticsPast" class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">0</p>
          </div>
          <div class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Status Breakdown (Visible)</p>
            <div id="visitorAnalyticsStatusBreakdown" class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p class="text-xs text-gray-500 dark:text-gray-400">No data</p>
            </div>
          </div>
          <div class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Top Places (Visible)</p>
            <div id="visitorAnalyticsTopPlaces" class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p class="text-xs text-gray-500 dark:text-gray-400">No data</p>
            </div>
          </div>
        </div>
      </aside>

      <section class="xl:col-span-9 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 h-full flex flex-col min-h-0 flex-1">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">My Scheduled Visits</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Minimal table view with all actions available.</p>
          </div>
          <button
            id="refreshVisitorBtn"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            Refresh
          </button>
        </div>

        <div class="border-b border-gray-200 dark:border-gray-700 mb-4">
          <nav class="-mb-px flex space-x-8">
            <button
              id="visitorCurrentTab"
              class="border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 px-1 py-2 text-sm font-medium"
            >
              Current Visits
            </button>
            <button
              id="visitorPastTab"
              class="border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 px-1 py-2 text-sm font-medium"
            >
              Past Schedules
            </button>
          </nav>
        </div>

        <div id="visitorCurrentContent" class="flex flex-col gap-4 min-h-0 flex-1">
          <div class="border-b border-gray-200 dark:border-gray-700">
            <nav class="-mb-px flex space-x-8">
              <button
                id="visitorTodayTab"
                class="border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 px-1 py-2 text-sm font-medium"
              >
                Today
              </button>
              <button
                id="visitorFutureTab"
                class="border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 px-1 py-2 text-sm font-medium"
              >
                Future
              </button>
            </nav>
          </div>

          <div id="visitorTodayContent" class="flex flex-col gap-3 min-h-0 flex-1">
            <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Today's Visits</h3>
              <div class="flex items-center gap-2 w-full sm:w-auto">
                <select
                  id="visitorTodayStatusFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-56"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="unsuccessful">Unsuccessful</option>
                </select>
              </div>
            </div>

            <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex-1 min-h-0 bg-white dark:bg-gray-800">
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead class="bg-gray-50 dark:bg-gray-700/40 text-left text-gray-700 dark:text-gray-300">
                    <tr>
                      <th class="px-4 py-3 font-medium">Date</th>
                      <th class="px-4 py-3 font-medium">Purpose</th>
                      <th class="px-4 py-3 font-medium">Places</th>
                      <th class="px-4 py-3 font-medium">Status</th>
                      <th class="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody id="visitorTodayVisitsList" class="divide-y divide-gray-200 dark:divide-gray-700"></tbody>
                </table>
              </div>
            </div>
          </div>

          <div id="visitorFutureContent" class="hidden flex flex-col gap-3 min-h-0 flex-1">
            <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Future Visits</h3>
              <div class="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  id="visitorFutureDatePicker"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-56"
                  min=""
                  max=""
                >
              </div>
            </div>

            <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex-1 min-h-0 bg-white dark:bg-gray-800">
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead class="bg-gray-50 dark:bg-gray-700/40 text-left text-gray-700 dark:text-gray-300">
                    <tr>
                      <th class="px-4 py-3 font-medium">Date</th>
                      <th class="px-4 py-3 font-medium">Purpose</th>
                      <th class="px-4 py-3 font-medium">Places</th>
                      <th class="px-4 py-3 font-medium">Status</th>
                      <th class="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody id="visitorFutureVisitsList" class="divide-y divide-gray-200 dark:divide-gray-700"></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div id="visitorPastContent" class="hidden flex flex-col gap-3 min-h-0">
          <div class="flex flex-col gap-3">
            <div class="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-3">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Past Schedules</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full lg:w-auto">
                <div class="relative sm:col-span-2 lg:col-span-1">
                  <input
                    type="text"
                    id="visitorPastSearchInput"
                    placeholder="Search past schedules..."
                    class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                  >
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
                <select
                  id="visitorPastStatusFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="unsuccessful">Unsuccessful</option>
                </select>
                <select
                  id="visitorPastPlaceFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                >
                  <option value="all">All Places</option>
                </select>
                <button
                  id="visitorPastCalendarToggle"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Date Filter
                </button>
              </div>
            </div>

            <div id="visitorPastCalendarFilter" class="hidden">
              <div class="bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filter by Date Range</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label for="visitorPastStartDate" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="visitorPastStartDate"
                      class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                    >
                  </div>
                  <div>
                    <label for="visitorPastEndDate" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="visitorPastEndDate"
                      class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                    >
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Quick Select</label>
                    <div class="flex gap-1">
                      <button
                        id="visitorPastLastWeekBtn"
                        class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                      >
                        Last Week
                      </button>
                      <button
                        id="visitorPastLastMonthBtn"
                        class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                      >
                        Last Month
                      </button>
                    </div>
                  </div>
                  <div class="flex items-end">
                    <button
                      id="clearVisitorPastCalendarBtn"
                      class="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 w-full"
                    >
                      Clear Dates
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex-1 min-h-0">
            <div class="overflow-x-auto">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-700/40 text-left text-gray-700 dark:text-gray-300">
                  <tr>
                    <th class="px-4 py-3 font-medium">Date</th>
                    <th class="px-4 py-3 font-medium">Purpose</th>
                    <th class="px-4 py-3 font-medium">Places</th>
                    <th class="px-4 py-3 font-medium">Status</th>
                    <th class="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody id="visitorPastVisitsList" class="divide-y divide-gray-200 dark:divide-gray-700"></tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function renderVisitorAnalyticsStatusBreakdown(statusCounts: Record<string, number>): string {
  const entries = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return `<p class="text-xs text-gray-500 dark:text-gray-400">No data</p>`;
  }

  return entries.slice(0, 8).map(([status, count]) => `
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-700 dark:text-gray-200">${escapeHtml(status)}</span>
      <span class="text-xs font-medium text-gray-600 dark:text-gray-300">${count}</span>
    </div>
  `).join('');
}

export function renderVisitorAnalyticsTopPlaces(placeCounts: Record<string, number>): string {
  const entries = Object.entries(placeCounts)
    .filter(([name]) => Boolean(name && name.trim()))
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return `<p class="text-xs text-gray-500 dark:text-gray-400">No data</p>`;
  }

  return entries.slice(0, 8).map(([name, count]) => `
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-700 dark:text-gray-200 truncate" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
      <span class="text-xs font-medium text-gray-600 dark:text-gray-300">${count}</span>
    </div>
  `).join('');
}

export function renderVisitorAnalyticsChart(visits: any[], range: 'last_7_days' | 'last_30_days' = 'last_7_days'): string {
  const daysCount = range === 'last_30_days' ? 30 : 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: Array<{ key: string; label: string; count: number }> = [];
  for (let i = daysCount - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    days.push({ key, label, count: 0 });
  }

  const dayMap = new Map(days.map((d) => [d.key, d]));
  for (const v of (Array.isArray(visits) ? visits : [])) {
    const raw = v?.visit_date;
    const parsed = raw ? new Date(raw) : null;
    if (!parsed || Number.isNaN(parsed.getTime())) continue;
    parsed.setHours(0, 0, 0, 0);
    const key = parsed.toISOString().slice(0, 10);
    const day = dayMap.get(key);
    if (day) day.count += 1;
  }

  const max = Math.max(1, ...days.map((d) => d.count));
  const plotLeft = 6;
  const plotRight = 98;
  const chartTop = 8;
  const chartBottom = 70;
  const chartHeight = chartBottom - chartTop;
  const plotWidth = plotRight - plotLeft;
  const step = days.length > 1 ? plotWidth / (days.length - 1) : plotWidth;

  const toY = (value: number) => chartBottom - ((value / max) * chartHeight);
  const points = days.map((d, i) => ({
    x: days.length > 1 ? plotLeft + (i * step) : (plotLeft + plotRight) / 2,
    y: toY(d.count),
    label: d.label,
    value: d.count
  }));

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  const area = `${path} L ${points[points.length - 1].x.toFixed(2)} ${chartBottom} L ${points[0].x.toFixed(2)} ${chartBottom} Z`;

  const xLabelInterval = Math.max(1, Math.ceil(days.length / 5));
  const xLabels = days.map((d, i) => {
    const show = i === 0 || i === days.length - 1 || i % xLabelInterval === 0;
    return show
      ? `<div class="text-[10px] leading-3 text-center text-gray-500 dark:text-gray-300">${escapeHtml(d.label)}</div>`
      : `<div></div>`;
  }).join('');

  const total = days.reduce((acc, d) => acc + d.count, 0);

  return `
    <div class="space-y-2">
      <svg viewBox="0 0 100 78" class="w-full h-28 text-gray-500 dark:text-gray-400" role="img" aria-label="Visitor visits trend chart" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="visitorTrendArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2563eb" stop-opacity="0.20"></stop>
            <stop offset="100%" stop-color="#2563eb" stop-opacity="0"></stop>
          </linearGradient>
        </defs>
        <line x1="${plotLeft}" y1="${chartBottom}" x2="${plotRight}" y2="${chartBottom}" stroke="currentColor" stroke-opacity="0.25" />
        <path d="${area}" fill="url(#visitorTrendArea)"></path>
        <path d="${path}" fill="none" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
        ${points.map((p) => `
          <circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="1.2" fill="#2563eb" stroke="white" stroke-width="0.45"></circle>
        `).join('')}
      </svg>
      <div class="grid gap-1" style="grid-template-columns: repeat(${days.length}, minmax(0, 1fr));">
        ${xLabels}
      </div>
      <div class="text-xs text-gray-600 dark:text-gray-300 flex items-center justify-between">
        <span>Total: <span class="font-medium text-gray-900 dark:text-white">${total}</span></span>
        <span>Max/day: <span class="font-medium text-gray-900 dark:text-white">${max}</span></span>
      </div>
    </div>
  `;
}

