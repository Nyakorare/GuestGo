export function TechnologyStack() {
  return `
    <section class="mb-10 sm:mb-14 md:mb-20 mt-4 sm:mt-6 md:mt-8 px-2">
      <div class="max-w-6xl mx-auto bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-950 dark:to-blue-950 border border-slate-200/70 dark:border-slate-800/70 rounded-3xl shadow-xl overflow-hidden relative">
        <div class="pointer-events-none absolute inset-0 opacity-50 dark:opacity-30">
          <div class="absolute -top-24 left-10 w-56 h-56 bg-blue-200/60 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-32 right-0 w-72 h-72 bg-indigo-200/60 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

        <div class="relative grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)] p-5 sm:p-8 md:p-10 lg:p-12 items-start">
          <!-- Intro / copy -->
          <div class="space-y-4 sm:space-y-5 md:space-y-6">
            <p class="inline-flex items-center px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-900/40 text-[11px] sm:text-xs font-semibold tracking-wide text-blue-700 dark:text-blue-300 uppercase">
              Under the hood
            </p>
            <div>
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2">
                Technology <span class="text-blue-600 dark:text-blue-400">Stack</span>
              </h2>
              <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-md">
                GuestGo is built on a modern, production-ready stack that combines fast frontend tooling,
                secure data infrastructure, and AI-powered services for facial recognition and smart scheduling.
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div class="flex items-start gap-2">
                <div class="mt-0.5 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  FE
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-gray-100">Fast, typed frontend</p>
                  <p class="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">Vite + TypeScript + Tailwind.</p>
                </div>
              </div>
              <div class="flex items-start gap-2">
                <div class="mt-0.5 h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                  BE
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-gray-100">Secure backend</p>
                  <p class="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">Supabase + RLS policies.</p>
                </div>
              </div>
              <div class="flex items-start gap-2">
                <div class="mt-0.5 h-6 w-6 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-[11px] font-semibold text-sky-700 dark:text-sky-300">
                  AI
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-gray-100">Face-aware services</p>
                  <p class="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">Python & YOLOv8 pipeline.</p>
                </div>
              </div>
              <div class="flex items-start gap-2">
                <div class="mt-0.5 h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  DX
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-gray-100">Great developer UX</p>
                  <p class="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">Fast builds, clean tooling.</p>
                </div>
              </div>
            </div>

            <div class="hidden md:flex items-center gap-3 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
              <span class="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Optimized for reliability, security, and smooth visitor throughput.</span>
            </div>
          </div>

          <!-- Tech grid -->
          <div class="space-y-4">
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <!-- Vite -->
              <div class="tech-item group relative bg-gradient-to-br from-blue-50/70 to-cyan-50/70 dark:from-blue-900/40 dark:to-cyan-900/40 rounded-2xl shadow-lg p-4 sm:p-5 text-left hover:shadow-2xl transform hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-400 ease-out cursor-pointer border border-blue-100/70 dark:border-blue-800/70 overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-cyan-400/0 group-hover:from-blue-400/10 group-hover:to-cyan-400/10 transition-all duration-400"></div>
                <div class="relative z-10 space-y-2">
                  <div class="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md group-hover:rotate-1 group-hover:scale-105 transition-all duration-300">
                    Vite
                  </div>
                  <div>
                    <p class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Vite</p>
                    <p class="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">Ultra-fast dev server and build tool with instant HMR and optimized bundles.</p>
                  </div>
                  <p class="text-[10px] sm:text-[11px] uppercase tracking-wide text-blue-600/80 dark:text-blue-300/80">
                    Build Tool
                  </p>
                </div>
              </div>

              <!-- TypeScript -->
              <div class="tech-item group relative bg-gradient-to-br from-purple-50/70 to-indigo-50/70 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-2xl shadow-lg p-4 sm:p-5 text-left hover:shadow-2xl transform hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-400 ease-out cursor-pointer border border-purple-100/70 dark:border-purple-800/70 overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-indigo-400/0 group-hover:from-purple-400/10 group-hover:to-indigo-400/10 transition-all duration-400"></div>
                <div class="relative z-10 space-y-2">
                  <div class="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md group-hover:rotate-1 group-hover:scale-105 transition-all duration-300">
                    TS
                  </div>
                  <div>
                    <p class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">TypeScript</p>
                    <p class="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">Static typing for safer refactors, better tooling, and fewer runtime surprises.</p>
                  </div>
                  <p class="text-[10px] sm:text-[11px] uppercase tracking-wide text-purple-600/80 dark:text-purple-300/80">
                    Type Safety
                  </p>
                </div>
              </div>

              <!-- Tailwind CSS -->
              <div class="tech-item group relative bg-gradient-to-br from-pink-50/70 to-rose-50/70 dark:from-pink-900/40 dark:to-rose-900/40 rounded-2xl shadow-lg p-4 sm:p-5 text-left hover:shadow-2xl transform hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-400 ease-out cursor-pointer border border-pink-100/70 dark:border-pink-800/70 overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-pink-400/0 to-rose-400/0 group-hover:from-pink-400/10 group-hover:to-rose-400/10 transition-all duration-400"></div>
                <div class="relative z-10 space-y-2">
                  <div class="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md group-hover:rotate-1 group-hover:scale-105 transition-all duration-300">
                    Tailwind
                  </div>
                  <div>
                    <p class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Tailwind CSS</p>
                    <p class="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">Utility-first styling for consistent, responsive layouts and polished dark mode.</p>
                  </div>
                  <p class="text-[10px] sm:text-[11px] uppercase tracking-wide text-pink-600/80 dark:text-pink-300/80">
                    CSS Framework
                  </p>
                </div>
              </div>

              <!-- Supabase -->
              <div class="tech-item group relative bg-gradient-to-br from-amber-50/70 to-orange-50/70 dark:from-amber-900/40 dark:to-orange-900/40 rounded-2xl shadow-lg p-4 sm:p-5 text-left hover:shadow-2xl transform hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-400 ease-out cursor-pointer border border-amber-100/70 dark:border-amber-800/70 overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-orange-400/0 group-hover:from-amber-400/10 group-hover:to-orange-400/10 transition-all duration-400"></div>
                <div class="relative z-10 space-y-2">
                  <div class="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md group-hover:rotate-1 group-hover:scale-105 transition-all duration-300">
                    Supabase
                  </div>
                  <div>
                    <p class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Supabase</p>
                    <p class="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">PostgreSQL, auth, storage, and real-time updates with strong RLS security.</p>
                  </div>
                  <p class="text-[10px] sm:text-[11px] uppercase tracking-wide text-amber-600/80 dark:text-amber-300/80">
                    Database & Auth
                  </p>
                </div>
              </div>

              <!-- Python / FastAPI -->
              <div class="tech-item group relative bg-gradient-to-br from-emerald-50/70 to-green-50/70 dark:from-emerald-900/40 dark:to-green-900/40 rounded-2xl shadow-lg p-4 sm:p-5 text-left hover:shadow-2xl transform hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-400 ease-out cursor-pointer border border-emerald-100/70 dark:border-emerald-800/70 overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-green-400/0 group-hover:from-emerald-400/10 group-hover:to-green-400/10 transition-all duration-400"></div>
                <div class="relative z-10 space-y-2">
                  <div class="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md group-hover:rotate-1 group-hover:scale-105 transition-all duration-300">
                    Python · FastAPI
                  </div>
                  <div>
                    <p class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">AI microservice</p>
                    <p class="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">Handles YOLOv8-based facial recognition, image processing, and REST APIs.</p>
                  </div>
                  <p class="text-[10px] sm:text-[11px] uppercase tracking-wide text-emerald-600/80 dark:text-emerald-300/80">
                    AI Service
                  </p>
                </div>
              </div>

              <!-- TensorFlow.js -->
              <div class="tech-item group relative bg-gradient-to-br from-amber-50/70 to-yellow-50/70 dark:from-amber-900/40 dark:to-yellow-900/40 rounded-2xl shadow-lg p-4 sm:p-5 text-left hover:shadow-2xl transform hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-400 ease-out cursor-pointer border border-yellow-100/70 dark:border-yellow-800/70 overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-amber-400/0 group-hover:from-yellow-400/10 group-hover:to-amber-400/10 transition-all duration-400"></div>
                <div class="relative z-10 space-y-2">
                  <div class="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md group-hover:rotate-1 group-hover:scale-105 transition-all duration-300">
                    TensorFlow.js
                  </div>
                  <div>
                    <p class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">TensorFlow.js</p>
                    <p class="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">Client-side fallback for BlazeFace-based face detection when services are offline.</p>
                  </div>
                  <p class="text-[10px] sm:text-[11px] uppercase tracking-wide text-yellow-600/80 dark:text-yellow-300/80">
                    Face Detection
                  </p>
                </div>
              </div>
            </div>

            <p class="mt-1 text-[11px] sm:text-xs text-gray-500 dark:text-gray-500 text-right">
              Designed for academic rigor and real-world deployment reliability.
            </p>
          </div>
        </div>
      </div>
    </section>
  `;
}

