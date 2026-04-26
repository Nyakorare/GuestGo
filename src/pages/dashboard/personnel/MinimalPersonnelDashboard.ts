function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderPersonnelAnalytics(visits: any[], rangeLabel: string): string {
  const rows = Array.isArray(visits) ? visits : [];
  const today = new Date().toISOString().slice(0, 10);
  const totals = rows.reduce((acc, visit) => {
    const status = String(visit?.status || '').toLowerCase();
    const visitDate = String(visit?.visit_date || '');
    if (visitDate === today) acc.today += 1;
    if (visitDate > today) acc.upcoming += 1;
    acc.total += 1;
    if (status === 'pending' || status === 'in_progress' || status === 'temporary_exit') acc.active += 1;
    if (status === 'completed' || status === 'completed_flagged') acc.completed += 1;
    if (status === 'unsuccessful' || status === 'failed' || status === 'cancelled') acc.unsuccessful += 1;
    const placeName = String(visit?.place_name || 'Unknown');
    acc.placeMap.set(placeName, (acc.placeMap.get(placeName) || 0) + 1);
    return acc;
  }, {
    total: 0,
    today: 0,
    upcoming: 0,
    active: 0,
    completed: 0,
    unsuccessful: 0,
    placeMap: new Map<string, number>()
  });

  const topPlaces = Array.from(totals.placeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return `
    <div class="space-y-3">
      <div>
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Personnel Analytics</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400">${escapeHtml(rangeLabel)}</p>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2">
          <p class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Visible</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">${totals.total}</p>
        </div>
        <div class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2">
          <p class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Active</p>
          <p class="text-lg font-semibold text-blue-700 dark:text-blue-300">${totals.active}</p>
        </div>
        <div class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2">
          <p class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Today</p>
          <p class="text-lg font-semibold text-emerald-700 dark:text-emerald-300">${totals.today}</p>
        </div>
        <div class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2">
          <p class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Upcoming</p>
          <p class="text-lg font-semibold text-indigo-700 dark:text-indigo-300">${totals.upcoming}</p>
        </div>
      </div>
      <div class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2">
        <p class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Top Assigned Places</p>
        <div class="space-y-1.5">
          ${topPlaces.length > 0 ? topPlaces.map(([name, count]) => `
            <div class="flex items-center justify-between gap-2 text-xs">
              <span class="truncate text-gray-700 dark:text-gray-200" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
              <span class="font-medium text-gray-900 dark:text-white">${count}</span>
            </div>
          `).join('') : `<p class="text-xs text-gray-500 dark:text-gray-400">No analytics yet.</p>`}
        </div>
      </div>
      <div class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2">
        <p class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Completed</p>
        <p class="text-base font-semibold text-green-700 dark:text-green-300">${totals.completed}</p>
        <p class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mt-2">Unsuccessful / Cancelled</p>
        <p class="text-base font-semibold text-red-700 dark:text-red-300">${totals.unsuccessful}</p>
      </div>
    </div>
  `;
}

