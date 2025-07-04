import supabase from '../config/supabase';

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
    </style>
  `;
}
