function parseLogDetails(log: any): Record<string, any> {
  const rawDetails = log?.details;
  if (!rawDetails) return {};
  if (typeof rawDetails === 'object') return rawDetails;
  if (typeof rawDetails === 'string') {
    try {
      return JSON.parse(rawDetails);
    } catch (_) {
      return {};
    }
  }
  return {};
}

function getVisitPlaceNames(log: any): string[] {
  const details = parseLogDetails(log);
  const names = new Set<string>();

  if (typeof details.place_name === 'string' && details.place_name.trim()) {
    names.add(details.place_name.trim());
  }

  if (Array.isArray(details.place_names)) {
    details.place_names.forEach((name: any) => {
      if (typeof name === 'string' && name.trim()) {
        names.add(name.trim());
      }
    });
  }

  if (Array.isArray(details.places)) {
    details.places.forEach((place: any) => {
      if (typeof place === 'string' && place.trim()) {
        names.add(place.trim());
      } else if (place && typeof place.name === 'string' && place.name.trim()) {
        names.add(place.name.trim());
      }
    });
  }

  return [...names];
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

type AnalyticsPreviewFilter =
  | 'overview'
  | 'daily_activity'
  | 'action_breakdown'
  | 'hourly_activity'
  | 'face_detection_avg'
  | 'vface_verification_avg'
  | 'place_insights'
  | 'guest_insights'
  | 'time_insights'
  | 'outcome_insights';

function normalizePercentLike(value: unknown): number | null {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return null;
  return numeric > 1 ? numeric / 100 : numeric;
}

export function renderLogsStatisticsTab(
  logs: any[],
  previewFilter: AnalyticsPreviewFilter = 'overview'
): string {
  const visibleLogs = Array.isArray(logs) ? logs : [];
  const visitLogs = visibleLogs.filter((log) => String(log?.action || '').startsWith('visit_'));
  const guestVisitLogs = visitLogs.filter((log) => {
    const role = String(log?.user_roles?.role || '').toLowerCase();
    return role === 'guest' || role === 'visitor';
  });

  const placeCount = new Map<string, number>();
  visitLogs.forEach((log) => {
    const placeNames = getVisitPlaceNames(log);
    placeNames.forEach((name) => {
      placeCount.set(name, (placeCount.get(name) || 0) + 1);
    });
  });

  const guestCount = new Map<string, number>();
  guestVisitLogs.forEach((log) => {
    const email = String(log?.user_roles?.email || '').trim();
    const name = `${String(log?.user_roles?.first_name || '').trim()} ${String(log?.user_roles?.last_name || '').trim()}`.trim();
    const label = name || email || 'Unknown Guest';
    guestCount.set(label, (guestCount.get(label) || 0) + 1);
  });

  const dailyVisitCount = new Map<string, number>();
  const hourlyVisitCount = new Map<number, number>();
  const weekdayVisitCount = new Map<string, number>();
  visitLogs.forEach((log) => {
    const date = new Date(log.created_at);
    const key = date.toISOString().slice(0, 10);
    dailyVisitCount.set(key, (dailyVisitCount.get(key) || 0) + 1);
    const hour = date.getHours();
    hourlyVisitCount.set(hour, (hourlyVisitCount.get(hour) || 0) + 1);
    const weekday = date.toLocaleDateString(undefined, { weekday: 'short' });
    weekdayVisitCount.set(weekday, (weekdayVisitCount.get(weekday) || 0) + 1);
  });

  const totalVisitEvents = visitLogs.length;
  const uniquePlaceCount = Math.max(placeCount.size, 1);
  const uniqueGuestCount = Math.max(guestCount.size, 1);
  const uniqueDateCount = Math.max(dailyVisitCount.size, 1);

  const averageVisitPerPlace = totalVisitEvents / uniquePlaceCount;
  const averageVisitPerGuest = guestVisitLogs.length / uniqueGuestCount;
  const averageVisitPerDate = totalVisitEvents / uniqueDateCount;

  const busiestDayEntry = [...dailyVisitCount.entries()].sort((a, b) => b[1] - a[1])[0];
  const busiestDayLabel = busiestDayEntry ? formatDayLabel(new Date(busiestDayEntry[0])) : 'N/A';
  const busiestDayCount = busiestDayEntry ? busiestDayEntry[1] : 0;
  const peakHourEntry = [...hourlyVisitCount.entries()].sort((a, b) => b[1] - a[1])[0];
  const peakHourLabel = peakHourEntry ? `${String(peakHourEntry[0]).padStart(2, '0')}:00` : 'N/A';
  const peakHourCount = peakHourEntry ? peakHourEntry[1] : 0;
  const topWeekdayEntry = [...weekdayVisitCount.entries()].sort((a, b) => b[1] - a[1])[0];
  const topWeekdayLabel = topWeekdayEntry ? topWeekdayEntry[0] : 'N/A';
  const topWeekdayCount = topWeekdayEntry ? topWeekdayEntry[1] : 0;

  const topPlaces = [...placeCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topGuests = [...guestCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const mostVisitedPlace = topPlaces[0];

  const completedVisits = visitLogs.filter((log) => {
    const action = String(log?.action || '').toLowerCase();
    return action === 'visit_completed' || action === 'visit_completed_flagged';
  }).length;
  const unsuccessfulVisits = visitLogs.filter((log) => String(log?.action || '').toLowerCase() === 'visit_unsuccessful').length;
  const completionRate = totalVisitEvents > 0 ? (completedVisits / totalVisitEvents) * 100 : 0;

  const repeatGuestCount = [...guestCount.values()].filter((count) => count > 1).length;
  const repeatGuestRate = guestCount.size > 0 ? (repeatGuestCount / guestCount.size) * 100 : 0;
  const averagePlacesPerVisit = totalVisitEvents > 0
    ? visitLogs.reduce((sum, log) => sum + Math.max(1, getVisitPlaceNames(log).length), 0) / totalVisitEvents
    : 0;

  let faceDetectionSamples = 0;
  let faceDetectionConfidenceSum = 0;
  let vfaceSamples = 0;
  let vfaceSimilaritySum = 0;
  let vfaceVerified = 0;

  visibleLogs.forEach((log) => {
    const details = parseLogDetails(log);
    const faceDetectionConfidence = normalizePercentLike(
      details.face_detection_confidence
      ?? details.detection_confidence
      ?? details.confidence
      ?? log?.face_detection_confidence
    );
    if (faceDetectionConfidence !== null) {
      faceDetectionSamples += 1;
      faceDetectionConfidenceSum += faceDetectionConfidence;
    }

    const verificationSimilarity = normalizePercentLike(
      details.verification_similarity
      ?? details.face_verification_similarity
      ?? details.similarity
      ?? details.verification_score
    );
    const explicitMatch = details.face_verified ?? details.verification_match ?? details.match;
    if (verificationSimilarity !== null || typeof explicitMatch === 'boolean') {
      const similarity = verificationSimilarity ?? 0;
      const isMatch = typeof explicitMatch === 'boolean' ? explicitMatch : similarity >= 0.5;
      vfaceSamples += 1;
      vfaceSimilaritySum += similarity;
      if (isMatch) vfaceVerified += 1;
    }
  });

  const avgFaceDetection = faceDetectionSamples > 0 ? (faceDetectionConfidenceSum / faceDetectionSamples) * 100 : 0;
  const avgVfaceSimilarity = vfaceSamples > 0 ? (vfaceSimilaritySum / vfaceSamples) * 100 : 0;
  const vfaceVerificationRate = vfaceSamples > 0 ? (vfaceVerified / vfaceSamples) * 100 : 0;

  const topPlaceMax = Math.max(1, ...topPlaces.map(([, count]) => count));
  const topGuestMax = Math.max(1, ...topGuests.map(([, count]) => count));

  const renderRankedList = (rows: Array<[string, number]>, max: number, emptyText: string) => {
    if (!rows.length) {
      return `<p class="text-xs text-gray-500 dark:text-gray-400">${emptyText}</p>`;
    }

    return rows.map(([label, count]) => {
      const width = Math.max(8, Math.round((count / max) * 100));
      return `
        <div class="space-y-1">
          <div class="flex items-center justify-between gap-2 text-sm">
            <span class="truncate text-gray-700 dark:text-gray-200">${label}</span>
            <span class="font-semibold text-gray-900 dark:text-white">${count}</span>
          </div>
          <div class="h-1.5 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div class="h-full bg-blue-500 dark:bg-blue-400" style="width:${width}%"></div>
          </div>
        </div>
      `;
    }).join('');
  };

  const placeCards = `
      <div class="rounded-md border-l-4 border-l-blue-500 border border-gray-200 dark:border-gray-700 bg-blue-50/60 dark:bg-blue-900/20 p-3">
        <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Average Place Visits</p>
        <p class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">${averageVisitPerPlace.toFixed(1)}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Visit events per place</p>
      </div>
      <div class="rounded-md border-l-4 border-l-indigo-500 border border-gray-200 dark:border-gray-700 bg-indigo-50/60 dark:bg-indigo-900/20 p-3">
        <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Most Visited Place</p>
        <p class="text-lg font-semibold text-gray-900 dark:text-white mt-1">${mostVisitedPlace ? mostVisitedPlace[0] : 'N/A'}</p>
        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${mostVisitedPlace ? `${mostVisitedPlace[1]} total visit events` : 'No place data yet'}</p>
      </div>
      <div class="rounded-md border-l-4 border-l-indigo-500 border border-gray-200 dark:border-gray-700 bg-indigo-50/60 dark:bg-indigo-900/20 p-3">
        <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Top Places by Visits</p>
        <div class="space-y-2">
          ${renderRankedList(topPlaces, topPlaceMax, 'No place visit data')}
        </div>
      </div>
  `;

  const guestCards = `
      <div class="rounded-md border-l-4 border-l-violet-500 border border-gray-200 dark:border-gray-700 bg-violet-50/60 dark:bg-violet-900/20 p-3">
        <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Average Guest Visits</p>
        <p class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">${averageVisitPerGuest.toFixed(1)}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Visit events per guest/visitor account</p>
      </div>
      <div class="rounded-md border-l-4 border-l-rose-500 border border-gray-200 dark:border-gray-700 bg-rose-50/60 dark:bg-rose-900/20 p-3">
        <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Repeat Guest Rate</p>
        <p class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">${repeatGuestRate.toFixed(1)}%</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${repeatGuestCount} repeat guest/visitor accounts out of ${guestCount.size || 0}</p>
      </div>
      <div class="rounded-md border-l-4 border-l-violet-500 border border-gray-200 dark:border-gray-700 bg-violet-50/60 dark:bg-violet-900/20 p-3">
        <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Top Guest/Visitor Accounts by Visits</p>
        <div class="space-y-2">
          ${renderRankedList(topGuests, topGuestMax, 'No guest visit data')}
        </div>
      </div>
  `;

  const timeCards = `
      <div class="rounded-md border-l-4 border-l-cyan-500 border border-gray-200 dark:border-gray-700 bg-cyan-50/60 dark:bg-cyan-900/20 p-3">
        <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Average Visits per Date</p>
        <p class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">${averageVisitPerDate.toFixed(1)}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Visit events per active date</p>
      </div>
      <div class="rounded-md border-l-4 border-l-fuchsia-500 border border-gray-200 dark:border-gray-700 bg-fuchsia-50/60 dark:bg-fuchsia-900/20 p-3">
        <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Busiest Visit Date</p>
        <p class="text-lg font-semibold text-gray-900 dark:text-white mt-1">${busiestDayLabel}</p>
        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${busiestDayCount} visit event${busiestDayCount === 1 ? '' : 's'}</p>
      </div>
      <div class="rounded-md border-l-4 border-l-emerald-500 border border-gray-200 dark:border-gray-700 bg-emerald-50/60 dark:bg-emerald-900/20 p-3">
        <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Peak Visit Hour</p>
        <p class="text-lg font-semibold text-gray-900 dark:text-white mt-1">${peakHourLabel}</p>
        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${peakHourCount} visit event${peakHourCount === 1 ? '' : 's'} around this hour</p>
      </div>
      <div class="rounded-md border-l-4 border-l-teal-500 border border-gray-200 dark:border-gray-700 bg-teal-50/60 dark:bg-teal-900/20 p-3">
        <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Top Visit Weekday</p>
        <p class="text-lg font-semibold text-gray-900 dark:text-white mt-1">${topWeekdayLabel}</p>
        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${topWeekdayCount} visit event${topWeekdayCount === 1 ? '' : 's'}</p>
      </div>
  `;

  const outcomeCards = `
      <div class="rounded-md border-l-4 border-l-sky-500 border border-gray-200 dark:border-gray-700 bg-sky-50/60 dark:bg-sky-900/20 p-3">
        <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Average Places per Visit</p>
        <p class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">${averagePlacesPerVisit.toFixed(1)}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">How many places are usually included in one visit</p>
      </div>
      <div class="rounded-md border-l-4 border-l-amber-500 border border-gray-200 dark:border-gray-700 bg-amber-50/60 dark:bg-amber-900/20 p-3">
        <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Completion Rate</p>
        <p class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">${completionRate.toFixed(1)}%</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${completedVisits} completed vs ${unsuccessfulVisits} unsuccessful</p>
      </div>
  `;

  const faceCards = `
      <div class="rounded-md border-l-4 border-l-emerald-500 border border-gray-200 dark:border-gray-700 bg-emerald-50/60 dark:bg-emerald-900/20 p-3">
        <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Average Face Detection</p>
        <p class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">${avgFaceDetection.toFixed(1)}%</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${faceDetectionSamples} logs with confidence data</p>
      </div>
      <div class="rounded-md border-l-4 border-l-purple-500 border border-gray-200 dark:border-gray-700 bg-purple-50/60 dark:bg-purple-900/20 p-3">
        <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Average VFace Similarity</p>
        <p class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">${avgVfaceSimilarity.toFixed(1)}%</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${vfaceVerificationRate.toFixed(1)}% verified match rate (${vfaceSamples} samples)</p>
      </div>
  `;

  const sectionsByFilter: Record<AnalyticsPreviewFilter, string> = {
    overview: `${placeCards}${guestCards}${timeCards}${outcomeCards}${faceCards}`,
    daily_activity: `${timeCards}`,
    action_breakdown: `${outcomeCards}`,
    hourly_activity: `${timeCards}`,
    face_detection_avg: `${faceCards}`,
    vface_verification_avg: `${faceCards}`,
    place_insights: `${placeCards}`,
    guest_insights: `${guestCards}`,
    time_insights: `${timeCards}`,
    outcome_insights: `${outcomeCards}`,
  };

  return `<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">${sectionsByFilter[previewFilter] || sectionsByFilter.overview}</div>`;
}
