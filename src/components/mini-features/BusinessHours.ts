export function BusinessHours() {
  return `
    <section class="mt-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-stretch gap-6 lg:gap-8 py-8 border-t border-b border-gray-200 dark:border-gray-700">
        <!-- Heading + schedule list -->
        <div class="lg:w-72 flex-shrink-0">
          <div class="flex items-start gap-3 mb-6">
            <div class="flex-shrink-0 w-1 sm:w-1.5 rounded-full bg-gradient-to-b from-orange-500 to-amber-500 min-h-[2.5rem] sm:min-h-0 sm:h-12"></div>
            <div>
              <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">Business hours</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Support available during these hours. All times are Philippine Standard Time (PST).
              </p>
            </div>
          </div>
          <div class="space-y-2 pl-4 sm:pl-5">
            <div id="schedule-monday-friday" class="schedule-row flex justify-between items-center gap-4 py-3 px-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 transition-all duration-200">
              <div class="flex items-center gap-3 min-w-0">
                <span class="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500 text-white text-xs font-bold flex items-center justify-center">M–F</span>
                <span class="font-semibold text-gray-900 dark:text-white text-sm">Monday – Friday</span>
              </div>
              <span class="flex-shrink-0 text-sm font-medium text-blue-600 dark:text-blue-400">9:00 AM – 6:00 PM</span>
            </div>
            <div id="schedule-saturday" class="schedule-row flex justify-between items-center gap-4 py-3 px-4 rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20 transition-all duration-200">
              <div class="flex items-center gap-3 min-w-0">
                <span class="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500 text-white text-xs font-bold flex items-center justify-center">Sat</span>
                <span class="font-semibold text-gray-900 dark:text-white text-sm">Saturday</span>
              </div>
              <span class="flex-shrink-0 text-sm font-medium text-green-600 dark:text-green-400">10:00 AM – 4:00 PM</span>
            </div>
            <div id="schedule-sunday" class="schedule-row flex justify-between items-center gap-4 py-3 px-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-gray-100/80 dark:bg-gray-800/50 transition-all duration-200">
              <div class="flex items-center gap-3 min-w-0">
                <span class="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-500 text-white text-xs font-bold flex items-center justify-center">Sun</span>
                <span class="font-semibold text-gray-900 dark:text-white text-sm">Sunday</span>
              </div>
              <span class="flex-shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400">Closed</span>
            </div>
          </div>
        </div>

        <!-- Current status -->
        <div class="flex-1 flex flex-col justify-center min-w-0">
          <div id="current-status" class="inline-flex flex-col items-center sm:items-start px-6 py-5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/80 shadow-sm transition-all duration-200">
            <div class="flex items-center gap-3 mb-2">
              <div id="status-indicator" class="w-3.5 h-3.5 rounded-full bg-gray-400 animate-pulse flex-shrink-0"></div>
              <span id="status-text" class="text-lg font-bold text-gray-600 dark:text-gray-400">Checking status...</span>
            </div>
            <p id="next-opening" class="text-sm text-gray-600 dark:text-gray-400">Please wait...</p>
          </div>
          <p class="mt-4 text-xs text-gray-500 dark:text-gray-500 max-w-md">
            For urgent technical issues, use the emergency contact form or call the number on the Find us section.
          </p>
        </div>
      </div>
    </section>
    <style>
      .schedule-day-active {
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
      #schedule-monday-friday.schedule-day-active {
        border-color: rgb(59, 130, 246);
        background: rgb(219, 234, 254);
      }
      .dark #schedule-monday-friday.schedule-day-active {
        border-color: rgb(96, 165, 250);
        background: rgba(30, 58, 138, 0.3);
      }
      #schedule-saturday.schedule-day-active {
        border-color: rgb(34, 197, 94);
        background: rgb(220, 252, 231);
      }
      .dark #schedule-saturday.schedule-day-active {
        border-color: rgb(74, 222, 128);
        background: rgba(22, 101, 52, 0.3);
      }
      #schedule-sunday.schedule-day-active {
        border-color: rgb(107, 114, 128);
        background: rgb(243, 244, 246);
      }
      .dark #schedule-sunday.schedule-day-active {
        border-color: rgb(156, 163, 175);
        background: rgba(55, 65, 81, 0.5);
      }
    </style>
  `;
}
