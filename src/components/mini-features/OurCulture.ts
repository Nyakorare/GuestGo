export function OurCulture() {
  return `
    <div class="mb-8 sm:mb-12 md:mb-20 mt-4 sm:mt-6 md:mt-8">
      <h2 class="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-center animate-fade-in-up px-2" style="animation-delay:3.2s;">Our Culture</h2>
      <p class="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
        The collaborative spirit and practices that drive our thesis project team forward
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-2">
        
        <!-- Team Collaboration -->
        <div class="culture-card group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 ease-out cursor-pointer border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700">
          <div class="h-40 sm:h-48 md:h-56 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-indigo-700/0 group-hover:from-blue-600/20 group-hover:to-indigo-700/20 transition-all duration-500"></div>
            <svg class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white relative z-10 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <div class="p-5 sm:p-6 md:p-8">
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Team Collaboration</h3>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              We work together seamlessly, sharing knowledge and supporting each other through challenges. Regular meetings, code reviews, and pair programming sessions strengthen our team dynamics.
            </p>
          </div>
          <!-- Hover Description -->
          <div class="absolute inset-0 bg-gradient-to-br from-blue-600/95 to-indigo-700/95 dark:from-blue-900/95 dark:to-indigo-900/95 text-white p-6 sm:p-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 flex flex-col justify-center items-center text-center z-20">
            <h4 class="text-xl sm:text-2xl font-bold mb-4">Team Collaboration</h4>
            <p class="text-sm sm:text-base leading-relaxed">
              Our team thrives on open communication and mutual support. We conduct regular stand-ups, collaborative coding sessions, and knowledge-sharing meetings. Each member brings unique strengths, and together we create solutions that none of us could achieve alone. This collaborative approach has been essential in building GuestGo from concept to completion.
            </p>
          </div>
        </div>

        <!-- Continuous Learning -->
        <div class="culture-card group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 ease-out cursor-pointer border-2 border-transparent hover:border-green-300 dark:hover:border-green-700">
          <div class="h-40 sm:h-48 md:h-56 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-green-600/0 to-teal-700/0 group-hover:from-green-600/20 group-hover:to-teal-700/20 transition-all duration-500"></div>
            <svg class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white relative z-10 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <div class="p-5 sm:p-6 md:p-8">
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Continuous Learning</h3>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              We embrace new technologies and methodologies. From learning TypeScript and Supabase to mastering AI models, every challenge is an opportunity to grow and expand our skill sets.
            </p>
          </div>
          <!-- Hover Description -->
          <div class="absolute inset-0 bg-gradient-to-br from-green-600/95 to-teal-700/95 dark:from-green-900/95 dark:to-teal-900/95 text-white p-6 sm:p-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 flex flex-col justify-center items-center text-center z-20">
            <h4 class="text-xl sm:text-2xl font-bold mb-4">Continuous Learning</h4>
            <p class="text-sm sm:text-base leading-relaxed">
              Our thesis project has been a journey of constant learning. We've explored cutting-edge technologies like YOLOv8 for facial recognition, implemented complex database architectures, and mastered full-stack development. We regularly share resources, conduct tech talks, and experiment with new approaches. This culture of learning ensures we stay current and deliver innovative solutions.
            </p>
          </div>
        </div>

        <!-- Problem-Solving Focus -->
        <div class="culture-card group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 ease-out cursor-pointer border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-700">
          <div class="h-40 sm:h-48 md:h-56 bg-gradient-to-br from-purple-400 via-purple-500 to-pink-600 flex items-center justify-center relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-700/0 group-hover:from-purple-600/20 group-hover:to-pink-700/20 transition-all duration-500"></div>
            <svg class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white relative z-10 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <div class="p-5 sm:p-6 md:p-8">
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Problem-Solving Focus</h3>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              We tackle complex challenges head-on. Whether it's optimizing AI inference times, designing secure authentication flows, or creating intuitive user experiences, we find creative solutions.
            </p>
          </div>
          <!-- Hover Description -->
          <div class="absolute inset-0 bg-gradient-to-br from-purple-600/95 to-pink-700/95 dark:from-purple-900/95 dark:to-pink-900/95 text-white p-6 sm:p-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 flex flex-col justify-center items-center text-center z-20">
            <h4 class="text-xl sm:text-2xl font-bold mb-4">Problem-Solving Focus</h4>
            <p class="text-sm sm:text-base leading-relaxed">
              We approach every challenge with analytical thinking and creativity. From debugging complex AI integration issues to optimizing database queries, we break down problems systematically. Our problem-solving culture involves thorough research, experimentation, and collaborative brainstorming. This mindset has been crucial in overcoming technical hurdles and delivering a robust, production-ready system.
            </p>
          </div>
        </div>

      </div>
    </div>
  `;
}

