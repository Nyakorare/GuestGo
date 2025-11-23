export function ThesisTimeline() {
  return `
    <div class="mb-8 sm:mb-12 md:mb-16">
      <h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 md:mb-8 text-center animate-fade-in-up px-2" style="animation-delay:2.4s;">Our Journey</h2>
      <div class="max-w-7xl mx-auto px-2 sm:px-4">
        <!-- Horizontal Timeline Container -->
        <div class="relative py-8 sm:py-12 md:py-16">
          <!-- Horizontal timeline line -->
          <div class="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 via-orange-500 via-red-500 to-indigo-500 dark:from-blue-400 dark:via-purple-400 dark:via-green-400 dark:via-orange-400 dark:via-red-400 dark:to-indigo-400 transform -translate-y-1/2 hidden md:block"></div>
          
          <!-- Timeline Items Container -->
          <div class="relative flex flex-col md:flex-row md:justify-between items-start md:items-center gap-8 md:gap-4">
            
            <!-- Timeline Item 1: Project Inception -->
            <div class="timeline-item group relative flex-1 max-w-xs mx-auto md:mx-0">
              <!-- Timeline dot -->
              <div class="relative z-10 mx-auto md:mx-0 mb-4 md:mb-0">
                <div class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-600 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-lg transform group-hover:scale-125 transition-all duration-300 cursor-pointer">
                  <svg class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
              </div>
              <!-- Content card (shown on hover) -->
              <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-64 sm:w-72 md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 sm:p-5 border-2 border-blue-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 pointer-events-none">
                <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-blue-600"></div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">Semester 1</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">2024</span>
                </div>
                <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">Project Inception & Research</h3>
                <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Our thesis journey began with identifying the need for an intelligent guest management system. We conducted extensive research on existing solutions, analyzed security requirements, and defined the scope of our project.
                </p>
              </div>
              <!-- Title (always visible) -->
              <div class="text-center md:text-left">
                <h3 class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1">Project Inception</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Semester 1, 2024</p>
              </div>
            </div>

            <!-- Timeline Item 2: System Design -->
            <div class="timeline-item group relative flex-1 max-w-xs mx-auto md:mx-0">
              <!-- Timeline dot -->
              <div class="relative z-10 mx-auto md:mx-0 mb-4 md:mb-0">
                <div class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-purple-600 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-lg transform group-hover:scale-125 transition-all duration-300 cursor-pointer">
                  <svg class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                  </svg>
                </div>
              </div>
              <!-- Content card (shown on hover) -->
              <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-64 sm:w-72 md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 sm:p-5 border-2 border-purple-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 pointer-events-none">
                <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-purple-600"></div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded">Semester 1-2</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">2024</span>
                </div>
                <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">System Architecture & Design</h3>
                <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  We designed the complete system architecture, including database schema, API endpoints, and user interface mockups. Key decisions were made on technology stack selection, security protocols, and the integration of facial recognition technology.
                </p>
              </div>
              <!-- Title (always visible) -->
              <div class="text-center md:text-left">
                <h3 class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1">System Design</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Semester 1-2, 2024</p>
              </div>
            </div>

            <!-- Timeline Item 3: Development Phase -->
            <div class="timeline-item group relative flex-1 max-w-xs mx-auto md:mx-0">
              <!-- Timeline dot -->
              <div class="relative z-10 mx-auto md:mx-0 mb-4 md:mb-0">
                <div class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-600 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-lg transform group-hover:scale-125 transition-all duration-300 cursor-pointer">
                  <svg class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                  </svg>
                </div>
              </div>
              <!-- Content card (shown on hover) -->
              <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-64 sm:w-72 md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 sm:p-5 border-2 border-green-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 pointer-events-none">
                <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-green-600"></div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">Semester 2</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">2024-2025</span>
                </div>
                <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">Core Development & Implementation</h3>
                <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Intensive development phase where we built all core features: visitor scheduling system, QR code generation, gate scanning functionality, role-based access control, and the Python AI service for facial recognition.
                </p>
              </div>
              <!-- Title (always visible) -->
              <div class="text-center md:text-left">
                <h3 class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1">Development</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Semester 2, 2024-2025</p>
              </div>
            </div>

            <!-- Timeline Item 4: AI Integration -->
            <div class="timeline-item group relative flex-1 max-w-xs mx-auto md:mx-0">
              <!-- Timeline dot -->
              <div class="relative z-10 mx-auto md:mx-0 mb-4 md:mb-0">
                <div class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-orange-600 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-lg transform group-hover:scale-125 transition-all duration-300 cursor-pointer">
                  <svg class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                </div>
              </div>
              <!-- Content card (shown on hover) -->
              <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-64 sm:w-72 md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 sm:p-5 border-2 border-orange-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 pointer-events-none">
                <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-orange-600"></div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded">Semester 2</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">2025</span>
                </div>
                <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">AI & Facial Recognition Integration</h3>
                <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Integrated YOLOv8 models for advanced facial detection and verification. Developed the Python microservice with fallback to TensorFlow.js BlazeFace for resilience. Implemented secure face data encryption and storage.
                </p>
              </div>
              <!-- Title (always visible) -->
              <div class="text-center md:text-left">
                <h3 class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1">AI Integration</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Semester 2, 2025</p>
              </div>
            </div>

            <!-- Timeline Item 5: Testing & Refinement -->
            <div class="timeline-item group relative flex-1 max-w-xs mx-auto md:mx-0">
              <!-- Timeline dot -->
              <div class="relative z-10 mx-auto md:mx-0 mb-4 md:mb-0">
                <div class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-red-600 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-lg transform group-hover:scale-125 transition-all duration-300 cursor-pointer">
                  <svg class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <!-- Content card (shown on hover) -->
              <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-64 sm:w-72 md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 sm:p-5 border-2 border-red-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 pointer-events-none">
                <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-red-600"></div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded">Semester 2-3</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">2025</span>
                </div>
                <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">Testing, Optimization & Documentation</h3>
                <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Comprehensive testing phase including unit tests, integration tests, and user acceptance testing. Performance optimization for AI inference latency, database queries, and frontend rendering. Created detailed documentation.
                </p>
              </div>
              <!-- Title (always visible) -->
              <div class="text-center md:text-left">
                <h3 class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1">Testing & Docs</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Semester 2-3, 2025</p>
              </div>
            </div>

            <!-- Timeline Item 6: Thesis Completion -->
            <div class="timeline-item group relative flex-1 max-w-xs mx-auto md:mx-0">
              <!-- Timeline dot -->
              <div class="relative z-10 mx-auto md:mx-0 mb-4 md:mb-0">
                <div class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-indigo-600 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-lg transform group-hover:scale-125 transition-all duration-300 cursor-pointer">
                  <svg class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                </div>
              </div>
              <!-- Content card (shown on hover) -->
              <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-64 sm:w-72 md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 sm:p-5 border-2 border-indigo-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 pointer-events-none">
                <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-indigo-600"></div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">Present</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">2025</span>
                </div>
                <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">Thesis Defense & System Launch</h3>
                <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Successfully completed our thesis project with GuestGo fully functional and deployed. The system demonstrates advanced features including AI-powered facial recognition, comprehensive visitor management, and robust security measures.
                </p>
              </div>
              <!-- Title (always visible) -->
              <div class="text-center md:text-left">
                <h3 class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1">Completion</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Present, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
