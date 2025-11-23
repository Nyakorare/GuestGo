export function BusinessHours() {
  return `
    <div class="mt-12 bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-orange-900/20 rounded-2xl shadow-xl p-8 sm:p-10 mx-4 sm:mx-6 lg:mx-8 border-2 border-orange-100 dark:border-orange-800">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">Business Hours</h2>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Our support team is available during these hours. For urgent matters, please use our emergency contact.
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-4">
          <div class="flex justify-between items-center p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border-2 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">M-F</span>
              </div>
              <span class="font-bold text-gray-900 dark:text-white">Monday - Friday</span>
            </div>
            <span class="text-lg font-semibold text-blue-600 dark:text-blue-400">9:00 AM - 6:00 PM</span>
          </div>
          <div class="flex justify-between items-center p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border-2 border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">SAT</span>
              </div>
              <span class="font-bold text-gray-900 dark:text-white">Saturday</span>
            </div>
            <span class="text-lg font-semibold text-green-600 dark:text-green-400">10:00 AM - 4:00 PM</span>
          </div>
          <div class="flex justify-between items-center p-5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:shadow-lg transition-all duration-300">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">SUN</span>
              </div>
              <span class="font-bold text-gray-900 dark:text-white">Sunday</span>
            </div>
            <span class="text-lg font-semibold text-gray-500 dark:text-gray-400">Closed</span>
          </div>
        </div>
        <div class="text-center flex flex-col justify-center">
          <div id="current-status" class="inline-flex flex-col items-center px-8 py-6 rounded-2xl mb-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-lg">
            <div class="flex items-center gap-3 mb-2">
              <div id="status-indicator" class="w-4 h-4 rounded-full animate-pulse"></div>
              <span id="status-text" class="text-xl font-bold text-gray-900 dark:text-white">Checking status...</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <span id="next-opening">Next opening: Monday 9:00 AM</span>
            </p>
          </div>
          <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
            <p class="text-xs text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> All times are in Philippine Standard Time (PST). For urgent technical issues, please use the emergency contact form.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

