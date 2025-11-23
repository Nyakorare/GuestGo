export function VisitInformation() {
  return `
    <div id="visitInfo" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Left Column -->
      <div class="space-y-5">
        <div class="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Visit ID</label>
          <p id="displayVisitId" class="text-sm font-mono text-gray-900 dark:text-white bg-white dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600"></p>
        </div>
        <div class="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Visitor Name</label>
          <p id="displayVisitorName" class="text-sm font-medium text-gray-900 dark:text-white"></p>
        </div>
        <div class="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Email</label>
          <p id="displayVisitorEmail" class="text-sm text-gray-900 dark:text-white"></p>
        </div>
        <div class="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Phone</label>
          <p id="displayVisitorPhone" class="text-sm text-gray-900 dark:text-white"></p>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-5">
        <div class="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Visit Date</label>
          <p id="displayVisitDate" class="text-sm font-medium text-gray-900 dark:text-white"></p>
        </div>
        <div class="p-4 bg-gradient-to-br from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Purpose</label>
          <p id="displayPurpose" class="text-sm text-gray-900 dark:text-white"></p>
        </div>
        <div class="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Status</label>
          <span id="displayStatus" class="mt-1 inline-flex px-3 py-1 text-xs font-semibold rounded-full"></span>
        </div>
        <div class="p-4 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-800 rounded-xl border border-gray-200 dark:border-gray-600">
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Scheduled At</label>
          <p id="displayScheduledAt" class="text-sm text-gray-900 dark:text-white"></p>
        </div>
      </div>
    </div>
  `;
}

