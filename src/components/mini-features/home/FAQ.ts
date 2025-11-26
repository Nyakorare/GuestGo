export function FAQ() {
  return `
    <section class="mb-8 sm:mb-12 md:mb-16">
      <div class="text-center mb-8 sm:mb-10">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">Frequently Asked Questions</h2>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Find answers to common questions about GuestGo's features and how to use our system
        </p>
      </div>
      
      <div class="max-w-4xl mx-auto space-y-4 sm:space-y-5">
        <div class="faq-item group bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <button class="w-full flex justify-between items-center px-5 sm:px-6 py-4 sm:py-5 text-left group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors duration-300" data-faq-toggle="scheduling">
            <span class="font-bold text-base sm:text-lg text-gray-900 dark:text-white pr-4">How does the scheduling system work?</span>
            <svg data-faq-icon class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-5 sm:px-6 pb-0 text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="scheduling">
            <div class="pb-4 sm:pb-5 pt-2 border-t border-gray-200 dark:border-gray-700">
              Our smart scheduling system allows you to book visits up to 1 month in advance. You can schedule visits to multiple places in a single booking, select specific purposes for each visit, and track your appointments in real-time. The system enforces a maximum of 2 visits per week per user account, with automatic weekly reset (Sunday to Saturday, Philippine time).
            </div>
          </div>
        </div>

        <div class="faq-item group bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <button class="w-full flex justify-between items-center px-5 sm:px-6 py-4 sm:py-5 text-left group-hover:bg-green-50 dark:group-hover:bg-green-900/30 transition-colors duration-300" data-faq-toggle="verification">
            <span class="font-bold text-base sm:text-lg text-gray-900 dark:text-white pr-4">What verification methods are used?</span>
            <svg data-faq-icon class="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-5 sm:px-6 pb-0 text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="verification">
            <div class="pb-4 sm:pb-5 pt-2 border-t border-gray-200 dark:border-gray-700">
              We use multiple verification methods to ensure security: email verification with one-time codes (Gmail supported), QR code scanning at gates, and AI-powered facial recognition technology. Your face data is encrypted and stored securely, only accessible to authorized personnel for verification purposes.
            </div>
          </div>
        </div>

        <div class="faq-item group bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <button class="w-full flex justify-between items-center px-5 sm:px-6 py-4 sm:py-5 text-left group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30 transition-colors duration-300" data-faq-toggle="qr">
            <span class="font-bold text-base sm:text-lg text-gray-900 dark:text-white pr-4">How do QR codes work?</span>
            <svg data-faq-icon class="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-5 sm:px-6 pb-0 text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="qr">
            <div class="pb-4 sm:pb-5 pt-2 border-t border-gray-200 dark:border-gray-700">
              When you schedule a visit, a unique QR code is generated and sent to your email. Present this QR code at the entrance gate where security personnel will scan it to verify your appointment. The QR code contains your visit information and is valid only for your scheduled date and time.
            </div>
          </div>
        </div>

        <div class="faq-item group bg-gradient-to-br from-white to-pink-50 dark:from-gray-800 dark:to-pink-900/20 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <button class="w-full flex justify-between items-center px-5 sm:px-6 py-4 sm:py-5 text-left group-hover:bg-pink-50 dark:group-hover:bg-pink-900/30 transition-colors duration-300" data-faq-toggle="face-detection">
            <span class="font-bold text-base sm:text-lg text-gray-900 dark:text-white pr-4">What is facial recognition used for?</span>
            <svg data-faq-icon class="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 dark:text-pink-400 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-5 sm:px-6 pb-0 text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="face-detection">
            <div class="pb-4 sm:pb-5 pt-2 border-t border-gray-200 dark:border-gray-700">
              Our AI-powered facial recognition system enhances security by verifying your identity at entrance and exit gates. You can optionally enroll your facial data during scheduling for faster check-in. The system uses advanced YOLOv8 models with fallback detection, and all face images are encrypted and stored securely. Your privacy is protected with role-based access controls.
            </div>
          </div>
        </div>

        <div class="faq-item group bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-orange-900/20 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <button class="w-full flex justify-between items-center px-5 sm:px-6 py-4 sm:py-5 text-left group-hover:bg-orange-50 dark:group-hover:bg-orange-900/30 transition-colors duration-300" data-faq-toggle="tracking">
            <span class="font-bold text-base sm:text-lg text-gray-900 dark:text-white pr-4">How can I track my visit status?</span>
            <svg data-faq-icon class="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-5 sm:px-6 pb-0 text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="tracking">
            <div class="pb-4 sm:pb-5 pt-2 border-t border-gray-200 dark:border-gray-700">
              You can track your visit status in real-time through your dashboard. Statuses include: Pending (awaiting approval), In Progress (you've checked in), Temporary Exit (you've left temporarily), Completed (visit finished), and Completed Flagged (visit completed with notes). You'll also see your weekly visit count and remaining scheduling slots.
            </div>
          </div>
        </div>

        <div class="faq-item group bg-gradient-to-br from-white to-cyan-50 dark:from-gray-800 dark:to-cyan-900/20 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <button class="w-full flex justify-between items-center px-5 sm:px-6 py-4 sm:py-5 text-left group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/30 transition-colors duration-300" data-faq-toggle="limits">
            <span class="font-bold text-base sm:text-lg text-gray-900 dark:text-white pr-4">What are the visit limits?</span>
            <svg data-faq-icon class="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-5 sm:px-6 pb-0 text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="limits">
            <div class="pb-4 sm:pb-5 pt-2 border-t border-gray-200 dark:border-gray-700">
              Each user account can schedule up to 2 visits per week. The counter resets weekly on Sunday (Philippine time). Additionally, each place may have its own daily or weekly visitor limits. The system will automatically prevent scheduling when limits are reached and show you available dates.
            </div>
          </div>
        </div>

        <div class="faq-item group bg-gradient-to-br from-white to-teal-50 dark:from-gray-800 dark:to-teal-900/20 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <button class="w-full flex justify-between items-center px-5 sm:px-6 py-4 sm:py-5 text-left group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 transition-colors duration-300" data-faq-toggle="reschedule">
            <span class="font-bold text-base sm:text-lg text-gray-900 dark:text-white pr-4">Can I reschedule or cancel my visit?</span>
            <svg data-faq-icon class="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-5 sm:px-6 pb-0 text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="reschedule">
            <div class="pb-4 sm:pb-5 pt-2 border-t border-gray-200 dark:border-gray-700">
              Yes, you can reschedule but you cannot cancel your visit as we have an automatic system that automatically cancels your schedueld visit if you do not show up at the scheduled date you scheduled. Please notify us at least 24 hours before your scheduled visit time so we can accommodate changes (through the reschedule feature in your visitor dashboard). Not Logged in Users cannot reschedule their visits.
            </div>
          </div>
        </div>

        <div class="faq-item group bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <button class="w-full flex justify-between items-center px-5 sm:px-6 py-4 sm:py-5 text-left group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors duration-300" data-faq-toggle="feedback">
            <span class="font-bold text-base sm:text-lg text-gray-900 dark:text-white pr-4">Can I provide feedback after my visit?</span>
            <svg data-faq-icon class="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-5 sm:px-6 pb-0 text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="feedback">
            <div class="pb-4 sm:pb-5 pt-2 border-t border-gray-200 dark:border-gray-700">
              Yes! After completing your visit, you'll have the opportunity to provide feedback through our ISO 25010 quality survey. This helps us improve our services and covers aspects like functional suitability, security, performance, and overall satisfaction. Your feedback is valuable and helps us maintain high standards.
            </div>
          </div>
        </div>

        <div class="faq-item group bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <button class="w-full flex justify-between items-center px-5 sm:px-6 py-4 sm:py-5 text-left group-hover:bg-amber-50 dark:group-hover:bg-amber-900/30 transition-colors duration-300" data-faq-toggle="temporary-exit">
            <span class="font-bold text-base sm:text-lg text-gray-900 dark:text-white pr-4">What if I need to leave temporarily during my visit?</span>
            <svg data-faq-icon class="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-5 sm:px-6 pb-0 text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="temporary-exit">
            <div class="pb-4 sm:pb-5 pt-2 border-t border-gray-200 dark:border-gray-700">
              The system supports temporary exits. If you need to leave the premises temporarily during your visit, security personnel can mark your visit as "temporary exit" at the gate. You can return and complete your visit later the same day. Your visit status will update accordingly, and you'll still be able to complete all scheduled places.
            </div>
          </div>
        </div>

        <div class="faq-item group bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <button class="w-full flex justify-between items-center px-5 sm:px-6 py-4 sm:py-5 text-left group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors duration-300" data-faq-toggle="multiple-places">
            <span class="font-bold text-base sm:text-lg text-gray-900 dark:text-white pr-4">Can I visit multiple places in one appointment?</span>
            <svg data-faq-icon class="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-5 sm:px-6 pb-0 text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="multiple-places">
            <div class="pb-4 sm:pb-5 pt-2 border-t border-gray-200 dark:border-gray-700">
              Yes! When scheduling, you can select "Multiple Places" if at least 2 places are available. You can choose different purposes for each place and visit them all in a single appointment. The system tracks your progress through each place, and you must complete all scheduled places before your visit is marked as completed.
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

