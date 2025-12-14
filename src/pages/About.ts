import { ThesisTimeline } from '../components/mini-features/ThesisTimeline';
import { OurValues } from '../components/mini-features/OurValues';
import { TechnologyStack } from '../components/mini-features/TechnologyStack';
import { OurCulture } from '../components/mini-features/OurCulture';
import { ByTheNumbers } from '../components/mini-features/ByTheNumbers';
import { Footer } from '../components/mini-features/Footer';

export function AboutPage() {
  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 animate-fade-in">
      <!-- Hero Section -->
      <div class="text-center mb-8 sm:mb-12">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-400 mb-3 sm:mb-4 animate-slide-down">About GuestGo</h1>
        <p class="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 px-2 animate-fade-in-delay">Revolutionizing guest management for modern businesses.</p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <a href="#/contact" class="inline-block bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out animate-bounce text-sm sm:text-base">Contact Us</a>
          <button id="qr-share-btn" class="inline-flex items-center gap-2 bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg hover:bg-green-700 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out animate-pulse hover:animate-none text-sm sm:text-base qr-share-btn">
            <svg class="w-5 h-5 qr-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
            </svg>
            Share QR
          </button>
        </div>
      </div>

      <!-- Features Section -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 text-center animate-fade-in feature-card hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out">
          <div class="flex justify-center mb-3 sm:mb-4">
            <svg class="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 transform hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2z"/><path d="M17.657 16.657A8 8 0 1112 4v8h8a8 8 0 01-2.343 4.657z"/></svg>
          </div>
          <h3 class="text-lg sm:text-xl font-semibold mb-2">Seamless Check-In</h3>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300">Fast, paperless, and secure guest check-in for any business type.</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 text-center animate-fade-in feature-card hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out" style="animation-delay:0.2s;">
          <div class="flex justify-center mb-3 sm:mb-4">
            <svg class="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 transform hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 17v-2a4 4 0 018 0v2"/><path d="M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg>
          </div>
          <h3 class="text-lg sm:text-xl font-semibold mb-2">Real-Time Analytics</h3>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300">Track guest flow, peak times, and more with live dashboards.</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 text-center animate-fade-in feature-card hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out" style="animation-delay:0.4s;">
          <div class="flex justify-center mb-3 sm:mb-4">
            <svg class="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 transform hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 7v4a1 1 0 001 1h3v2a1 1 0 001 1h4a1 1 0 001-1v-2h3a1 1 0 001-1V7"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/></svg>
          </div>
          <h3 class="text-lg sm:text-xl font-semibold mb-2">Customizable Workflows</h3>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300">Tailor guest journeys to fit your brand and operational needs.</p>
        </div>
      </div>

      <!-- FAQ Accordion -->
      <div class="mb-8 sm:mb-12 md:mb-16">
        <h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center animate-fade-in-up px-2" style="animation-delay:1s;">GuestGo Experience</h2>
        <div class="space-y-3 sm:space-y-4 max-w-2xl mx-auto px-2">
          <div class="faq-item border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <button class="w-full flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-gray-100 dark:bg-gray-700 font-semibold focus:outline-none faq-question hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 text-sm sm:text-base">
              <span>What is GuestGo?</span>
              <svg class="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 transform faq-icon flex-shrink-0 ml-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="faq-answer px-4 sm:px-6 py-0 bg-white dark:bg-gray-800 max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
              <div class="py-3 sm:py-4 text-sm sm:text-base">GuestGo is a platform for businesses to manage guest check-ins, analytics, and more, all in one place.</div>
            </div>
          </div>
          <div class="faq-item border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <button class="w-full flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-gray-100 dark:bg-gray-700 font-semibold focus:outline-none faq-question hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 text-sm sm:text-base">
              <span>Is GuestGo secure?</span>
              <svg class="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 transform faq-icon flex-shrink-0 ml-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="faq-answer px-4 sm:px-6 py-0 bg-white dark:bg-gray-800 max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
              <div class="py-3 sm:py-4 text-sm sm:text-base">Yes, we use industry-standard security practices to keep your data safe.</div>
            </div>
          </div>
          <div class="faq-item border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <button class="w-full flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-gray-100 dark:bg-gray-700 font-semibold focus:outline-none faq-question hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 text-sm sm:text-base">
              <span>Can I customize the guest experience?</span>
              <svg class="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 transform faq-icon flex-shrink-0 ml-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="faq-answer px-4 sm:px-6 py-0 bg-white dark:bg-gray-800 max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
              <div class="py-3 sm:py-4 text-sm sm:text-base">Absolutely! GuestGo offers customizable workflows and branding options.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Section -->
      <div class="mb-8 sm:mb-12">
        <h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center animate-fade-in-up px-2" style="animation-delay:1.2s;">Meet the Team</h2>
        <div class="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 px-2">
          <button class="team-member bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 text-center transition-all duration-300 ease-out hover:shadow-2xl hover:scale-105 cursor-pointer focus:outline-none animate-fade-in-up w-full sm:w-auto" data-member="glenn" style="animation-delay:1.4s;">
            <img src="/glenn.jpg" alt="Glenn" class="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-3 sm:mb-4 team-photo object-cover">
            <h3 class="text-base sm:text-lg font-semibold">Glenn</h3>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300">Founder & CEO</p>
          </button>
          <button class="team-member bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 text-center transition-all duration-300 ease-out hover:shadow-2xl hover:scale-105 cursor-pointer focus:outline-none animate-fade-in-up w-full sm:w-auto" data-member="justine" style="animation-delay:1.6s;">
            <img src="/justine.jpg" alt="Justine" class="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-3 sm:mb-4 team-photo object-cover">
            <h3 class="text-base sm:text-lg font-semibold">Justine</h3>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300">Product Manager</p>
          </button>
          <button class="team-member bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 text-center transition-all duration-300 ease-out hover:shadow-2xl hover:scale-105 cursor-pointer focus:outline-none animate-fade-in-up w-full sm:w-auto" data-member="ken" style="animation-delay:1.8s;">
            <img src="/ken.jpg" alt="Ken" class="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-3 sm:mb-4 team-photo object-cover">
            <h3 class="text-base sm:text-lg font-semibold">Ken</h3>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300">Lead Developer</p>
          </button>
          <button class="team-member bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 text-center transition-all duration-300 ease-out hover:shadow-2xl hover:scale-105 cursor-pointer focus:outline-none animate-fade-in-up w-full sm:w-auto" data-member="kurt" style="animation-delay:2s;">
            <img src="/kurt.jpg" alt="Kurt" class="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-3 sm:mb-4 team-photo object-cover">
            <h3 class="text-base sm:text-lg font-semibold">Kurt</h3>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300">UI/UX Designer</p>
          </button>
          <button class="team-member bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 text-center transition-all duration-300 ease-out hover:shadow-2xl hover:scale-105 cursor-pointer focus:outline-none animate-fade-in-up w-full sm:w-auto" data-member="walter" style="animation-delay:2.2s;">
            <img src="/walter.jpg" alt="Walter" class="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-3 sm:mb-4 team-photo object-cover">
            <h3 class="text-base sm:text-lg font-semibold">Walter</h3>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300">QA Engineer</p>
          </button>
        </div>
      </div>


      ${ThesisTimeline()}

      ${OurValues()}

      ${TechnologyStack()}

      ${ByTheNumbers()}

      ${OurCulture()}
      
      ${Footer()}
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
      
      /* QR Share Button Animations */
      .qr-share-btn {
        animation: qrButtonPulse 2s ease-in-out infinite;
      }
      
      .qr-share-btn:hover {
        animation: qrButtonHover 0.3s ease-out forwards;
      }
      
      .qr-share-btn:hover .qr-icon {
        animation: qrIconRotate 0.5s ease-out;
      }
      
      @keyframes qrButtonPulse {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
        }
      }
      
      @keyframes qrButtonHover {
        0% {
          transform: translateY(0) scale(1);
        }
        50% {
          transform: translateY(-4px) scale(1.05);
        }
        100% {
          transform: translateY(-2px) scale(1.02);
        }
      }
      
      @keyframes qrIconRotate {
        0% {
          transform: rotate(0deg);
        }
        25% {
          transform: rotate(-10deg) scale(1.1);
        }
        75% {
          transform: rotate(10deg) scale(1.1);
        }
        100% {
          transform: rotate(0deg) scale(1);
        }
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