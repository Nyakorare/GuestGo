import { GoogleMap } from './GoogleMap';

export function FindUs() {
  return `
    <section class="mt-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-col lg:flex-row lg:items-stretch gap-6 lg:gap-8">
          <!-- Contact details -->
          <div class="lg:w-[380px] flex-shrink-0 space-y-4">
            <div class="mb-6">
              <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">Find us</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Reach out by location, phone, or email. We're here to help.
              </p>
            </div>

            <!-- Address -->
            <a href="https://www.google.com/maps/search/San+Marcelino+St+Ayala+Blvd+Ermita+Manila" target="_blank" rel="noopener noreferrer" class="find-us-card group flex gap-4 p-4 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md transition-all duration-200">
              <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Main office</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 leading-snug">
                  San Marcelino St, Ayala Blvd<br>Ermita, Manila, 1000
                </p>
                <span class="inline-flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 group-hover:underline">
                  Get directions
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </span>
              </div>
            </a>

            <!-- Phone -->
            <a href="tel:+639123456789" class="find-us-card group flex gap-4 p-4 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200">
              <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Phone</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 leading-snug">
                  +63 912 345 6789
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Mon–Fri, 9:00 AM – 6:00 PM</p>
                <span class="inline-flex items-center gap-1 mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                  Call now
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                </span>
              </div>
            </a>

            <!-- Email -->
            <a href="mailto:support@guestgo.com" class="find-us-card group flex gap-4 p-4 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-md transition-all duration-200">
              <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-colors duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Email</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 leading-snug">
                  support@guestgo.com
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">We typically respond within 24 hours</p>
                <span class="inline-flex items-center gap-1 mt-2 text-xs font-medium text-violet-600 dark:text-violet-400 group-hover:underline">
                  Send email
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                </span>
              </div>
            </a>
          </div>

          <!-- Map -->
          <div class="flex-1 min-h-[320px] lg:min-h-[400px]">
            <div class="rounded-xl overflow-hidden shadow-sm h-full bg-gray-100 dark:bg-gray-800/50" style="min-height: 320px;">
              <div class="px-3 py-2 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                </svg>
                <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Our location</span>
              </div>
              ${GoogleMap()}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
