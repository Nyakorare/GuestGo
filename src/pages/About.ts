export function AboutPage() {
  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-extrabold text-blue-600 dark:text-blue-400 mb-4 animate-slide-down">About GuestGo</h1>
        <p class="text-xl text-gray-700 dark:text-gray-300 mb-6 animate-fade-in-delay">Revolutionizing guest management for modern businesses.</p>
        <a href="#/contact" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out animate-bounce">Contact Us</a>
      </div>

      <!-- Features Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center animate-fade-in feature-card hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out">
          <div class="flex justify-center mb-4">
            <svg class="w-12 h-12 text-blue-500 transform hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2z"/><path d="M17.657 16.657A8 8 0 1112 4v8h8a8 8 0 01-2.343 4.657z"/></svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Seamless Check-In</h3>
          <p class="text-gray-600 dark:text-gray-300">Fast, paperless, and secure guest check-in for any business type.</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center animate-fade-in feature-card hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out" style="animation-delay:0.2s;">
          <div class="flex justify-center mb-4">
            <svg class="w-12 h-12 text-blue-500 transform hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 17v-2a4 4 0 018 0v2"/><path d="M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Real-Time Analytics</h3>
          <p class="text-gray-600 dark:text-gray-300">Track guest flow, peak times, and more with live dashboards.</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center animate-fade-in feature-card hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out" style="animation-delay:0.4s;">
          <div class="flex justify-center mb-4">
            <svg class="w-12 h-12 text-blue-500 transform hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 7v4a1 1 0 001 1h3v2a1 1 0 001 1h4a1 1 0 001-1v-2h3a1 1 0 001-1V7"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/></svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Customizable Workflows</h3>
          <p class="text-gray-600 dark:text-gray-300">Tailor guest journeys to fit your brand and operational needs.</p>
        </div>
      </div>

      <!-- Animated Counters -->
      <div class="flex flex-col md:flex-row justify-center items-center gap-12 mb-16">
        <div class="text-center animate-fade-in-up" style="animation-delay:0.6s;">
          <div id="guests-managed" class="text-5xl font-bold text-blue-600 dark:text-blue-400 counter transform hover:scale-110 transition-transform duration-300">0</div>
          <div class="text-lg text-gray-700 dark:text-gray-300 mt-2">Guests Managed</div>
        </div>
        <div class="text-center animate-fade-in-up" style="animation-delay:0.8s;">
          <div id="uptime" class="text-5xl font-bold text-blue-600 dark:text-blue-400 counter transform hover:scale-110 transition-transform duration-300">0</div>
          <div class="text-lg text-gray-700 dark:text-gray-300 mt-2">Uptime (%)</div>
        </div>
      </div>

      <!-- FAQ Accordion -->
      <div class="mb-16">
        <h2 class="text-2xl font-bold mb-6 text-center animate-fade-in-up" style="animation-delay:1s;">Frequently Asked Questions</h2>
        <div class="space-y-4 max-w-2xl mx-auto">
          <div class="faq-item border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <button class="w-full flex justify-between items-center px-6 py-4 bg-gray-100 dark:bg-gray-700 font-semibold focus:outline-none faq-question hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
              <span>What is GuestGo?</span>
              <svg class="w-5 h-5 transition-transform duration-300 transform faq-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="faq-answer px-6 py-0 bg-white dark:bg-gray-800 max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
              <div class="py-4">GuestGo is a platform for businesses to manage guest check-ins, analytics, and more, all in one place.</div>
            </div>
          </div>
          <div class="faq-item border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <button class="w-full flex justify-between items-center px-6 py-4 bg-gray-100 dark:bg-gray-700 font-semibold focus:outline-none faq-question hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
              <span>Is GuestGo secure?</span>
              <svg class="w-5 h-5 transition-transform duration-300 transform faq-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="faq-answer px-6 py-0 bg-white dark:bg-gray-800 max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
              <div class="py-4">Yes, we use industry-standard security practices to keep your data safe.</div>
            </div>
          </div>
          <div class="faq-item border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <button class="w-full flex justify-between items-center px-6 py-4 bg-gray-100 dark:bg-gray-700 font-semibold focus:outline-none faq-question hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
              <span>Can I customize the guest experience?</span>
              <svg class="w-5 h-5 transition-transform duration-300 transform faq-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="faq-answer px-6 py-0 bg-white dark:bg-gray-800 max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
              <div class="py-4">Absolutely! GuestGo offers customizable workflows and branding options.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Section -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-6 text-center animate-fade-in-up" style="animation-delay:1.2s;">Meet the Team</h2>
        <div class="flex flex-wrap justify-center gap-8">
          <button class="team-member bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center transition-all duration-300 ease-out hover:shadow-2xl hover:scale-105 cursor-pointer focus:outline-none animate-fade-in-up" data-member="glenn" style="animation-delay:1.4s;">
            <img src="/glenn.jpg" alt="Glenn" class="w-24 h-24 rounded-full mx-auto mb-4 team-photo object-cover">
            <h3 class="text-lg font-semibold">Glenn</h3>
            <p class="text-gray-600 dark:text-gray-300">Founder & CEO</p>
          </button>
          <button class="team-member bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center transition-all duration-300 ease-out hover:shadow-2xl hover:scale-105 cursor-pointer focus:outline-none animate-fade-in-up" data-member="justine" style="animation-delay:1.6s;">
            <img src="/justine.jpg" alt="Justine" class="w-24 h-24 rounded-full mx-auto mb-4 team-photo object-cover">
            <h3 class="text-lg font-semibold">Justine</h3>
            <p class="text-gray-600 dark:text-gray-300">Product Manager</p>
          </button>
          <button class="team-member bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center transition-all duration-300 ease-out hover:shadow-2xl hover:scale-105 cursor-pointer focus:outline-none animate-fade-in-up" data-member="ken" style="animation-delay:1.8s;">
            <img src="/ken.jpg" alt="Ken" class="w-24 h-24 rounded-full mx-auto mb-4 team-photo object-cover">
            <h3 class="text-lg font-semibold">Ken</h3>
            <p class="text-gray-600 dark:text-gray-300">Lead Developer</p>
          </button>
          <button class="team-member bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center transition-all duration-300 ease-out hover:shadow-2xl hover:scale-105 cursor-pointer focus:outline-none animate-fade-in-up" data-member="kurt" style="animation-delay:2s;">
            <img src="/kurt.jpg" alt="Kurt" class="w-24 h-24 rounded-full mx-auto mb-4 team-photo object-cover">
            <h3 class="text-lg font-semibold">Kurt</h3>
            <p class="text-gray-600 dark:text-gray-300">UI/UX Designer</p>
          </button>
          <button class="team-member bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center transition-all duration-300 ease-out hover:shadow-2xl hover:scale-105 cursor-pointer focus:outline-none animate-fade-in-up" data-member="walter" style="animation-delay:2.2s;">
            <img src="/walter.jpg" alt="Walter" class="w-24 h-24 rounded-full mx-auto mb-4 team-photo object-cover">
            <h3 class="text-lg font-semibold">Walter</h3>
            <p class="text-gray-600 dark:text-gray-300">QA Engineer</p>
          </button>
        </div>
      </div>

      <!-- Team Member Popup Modal -->
      <div id="team-modal" class="fixed inset-0 bg-black bg-opacity-0 flex items-center justify-center z-50 hidden backdrop-blur-sm transition-all duration-300 ease-out">
        <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 max-w-md w-full relative transform scale-75 opacity-0 transition-all duration-500 ease-out">
          <button id="close-team-modal" class="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl transition-colors duration-200 transform hover:scale-110">&times;</button>
          <div id="team-modal-content" class="animate-fade-in-up" style="animation-delay: 0.2s;"></div>
        </div>
      </div>

      <!-- Interactive Company Timeline -->
      <div class="mb-16">
        <h2 class="text-2xl font-bold mb-8 text-center animate-fade-in-up" style="animation-delay:2.4s;">Our Journey</h2>
        <div class="max-w-4xl mx-auto">
          <div class="space-y-8">
            <div class="timeline-item flex flex-col md:flex-row items-center gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-600 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                  <span class="text-white font-bold text-sm">2020</span>
                </div>
              </div>
              <div class="flex-1 text-center md:text-left">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Company Founded</h3>
                <p class="text-gray-600 dark:text-gray-300">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </div>
            </div>
            <div class="timeline-item flex flex-col md:flex-row items-center gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-600 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                  <span class="text-white font-bold text-sm">2021</span>
                </div>
              </div>
              <div class="flex-1 text-center md:text-left">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">First Product Launch</h3>
                <p class="text-gray-600 dark:text-gray-300">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              </div>
            </div>
            <div class="timeline-item flex flex-col md:flex-row items-center gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-purple-600 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                  <span class="text-white font-bold text-sm">2022</span>
                </div>
              </div>
              <div class="flex-1 text-center md:text-left">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Series A Funding</h3>
                <p class="text-gray-600 dark:text-gray-300">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
              </div>
            </div>
            <div class="timeline-item flex flex-col md:flex-row items-center gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-orange-600 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                  <span class="text-white font-bold text-sm">2023</span>
                </div>
              </div>
              <div class="flex-1 text-center md:text-left">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">International Expansion</h3>
                <p class="text-gray-600 dark:text-gray-300">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              </div>
            </div>
            <div class="timeline-item flex flex-col md:flex-row items-center gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-red-600 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                  <span class="text-white font-bold text-sm">2024</span>
                </div>
              </div>
              <div class="flex-1 text-center md:text-left">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">AI Integration</h3>
                <p class="text-gray-600 dark:text-gray-300">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Company Values -->
      <div class="mb-20 mt-8">
        <h2 class="text-2xl font-bold mb-8 text-center animate-fade-in-up" style="animation-delay:2.6s;">Our Values</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="value-card group bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out cursor-pointer">
            <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Excellence</h3>
            <p class="text-gray-600 dark:text-gray-300 text-sm">We strive for the highest quality in everything we do.</p>
          </div>
          <div class="value-card group bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out cursor-pointer">
            <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Innovation</h3>
            <p class="text-gray-600 dark:text-gray-300 text-sm">We constantly push boundaries to create better solutions.</p>
          </div>
          <div class="value-card group bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out cursor-pointer">
            <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Collaboration</h3>
            <p class="text-gray-600 dark:text-gray-300 text-sm">We believe in the power of working together.</p>
          </div>
          <div class="value-card group bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out cursor-pointer">
            <div class="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">Passion</h3>
            <p class="text-gray-600 dark:text-gray-300 text-sm">We are passionate about solving real-world problems.</p>
          </div>
        </div>
      </div>

      <!-- Interactive Technology Stack -->
      <div class="mb-20 mt-8">
        <h2 class="text-2xl font-bold mb-8 text-center animate-fade-in-up" style="animation-delay:2.8s;">Technology Stack</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div class="tech-item group bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 text-center hover:shadow-2xl transform hover:scale-110 transition-all duration-300 ease-out cursor-pointer relative">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <span class="text-blue-600 dark:text-blue-400 font-bold text-lg">R</span>
            </div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">React</p>
            <div class="tech-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Frontend Framework
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div class="tech-item group bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 text-center hover:shadow-2xl transform hover:scale-110 transition-all duration-300 ease-out cursor-pointer relative">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <span class="text-green-600 dark:text-green-400 font-bold text-lg">N</span>
            </div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">Node.js</p>
            <div class="tech-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Backend Runtime
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div class="tech-item group bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 text-center hover:shadow-2xl transform hover:scale-110 transition-all duration-300 ease-out cursor-pointer relative">
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <span class="text-purple-600 dark:text-purple-400 font-bold text-lg">T</span>
            </div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">TypeScript</p>
            <div class="tech-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Type Safety
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div class="tech-item group bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 text-center hover:shadow-2xl transform hover:scale-110 transition-all duration-300 ease-out cursor-pointer relative">
            <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <span class="text-orange-600 dark:text-orange-400 font-bold text-lg">S</span>
            </div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">Supabase</p>
            <div class="tech-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Database & Auth
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div class="tech-item group bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 text-center hover:shadow-2xl transform hover:scale-110 transition-all duration-300 ease-out cursor-pointer relative">
            <div class="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <span class="text-pink-600 dark:text-pink-400 font-bold text-lg">T</span>
            </div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">Tailwind</p>
            <div class="tech-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              CSS Framework
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div class="tech-item group bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 text-center hover:shadow-2xl transform hover:scale-110 transition-all duration-300 ease-out cursor-pointer relative">
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <span class="text-red-600 dark:text-red-400 font-bold text-lg">A</span>
            </div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">AWS</p>
            <div class="tech-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Cloud Infrastructure
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Statistics Dashboard -->
      <div class="mb-20 mt-8">
        <h2 class="text-2xl font-bold mb-8 text-center animate-fade-in-up" style="animation-delay:3s;">By the Numbers</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="stat-card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out">
            <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <div id="stat-users" class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">0</div>
            <div class="text-gray-600 dark:text-gray-300">Active Users</div>
          </div>
          <div class="stat-card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out">
            <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div id="stat-companies" class="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">0</div>
            <div class="text-gray-600 dark:text-gray-300">Companies</div>
          </div>
          <div class="stat-card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out">
            <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <div id="stat-checkins" class="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">0</div>
            <div class="text-gray-600 dark:text-gray-300">Check-ins Today</div>
          </div>
          <div class="stat-card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out">
            <div class="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <div id="stat-growth" class="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">0%</div>
            <div class="text-gray-600 dark:text-gray-300">Growth Rate</div>
          </div>
        </div>
      </div>

      <!-- Interactive Company Culture Gallery -->
      <div class="mb-20 mt-8">
        <h2 class="text-2xl font-bold mb-8 text-center animate-fade-in-up" style="animation-delay:3.2s;">Our Culture</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="culture-card group bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out cursor-pointer">
            <div class="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Team Building</h3>
              <p class="text-gray-600 dark:text-gray-300 text-sm">Regular team activities and events to build strong relationships.</p>
            </div>
          </div>
          <div class="culture-card group bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out cursor-pointer">
            <div class="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Learning & Development</h3>
              <p class="text-gray-600 dark:text-gray-300 text-sm">Continuous learning opportunities and professional development programs.</p>
            </div>
          </div>
          <div class="culture-card group bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out cursor-pointer">
            <div class="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Work-Life Balance</h3>
              <p class="text-gray-600 dark:text-gray-300 text-sm">Flexible working arrangements and wellness programs for all employees.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <style>
      .animate-fade-in { 
        animation: fadeIn 1s ease-out; 
        opacity: 0;
        animation-fill-mode: forwards;
      }
      .animate-fade-in-delay { 
        animation: fadeIn 1.5s ease-out; 
        opacity: 0;
        animation-fill-mode: forwards;
      }
      .animate-fade-in-up { 
        animation: fadeInUp 0.8s ease-out; 
        opacity: 0;
        animation-fill-mode: forwards;
      }
      .animate-slide-down { 
        animation: slideDown 1s cubic-bezier(.4,0,.2,1); 
        opacity: 0;
        animation-fill-mode: forwards;
      }
      .animate-bounce { 
        animation: bounce 2s infinite; 
      }
      
      @keyframes fadeIn { 
        from { opacity: 0; } 
        to { opacity: 1; } 
      }
      @keyframes fadeInUp { 
        from { 
          opacity: 0; 
          transform: translateY(30px); 
        } 
        to { 
          opacity: 1; 
          transform: translateY(0); 
        } 
      }
      @keyframes slideDown { 
        from { 
          transform: translateY(-40px); 
          opacity: 0; 
        } 
        to { 
          transform: translateY(0); 
          opacity: 1; 
        } 
      }
      @keyframes bounce { 
        0%, 100% { transform: translateY(0); } 
        50% { transform: translateY(-8px); } 
      }
      
      /* FAQ Styles */
      .faq-item.active .faq-answer {
        max-height: 200px;
        padding-top: 1rem;
        padding-bottom: 1rem;
      }
      
      .faq-item.active .faq-icon {
        transform: rotate(180deg);
      }
      
      /* Modal Animation */
      #team-modal.show {
        display: flex;
        background-color: rgba(0, 0, 0, 0.5);
      }
      
      #team-modal.show > div {
        transform: scale(1);
        opacity: 1;
      }
      
      /* Modal entrance animation */
      #team-modal.show {
        animation: modalFadeIn 0.3s ease-out forwards;
      }
      
      #team-modal.show > div {
        animation: modalSlideIn 0.5s ease-out forwards;
      }
      
      @keyframes modalFadeIn {
        from {
          background-color: rgba(0, 0, 0, 0);
        }
        to {
          background-color: rgba(0, 0, 0, 0.5);
        }
      }
      
      @keyframes modalSlideIn {
        0% {
          transform: scale(0.75) translateY(-50px);
          opacity: 0;
        }
        50% {
          transform: scale(1.05) translateY(0);
          opacity: 0.8;
        }
        100% {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
      }
      
      /* Modal exit animation */
      #team-modal:not(.show) {
        animation: modalFadeOut 0.3s ease-in forwards;
      }
      
      #team-modal:not(.show) > div {
        animation: modalSlideOut 0.3s ease-in forwards;
      }
      
      @keyframes modalFadeOut {
        from {
          background-color: rgba(0, 0, 0, 0.5);
        }
        to {
          background-color: rgba(0, 0, 0, 0);
        }
      }
      
      @keyframes modalSlideOut {
        0% {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
        100% {
          transform: scale(0.75) translateY(50px);
          opacity: 0;
        }
      }
      
      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
      }
      
      /* Hover effects for better interactivity */
      .feature-card:hover {
        transform: translateY(-8px);
      }
      
      .team-member:hover {
        transform: translateY(-4px) scale(1.05);
      }
      
      /* Loading animation for counters */
      .counter {
        transition: all 0.3s ease-out;
      }
      
      /* Timeline animations */
      .timeline-item {
        opacity: 0;
        transform: translateY(20px);
        animation: timelineFadeIn 0.6s ease-out forwards;
      }
      
      .timeline-item:nth-child(1) { animation-delay: 0.1s; }
      .timeline-item:nth-child(2) { animation-delay: 0.2s; }
      .timeline-item:nth-child(3) { animation-delay: 0.3s; }
      .timeline-item:nth-child(4) { animation-delay: 0.4s; }
      .timeline-item:nth-child(5) { animation-delay: 0.5s; }
      
      @keyframes timelineFadeIn {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Value cards hover effects */
      .value-card:hover {
        transform: translateY(-8px) scale(1.02);
      }
      
      /* Tech stack hover effects */
      .tech-item:hover {
        transform: scale(1.1) rotate(2deg);
      }
      
      /* Statistics counter animation */
      .stat-card:hover .counter {
        transform: scale(1.1);
      }
      
      /* Culture gallery hover effects */
      .culture-card:hover .h-48 {
        transform: scale(1.05);
        transition: transform 0.3s ease-out;
      }
    </style>
    <script>
      // Animated counters for statistics
      function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
          start += increment;
          if (start < target) {
            element.textContent = Math.floor(start).toLocaleString();
            requestAnimationFrame(updateCounter);
          } else {
            element.textContent = target.toLocaleString();
          }
        }
        
        updateCounter();
      }
      
      // Initialize counters when page loads
      document.addEventListener('DOMContentLoaded', function() {
        // Animate statistics counters
        setTimeout(() => {
          animateCounter(document.getElementById('stat-users'), 12500);
          animateCounter(document.getElementById('stat-companies'), 850);
          animateCounter(document.getElementById('stat-checkins'), 2450);
          animateCounter(document.getElementById('stat-growth'), 45);
        }, 1000);
        
        // Add click handlers for interactive elements
        document.querySelectorAll('.value-card').forEach(card => {
          card.addEventListener('click', function() {
            // Add a pulse effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
              this.style.transform = '';
            }, 150);
          });
        });
        
        document.querySelectorAll('.tech-item').forEach(item => {
          item.addEventListener('click', function() {
            // Add a bounce effect
            this.style.transform = 'scale(1.2) rotate(5deg)';
            setTimeout(() => {
              this.style.transform = '';
            }, 200);
          });
        });
        
        document.querySelectorAll('.culture-card').forEach(card => {
          card.addEventListener('click', function() {
            // Add a flip effect
            this.style.transform = 'rotateY(10deg) scale(1.05)';
            setTimeout(() => {
              this.style.transform = '';
            }, 300);
          });
        });
        
        // Add scroll-triggered animations
        const observerOptions = {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-fade-in-up');
            }
          });
        }, observerOptions);
        
        // Observe all interactive elements
        document.querySelectorAll('.value-card, .tech-item, .stat-card, .culture-card, .timeline-item').forEach(el => {
          observer.observe(el);
        });
      });
    </script>
  `;
}