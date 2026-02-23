export function VisitInformation() {
  return `
    <div id="visitInfo" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 track-fade-in track-fade-in-delay-2">
      <!-- Left Column -->
      <div class="space-y-5 sm:space-y-6">
        <div class="track-card p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Visit ID</label>
          <p id="displayVisitId" class="text-sm font-mono text-gray-900 dark:text-white bg-white dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600"></p>
        </div>
        <div class="track-card p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Visitor Name</label>
          <p id="displayVisitorName" class="text-sm font-medium text-gray-900 dark:text-white"></p>
        </div>
        <div class="track-card p-4 bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 rounded-xl border border-sky-200 dark:border-sky-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Email</label>
          <p id="displayVisitorEmail" class="text-sm text-gray-900 dark:text-white"></p>
        </div>
        <div class="track-card p-4 bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-900/20 dark:to-rose-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Phone</label>
          <p id="displayVisitorPhone" class="text-sm text-gray-900 dark:text-white"></p>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-5 sm:space-y-6">
        <div class="track-card p-4 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Visit Date</label>
          <p id="displayVisitDate" class="text-sm font-medium text-gray-900 dark:text-white"></p>
        </div>
        <div class="track-card p-4 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Purpose</label>
          <p id="displayPurpose" class="text-sm text-gray-900 dark:text-white"></p>
        </div>
        <div class="track-card p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Status</label>
          <span id="displayStatus" class="mt-1 inline-flex px-3 py-1 text-xs font-semibold rounded-full"></span>
        </div>
        <div class="track-card p-4 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-800 rounded-xl border border-gray-200 dark:border-gray-600">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Scheduled At</label>
          <p id="displayScheduledAt" class="text-sm text-gray-900 dark:text-white"></p>
        </div>
      </div>
    </div>
  `;
}

