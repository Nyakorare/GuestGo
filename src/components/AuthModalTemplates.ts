export function getLoginModalTemplate(): string {
  return `
    <div id="login-modal" class="auth-modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center hidden z-50 transition-all duration-300 ease-out">
      <div class="auth-modal-content bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        <!-- Decorative gradient background -->
        <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-blue-100/30 dark:from-blue-900/10 dark:via-transparent dark:to-blue-800/10 pointer-events-none"></div>
        
        <div class="relative z-10">
          <div class="flex justify-between items-center mb-8">
            <div>
              <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">Welcome Back</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
            </div>
            <button class="auth-modal-close text-gray-400 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-all duration-200 hover:rotate-90 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div id="login-error" class="hidden mb-4 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-lg animate-slide-in">
            <div class="flex items-center">
              <svg class="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm"></span>
            </div>
          </div>
          
          <form id="login-form" class="space-y-5">
            <div class="auth-input-group">
              <label for="login-email" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input type="email" id="login-email" required class="auth-input block w-full pl-10 pr-3 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
              </div>
            </div>
            
            <div class="auth-input-group">
              <label for="login-password" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input type="password" id="login-password" required class="auth-input block w-full pl-10 pr-3 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
              </div>
            </div>
            
            <div class="pt-2">
              <button type="submit" class="auth-submit-btn w-full bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center group">
                <span class="group-hover:translate-x-1 transition-transform duration-200">Login</span>
                <svg class="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

export function getSignupModalTemplate(): string {
  return `
    <div id="signup-modal" class="auth-modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center hidden z-50 transition-all duration-300 ease-out">
      <div class="auth-modal-content bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <!-- Decorative gradient background -->
        <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-blue-100/30 dark:from-blue-900/10 dark:via-transparent dark:to-blue-800/10 pointer-events-none"></div>
        
        <div class="relative z-10">
          <div class="flex justify-between items-center mb-8">
            <div>
              <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">Create Account</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Join us and get started</p>
            </div>
            <button class="auth-modal-close text-gray-400 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-all duration-200 hover:rotate-90 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div id="signup-error" class="hidden mb-4 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-lg animate-slide-in">
            <div class="flex items-center">
              <svg class="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm"></span>
            </div>
          </div>
          
          <div id="signup-success" class="hidden mb-4 p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 rounded-lg animate-slide-in">
            <div class="flex items-center">
              <svg class="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm"></span>
            </div>
          </div>
          
          <form id="signup-form" class="space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div class="auth-input-group">
                <label for="signup-firstname" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input type="text" id="signup-firstname" required class="auth-input block w-full pl-10 pr-3 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                </div>
              </div>
              
              <div class="auth-input-group">
                <label for="signup-lastname" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input type="text" id="signup-lastname" required class="auth-input block w-full pl-10 pr-3 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                </div>
              </div>
            </div>
            
            <div class="auth-input-group">
              <label for="signup-email" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input type="email" id="signup-email" required class="auth-input block w-full pl-10 pr-3 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
              </div>
            </div>
            
            <div class="auth-input-group">
              <label for="signup-password" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input type="password" id="signup-password" required minlength="6" class="auth-input block w-full pl-10 pr-3 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
              </div>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Must be at least 6 characters</p>
            </div>
            
            <div class="pt-2">
              <button type="submit" class="auth-submit-btn w-full bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center group">
                <span class="group-hover:translate-x-1 transition-transform duration-200">Create Account</span>
                <svg class="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

