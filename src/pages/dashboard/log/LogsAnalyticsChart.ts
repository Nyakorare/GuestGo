export type LogsAnalyticsChartType =
  | 'daily_activity'
  | 'action_breakdown'
  | 'hourly_activity'
  | 'face_detection_avg'
  | 'vface_verification_avg';
export type LogsViewMode = 'logs' | 'analytics';

function normalizePercentLike(value: unknown): number | null {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return null;
  if (numeric < 0) return null;
  return numeric > 1 ? numeric / 100 : numeric;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseDetails(log: any): Record<string, any> {
  if (!log?.details) return {};
  if (typeof log.details === 'object') return log.details;
  if (typeof log.details === 'string') {
    try {
      return JSON.parse(log.details);
    } catch (_) {
      return {};
    }
  }
  return {};
}

function renderDonutChart(
  rows: Array<{ label: string; count: number; color: string; percent: number; tooltip: string }>,
  centerTitle: string,
  centerValue: string,
  centerSubLabel: string
): string {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  if (total <= 0) {
    return '<p class="text-xs text-gray-500 dark:text-gray-400">No data</p>';
  }

  const circumference = 2 * Math.PI * 42;
  let offset = 0;
  const slices = rows.map((row) => {
    const length = (row.count / total) * circumference;
    const slice = `
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="transparent"
        stroke="${row.color}"
        stroke-width="16"
        stroke-linecap="butt"
        stroke-dasharray="${length.toFixed(2)} ${circumference.toFixed(2)}"
        stroke-dashoffset="${(-offset).toFixed(2)}"
        transform="rotate(-90 50 50)"
        class="transition-opacity duration-200 hover:opacity-85"
      >
        <title>${escapeHtml(row.tooltip)}</title>
      </circle>
    `;
    offset += length;
    return slice;
  }).join('');

  const legend = rows.map((row) => `
    <div class="flex items-center justify-between gap-2 text-[11px] text-gray-600 dark:text-gray-300">
      <span class="inline-flex items-center gap-2 truncate">
        <span class="inline-block w-2.5 h-2.5 rounded-full" style="background:${row.color}"></span>
        ${escapeHtml(row.label)}
      </span>
      <span class="font-semibold text-gray-900 dark:text-white">${row.percent.toFixed(1)}%</span>
    </div>
  `).join('');

  return `
    <div class="h-full flex flex-col sm:flex-row sm:items-center gap-3">
      <div class="w-full sm:w-1/2 flex justify-center">
        <div class="relative w-36 h-36">
          <svg viewBox="0 0 100 100" class="w-full h-full">
            <circle cx="50" cy="50" r="42" fill="transparent" stroke="#e5e7eb" stroke-width="16"></circle>
            ${slices}
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <p class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">${escapeHtml(centerTitle)}</p>
            <p class="text-xl font-semibold text-gray-900 dark:text-white">${escapeHtml(centerValue)}</p>
            <p class="text-[10px] text-gray-500 dark:text-gray-400">${escapeHtml(centerSubLabel)}</p>
          </div>
        </div>
      </div>
      <div class="w-full sm:w-1/2 space-y-1.5">
        ${legend}
      </div>
    </div>
  `;
}

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
  if (type === 'face_detection_avg') {
    let totalSamples = 0;
    let confidenceSum = 0;
    let highConfidence = 0;
    let lowConfidence = 0;
    let noFaceData = 0;

    logs.forEach((log) => {
      const details = parseDetails(log);
      const confidence = normalizePercentLike(
        details.face_detection_confidence
        ?? details.detection_confidence
        ?? details.confidence
        ?? log?.face_detection_confidence
      );
      if (confidence === null) {
        noFaceData += 1;
        return;
      }
      totalSamples += 1;
      confidenceSum += confidence;
      if (confidence >= 0.5) highConfidence += 1;
      else lowConfidence += 1;
    });

    if (totalSamples === 0) {
      return '<p class="text-xs text-gray-500 dark:text-gray-400">No face detection confidence data</p>';
    }

    const averagePercent = (confidenceSum / totalSamples) * 100;
    const rows = [
      {
        label: 'High Confidence (>= 50%)',
        count: highConfidence,
        color: '#22c55e',
        percent: totalSamples > 0 ? (highConfidence / totalSamples) * 100 : 0,
        tooltip: `High confidence: ${highConfidence}/${totalSamples} (${((highConfidence / totalSamples) * 100).toFixed(1)}%)`
      },
      {
        label: 'Low Confidence (< 50%)',
        count: lowConfidence,
        color: '#f59e0b',
        percent: totalSamples > 0 ? (lowConfidence / totalSamples) * 100 : 0,
        tooltip: `Low confidence: ${lowConfidence}/${totalSamples} (${((lowConfidence / totalSamples) * 100).toFixed(1)}%)`
      },
      {
        label: 'No Face Data',
        count: noFaceData,
        color: '#94a3b8',
        percent: logs.length > 0 ? (noFaceData / logs.length) * 100 : 0,
        tooltip: `No face data: ${noFaceData}/${logs.length} (${(logs.length > 0 ? (noFaceData / logs.length) * 100 : 0).toFixed(1)}%)`
      }
    ].filter((row) => row.count > 0);

    return renderDonutChart(
      rows,
      'Average',
      `${averagePercent.toFixed(1)}%`,
      `${totalSamples} face scans`
    );
  }

  if (type === 'vface_verification_avg') {
    let samples = 0;
    let similaritySum = 0;
    let verified = 0;
    let notVerified = 0;

    logs.forEach((log) => {
      const details = parseDetails(log);
      const similarity = normalizePercentLike(
        details.verification_similarity
        ?? details.face_verification_similarity
        ?? details.similarity
        ?? details.verification_score
      );
      const explicitMatch = details.face_verified ?? details.verification_match ?? details.match;
      if (similarity === null && typeof explicitMatch !== 'boolean') {
        return;
      }
      const normalizedSimilarity = similarity ?? 0;
      samples += 1;
      similaritySum += normalizedSimilarity;
      const match = typeof explicitMatch === 'boolean' ? explicitMatch : normalizedSimilarity >= 0.5;
      if (match) verified += 1;
      else notVerified += 1;
    });

    if (samples === 0) {
      return '<p class="text-xs text-gray-500 dark:text-gray-400">No vface verification data</p>';
    }

    const avgSimilarityPercent = (similaritySum / samples) * 100;
    const rows = [
      {
        label: 'Verified Match',
        count: verified,
        color: '#3b82f6',
        percent: (verified / samples) * 100,
        tooltip: `Verified: ${verified}/${samples} (${((verified / samples) * 100).toFixed(1)}%)`
      },
      {
        label: 'Not Verified',
        count: notVerified,
        color: '#ef4444',
        percent: (notVerified / samples) * 100,
        tooltip: `Not verified: ${notVerified}/${samples} (${((notVerified / samples) * 100).toFixed(1)}%)`
      }
    ].filter((row) => row.count > 0);

    return renderDonutChart(
      rows,
      'Avg Similarity',
      `${avgSimilarityPercent.toFixed(1)}%`,
      `${samples} verifications`
    );
  }

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

    const total = series.reduce((sum, item) => sum + item.count, 0);
    const colors = ['#3b82f6', '#6366f1', '#06b6d4', '#8b5cf6', '#22c55e', '#f59e0b'];
    const rows = series.map((entry) => ({
      label: entry.label,
      count: entry.count,
      color: colors[entry.index % colors.length],
      percent: total > 0 ? (entry.count / total) * 100 : 0,
      tooltip: `${entry.label}: ${entry.count} (${(total > 0 ? (entry.count / total) * 100 : 0).toFixed(1)}%)`
    }));
    return renderDonutChart(rows, 'Actions', String(total), 'total logs');
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

    const total = series.reduce((sum, item) => sum + item.count, 0);
    const colors = ['#10b981', '#14b8a6', '#06b6d4', '#22c55e', '#0ea5e9', '#2dd4bf'];
    const rows = series.map((entry, index) => ({
      label: entry.label,
      count: entry.count,
      color: colors[index % colors.length],
      percent: total > 0 ? (entry.count / total) * 100 : 0,
      tooltip: `${entry.label}: ${entry.count} (${(total > 0 ? (entry.count / total) * 100 : 0).toFixed(1)}%)`
    }));
    return renderDonutChart(rows, 'Hours', String(total), 'active logs');
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

  const total = series.reduce((sum, item) => sum + item.count, 0);
  const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#06b6d4', '#0ea5e9', '#22c55e'];
  const rows = series.map((entry, index) => ({
    label: entry.label,
    count: entry.count,
    color: colors[index % colors.length],
    percent: total > 0 ? (entry.count / total) * 100 : 0,
    tooltip: `${entry.label}: ${entry.count} (${(total > 0 ? (entry.count / total) * 100 : 0).toFixed(1)}%)`
  }));

  return renderDonutChart(rows, '7-Day', String(total), 'visible logs');
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
