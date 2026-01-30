export function OurCulture() {
  return `
    <section class="mb-10 sm:mb-14 md:mb-20 mt-4 sm:mt-6 md:mt-8 px-2">
      <div class="max-w-6xl mx-auto bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 dark:from-violet-950/40 dark:via-slate-950 dark:to-fuchsia-950/40 border border-violet-200/70 dark:border-violet-900/50 rounded-3xl shadow-xl overflow-hidden relative">
        <div class="pointer-events-none absolute inset-0 opacity-50 dark:opacity-30">
          <div class="absolute -top-20 right-10 w-48 h-48 bg-violet-200/60 dark:bg-violet-500/10 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-24 left-0 w-56 h-56 bg-fuchsia-200/60 dark:bg-fuchsia-500/10 rounded-full blur-3xl"></div>
        </div>

        <div class="relative p-5 sm:p-8 md:p-10 lg:p-12">
          <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] items-start">
            <!-- Intro -->
            <div class="space-y-4 sm:space-y-5">
              <p class="inline-flex items-center px-3 py-1 rounded-full bg-violet-100/80 dark:bg-violet-900/40 text-[11px] sm:text-xs font-semibold tracking-wide text-violet-700 dark:text-violet-300 uppercase">
                How we work
              </p>
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                Our <span class="text-violet-600 dark:text-violet-400">Culture</span>
              </h2>
              <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-md">
                The collaborative spirit and practices that drive our thesis project team forward—built on trust, learning, and a shared focus on solving real problems.
              </p>
              <div class="flex flex-wrap gap-2 pt-1">
                <span class="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-[11px] sm:text-xs font-medium text-blue-700 dark:text-blue-300">Collaboration</span>
                <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 text-[11px] sm:text-xs font-medium text-emerald-700 dark:text-emerald-300">Learning</span>
                <span class="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-900/40 px-3 py-1 text-[11px] sm:text-xs font-medium text-purple-700 dark:text-purple-300">Problem-solving</span>
              </div>
            </div>

            <!-- Culture cards -->
            <div class="space-y-4 sm:space-y-5">
              <!-- Team Collaboration -->
              <div class="culture-card group relative bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-blue-100/70 dark:border-blue-800/70 shadow-lg hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300 overflow-hidden">
                <div class="flex flex-col sm:flex-row sm:items-start gap-4 p-4 sm:p-5 md:p-6">
                  <div class="flex-shrink-0 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg group-hover:scale-105 group-hover:rotate-2 transition-transform duration-300">
                    <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Team Collaboration
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      We work together seamlessly—sharing knowledge, code reviews, and pair programming. Regular meetings and open communication keep us aligned and moving forward as one team.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Continuous Learning -->
              <div class="culture-card group relative bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-emerald-100/70 dark:border-emerald-800/70 shadow-lg hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-700 transition-all duration-300 overflow-hidden">
                <div class="flex flex-col sm:flex-row sm:items-start gap-4 p-4 sm:p-5 md:p-6">
                  <div class="flex-shrink-0 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg group-hover:scale-105 group-hover:rotate-2 transition-transform duration-300">
                    <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Continuous Learning
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      We embrace new tech and methods—from TypeScript and Supabase to AI models. Every challenge is a chance to grow; we share resources, run tech talks, and experiment to stay current.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Problem-Solving Focus -->
              <div class="culture-card group relative bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-purple-100/70 dark:border-purple-800/70 shadow-lg hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-700 transition-all duration-300 overflow-hidden">
                <div class="flex flex-col sm:flex-row sm:items-start gap-4 p-4 sm:p-5 md:p-6">
                  <div class="flex-shrink-0 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg group-hover:scale-105 group-hover:rotate-2 transition-transform duration-300">
                    <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Problem-Solving Focus
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      We tackle complex challenges head-on—optimizing AI inference, designing secure auth, and crafting intuitive UX. We break problems down, experiment, and iterate until we ship something solid.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
