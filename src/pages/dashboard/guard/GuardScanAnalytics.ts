function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderGuardAnalyticsChart(scanHistory: any[], range: string = 'all_time'): string {
  const today = new Date();
  const rangeLower = range.toLowerCase();

  const filteredForRange = scanHistory.filter((scan) => {
    const ts = new Date(scan.created_at);
    if (Number.isNaN(ts.getTime())) return false;

    if (rangeLower === 'today') {
      return ts.toDateString() === today.toDateString();
    }
    if (rangeLower === 'last_7_days') {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return ts >= start;
    }
    if (rangeLower === 'last_30_days') {
      const start = new Date(today);
      start.setDate(today.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return ts >= start;
    }
    if (rangeLower === 'last_90_days') {
      const start = new Date(today);
      start.setDate(today.getDate() - 89);
      start.setHours(0, 0, 0, 0);
      return ts >= start;
    }
    return true;
  });

  const days: { key: string; label: string; entrance: number; exit: number; temporary_exit: number }[] = [];

  if (rangeLower === 'all_time') {
    const monthMap = new Map<string, { key: string; label: string; entrance: number; exit: number; temporary_exit: number }>();
    for (const scan of filteredForRange) {
      const ts = new Date(scan.created_at);
      if (Number.isNaN(ts.getTime())) continue;
      const key = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, {
          key,
          label: ts.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
          entrance: 0,
          exit: 0,
          temporary_exit: 0
        });
      }
    }
    const sorted = Array.from(monthMap.values()).sort((a, b) => a.key.localeCompare(b.key));
    const recent = sorted.slice(-12);
    days.push(...recent);
  } else {
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      days.push({ key, label, entrance: 0, exit: 0, temporary_exit: 0 });
    }
  }

  const dayMap = new Map(days.map((d) => [d.key, d]));

  for (const scan of filteredForRange) {
    const details = scan.details || {};
    const action = (details.action || '').toLowerCase() || (scan.action === 'visit_temporary_exit' ? 'temporary_exit' : '');
    if (!['entrance', 'exit', 'temporary_exit'].includes(action)) continue;
    const ts = new Date(scan.created_at);
    if (Number.isNaN(ts.getTime())) continue;
    const key = rangeLower === 'all_time'
      ? `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}`
      : ts.toISOString().slice(0, 10);
    const day = dayMap.get(key);
    if (!day) continue;
    (day as any)[action] += 1;
  }

  if (days.length === 0) {
    if (rangeLower === 'all_time') {
      const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      days.push({
        key,
        label: today.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
        entrance: 0,
        exit: 0,
        temporary_exit: 0
      });
    } else {
      const key = today.toISOString().slice(0, 10);
      days.push({
        key,
        label: today.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        entrance: 0,
        exit: 0,
        temporary_exit: 0
      });
    }
  }

  const yMax = Math.max(5, ...days.map((d) => d.entrance + d.exit + d.temporary_exit));
  const plotLeft = 9;
  const plotRight = 98;
  const chartTop = 8;
  const chartBottom = 76;
  const chartHeight = chartBottom - chartTop;
  const plotWidth = plotRight - plotLeft;
  const pointStep = days.length > 1 ? plotWidth / (days.length - 1) : plotWidth;

  const legend = `
    <div class="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-300">
      <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>Entrance</span>
      <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>Exit</span>
      <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>Temporary Exit</span>
    </div>
  `;

  const toY = (value: number) => chartBottom - ((value / yMax) * chartHeight);
  const pointsFor = (key: 'entrance' | 'exit' | 'temporary_exit') => days.map((day, index) => ({
    x: days.length > 1 ? plotLeft + (index * pointStep) : (plotLeft + plotRight) / 2,
    y: toY(day[key]),
    label: day.label,
    value: day[key]
  }));

  const toSmoothPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length <= 1) {
      return points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
    }

    let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    for (let i = 0; i < points.length - 1; i += 1) {
      const current = points[i];
      const next = points[i + 1];
      const midX = (current.x + next.x) / 2;
      d += ` C ${midX.toFixed(2)} ${current.y.toFixed(2)}, ${midX.toFixed(2)} ${next.y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
    }
    return d;
  };

  const toAreaPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return '';
    return `${toSmoothPath(points)} L ${points[points.length - 1].x.toFixed(2)} ${chartBottom} L ${points[0].x.toFixed(2)} ${chartBottom} Z`;
  };

  const entrancePoints = pointsFor('entrance');
  const exitPoints = pointsFor('exit');
  const temporaryExitPoints = pointsFor('temporary_exit');
  const totalSeries = days.map((d) => d.entrance + d.exit + d.temporary_exit);
  const peakIndex = totalSeries.indexOf(Math.max(...totalSeries));
  const peakLabel = peakIndex >= 0 ? days[peakIndex].label : '-';
  const peakValue = peakIndex >= 0 ? totalSeries[peakIndex] : 0;

  const totals = days.reduce((acc, d) => {
    acc.entrance += d.entrance;
    acc.exit += d.exit;
    acc.temporary_exit += d.temporary_exit;
    return acc;
  }, { entrance: 0, exit: 0, temporary_exit: 0 });

  const yGrid = [0, 0.25, 0.5, 0.75, 1].map((step) => {
    const value = Math.round(yMax * (1 - step));
    const y = chartTop + (chartHeight * step);
    return `
      <line x1="${plotLeft}" y1="${y}" x2="${plotRight}" y2="${y}" stroke="currentColor" stroke-opacity="${step === 1 ? '0.35' : '0.14'}" />
      <text x="${plotLeft - 0.8}" y="${y + 0.9}" text-anchor="end" font-size="2.2" fill="currentColor" opacity="0.75">${value}</text>
    `;
  }).join('');

  const periodLabel =
    rangeLower === 'today' ? 'Today' :
    rangeLower === 'last_7_days' ? 'Last 7 Days' :
    rangeLower === 'last_30_days' ? 'Last 30 Days' :
    rangeLower === 'last_90_days' ? 'Last 90 Days' :
    'All Time (last 12 months view)';

  const avgPerPeriod = Math.round(((totals.entrance + totals.exit + totals.temporary_exit) / Math.max(1, days.length)) * 10) / 10;
  const xLabelInterval = Math.max(1, Math.ceil(days.length / 6));
  const xAxisLabels = days.map((day, index) => {
    const shouldRender = index === 0 || index === days.length - 1 || index % xLabelInterval === 0;
    if (!shouldRender) return '<div></div>';
    return `<div class="text-[10px] leading-3 text-center text-gray-500 dark:text-gray-300">${escapeHtml(day.label)}</div>`;
  }).join('');

  const renderSeriesPoints = (points: Array<{ x: number; y: number; label: string; value: number }>, color: string, seriesLabel: string) =>
    points.map((point) => `
      <circle
        cx="${point.x.toFixed(2)}"
        cy="${point.y.toFixed(2)}"
        r="1.1"
        fill="${color}"
        stroke="white"
        stroke-width="0.45"
        class="guard-analytics-tooltip-target"
        data-tip="${escapeHtml(`${seriesLabel} | ${point.label} | ${point.value}`)}"
      ></circle>
    `).join('');

  return `
    <div class="space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Scan Analytics</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">${periodLabel}</p>
        </div>
        <div class="flex items-center gap-2">
          <select id="guardAnalyticsRangeFilter" class="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <option value="today" ${rangeLower === 'today' ? 'selected' : ''}>Today</option>
            <option value="last_7_days" ${rangeLower === 'last_7_days' ? 'selected' : ''}>Last 7 Days</option>
            <option value="last_30_days" ${rangeLower === 'last_30_days' ? 'selected' : ''}>Last 30 Days</option>
            <option value="last_90_days" ${rangeLower === 'last_90_days' ? 'selected' : ''}>Last 90 Days</option>
            <option value="all_time" ${rangeLower === 'all_time' ? 'selected' : ''}>All Time</option>
          </select>
          <button
            id="guardAnalyticsFullscreenBtn"
            type="button"
            title="Toggle fullscreen"
            aria-label="Toggle fullscreen"
            class="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 3H5a2 2 0 00-2 2v3m16 0V5a2 2 0 00-2-2h-3m-6 18H5a2 2 0 01-2-2v-3m16 0v3a2 2 0 01-2 2h-3"></path>
            </svg>
          </button>
        </div>
      </div>
      <div>
        ${legend}
      </div>
      <style>
        #guardAnalyticsChartShell:fullscreen, #guardAnalyticsChartShell:-webkit-full-screen {
          width: 100vw;
          height: 100vh;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #ffffff;
        }
        .dark #guardAnalyticsChartShell:fullscreen, .dark #guardAnalyticsChartShell:-webkit-full-screen {
          background: #111827;
        }
        #guardAnalyticsChartShell:fullscreen .guard-analytics-chart-svg,
        #guardAnalyticsChartShell:-webkit-full-screen .guard-analytics-chart-svg {
          height: 64vh;
        }
        #guardAnalyticsChartShell:fullscreen .guard-analytics-bottom-stats,
        #guardAnalyticsChartShell:-webkit-full-screen .guard-analytics-bottom-stats {
          margin-top: 0.75rem;
        }
      </style>
      <div id="guardAnalyticsChartShell" class="relative w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2">
        <svg viewBox="0 0 100 86" class="guard-analytics-chart-svg w-full h-56 md:h-64 lg:h-72 text-gray-500 dark:text-gray-400" role="img" aria-label="Guard scan activity line chart" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="entranceAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#22c55e" stop-opacity="0.22"></stop>
              <stop offset="100%" stop-color="#22c55e" stop-opacity="0"></stop>
            </linearGradient>
          </defs>
          ${yGrid}
          <line x1="${plotLeft}" y1="${chartBottom}" x2="${plotRight}" y2="${chartBottom}" stroke="currentColor" stroke-opacity="0.35" />
          <line x1="${plotLeft}" y1="${chartTop}" x2="${plotLeft}" y2="${chartBottom}" stroke="currentColor" stroke-opacity="0.2" />
          <path d="${toAreaPath(entrancePoints)}" fill="url(#entranceAreaGradient)"></path>
          <path d="${toSmoothPath(entrancePoints)}" fill="none" stroke="#22c55e" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
          <path d="${toSmoothPath(exitPoints)}" fill="none" stroke="#ef4444" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
          <path d="${toSmoothPath(temporaryExitPoints)}" fill="none" stroke="#eab308" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
          <path d="${toSmoothPath(entrancePoints)}" fill="none" stroke="transparent" stroke-width="7" class="guard-analytics-tooltip-target" data-tip="Entrance line"></path>
          <path d="${toSmoothPath(exitPoints)}" fill="none" stroke="transparent" stroke-width="7" class="guard-analytics-tooltip-target" data-tip="Exit line"></path>
          <path d="${toSmoothPath(temporaryExitPoints)}" fill="none" stroke="transparent" stroke-width="7" class="guard-analytics-tooltip-target" data-tip="Temporary Exit line"></path>
          ${renderSeriesPoints(entrancePoints, '#22c55e', 'Entrance')}
          ${renderSeriesPoints(exitPoints, '#ef4444', 'Exit')}
          ${renderSeriesPoints(temporaryExitPoints, '#eab308', 'Temporary Exit')}
        </svg>
        <div
          id="guardAnalyticsTooltip"
          class="pointer-events-none hidden absolute z-20 px-2 py-1 text-xs rounded-md bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 shadow-lg"
        ></div>
        <div class="mt-2 grid gap-1" style="grid-template-columns: repeat(${days.length}, minmax(0, 1fr));">
          ${xAxisLabels}
        </div>
        <div class="guard-analytics-bottom-stats mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div class="rounded-md border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-2.5">
            <p class="text-[11px] uppercase tracking-wide text-green-700 dark:text-green-300">Entrance</p>
            <p class="text-lg font-semibold text-green-800 dark:text-green-200">${totals.entrance}</p>
          </div>
          <div class="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-2.5">
            <p class="text-[11px] uppercase tracking-wide text-red-700 dark:text-red-300">Exit</p>
            <p class="text-lg font-semibold text-red-800 dark:text-red-200">${totals.exit}</p>
          </div>
          <div class="rounded-md border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-2.5">
            <p class="text-[11px] uppercase tracking-wide text-yellow-700 dark:text-yellow-300">Temporary Exit</p>
            <p class="text-lg font-semibold text-yellow-800 dark:text-yellow-200">${totals.temporary_exit}</p>
          </div>
          <div class="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 p-2.5">
            <p class="text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-300">Avg Scans / Period</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">${avgPerPeriod}</p>
            <p class="text-[11px] text-gray-500 dark:text-gray-400">Peak: ${escapeHtml(peakLabel)} (${peakValue})</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
