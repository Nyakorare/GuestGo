import { getThemePreference, updateTheme } from './utils/theme';
import { updateNavigation } from './utils/navigation';
import { setupEventListeners } from './utils/eventHandlers';

export default function setupApp() {
  // Initialize theme
  const theme = getThemePreference();
  updateTheme(theme);

  const app = document.querySelector<HTMLDivElement>('#app')!;
  
  app.innerHTML = `    <div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      <nav class="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16"><!-- Logo, brand name and theme toggle -->
          <div class="flex items-center space-x-2">
            <img src="/guestgo-logo-no_word.png" alt="GuestGo Logo" class="h-8 w-auto">
            <div class="flex items-center space-x-2">
              <div class="flex-shrink-0 text-2xl font-bold text-blue-600 dark:text-blue-500">
                GuestGo
              </div>
              <!-- Dark mode toggle button -->
              <button id="theme-toggle" class="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500 transition-colors duration-200">                <!-- Sun icon (shown in dark mode) -->
                <svg id="theme-toggle-light-icon" class="${theme === 'dark' ? '' : 'hidden'} w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
                </svg>
                <!-- Moon icon (shown in light mode) -->
                <svg id="theme-toggle-dark-icon" class="${theme === 'dark' ? 'hidden' : ''} w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-8">
            <a href="#/" class="nav-link">Home</a>
            <a href="#/about" class="nav-link">About</a>
            <a href="#/contact" class="nav-link">Contact Us</a>
          </div>

          <!-- Right side menu -->
          <div class="flex items-center space-x-2">
            <div class="hidden md:flex items-center" id="auth-menu-container" style="display: none;">
              <div class="relative">
                <button id="auth-menu-button" class="flex items-center text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500 px-3 py-2 transition-colors duration-200">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                  </svg>
                </button>
                <div id="auth-dropdown" class="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 dropdown-transition">
                  <div class="py-1">
                    <button id="login-button" class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200">Login</button>
                    <button id="signup-button" class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200">Sign Up</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mobile menu button -->
            <div class="md:hidden flex items-center">
              <button id="mobile-menu-button" class="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile menu -->
        <div id="mobile-menu" class="hidden md:hidden">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#/" class="block px-3 py-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">Home</a>
            <a href="#/about" class="block px-3 py-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">About</a>
            <a href="#/contact" class="block px-3 py-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">Contact Us</a>
            <div id="mobile-auth-buttons" style="display: none;">
              <button class="mobile-login-button block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">Login</button>
              <button class="mobile-signup-button block w-full text-left px-3 py-2 text-blue-600 dark:text-blue-500 font-medium">Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content with padding to account for fixed navbar -->    <main class="pt-16 container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="page-transition text-gray-900 dark:text-white">
      </div>
    </main>

    <!-- Login Modal -->
    <div id="login-modal" class="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center hidden z-50 modal-backdrop">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 modal-content">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Login</h2>
          <button class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 close-modal transition-colors duration-200">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <form class="space-y-6">
          <div>
            <label for="login-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" id="login-email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200">
          </div>
          <div>
            <label for="login-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" id="login-password" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200">
          </div>
          <div>
            <button type="submit" class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Signup Modal -->
    <div id="signup-modal" class="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center hidden z-50 modal-backdrop">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 modal-content">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Sign Up</h2>
          <button class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 close-modal transition-colors duration-200">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <form class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="signup-firstname" class="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
              <input type="text" id="signup-firstname" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200">
            </div>
            <div>
              <label for="signup-lastname" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
              <input type="text" id="signup-lastname" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200">
            </div>
          </div>
          <div>
            <label for="signup-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" id="signup-email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200">
          </div>
          <div>
            <label for="signup-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" id="signup-password" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200">
          </div>
          <div>
            <button type="submit" class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200">
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Initialize page content
  updateNavigation();

  // Setup all event listeners
  setupEventListeners();

  // Theme toggle functionality
  const themeToggleButton = document.getElementById('theme-toggle');
  themeToggleButton?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    updateTheme(isDark ? 'light' : 'dark');
  });

  // Handle navigation
  window.addEventListener('hashchange', updateNavigation);
}
