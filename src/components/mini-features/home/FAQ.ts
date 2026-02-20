export function FAQ() {
  return `
    <section class="mb-8 sm:mb-10 md:mb-12">
      <div class="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <p class="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
            FAQs
          </p>
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Frequently asked questions
          </h2>
          <p class="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-xl">
            Quick answers to the most common questions about how GuestGo works.
          </p>
        </div>
        <div class="hidden sm:flex items-center text-xs text-gray-500 dark:text-gray-400">
          <span class="h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
          <span>Helpful for new and returning visitors</span>
        </div>
      </div>
      
      <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div class="faq-item faq-card faq-card-delay-1 group rounded-lg border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/40 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-900/20 transition-colors duration-200">
          <button class="w-full flex items-start justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 text-left" data-faq-toggle="scheduling">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="faq-badge inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                  1
                </span>
                <span class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                  How does the scheduling system work?
                </span>
              </div>
              <p class="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                Book visits up to a month ahead with smart weekly limits.
              </p>
            </div>
            <svg data-faq-icon class="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-4 sm:px-5 pb-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="scheduling">
            <div class="pb-3 sm:pb-4 pt-2 border-t border-gray-100 dark:border-gray-700/80">
              Our smart scheduling system lets you book visits up to 1 month in advance. You can include multiple places in a single booking, choose specific purposes for each, and track everything in real-time. The system enforces a maximum of 2 visits per week per user account, with an automatic reset every Sunday (Philippine time).
            </div>
          </div>
        </div>

        <div class="faq-item faq-card faq-card-delay-2 group rounded-lg border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/40 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-900/20 transition-colors duration-200">
          <button class="w-full flex items-start justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 text-left" data-faq-toggle="verification">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="faq-badge inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                  2
                </span>
                <span class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                  What verification methods are used?
                </span>
              </div>
              <p class="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                Multiple secure checks before you enter the campus.
              </p>
            </div>
            <svg data-faq-icon class="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-4 sm:px-5 pb-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="verification">
            <div class="pb-3 sm:pb-4 pt-2 border-t border-gray-100 dark:border-gray-700/80">
              We combine email verification with one-time codes (Gmail supported), QR code scanning at gates, and optional AI-powered facial recognition. Your facial data is encrypted, stored securely, and only accessible to authorized personnel for verification purposes.
            </div>
          </div>
        </div>

        <div class="faq-item faq-card faq-card-delay-3 group rounded-lg border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/40 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-900/20 transition-colors duration-200">
          <button class="w-full flex items-start justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 text-left" data-faq-toggle="qr">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="faq-badge inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                  3
                </span>
                <span class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                  How do QR codes work?
                </span>
              </div>
              <p class="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                A unique QR pass makes check-in fast and smooth.
              </p>
            </div>
            <svg data-faq-icon class="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-4 sm:px-5 pb-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="qr">
            <div class="pb-3 sm:pb-4 pt-2 border-t border-gray-100 dark:border-gray-700/80">
              When you schedule a visit, we generate a unique QR code and send it to your email. Show this code at the gate where security personnel will scan it to verify your appointment. The QR is tied to your visit details and only works for your scheduled date and time.
            </div>
          </div>
        </div>

        <div class="faq-item faq-card faq-card-delay-4 group rounded-lg border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/40 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-900/20 transition-colors duration-200">
          <button class="w-full flex items-start justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 text-left" data-faq-toggle="face-detection">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="faq-badge inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                  4
                </span>
                <span class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                  What is facial recognition used for?
                </span>
              </div>
              <p class="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                Optional faster check-in with secure face matching.
              </p>
            </div>
            <svg data-faq-icon class="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-4 sm:px-5 pb-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="face-detection">
            <div class="pb-3 sm:pb-4 pt-2 border-t border-gray-100 dark:border-gray-700/80">
              Our AI-powered facial recognition helps verify your identity at entrance and exit gates. You can optionally enroll your facial data during scheduling for faster check-in. The system uses advanced models with fallback detection, and all images are encrypted with strict role-based access controls.
            </div>
          </div>
        </div>

        <div class="faq-item faq-card faq-card-delay-2 group rounded-lg border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/40 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-900/20 transition-colors duration-200">
          <button class="w-full flex items-start justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 text-left" data-faq-toggle="tracking">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="faq-badge inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                  5
                </span>
                <span class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                  How can I track my visit status?
                </span>
              </div>
              <p class="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                See live status updates from pending to completed.
              </p>
            </div>
            <svg data-faq-icon class="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-4 sm:px-5 pb-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="tracking">
            <div class="pb-3 sm:pb-4 pt-2 border-t border-gray-100 dark:border-gray-700/80">
              You can track your visit in real-time through your dashboard. Statuses include Pending (awaiting approval), In Progress (you've checked in), Temporary Exit, Completed, and Completed Flagged (completed with notes). You will also see your weekly visit count and remaining scheduling slots.
            </div>
          </div>
        </div>

        <div class="faq-item faq-card faq-card-delay-3 group rounded-lg border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/40 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-900/20 transition-colors duration-200">
          <button class="w-full flex items-start justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 text-left" data-faq-toggle="limits">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="faq-badge inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                  6
                </span>
                <span class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                  What are the visit limits?
                </span>
              </div>
              <p class="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                Weekly and per-place limits keep traffic manageable.
              </p>
            </div>
            <svg data-faq-icon class="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-4 sm:px-5 pb-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="limits">
            <div class="pb-3 sm:pb-4 pt-2 border-t border-gray-100 dark:border-gray-700/80">
              Each user account can schedule up to 2 visits per week. The counter resets every Sunday (Philippine time). Individual places may also have their own daily or weekly visitor limits, and the system will automatically block fully booked dates and suggest alternatives.
            </div>
          </div>
        </div>

        <div class="faq-item faq-card faq-card-delay-4 group rounded-lg border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/40 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-900/20 transition-colors duration-200">
          <button class="w-full flex items-start justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 text-left" data-faq-toggle="reschedule">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="faq-badge inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                  7
                </span>
                <span class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                  Can I reschedule or cancel my visit?
                </span>
              </div>
              <p class="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                Simple rescheduling options for logged-in visitors.
              </p>
            </div>
            <svg data-faq-icon class="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-4 sm:px-5 pb-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="reschedule">
            <div class="pb-3 sm:pb-4 pt-2 border-t border-gray-100 dark:border-gray-700/80">
              Logged-in visitors can reschedule their visits through the visitor dashboard. We recommend requesting changes at least 24 hours before your scheduled time. For security and attendance tracking, visits that you do not attend are automatically cancelled by the system. Guests who are not logged in cannot reschedule.
            </div>
          </div>
        </div>

        <div class="faq-item faq-card faq-card-delay-1 group rounded-lg border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/40 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-900/20 transition-colors duration-200">
          <button class="w-full flex items-start justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 text-left" data-faq-toggle="feedback">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="faq-badge inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                  8
                </span>
                <span class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                  Can I provide feedback after my visit?
                </span>
              </div>
              <p class="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                Share your experience through a short quality survey.
              </p>
            </div>
            <svg data-faq-icon class="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-4 sm:px-5 pb-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="feedback">
            <div class="pb-3 sm:pb-4 pt-2 border-t border-gray-100 dark:border-gray-700/80">
              Yes. After your visit is completed, you can answer an ISO 25010-based quality survey. It covers areas like functional suitability, security, performance, and overall satisfaction. Your feedback directly helps us refine and improve GuestGo.
            </div>
          </div>
        </div>

        <div class="faq-item faq-card faq-card-delay-2 group rounded-lg border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/40 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-900/20 transition-colors duration-200">
          <button class="w-full flex items-start justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 text-left" data-faq-toggle="temporary-exit">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="faq-badge inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                  9
                </span>
                <span class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                  What if I need to leave temporarily during my visit?
                </span>
              </div>
              <p class="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                Temporary exits are supported without losing your visit.
              </p>
            </div>
            <svg data-faq-icon class="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-4 sm:px-5 pb-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="temporary-exit">
            <div class="pb-3 sm:pb-4 pt-2 border-t border-gray-100 dark:border-gray-700/80">
              The system supports temporary exits. If you need to leave the premises during your visit, security personnel can mark your status as "Temporary Exit" at the gate. You can return later the same day and continue your visit, including all scheduled places, until it is marked as completed.
            </div>
          </div>
        </div>

        <div class="faq-item faq-card faq-card-delay-3 group rounded-lg border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/40 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-900/20 transition-colors duration-200 md:col-span-2">
          <button class="w-full flex items-start justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 text-left" data-faq-toggle="multiple-places">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="faq-badge inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                  10
                </span>
                <span class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                  Can I visit multiple places in one appointment?
                </span>
              </div>
              <p class="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                Plan a route across several offices with one booking.
              </p>
            </div>
            <svg data-faq-icon class="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="px-4 sm:px-5 pb-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden max-h-0 overflow-hidden transition-all duration-300 ease-in-out" data-faq-panel="multiple-places">
            <div class="pb-3 sm:pb-4 pt-2 border-t border-gray-100 dark:border-gray-700/80">
              Yes. When scheduling, you can choose "Multiple Places" if at least two locations are available. You can assign different purposes to each place and visit them all within a single appointment. The system tracks your progress, and your visit is marked completed only after all selected places are done.
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

