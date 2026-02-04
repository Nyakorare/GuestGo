export function UserFeedback() {
  return `
    <section class="mt-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl mx-auto">
        <div class="flex items-start gap-3 mb-6">
          <div class="flex-shrink-0 w-1 sm:w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-yellow-500 min-h-[2.5rem] sm:min-h-0 sm:h-12"></div>
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">User feedback</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              What visitors say about GuestGo. Real feedback from people who've used the system.
            </p>
          </div>
        </div>

        <div id="feedback-container" class="space-y-4">
          <div id="feedback-loading" class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mb-4"></div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Loading feedback...</p>
          </div>

          <div id="feedback-empty" class="hidden flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30">
            <div class="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">No feedback yet</p>
            <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">Check back soon for visitor testimonials.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}
