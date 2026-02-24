export function VisitInformation() {
  return `
    <div id="visitInfo" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 track-fade-in track-fade-in-delay-2">
      <!-- Left Column -->
      <div class="space-y-5 sm:space-y-6">
        <div class="track-card p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Visit ID</label>
          <p id="displayVisitId" class="text-sm font-mono text-gray-900 dark:text-white bg-white dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600"></p>
        </div>
        <div class="track-card p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Visitor Name</label>
          <p id="displayVisitorName" class="text-sm font-medium text-gray-900 dark:text-white"></p>
        </div>
        <div class="track-card p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Email</label>
          <p id="displayVisitorEmail" class="text-sm text-gray-900 dark:text-white"></p>
        </div>
        <div class="track-card p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Phone</label>
          <p id="displayVisitorPhone" class="text-sm text-gray-900 dark:text-white"></p>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-5 sm:space-y-6">
        <div class="track-card p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Visit Date</label>
          <p id="displayVisitDate" class="text-sm font-medium text-gray-900 dark:text-white"></p>
        </div>
        <div class="track-card p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Purpose</label>
          <p id="displayPurpose" class="text-sm text-gray-900 dark:text-white"></p>
        </div>
        <div class="track-card p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
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

