import supabase from '../config/supabase';

export function ContactPage() {
  return `    <div class="w-full py-12 -mx-4 sm:-mx-6 lg:-mx-8">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-200 px-4 sm:px-6 lg:px-8">
        Contact Us
      </h1>
      
      <!-- Contact Person Cards Auto-Sliding Animation -->
      <div class="relative overflow-hidden pb-6 w-screen" style="margin-left: calc(50% - 50vw);">
        <div class="contact-slider flex" style="animation: slideInfinite 40s linear infinite;">
          <!-- Card 1 -->
          <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10 overflow-hidden flex mr-4" style="width: 14.2857%;">
            <!-- Left Side - Current Design -->
            <div class="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/glenn.jpg" alt="Glenn R. Galbadores I" class="w-full h-full object-cover rounded-full" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">Glenn R. Galbadores I</h3>
              <p class="text-gray-600 dark:text-gray-300 text-center">CEO</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">john@example.com</p>
            </div>
            <!-- Right Side - New Design -->
            <div class="w-1/2 p-6 bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              <div class="relative z-10 text-center">
                <div class="mb-4">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <h4 class="text-sm font-semibold mb-3 opacity-95">Leadership</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Strategic Vision</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Team Building</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Innovation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10 overflow-hidden flex mr-4" style="width: 14.2857%;">
            <!-- Left Side - Current Design -->
            <div class="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/kurt.jpg" alt="Kurt Angelo F. Ballarta" class="w-full h-full object-cover rounded-full" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">Kurt Angelo F. Ballarta</h3>
              <p class="text-gray-600 dark:text-gray-300 text-center">CTO</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">jane@example.com</p>
            </div>
            <!-- Right Side - New Design -->
            <div class="w-1/2 p-6 bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-600 dark:to-purple-800 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              <div class="relative z-10 text-center">
                <div class="mb-4">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                  </svg>
                </div>
                <h4 class="text-sm font-semibold mb-3 opacity-95">Technology</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>System Architecture</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Cloud Solutions</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10 overflow-hidden flex mr-4" style="width: 14.2857%;">
            <!-- Left Side - Current Design -->
            <div class="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/justine.jpg" alt="Justine B. Mantilla" class="w-full h-full object-cover rounded-full" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">Justine B. Mantilla</h3>
              <p class="text-gray-600 dark:text-gray-300 text-center">COO</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">mike@example.com</p>
            </div>
            <!-- Right Side - New Design -->
            <div class="w-1/2 p-6 bg-gradient-to-br from-green-500 to-green-700 dark:from-green-600 dark:to-green-800 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              <div class="relative z-10 text-center">
                <div class="mb-4">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <h4 class="text-sm font-semibold mb-3 opacity-95">Operations</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Process Optimization</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Quality Assurance</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Efficiency</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 4 -->
          <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10 overflow-hidden flex mr-4" style="width: 14.2857%;">
            <!-- Left Side - Current Design -->
            <div class="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/walter.jpg" alt="John Walter D. Marquez" class="w-full h-full object-cover rounded-full" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">John Walter D. Marquez</h3>
              <p class="text-gray-600 dark:text-gray-300 text-center">CFO</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">sarah@example.com</p>
            </div>
            <!-- Right Side - New Design -->
            <div class="w-1/2 p-6 bg-gradient-to-br from-orange-500 to-orange-700 dark:from-orange-600 dark:to-orange-800 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              <div class="relative z-10 text-center">
                <div class="mb-4">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h4 class="text-sm font-semibold mb-3 opacity-95">Finance</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Financial Planning</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Budget Management</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 5 -->
          <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10 overflow-hidden flex mr-4" style="width: 14.2857%;">
            <!-- Left Side - Current Design -->
            <div class="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/ken.jpg" alt="Ken Zedrick E. Montano" class="w-full h-full object-cover rounded-full" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">Ken Zedrick E. Montano</h3>
              <p class="text-gray-600 dark:text-gray-300 text-center">CMO</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">david@example.com</p>
            </div>
            <!-- Right Side - New Design -->
            <div class="w-1/2 p-6 bg-gradient-to-br from-pink-500 to-pink-700 dark:from-pink-600 dark:to-pink-800 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              <div class="relative z-10 text-center">
                <div class="mb-4">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
                  </svg>
                </div>
                <h4 class="text-sm font-semibold mb-3 opacity-95">Marketing</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Brand Strategy</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Digital Campaigns</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Growth</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Duplicate cards for seamless infinite loop -->
          <!-- Card 1 (Duplicate) -->
          <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10 overflow-hidden flex mr-4" style="width: 14.2857%;">
            <!-- Left Side - Current Design -->
            <div class="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/glenn.jpg" alt="Glenn R. Galbadores I" class="w-full h-full object-cover rounded-full" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">Glenn R. Galbadores I</h3>
              <p class="text-gray-600 dark:text-gray-300 text-center">CEO</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">john@example.com</p>
            </div>
            <!-- Right Side - New Design -->
            <div class="w-1/2 p-6 bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              <div class="relative z-10 text-center">
                <div class="mb-4">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <h4 class="text-sm font-semibold mb-3 opacity-95">Leadership</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Strategic Vision</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Team Building</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Innovation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2 (Duplicate) -->
          <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10 overflow-hidden flex mr-4" style="width: 14.2857%;">
            <!-- Left Side - Current Design -->
            <div class="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/kurt.jpg" alt="Kurt Angelo F. Ballarta" class="w-full h-full object-cover rounded-full" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">Kurt Angelo F. Ballarta</h3>
              <p class="text-gray-600 dark:text-gray-300 text-center">CTO</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">jane@example.com</p>
            </div>
            <!-- Right Side - New Design -->
            <div class="w-1/2 p-6 bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-600 dark:to-purple-800 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              <div class="relative z-10 text-center">
                <div class="mb-4">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                  </svg>
                </div>
                <h4 class="text-sm font-semibold mb-3 opacity-95">Technology</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>System Architecture</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Cloud Solutions</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Contact Form -->
      <div class="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mx-4 sm:mx-6 lg:mx-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Send us a Message</h2>
        <form id="contact-form" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name *</label>
              <input type="text" id="firstName" name="firstName" required disabled
                     class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:text-white opacity-50 cursor-not-allowed"
                     placeholder="Enter your first name">
              <div class="error-message text-red-500 text-sm mt-1 hidden"></div>
            </div>
            <div class="form-group">
              <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name *</label>
              <input type="text" id="lastName" name="lastName" required disabled
                     class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:text-white opacity-50 cursor-not-allowed"
                     placeholder="Enter your last name">
              <div class="error-message text-red-500 text-sm mt-1 hidden"></div>
            </div>
          </div>
          <div class="form-group">
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
            <input type="email" id="email" name="email" required disabled
                   class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:text-white opacity-50 cursor-not-allowed"
                   placeholder="Enter your email address">
            <div class="error-message text-red-500 text-sm mt-1 hidden"></div>
          </div>
          <div class="form-group">
            <label for="subject" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject *</label>
            <select id="subject" name="subject" required disabled
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:text-white opacity-50 cursor-not-allowed">
              <option value="">Select a subject</option>
              <option value="general">General Inquiry</option>
              <option value="support">Technical Support</option>
              <option value="sales">Sales Question</option>
              <option value="partnership">Partnership Opportunity</option>
              <option value="feedback">Feedback</option>
            </select>
            <div class="error-message text-red-500 text-sm mt-1 hidden"></div>
          </div>
          <div class="form-group">
            <label for="message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message *</label>
            <textarea id="message" name="message" rows="5" required disabled
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:text-white resize-none opacity-50 cursor-not-allowed"
                      placeholder="Tell us how we can help you..."></textarea>
            <div class="error-message text-red-500 text-sm mt-1 hidden"></div>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="newsletter" name="newsletter" disabled
                   class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded opacity-50 cursor-not-allowed">
            <label for="newsletter" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Subscribe to our newsletter for updates and tips
            </label>
          </div>
          <button type="submit" disabled
                  class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            <span class="submit-text">Send Message</span>
            <span class="loading-text hidden">Sending...</span>
          </button>
        </form>
        <div id="form-success" class="hidden mt-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-300 rounded-lg">
          Thank you for your message! We'll get back to you within 24 hours.
        </div>
      </div>

      <!-- Interactive Map Section -->
      <div class="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mx-4 sm:mx-6 lg:mx-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Find Us</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="space-y-6">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Main Office</h3>
                <p class="text-gray-600 dark:text-gray-300 mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
                <p class="text-gray-600 dark:text-gray-300">Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</p>
                <button onclick="window.location.hash = '/about'" class="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200">
                  Get Directions →
                </button>
              </div>
            </div>
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Phone</h3>
                <p class="text-gray-600 dark:text-gray-300 mb-2">Ut enim ad minim veniam, quis nostrud</p>
                <p class="text-gray-600 dark:text-gray-300">Exercitation ullamco laboris nisi ut aliquip</p>
                <button onclick="window.location.hash = '/dashboard'" class="mt-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium transition-colors duration-200">
                  Call Now →
                </button>
              </div>
            </div>
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
                <p class="text-gray-600 dark:text-gray-300 mb-2">Duis aute irure dolor in reprehenderit</p>
                <p class="text-gray-600 dark:text-gray-300">In voluptate velit esse cillum dolore eu fugiat</p>
                <button onclick="window.location.hash = '/'" class="mt-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium transition-colors duration-200">
                  Send Email →
                </button>
              </div>
            </div>
          </div>
          <div onclick="window.location.hash = '/about'" class="bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center h-64 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">
            <div class="text-center">
              <svg class="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
              <p class="text-gray-500 dark:text-gray-400">Excepteur sint occaecat cupidatat non proident</p>
              <p class="text-sm text-gray-400 dark:text-gray-500">Sunt in culpa qui officia deserunt mollit anim</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Business Hours -->
      <div class="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mx-4 sm:mx-6 lg:mx-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Business Hours</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <div class="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="font-medium text-gray-900 dark:text-white">Monday - Friday</span>
              <span class="text-gray-600 dark:text-gray-300">9:00 AM - 6:00 PM</span>
            </div>
            <div class="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="font-medium text-gray-900 dark:text-white">Saturday</span>
              <span class="text-gray-600 dark:text-gray-300">10:00 AM - 4:00 PM</span>
            </div>
            <div class="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="font-medium text-gray-900 dark:text-white">Sunday</span>
              <span class="text-gray-600 dark:text-gray-300">Closed</span>
            </div>
          </div>
          <div class="text-center">
            <div id="current-status" class="inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold mb-4">
              <div id="status-indicator" class="w-3 h-3 rounded-full mr-3 animate-pulse"></div>
              <span id="status-text">Checking status...</span>
            </div>
            <p class="text-gray-600 dark:text-gray-300 text-sm">
              <span id="next-opening">Next opening: Monday 9:00 AM</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Social Media Links -->
      <div class="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mx-4 sm:mx-6 lg:mx-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Follow Us</h2>
        <div class="flex justify-center space-x-6">
          <button onclick="window.location.hash = '/about'" class="social-link group flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transform hover:scale-110 transition-all duration-200">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
          </button>
          <button onclick="window.location.hash = '/dashboard'" class="social-link group flex items-center justify-center w-12 h-12 bg-blue-800 text-white rounded-full hover:bg-blue-900 transform hover:scale-110 transition-all duration-200">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          <button onclick="window.location.hash = '/'" class="social-link group flex items-center justify-center w-12 h-12 bg-pink-600 text-white rounded-full hover:bg-pink-700 transform hover:scale-110 transition-all duration-200">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
            </svg>
          </button>
          <button onclick="window.location.hash = '/contact'" class="social-link group flex items-center justify-center w-12 h-12 bg-gray-800 text-white rounded-full hover:bg-gray-900 transform hover:scale-110 transition-all duration-200">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- User Feedback -->
      <div class="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mx-4 sm:mx-6 lg:mx-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">User Feedback</h2>
        
        <div id="feedback-container" class="space-y-8">
          <!-- Loading state -->
          <div id="feedback-loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-4 text-gray-600 dark:text-gray-400">Loading feedback...</p>
          </div>
          
          <!-- Empty state (hidden by default) -->
          <div id="feedback-empty" class="text-center py-8 hidden">
            <p class="text-gray-600 dark:text-gray-400">No feedback available yet. Check back soon!</p>
          </div>
        </div>
      </div>
    </div>
    <script>
      // Load feedback from database
      async function loadFeedback() {
        const feedbackContainer = document.getElementById('feedback-container');
        const feedbackLoading = document.getElementById('feedback-loading');
        const feedbackEmpty = document.getElementById('feedback-empty');
        
        try {
          // Use the supabase client from the global scope (set up in App.ts)
          const supabaseClient = window.supabaseClient;
          
          if (!supabaseClient) {
            console.error('Supabase client not available');
            if (feedbackLoading) feedbackLoading.classList.add('hidden');
            if (feedbackEmpty) feedbackEmpty.classList.remove('hidden');
            return;
          }
          
          // Try RPC function first, fallback to direct query if it fails
          let feedbackData = null;
          let error = null;
          
          try {
            const result = await supabaseClient.rpc('get_public_feedback');
            feedbackData = result.data;
            error = result.error;
          } catch (rpcError) {
            console.log('RPC function not available, trying direct query...', rpcError);
            // Fallback: query directly from visit_feedback table
            const { data, error: queryError } = await supabaseClient
              .from('visit_feedback')
              .select('id, comments, overall_satisfaction, submitted_at, scheduled_visits(visitor_first_name, visitor_last_name)')
              .not('comments', 'is', null)
              .gte('overall_satisfaction', 4)
              .order('submitted_at', { ascending: false })
              .limit(100);
            
            if (queryError) {
              error = queryError;
            } else if (data && data.length > 0) {
              // Select random feedback based on today's date
              const today = new Date();
              const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
              const randomIndex = dayOfYear % data.length;
              const selected = data[randomIndex];
              
              feedbackData = [{
                id: selected.id,
                visitor_name: (selected.scheduled_visits?.visitor_first_name || '') + ' ' + (selected.scheduled_visits?.visitor_last_name || '') || 'Anonymous',
                comments: selected.comments,
                overall_satisfaction: selected.overall_satisfaction,
                submitted_at: selected.submitted_at
              }];
            }
          }
          
          if (error) {
            console.error('Error loading feedback:', error);
            if (feedbackLoading) feedbackLoading.classList.add('hidden');
            if (feedbackEmpty) feedbackEmpty.classList.remove('hidden');
            return;
          }
          
          // Hide loading state
          if (feedbackLoading) feedbackLoading.classList.add('hidden');
          
          // Handle the response
          let feedback = null;
          if (Array.isArray(feedbackData)) {
            feedback = feedbackData.length > 0 ? feedbackData[0] : null;
          } else if (feedbackData) {
            feedback = feedbackData;
          }
          
          // If no feedback found, show empty state
          if (!feedback || !feedback.comments) {
            if (feedbackEmpty) feedbackEmpty.classList.remove('hidden');
            return;
          }
          
          // Clear container and render single feedback
          if (feedbackContainer) {
            const color = { bg: 'bg-blue-100', darkBg: 'dark:bg-blue-900', text: 'text-blue-600', darkText: 'dark:text-blue-400' };
            const rating = feedback.overall_satisfaction || 5;
            const comment = (feedback.comments || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            const visitorName = feedback.visitor_name || 'Anonymous';
            const date = new Date(feedback.submitted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            
            // Create stars HTML - simpler approach
            let starsHtml = '';
            for (let i = 0; i < 5; i++) {
              if (i < rating) {
                starsHtml += '<span class="text-yellow-400 text-xl">★</span>';
              } else {
                starsHtml += '<span class="text-gray-300 dark:text-gray-600 text-xl">★</span>';
              }
            }
            
            feedbackContainer.innerHTML = '<div class="testimonial-item mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">' +
              '<div class="flex items-start space-x-4">' +
                '<div class="flex-shrink-0">' +
                  '<div class="w-12 h-12 ' + color.bg + ' ' + color.darkBg + ' rounded-full flex items-center justify-center">' +
                    '<svg class="w-6 h-6 ' + color.text + ' ' + color.darkText + '" fill="currentColor" viewBox="0 0 24 24">' +
                      '<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>' +
                    '</svg>' +
                  '</div>' +
                '</div>' +
                '<div class="flex-1">' +
                  '<blockquote class="text-lg text-gray-700 dark:text-gray-300 italic mb-4">' +
                    '"' + comment + '"' +
                  '</blockquote>' +
                  '<div class="flex items-center">' +
                    '<div>' +
                      '<cite class="text-sm font-semibold text-gray-900 dark:text-white">' + visitorName + '</cite>' +
                      '<p class="text-sm text-gray-500 dark:text-gray-400">' + date + '</p>' +
                    '</div>' +
                    '<div class="ml-auto">' +
                      '<div class="flex items-center gap-1">' +
                        starsHtml +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
          }
        } catch (error) {
          console.error('Error in loadFeedback:', error);
          if (feedbackLoading) feedbackLoading.classList.add('hidden');
          if (feedbackEmpty) feedbackEmpty.classList.remove('hidden');
        }
      }
      
      // Contact form validation and submission
      document.addEventListener('DOMContentLoaded', function() {
        // Load feedback when page loads (with retry mechanism)
        let retryCount = 0;
        const maxRetries = 5;
        
        function attemptLoadFeedback() {
          if (window.supabaseClient) {
            loadFeedback();
          } else if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(attemptLoadFeedback, 200);
          } else {
            // Fallback: hide loading and show empty state
            const feedbackLoading = document.getElementById('feedback-loading');
            const feedbackEmpty = document.getElementById('feedback-empty');
            if (feedbackLoading) feedbackLoading.classList.add('hidden');
            if (feedbackEmpty) feedbackEmpty.classList.remove('hidden');
            console.error('Supabase client not available after retries');
          }
        }
        
        attemptLoadFeedback();
        
        const form = document.getElementById('contact-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        const submitText = submitBtn.querySelector('.submit-text');
        const loadingText = submitBtn.querySelector('.loading-text');
        const successMessage = document.getElementById('form-success');

        // Form validation
        function validateField(field) {
          const value = field.value.trim();
          const errorDiv = field.parentNode.querySelector('.error-message');
          
          if (field.hasAttribute('required') && !value) {
            errorDiv.textContent = 'This field is required';
            errorDiv.classList.remove('hidden');
            field.classList.add('border-red-500');
            return false;
          }
          
          if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errorDiv.textContent = 'Please enter a valid email address';
              errorDiv.classList.remove('hidden');
              field.classList.add('border-red-500');
              return false;
            }
          }
          
          errorDiv.classList.add('hidden');
          field.classList.remove('border-red-500');
          return true;
        }

        // Real-time validation
        form.querySelectorAll('input, select, textarea').forEach(field => {
          field.addEventListener('blur', () => validateField(field));
          field.addEventListener('input', () => {
            if (field.classList.contains('border-red-500')) {
              validateField(field);
            }
          });
        });

        // Form submission
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          
          let isValid = true;
          form.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
            if (!validateField(field)) {
              isValid = false;
            }
          });

          if (isValid) {
            // Show loading state
            submitBtn.disabled = true;
            submitText.classList.add('hidden');
            loadingText.classList.remove('hidden');
            
            // Simulate form submission
            setTimeout(() => {
              submitBtn.disabled = false;
              submitText.classList.remove('hidden');
              loadingText.classList.add('hidden');
              successMessage.classList.remove('hidden');
              form.reset();
              
              // Hide success message after 5 seconds
              setTimeout(() => {
                successMessage.classList.add('hidden');
              }, 5000);
            }, 2000);
          }
        });

        // Business hours status
        function updateBusinessStatus() {
          const now = new Date();
          const day = now.getDay();
          const hour = now.getHours();
          const minute = now.getMinutes();
          const currentTime = hour * 60 + minute;
          
          const statusIndicator = document.getElementById('status-indicator');
          const statusText = document.getElementById('status-text');
          const nextOpening = document.getElementById('next-opening');
          
          let isOpen = false;
          let nextOpen = '';
          
          if (day >= 1 && day <= 5) { // Monday to Friday
            if (currentTime >= 9 * 60 && currentTime < 18 * 60) {
              isOpen = true;
            } else if (currentTime < 9 * 60) {
              nextOpen = 'Today at 9:00 AM';
            } else {
              nextOpen = 'Tomorrow at 9:00 AM';
            }
          } else if (day === 6) { // Saturday
            if (currentTime >= 10 * 60 && currentTime < 16 * 60) {
              isOpen = true;
            } else if (currentTime < 10 * 60) {
              nextOpen = 'Today at 10:00 AM';
            } else {
              nextOpen = 'Monday at 9:00 AM';
            }
          } else { // Sunday
            nextOpen = 'Monday at 9:00 AM';
          }
          
          if (isOpen) {
            statusIndicator.className = 'w-3 h-3 rounded-full mr-3 bg-green-500';
            statusText.textContent = 'We\'re Open!';
            nextOpening.textContent = 'Open until ' + (day >= 1 && day <= 5 ? '6:00 PM' : '4:00 PM');
          } else {
            statusIndicator.className = 'w-3 h-3 rounded-full mr-3 bg-red-500';
            statusText.textContent = 'We\'re Closed';
            nextOpening.textContent = 'Next opening: ' + nextOpen;
          }
        }

        // Update business status every minute
        updateBusinessStatus();
        setInterval(updateBusinessStatus, 60000);

        // Testimonials are now static - no JavaScript needed
      });
    </script>
  `;
}