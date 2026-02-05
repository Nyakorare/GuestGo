export function SendUsMessage() {
  return `
    <section class="mt-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-start gap-3 mb-6">
          <div class="flex-shrink-0 w-1 sm:w-1.5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500 min-h-[2.5rem] sm:min-h-0 sm:h-12"></div>
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">Send us a message</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Questions, support, or feedback? Fill out the form and we’ll get back to you as soon as we can.
            </p>
          </div>
        </div>

        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 shadow-sm overflow-hidden">
          <form id="contact-form" class="p-5 sm:p-6 space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="form-group">
                <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  First name <span class="text-red-500">*</span>
                </label>
                <input type="text" id="firstName" name="firstName" required disabled
                  class="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Your first name">
                <div class="error-message text-red-500 text-xs mt-1 hidden"></div>
              </div>
              <div class="form-group">
                <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Last name <span class="text-red-500">*</span>
                </label>
                <input type="text" id="lastName" name="lastName" required disabled
                  class="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Your last name">
                <div class="error-message text-red-500 text-xs mt-1 hidden"></div>
              </div>
            </div>

            <div class="form-group">
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email <span class="text-red-500">*</span>
              </label>
              <input type="email" id="email" name="email" required disabled
                class="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="you@example.com">
              <div class="error-message text-red-500 text-xs mt-1 hidden"></div>
            </div>

            <div class="form-group">
              <label for="subject" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Subject <span class="text-red-500">*</span>
              </label>
              <select id="subject" name="subject" required disabled
                class="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="">Choose a subject</option>
                <option value="general">General inquiry</option>
                <option value="support">Technical support</option>
                <option value="feature">Feature request</option>
                <option value="bug">Bug report</option>
                <option value="partnership">Partnership</option>
                <option value="feedback">Feedback & suggestions</option>
              </select>
              <div class="error-message text-red-500 text-xs mt-1 hidden"></div>
            </div>

            <div class="form-group">
              <label for="message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Message <span class="text-red-500">*</span>
              </label>
              <textarea id="message" name="message" rows="4" required disabled
                class="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="How can we help?"></textarea>
              <div class="error-message text-red-500 text-xs mt-1 hidden"></div>
            </div>

            <div class="form-group flex items-start gap-3">
              <input type="checkbox" id="newsletter" name="newsletter" disabled
                class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <label for="newsletter" class="text-sm text-gray-600 dark:text-gray-400">
                Subscribe to updates and tips for using GuestGo.
              </label>
            </div>

            <button type="submit" disabled
              class="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <span class="submit-text flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                Send message
              </span>
              <span class="loading-text hidden flex items-center justify-center gap-2">
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            </button>
          </form>

          <div id="form-success" class="hidden mx-5 sm:mx-6 mb-5 sm:mb-6 p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <p class="text-sm font-semibold text-green-800 dark:text-green-200">Message sent</p>
                <p class="text-xs text-green-700 dark:text-green-300 mt-0.5">We’ll get back to you within 24 hours.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
