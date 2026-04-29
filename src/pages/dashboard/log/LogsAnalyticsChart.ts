export type LogsAnalyticsChartType = 'daily_activity' | 'action_breakdown' | 'hourly_activity';
export type LogsViewMode = 'logs' | 'analytics';

function renderCompactDailyChart(logs: any[]): string {
  const today = new Date();
  const series: Array<{ key: string; label: string; count: number }> = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    series.push({ key, label, count: 0 });
  }

  const indexByKey = new Map(series.map((entry) => [entry.key, entry]));
  logs.forEach((log) => {
    try {
      const key = new Date(log.created_at).toISOString().slice(0, 10);
      const day = indexByKey.get(key);
      if (day) day.count += 1;
    } catch (_) {
      // ignore invalid dates
    }
  });

  const maxCount = Math.max(1, ...series.map((entry) => entry.count));
  const compactPalette = [
    'bg-sky-400/90 dark:bg-sky-300/90',
    'bg-blue-400/90 dark:bg-blue-300/90',
    'bg-indigo-400/90 dark:bg-indigo-300/90',
    'bg-violet-400/90 dark:bg-violet-300/90',
    'bg-fuchsia-400/90 dark:bg-fuchsia-300/90',
    'bg-cyan-400/90 dark:bg-cyan-300/90',
    'bg-emerald-400/90 dark:bg-emerald-300/90',
  ];
  const bars = series.map((entry, index) => {
    const height = Math.max(6, Math.round((entry.count / maxCount) * 100));
    const color = compactPalette[index % compactPalette.length];
    return `
      <div class="flex flex-col items-center justify-end gap-1 h-full group">
        <span class="text-[10px] text-gray-500 dark:text-gray-400">${entry.count}</span>
        <div class="w-full max-w-6 rounded-sm ${color} transition-all duration-300 group-hover:opacity-90" style="height:${height}%"></div>
        <span class="text-[10px] text-gray-500 dark:text-gray-400">${entry.label}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="h-full">
      <div class="grid grid-cols-7 gap-2 items-end h-full">
        ${bars}
      </div>
    </div>
  `;
}

function renderInteractiveChart(logs: any[], type: LogsAnalyticsChartType): string {
  if (type === 'action_breakdown') {
    const counts = new Map<string, number>();
    logs.forEach((log) => {
      const action = String(log?.action || 'unknown').replace(/_/g, ' ');
      counts.set(action, (counts.get(action) || 0) + 1);
    });

    const series = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, count], index) => ({ label, count, index }));

    if (!series.length) return '<p class="text-xs text-gray-500 dark:text-gray-400">No data</p>';

    const maxCount = Math.max(1, ...series.map((entry) => entry.count));
    const palette = ['bg-blue-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500'];
    const dotPalette = ['bg-blue-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500'];
    const bars = series.map((entry) => {
      const width = Math.max(10, Math.round((entry.count / maxCount) * 100));
      const color = palette[entry.index % palette.length];
      return `
        <div class="group">
          <div class="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300 mb-1">
            <span class="truncate pr-2">${entry.label}</span>
            <span class="font-semibold text-gray-900 dark:text-white">${entry.count}</span>
          </div>
          <div class="h-2.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div class="${color} h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-90" style="width:${width}%"></div>
          </div>
        </div>
      `;
    }).join('');

    const legend = series.map((entry) => `
      <div class="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300">
        <span class="truncate inline-flex items-center gap-2"><span class="inline-block w-2 h-2 rounded-full ${dotPalette[entry.index % dotPalette.length]}"></span>${entry.label}</span>
        <span class="font-medium">${entry.count}</span>
      </div>
    `).join('');

    return `
      <div class="h-full overflow-y-auto pr-1 space-y-2">
        ${bars}
      </div>
      <div class="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <p class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Legend</p>
        <div class="space-y-1">${legend}</div>
      </div>
    `;
  }

  if (type === 'hourly_activity') {
    const hourly = Array.from({ length: 24 }, (_, hour) => ({ label: `${hour.toString().padStart(2, '0')}:00`, count: 0 }));
    logs.forEach((log) => {
      try {
        const hour = new Date(log.created_at).getHours();
        if (hour >= 0 && hour < 24) hourly[hour].count += 1;
      } catch (_) {
        // ignore invalid dates
      }
    });
    const series = hourly.filter((entry) => entry.count > 0).slice(0, 12);
    if (!series.length) return '<p class="text-xs text-gray-500 dark:text-gray-400">No data</p>';

    const maxCount = Math.max(1, ...series.map((entry) => entry.count));
    const hourPalette = ['bg-emerald-500/90 dark:bg-emerald-400/90', 'bg-teal-500/90 dark:bg-teal-400/90', 'bg-cyan-500/90 dark:bg-cyan-400/90'];
    const bars = series.map((entry, index) => {
      const height = Math.max(8, Math.round((entry.count / maxCount) * 100));
      const color = hourPalette[index % hourPalette.length];
      return `
        <div class="flex flex-col items-center justify-end gap-1 h-full group">
          <span class="text-[10px] text-gray-500 dark:text-gray-400">${entry.count}</span>
          <div class="w-full max-w-7 rounded-sm ${color} transition-all duration-500 group-hover:opacity-90 group-hover:scale-y-105 origin-bottom" style="height:${height}%"></div>
          <span class="text-[10px] text-gray-500 dark:text-gray-400">${entry.label}</span>
        </div>
      `;
    }).join('');
    const legend = series.map((entry, index) => `
      <div class="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300">
        <span class="inline-flex items-center gap-2"><span class="inline-block w-2 h-2 rounded-full ${hourPalette[index % hourPalette.length]}"></span>${entry.label}</span>
        <span class="font-medium">${entry.count}</span>
      </div>
    `).join('');

    return `
      <div class="h-full">
        <div class="grid grid-cols-6 gap-2 items-end h-[70%]">
          ${bars}
        </div>
        <div class="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Legend</p>
          <div class="grid grid-cols-2 gap-x-3 gap-y-1">${legend}</div>
        </div>
      </div>
    `;
  }

  const today = new Date();
  const series: Array<{ key: string; label: string; count: number }> = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    series.push({ key, label, count: 0 });
  }

  const indexByKey = new Map(series.map((entry) => [entry.key, entry]));
  logs.forEach((log) => {
    try {
      const key = new Date(log.created_at).toISOString().slice(0, 10);
      const day = indexByKey.get(key);
      if (day) day.count += 1;
    } catch (_) {
      // ignore invalid dates
    }
  });

  const maxCount = Math.max(1, ...series.map((entry) => entry.count));
  const dailyPalette = ['bg-blue-500/90 dark:bg-blue-400/90', 'bg-indigo-500/90 dark:bg-indigo-400/90', 'bg-violet-500/90 dark:bg-violet-400/90', 'bg-fuchsia-500/90 dark:bg-fuchsia-400/90', 'bg-cyan-500/90 dark:bg-cyan-400/90', 'bg-sky-500/90 dark:bg-sky-400/90', 'bg-emerald-500/90 dark:bg-emerald-400/90'];
  const bars = series.map((entry, index) => {
    const height = Math.max(6, Math.round((entry.count / maxCount) * 100));
    const color = dailyPalette[index % dailyPalette.length];
    return `
      <div class="flex flex-col items-center justify-end gap-1 h-full group">
        <span class="text-[10px] text-gray-500 dark:text-gray-400">${entry.count}</span>
        <div class="w-full max-w-6 rounded-sm ${color} transition-all duration-500 group-hover:opacity-90 group-hover:scale-y-105 origin-bottom" style="height:${height}%"></div>
        <span class="text-[10px] text-gray-500 dark:text-gray-400">${entry.label}</span>
      </div>
    `;
  }).join('');

  const legend = series.map((entry, index) => `
    <div class="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300">
      <span class="inline-flex items-center gap-2"><span class="inline-block w-2 h-2 rounded-full ${dailyPalette[index % dailyPalette.length]}"></span>${entry.label}</span>
      <span class="font-medium">${entry.count}</span>
    </div>
  `).join('');

  return `
    <div class="h-full">
      <div class="grid grid-cols-7 gap-2 items-end h-[68%]">
        ${bars}
      </div>
      <div class="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <p class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Legend</p>
        <div class="grid grid-cols-2 gap-x-3 gap-y-1">${legend}</div>
      </div>
    </div>
  `;
}

export function renderLogsAnalyticsChart(
  logs: any[],
  type: LogsAnalyticsChartType,
  mode: LogsViewMode
): string {
  if (mode === 'logs') {
    return renderCompactDailyChart(logs);
  }
  return renderInteractiveChart(logs, type);
}
