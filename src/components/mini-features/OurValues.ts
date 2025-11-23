export function OurValues() {
  return `
    <div class="mb-8 sm:mb-12 md:mb-20 mt-4 sm:mt-6 md:mt-8">
      <h2 class="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-center animate-fade-in-up px-2" style="animation-delay:2.6s;">Our Values</h2>
      <p class="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
        The principles that guide our thesis project and drive us to create innovative solutions for guest management.
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 px-2">
        
        <!-- Value 1: Innovation & Research -->
        <div class="value-card group relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-lg p-6 sm:p-8 text-center hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 ease-out cursor-pointer border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
          <div class="relative z-10">
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
              <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Innovation & Research</h3>
            <p class="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              We continuously explore cutting-edge technologies and methodologies to solve real-world problems. Our research-driven approach ensures we deliver solutions that are both innovative and practical.
            </p>
          </div>
        </div>

        <!-- Value 2: Excellence & Quality -->
        <div class="value-card group relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-lg p-6 sm:p-8 text-center hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 ease-out cursor-pointer border-2 border-transparent hover:border-green-300 dark:hover:border-green-700 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-green-200 dark:bg-green-800 rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
          <div class="relative z-10">
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
              <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
            </div>
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Excellence & Quality</h3>
            <p class="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              We maintain the highest standards in our work, from code quality to user experience. Every feature is carefully designed, tested, and refined to ensure reliability and performance.
            </p>
          </div>
        </div>

        <!-- Value 3: Collaboration & Teamwork -->
        <div class="value-card group relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-lg p-6 sm:p-8 text-center hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 ease-out cursor-pointer border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-700 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-purple-200 dark:bg-purple-800 rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
          <div class="relative z-10">
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
              <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Collaboration & Teamwork</h3>
            <p class="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              We believe in the power of working together. Through effective communication, shared knowledge, and mutual support, we achieve more than we could individually.
            </p>
          </div>
        </div>

        <!-- Value 4: Learning & Growth -->
        <div class="value-card group relative bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl shadow-lg p-6 sm:p-8 text-center hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 ease-out cursor-pointer border-2 border-transparent hover:border-orange-300 dark:hover:border-orange-700 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-orange-200 dark:bg-orange-800 rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
          <div class="relative z-10">
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
              <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">Learning & Growth</h3>
            <p class="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              We embrace challenges as opportunities to learn and grow. This thesis project has been a journey of continuous learning, from mastering new technologies to understanding complex system architectures.
            </p>
          </div>
        </div>

      </div>
    </div>
  `;
}

