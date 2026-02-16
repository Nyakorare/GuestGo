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

      <!-- GuestGo Experience - redesigned journey-style accordion -->
      <section class="mb-8 sm:mb-12 md:mb-16">
        <div class="max-w-5xl mx-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 border border-blue-100/60 dark:border-blue-900/60 rounded-3xl shadow-xl px-4 sm:px-8 md:px-10 py-6 sm:py-8 md:py-10 relative overflow-hidden">
          <div class="pointer-events-none absolute inset-0 opacity-40 dark:opacity-30">
            <div class="absolute -top-24 -right-10 w-56 h-56 bg-blue-200/60 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
            <div class="absolute -bottom-32 -left-10 w-64 h-64 bg-indigo-200/60 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
          </div>

          <div class="relative grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] items-start">
            <!-- Intro copy -->
            <div class="space-y-4 sm:space-y-5">
              <p class="inline-flex items-center px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-900/40 text-[11px] sm:text-xs font-semibold tracking-wide text-blue-700 dark:text-blue-300 uppercase">
                Guest journey, end to end
              </p>
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                GuestGo <span class="text-blue-600 dark:text-blue-400">Experience</span>
              </h2>
              <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl">
                See how a typical visit feels from your guest’s point of view—from the moment they schedule,
                to secure gate verification, up to feedback after the visit. Each step is designed to be fast,
                transparent, and human-friendly.
              </p>
              <div class="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div class="flex items-start gap-2">
                  <div class="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                    1
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-gray-100">Frictionless scheduling</p>
                    <p class="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">Guests book online in minutes.</p>
                  </div>
                </div>
                <div class="flex items-start gap-2">
                  <div class="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                    2
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-gray-100">Smart verification</p>
                    <p class="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">QR + face detection at the gate.</p>
                  </div>
                </div>
                <div class="flex items-start gap-2">
                  <div class="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-xs font-semibold">
                    3
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-gray-100">Guided visit</p>
                    <p class="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">Clear statuses across all places.</p>
                  </div>
                </div>
                <div class="flex items-start gap-2">
                  <div class="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                    4
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-gray-100">Feedback & insights</p>
                    <p class="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">Close the loop with surveys.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Journey accordion -->
            <div class="space-y-3 sm:space-y-4 relative">
              <div class="absolute inset-y-4 left-3 sm:left-4 w-px bg-gradient-to-b from-blue-400/70 via-indigo-400/40 to-transparent pointer-events-none hidden sm:block"></div>

              <div class="faq-item relative group bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm border border-blue-100/70 dark:border-blue-800/70 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div class="absolute left-3 sm:left-4 top-5 sm:top-6 h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.25)]"></div>
                <button class="faq-question w-full flex justify-between items-center gap-3 pl-9 sm:pl-12 pr-4 sm:pr-5 py-3.5 sm:py-4 text-left bg-gradient-to-r from-blue-50/80 via-white to-transparent dark:from-blue-900/40 dark:via-gray-900/80 dark:to-transparent hover:from-blue-100/90 dark:hover:from-blue-800/60 transition-colors duration-300">
                  <div class="flex items-center gap-3">
                    <span class="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold shadow-md">01</span>
                    <span class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Schedule a visit in a few taps</span>
                  </div>
                  <svg class="faq-icon w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                <div class="faq-answer px-4 sm:px-6 py-0 bg-white/95 dark:bg-gray-900/95 max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
                  <div class="py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Guests choose their destination, purpose, and date from any device. GuestGo automatically enforces visit limits,
                    shows available slots, and sends a confirmation email with a unique QR code—no phone calls or manual encoding needed.
                  </div>
                </div>
              </div>

              <div class="faq-item relative group bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm border border-emerald-100/70 dark:border-emerald-800/70 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div class="absolute left-3 sm:left-4 top-5 sm:top-6 h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.25)]"></div>
                <button class="faq-question w-full flex justify-between items-center gap-3 pl-9 sm:pl-12 pr-4 sm:pr-5 py-3.5 sm:py-4 text-left bg-gradient-to-r from-emerald-50/80 via-white to-transparent dark:from-emerald-900/40 dark:via-gray-900/80 dark:to-transparent hover:from-emerald-100/90 dark:hover:from-emerald-800/60 transition-colors duration-300">
                  <div class="flex items-center gap-3">
                    <span class="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-semibold shadow-md">02</span>
                    <span class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Arrive and verify securely at the gate</span>
                  </div>
                  <svg class="faq-icon w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                <div class="faq-answer px-4 sm:px-6 py-0 bg-white/95 dark:bg-gray-900/95 max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
                  <div class="py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    On arrival, guards simply scan the QR code and optionally verify using AI-powered facial recognition.
                    Gate staff see live status, visit details, and can mark temporary exits—all while keeping queues short
                    and security tight.
                  </div>
                </div>
              </div>

              <div class="faq-item relative group bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm border border-indigo-100/70 dark:border-indigo-800/70 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div class="absolute left-3 sm:left-4 top-5 sm:top-6 h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_0_4px_rgba(79,70,229,0.25)]"></div>
                <button class="faq-question w-full flex justify-between items-center gap-3 pl-9 sm:pl-12 pr-4 sm:pr-5 py-3.5 sm:py-4 text-left bg-gradient-to-r from-indigo-50/80 via-white to-transparent dark:from-indigo-900/40 dark:via-gray-900/80 dark:to-transparent hover:from-indigo-100/90 dark:hover:from-indigo-800/60 transition-colors duration-300">
                  <div class="flex items-center gap-3">
                    <span class="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-md">03</span>
                    <span class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Move through places with live status</span>
                  </div>
                  <svg class="faq-icon w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                <div class="faq-answer px-4 sm:px-6 py-0 bg-white/95 dark:bg-gray-900/95 max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
                  <div class="py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    As guests complete requirements across different offices or places, their visit status updates in real time
                    (Pending, In Progress, Temporary Exit, Completed). This keeps both guests and staff aligned on what’s next.
                  </div>
                </div>
              </div>

              <div class="faq-item relative group bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-100/70 dark:border-amber-800/70 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div class="absolute left-3 sm:left-4 top-5 sm:top-6 h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.25)]"></div>
                <button class="faq-question w-full flex justify-between items-center gap-3 pl-9 sm:pl-12 pr-4 sm:pr-5 py-3.5 sm:py-4 text-left bg-gradient-to-r from-amber-50/80 via-white to-transparent dark:from-amber-900/40 dark:via-gray-900/80 dark:to-transparent hover:from-amber-100/90 dark:hover:from-amber-800/60 transition-colors duration-300">
                  <div class="flex items-center gap-3">
                    <span class="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white text-sm font-semibold shadow-md">04</span>
                    <span class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Wrap up with feedback that matters</span>
                  </div>
                  <svg class="faq-icon w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                <div class="faq-answer px-4 sm:px-6 py-0 bg-white/95 dark:bg-gray-900/95 max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
                  <div class="py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    After the visit, guests can answer a short ISO 25010–inspired survey about their experience.
                    You get structured feedback on usability, performance, and security—turning every visit into insight
                    you can act on.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Meet the Team -->
      <section class="mb-10 sm:mb-14 md:mb-16 px-2">
        <div class="max-w-6xl mx-auto bg-gradient-to-br from-sky-50 via-white to-cyan-50 dark:from-sky-950/40 dark:via-slate-950 dark:to-cyan-950/40 border border-sky-200/70 dark:border-sky-900/50 rounded-3xl shadow-xl overflow-hidden relative">
          <div class="pointer-events-none absolute inset-0 opacity-50 dark:opacity-30">
            <div class="absolute -top-20 right-0 w-48 h-48 bg-sky-200/60 dark:bg-sky-500/10 rounded-full blur-3xl"></div>
            <div class="absolute -bottom-24 left-10 w-56 h-56 bg-cyan-200/60 dark:bg-cyan-500/10 rounded-full blur-3xl"></div>
          </div>

          <div class="relative p-5 sm:p-8 md:p-10 lg:p-12">
            <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] items-start">
              <!-- Intro -->
              <div class="space-y-4 sm:space-y-5">
                <p class="inline-flex items-center px-3 py-1 rounded-full bg-sky-100/80 dark:bg-sky-900/40 text-[11px] sm:text-xs font-semibold tracking-wide text-sky-700 dark:text-sky-300 uppercase">
                  The people behind GuestGo
                </p>
                <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  Meet the <span class="text-sky-600 dark:text-sky-400">Team</span>
                </h2>
                <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-md">
                  Our thesis project team brings together leadership, product, engineering, design, and quality assurance—each member driving GuestGo from idea to production.
                </p>
                <p class="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                  Click a card to read a short bio.
                </p>
              </div>

              <!-- Team grid -->
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <button class="team-member group relative bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-sky-100/70 dark:border-sky-800/70 shadow-lg hover:shadow-xl hover:border-sky-200 dark:hover:border-sky-600 transition-all duration-300 p-4 sm:p-5 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900" data-member="glenn">
                  <div class="relative mb-3 sm:mb-4 mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-sky-100 dark:ring-sky-800 group-hover:ring-sky-300 dark:group-hover:ring-sky-600 transition-all duration-300">
                    <img src="/glenn.jpg" alt="Glenn" class="team-photo w-full h-full object-cover">
                  </div>
                  <h3 class="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-0.5">Glenn</h3>
                  <p class="text-[11px] sm:text-xs text-sky-600 dark:text-sky-400 font-medium">Founder & CEO</p>
                </button>
                <button class="team-member group relative bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-emerald-100/70 dark:border-emerald-800/70 shadow-lg hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-600 transition-all duration-300 p-4 sm:p-5 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900" data-member="justine">
                  <div class="relative mb-3 sm:mb-4 mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-emerald-100 dark:ring-emerald-800 group-hover:ring-emerald-300 dark:group-hover:ring-emerald-600 transition-all duration-300">
                    <img src="/justine.jpg" alt="Justine" class="team-photo w-full h-full object-cover">
                  </div>
                  <h3 class="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-0.5">Justine</h3>
                  <p class="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium">Product Manager</p>
                </button>
                <button class="team-member group relative bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-violet-100/70 dark:border-violet-800/70 shadow-lg hover:shadow-xl hover:border-violet-200 dark:hover:border-violet-600 transition-all duration-300 p-4 sm:p-5 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900" data-member="ken">
                  <div class="relative mb-3 sm:mb-4 mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-violet-100 dark:ring-violet-800 group-hover:ring-violet-300 dark:group-hover:ring-violet-600 transition-all duration-300">
                    <img src="/ken.jpg" alt="Ken" class="team-photo w-full h-full object-cover">
                  </div>
                  <h3 class="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-0.5">Ken</h3>
                  <p class="text-[11px] sm:text-xs text-violet-600 dark:text-violet-400 font-medium">Lead Developer</p>
                </button>
                <button class="team-member group relative bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-pink-100/70 dark:border-pink-800/70 shadow-lg hover:shadow-xl hover:border-pink-200 dark:hover:border-pink-600 transition-all duration-300 p-4 sm:p-5 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900" data-member="kurt">
                  <div class="relative mb-3 sm:mb-4 mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-pink-100 dark:ring-pink-800 group-hover:ring-pink-300 dark:group-hover:ring-pink-600 transition-all duration-300">
                    <img src="/kurt.jpg" alt="Kurt" class="team-photo w-full h-full object-cover">
                  </div>
                  <h3 class="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-0.5">Kurt</h3>
                  <p class="text-[11px] sm:text-xs text-pink-600 dark:text-pink-400 font-medium">UI/UX Designer</p>
                </button>
                <button class="team-member group relative bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-amber-100/70 dark:border-amber-800/70 shadow-lg hover:shadow-xl hover:border-amber-200 dark:hover:border-amber-600 transition-all duration-300 p-4 sm:p-5 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 col-span-2 sm:col-span-1 sm:col-start-2" data-member="walter">
                  <div class="relative mb-3 sm:mb-4 mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-amber-100 dark:ring-amber-800 group-hover:ring-amber-300 dark:group-hover:ring-amber-600 transition-all duration-300">
                    <img src="/walter.jpg" alt="Walter" class="team-photo w-full h-full object-cover">
                  </div>
                  <h3 class="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-0.5">Walter</h3>
                  <p class="text-[11px] sm:text-xs text-amber-600 dark:text-amber-400 font-medium">QA Engineer</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


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
      
      /* Team modal design: decorative dots */
      .team-modal-dots {
        background-image: radial-gradient(circle, currentColor 1.5px, transparent 1.5px);
        background-size: 8px 8px;
        pointer-events: none;
      }
      .team-modal-dots--bottom {
        background-size: 6px 6px;
      }
      .team-modal-card {
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.08);
      }
      .dark .team-modal-card {
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.12);
      }
      .team-modal-avatar-ring {
        box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
      }
      
      /* Team modal entrance animations */
      #team-modal.show .team-modal-accent {
        animation: teamModalAccentIn 0.5s ease-out 0.2s forwards;
        transform: scaleX(0);
      }
      #team-modal.show .team-modal-dots--tr {
        animation: teamModalDotsIn 0.4s ease-out 0.35s forwards;
        opacity: 0;
        transform: scale(0.8);
      }
      #team-modal.show .team-modal-dots--bottom {
        animation: teamModalDotsIn 0.4s ease-out 0.5s forwards;
        opacity: 0;
        transform: scale(0.8);
      }
      #team-modal.show .team-modal-close-btn {
        animation: teamModalFadeIn 0.3s ease-out 0.4s forwards;
        opacity: 0;
      }
      #team-modal.show .team-modal-anim {
        opacity: 0;
        transform: translateY(12px);
        animation: teamModalContentIn 0.45s ease-out forwards;
      }
      #team-modal.show .team-modal-avatar-wrap {
        transform: translateY(12px) scale(0.85);
        animation: teamModalAvatarIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      #team-modal.show .team-modal-divider {
        transform: scaleX(0);
        transform-origin: center;
        animation: teamModalDividerIn 0.4s ease-out forwards;
      }
      
      @keyframes teamModalAccentIn {
        from { transform: scaleX(0); }
        to { transform: scaleX(1); }
      }
      @keyframes teamModalDotsIn {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 0.1;
          transform: scale(1);
        }
      }
      .dark #team-modal.show .team-modal-dots--tr,
      .dark #team-modal.show .team-modal-dots--bottom {
        animation: teamModalDotsInDark 0.4s ease-out forwards;
      }
      .dark #team-modal.show .team-modal-dots--tr { animation-delay: 0.35s; }
      .dark #team-modal.show .team-modal-dots--bottom { animation-delay: 0.5s; }
      @keyframes teamModalDotsInDark {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 0.2;
          transform: scale(1);
        }
      }
      @keyframes teamModalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes teamModalContentIn {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes teamModalAvatarIn {
        from {
          opacity: 0;
          transform: translateY(12px) scale(0.85);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @keyframes teamModalDividerIn {
        from { transform: scaleX(0); }
        to { transform: scaleX(1); }
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
        transform: translateY(-3px);
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
      .timeline-item:nth-child(2) { animation-delay: 0.15s; }
      .timeline-item:nth-child(3) { animation-delay: 0.2s; }
      .timeline-item:nth-child(4) { animation-delay: 0.25s; }
      .timeline-item:nth-child(5) { animation-delay: 0.3s; }
      .timeline-item:nth-child(6) { animation-delay: 0.35s; }
      .timeline-item:nth-child(7) { animation-delay: 0.4s; }
      .timeline-item:nth-child(8) { animation-delay: 0.45s; }
      .timeline-item:nth-child(9) { animation-delay: 0.5s; }
      .timeline-item:nth-child(10) { animation-delay: 0.55s; }
      .timeline-item:nth-child(11) { animation-delay: 0.6s; }
      .timeline-item:nth-child(12) { animation-delay: 0.65s; }
      .timeline-item:nth-child(13) { animation-delay: 0.7s; }
      
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