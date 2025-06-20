export function ContactPage() {
  return `    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-200">
        Contact Us
      </h1>
      
      <!-- Contact Person Cards Horizontal Scroll -->
      <div class="overflow-x-auto pb-6 contact-scrollbar">
        <div class="flex space-x-6 min-w-max">
          <!-- Card 1 -->
          <div class="relative w-64 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10">
            <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
              <img src="/glenn.jpg" alt="Glenn R. Galbadores I" class="w-full h-full object-cover rounded-full" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">Glenn R. Galbadores I</h3>
            <p class="text-gray-600 dark:text-gray-300 text-center">CEO</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">john@example.com</p>
          </div>

          <!-- Card 2 -->
          <div class="relative w-64 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10">
            <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
              <img src="/kurt.jpg" alt="Kurt Angelo F. Ballarta" class="w-full h-full object-cover rounded-full" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">Kurt Angelo F. Ballarta</h3>
            <p class="text-gray-600 dark:text-gray-300 text-center">CTO</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">jane@example.com</p>
          </div>

          <!-- Card 3 -->
          <div class="relative w-64 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10">
            <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
              <img src="/justine.jpg" alt="Justine B. Mantilla" class="w-full h-full object-cover rounded-full" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">Justine B. Mantilla</h3>
            <p class="text-gray-600 dark:text-gray-300 text-center">COO</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">mike@example.com</p>
          </div>

          <!-- Card 4 -->
          <div class="relative w-64 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10">
            <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
              <img src="/walter.jpg" alt="John Walter D. Marquez" class="w-full h-full object-cover rounded-full" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">John Walter D. Marquez</h3>
            <p class="text-gray-600 dark:text-gray-300 text-center">CFO</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">sarah@example.com</p>
          </div>

          <!-- Card 5 -->
          <div class="relative w-64 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10">
            <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
              <img src="/ken.jpg" alt="Ken Zedrick E. Montano" class="w-full h-full object-cover rounded-full" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">Ken Zedrick E. Montano</h3>
            <p class="text-gray-600 dark:text-gray-300 text-center">CMO</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">david@example.com</p>
          </div>
        </div>
      </div>

      <!-- Contact Details Section -->
      <div class="mt-12 max-w-2xl">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Reach Us</h2>
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Office Location</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Business Hours</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
            </p>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">General Inquiries</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}
