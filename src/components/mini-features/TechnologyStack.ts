export function TechnologyStack() {
  return `
    <div class="mb-8 sm:mb-12 md:mb-20 mt-4 sm:mt-6 md:mt-8">
      <h2 class="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-center animate-fade-in-up px-2" style="animation-delay:2.8s;">Technology Stack</h2>
      <p class="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
        Modern technologies powering GuestGo's intelligent guest management system
      </p>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 px-2">
        
        <!-- Vite -->
        <div class="tech-item group relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl shadow-lg p-5 sm:p-6 text-center hover:shadow-2xl transform hover:scale-110 hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-cyan-400/0 group-hover:from-blue-400/10 group-hover:to-cyan-400/10 transition-all duration-500"></div>
          <div class="relative z-10">
            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg">
              <span class="text-white font-bold text-xl sm:text-2xl">V</span>
            </div>
            <p class="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">Vite</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Build Tool</p>
          </div>
          <!-- Hover Description -->
          <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-64 sm:w-72 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 pointer-events-none">
            <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
            <h4 class="font-bold text-sm mb-2 text-blue-400">Vite</h4>
            <p class="text-xs leading-relaxed text-gray-300">
              Lightning-fast build tool and development server. Provides instant hot module replacement (HMR) and optimized production builds for our frontend application.
            </p>
          </div>
        </div>

        <!-- TypeScript -->
        <div class="tech-item group relative bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-5 sm:p-6 text-center hover:shadow-2xl transform hover:scale-110 hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-700 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-indigo-400/0 group-hover:from-purple-400/10 group-hover:to-indigo-400/10 transition-all duration-500"></div>
          <div class="relative z-10">
            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg">
              <span class="text-white font-bold text-xl sm:text-2xl">TS</span>
            </div>
            <p class="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">TypeScript</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Type Safety</p>
          </div>
          <!-- Hover Description -->
          <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-64 sm:w-72 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 pointer-events-none">
            <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
            <h4 class="font-bold text-sm mb-2 text-purple-400">TypeScript</h4>
            <p class="text-xs leading-relaxed text-gray-300">
              Strongly typed programming language that builds on JavaScript. Ensures type safety, better IDE support, and catches errors at compile-time, making our codebase more maintainable and robust.
            </p>
          </div>
        </div>

        <!-- Tailwind CSS -->
        <div class="tech-item group relative bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl shadow-lg p-5 sm:p-6 text-center hover:shadow-2xl transform hover:scale-110 hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer border-2 border-transparent hover:border-pink-300 dark:hover:border-pink-700 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-pink-400/0 to-rose-400/0 group-hover:from-pink-400/10 group-hover:to-rose-400/10 transition-all duration-500"></div>
          <div class="relative z-10">
            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg">
              <span class="text-white font-bold text-xl sm:text-2xl">TW</span>
            </div>
            <p class="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">Tailwind</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">CSS Framework</p>
          </div>
          <!-- Hover Description -->
          <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-64 sm:w-72 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 pointer-events-none">
            <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
            <h4 class="font-bold text-sm mb-2 text-pink-400">Tailwind CSS</h4>
            <p class="text-xs leading-relaxed text-gray-300">
              Utility-first CSS framework for rapid UI development. Enables us to build responsive, modern interfaces quickly with consistent design tokens and dark mode support.
            </p>
          </div>
        </div>

        <!-- Supabase -->
        <div class="tech-item group relative bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl shadow-lg p-5 sm:p-6 text-center hover:shadow-2xl transform hover:scale-110 hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer border-2 border-transparent hover:border-orange-300 dark:hover:border-orange-700 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-orange-400/0 to-amber-400/0 group-hover:from-orange-400/10 group-hover:to-amber-400/10 transition-all duration-500"></div>
          <div class="relative z-10">
            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg">
              <span class="text-white font-bold text-xl sm:text-2xl">S</span>
            </div>
            <p class="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">Supabase</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Database & Auth</p>
          </div>
          <!-- Hover Description -->
          <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-64 sm:w-72 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 pointer-events-none">
            <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
            <h4 class="font-bold text-sm mb-2 text-orange-400">Supabase</h4>
            <p class="text-xs leading-relaxed text-gray-300">
              Open-source Firebase alternative providing PostgreSQL database, authentication, real-time subscriptions, and storage. Powers our backend infrastructure with Row Level Security (RLS) for data protection.
            </p>
          </div>
        </div>

        <!-- Python -->
        <div class="tech-item group relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-lg p-5 sm:p-6 text-center hover:shadow-2xl transform hover:scale-110 hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer border-2 border-transparent hover:border-green-300 dark:hover:border-green-700 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-green-400/0 to-emerald-400/0 group-hover:from-green-400/10 group-hover:to-emerald-400/10 transition-all duration-500"></div>
          <div class="relative z-10">
            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg">
              <span class="text-white font-bold text-xl sm:text-2xl">Py</span>
            </div>
            <p class="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">Python</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">AI Service</p>
          </div>
          <!-- Hover Description -->
          <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-64 sm:w-72 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 pointer-events-none">
            <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
            <h4 class="font-bold text-sm mb-2 text-green-400">Python (FastAPI)</h4>
            <p class="text-xs leading-relaxed text-gray-300">
              High-performance microservice for AI-powered facial recognition. Uses YOLOv8 models for face detection, handles image processing, compression, and provides RESTful API endpoints for seamless integration.
            </p>
          </div>
        </div>

        <!-- TensorFlow.js -->
        <div class="tech-item group relative bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl shadow-lg p-5 sm:p-6 text-center hover:shadow-2xl transform hover:scale-110 hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer border-2 border-transparent hover:border-yellow-300 dark:hover:border-yellow-700 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-amber-400/0 group-hover:from-yellow-400/10 group-hover:to-amber-400/10 transition-all duration-500"></div>
          <div class="relative z-10">
            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg">
              <span class="text-white font-bold text-lg sm:text-xl">TF</span>
            </div>
            <p class="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">TensorFlow.js</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Face Detection</p>
          </div>
          <!-- Hover Description -->
          <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-64 sm:w-72 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 pointer-events-none">
            <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
            <h4 class="font-bold text-sm mb-2 text-yellow-400">TensorFlow.js</h4>
            <p class="text-xs leading-relaxed text-gray-300">
              Client-side fallback for facial detection using BlazeFace model. Provides offline face detection capabilities when the Python service is unavailable, ensuring system resilience and reliability.
            </p>
          </div>
        </div>

      </div>
    </div>
  `;
}

