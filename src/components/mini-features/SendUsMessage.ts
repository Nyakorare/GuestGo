export function SendUsMessage() {
  return `
    <div class="mt-12 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl shadow-xl p-8 sm:p-10 mx-4 sm:mx-6 lg:mx-8 border-2 border-blue-100 dark:border-blue-800">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">Send us a Message</h2>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Have questions about GuestGo? Need technical support? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
        </p>
      </div>
      <form id="contact-form" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label for="firstName" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              First Name <span class="text-red-500">*</span>
            </label>
            <input type="text" id="firstName" name="firstName" required disabled
                   class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:text-white opacity-50 cursor-not-allowed"
                   placeholder="Enter your first name">
            <div class="error-message text-red-500 text-sm mt-1 hidden"></div>
          </div>
          <div class="form-group">
            <label for="lastName" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Last Name <span class="text-red-500">*</span>
            </label>
            <input type="text" id="lastName" name="lastName" required disabled
                   class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:text-white opacity-50 cursor-not-allowed"
                   placeholder="Enter your last name">
            <div class="error-message text-red-500 text-sm mt-1 hidden"></div>
          </div>
        </div>
        <div class="form-group">
          <label for="email" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Email Address <span class="text-red-500">*</span>
          </label>
          <input type="email" id="email" name="email" required disabled
                 class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:text-white opacity-50 cursor-not-allowed"
                 placeholder="your.email@example.com">
          <div class="error-message text-red-500 text-sm mt-1 hidden"></div>
        </div>
        <div class="form-group">
          <label for="subject" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Subject <span class="text-red-500">*</span>
          </label>
          <select id="subject" name="subject" required disabled
                  class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:text-white opacity-50 cursor-not-allowed">
            <option value="">Select a subject</option>
            <option value="general">General Inquiry</option>
            <option value="support">Technical Support</option>
            <option value="feature">Feature Request</option>
            <option value="bug">Bug Report</option>
            <option value="partnership">Partnership Opportunity</option>
            <option value="feedback">Feedback & Suggestions</option>
          </select>
          <div class="error-message text-red-500 text-sm mt-1 hidden"></div>
        </div>
        <div class="form-group">
          <label for="message" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Message <span class="text-red-500">*</span>
          </label>
          <textarea id="message" name="message" rows="5" required disabled
                    class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:text-white resize-none opacity-50 cursor-not-allowed"
                    placeholder="Tell us how we can help you..."></textarea>
          <div class="error-message text-red-500 text-sm mt-1 hidden"></div>
        </div>
        <div class="flex items-start space-x-3">
          <input type="checkbox" id="newsletter" name="newsletter" disabled
                 class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded opacity-50 cursor-not-allowed">
          <label for="newsletter" class="block text-sm text-gray-700 dark:text-gray-300">
            Subscribe to our newsletter for updates, new features, and tips on using GuestGo effectively.
          </label>
        </div>
        <button type="submit" disabled
                class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
          <span class="submit-text flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
            Send Message
          </span>
          <span class="loading-text hidden flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </span>
        </button>
      </form>
      <div id="form-success" class="hidden mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-400 dark:border-green-700 text-green-800 dark:text-green-300 rounded-xl">
        <div class="flex items-center gap-3">
          <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p class="font-semibold">Message sent successfully!</p>
            <p class="text-sm">Thank you for contacting us. We'll get back to you within 24 hours.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

