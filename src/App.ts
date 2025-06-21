import { getThemePreference, updateTheme } from './utils/theme';
import { updateNavigation } from './utils/navigation';
import { setupEventListeners } from './utils/eventHandlers';
import { createLoginModal, createSignupModal, setupAuthEventListeners } from './components/AuthModals';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://srfcewglmzczveopbwsk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyZmNld2dsbXpjenZlb3Bid3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDI5ODEsImV4cCI6MjA2NTU3ODk4MX0.H6b6wbYOVytt2VOirSmJnjMkm-ba3H-i0LkCszxqYLY'
);

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
            <a href="#/dashboard" class="nav-link hidden" id="dashboard-link">Dashboard</a>
          </div>

          <!-- Right side menu -->
          <div class="flex items-center space-x-4">
            <span id="welcome-message" class="text-gray-700 dark:text-gray-300 hidden"></span>
            <div class="relative">
              <button 
                id="profileSettingsBtn"
                class="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500 hidden"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <div id="profile-dropdown" class="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 dropdown-transition">
                <div class="py-1">
                  <button id="account-settings-btn" class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200">
                    Account Settings
                  </button>
                  <button id="profile-logout-btn" class="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:text-red-500 dark:hover:bg-gray-700 transition-colors duration-200">
                    Logout
                  </button>
                </div>
              </div>
            </div>
            <div class="hidden md:flex items-center" id="auth-menu-container" style="display: none;">
              <div class="relative">
                <button id="auth-menu-button" class="flex items-center text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500 px-3 py-2 transition-colors duration-200">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                  </svg>
                </button>
                <div id="auth-dropdown" class="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 dropdown-transition">
                  <div class="py-1" id="auth-dropdown-content">
                    <!-- Content will be dynamically updated based on auth state -->
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
            <a href="#/dashboard" class="block px-3 py-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500 hidden" id="mobile-dashboard-link">Dashboard</a>
            <div id="mobile-auth-buttons" style="display: none;">
              <!-- Content will be dynamically updated based on auth state -->
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content with padding to account for fixed navbar -->    <main class="pt-16 container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="page-transition text-gray-900 dark:text-white">
      </div>
    </main>

    ${createLoginModal()}
    ${createSignupModal()}

    <!-- Profile Settings Modal -->
    <div id="profileSettingsModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Profile Settings</h3>
              <button 
                id="closeProfileModalBtn"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Your Role</h4>
                <p id="modalUserRole" class="mt-1 text-lg font-semibold text-blue-600 dark:text-blue-500">Loading...</p>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">User ID</h4>
                <p id="modalUserId" class="mt-1 text-sm font-mono text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
              <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                <form id="passwordChangeForm" class="space-y-4">
                  <div>
                    <label for="currentPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                    <input 
                      type="password" 
                      id="currentPassword" 
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                      required
                    >
                  </div>
                  <div>
                    <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                    <input 
                      type="password" 
                      id="newPassword" 
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                      required
                      minlength="6"
                    >
                  </div>
                  <div>
                    <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                    <input 
                      type="password" 
                      id="confirmPassword" 
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                      required
                      minlength="6"
                    >
                  </div>
                  <div id="passwordError" class="hidden text-red-600 text-sm"></div>
                  <div id="passwordSuccess" class="hidden text-green-600 text-sm"></div>
                  <div class="flex justify-end">
                    <button 
                      type="submit"
                      id="changePasswordBtn"
                      class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize page content
  updateNavigation();

  // Setup all event listeners
  setupEventListeners();
  setupAuthEventListeners();

  // Theme toggle functionality
  const themeToggleButton = document.getElementById('theme-toggle');
  themeToggleButton?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    updateTheme(isDark ? 'light' : 'dark');
  });

  // Handle navigation
  window.addEventListener('hashchange', updateNavigation);

  // Check auth state and update UI
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      // Show dashboard link
      const dashboardLink = document.getElementById('dashboard-link');
      const mobileDashboardLink = document.getElementById('mobile-dashboard-link');
      if (dashboardLink) dashboardLink.classList.remove('hidden');
      if (mobileDashboardLink) mobileDashboardLink.classList.remove('hidden');

      // Show welcome message
      const welcomeMessage = document.getElementById('welcome-message');
      if (welcomeMessage) {
        const firstName = session.user.user_metadata?.first_name || 'User';
        welcomeMessage.textContent = `Welcome, ${firstName}`;
        welcomeMessage.classList.remove('hidden');
      }
    }
  });

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((_event, session) => {
    const dashboardLink = document.getElementById('dashboard-link');
    const mobileDashboardLink = document.getElementById('mobile-dashboard-link');
    const welcomeMessage = document.getElementById('welcome-message');

    if (session?.user) {
      // Show dashboard link
      if (dashboardLink) dashboardLink.classList.remove('hidden');
      if (mobileDashboardLink) mobileDashboardLink.classList.remove('hidden');

      // Show welcome message
      if (welcomeMessage) {
        const firstName = session.user.user_metadata?.first_name || 'User';
        welcomeMessage.textContent = `Welcome, ${firstName}`;
        welcomeMessage.classList.remove('hidden');
      }
    } else {
      // Hide dashboard link
      if (dashboardLink) dashboardLink.classList.add('hidden');
      if (mobileDashboardLink) mobileDashboardLink.classList.add('hidden');

      // Hide welcome message
      if (welcomeMessage) welcomeMessage.classList.add('hidden');
    }
  });

  // Add dashboard link reload functionality
  const setupDashboardLinkReload = () => {
    const dashboardLink = document.getElementById('dashboard-link');
    const mobileDashboardLink = document.getElementById('mobile-dashboard-link');

    // Desktop dashboard link
    if (dashboardLink) {
      dashboardLink.addEventListener('click', (e) => {
        e.preventDefault();
        // First navigate to dashboard
        window.location.hash = '#/dashboard';
        // Then reload after a brief delay to allow navigation to complete
        setTimeout(() => {
          window.location.reload();
        }, 100);
      });
    }

    // Mobile dashboard link
    if (mobileDashboardLink) {
      mobileDashboardLink.addEventListener('click', (e) => {
        e.preventDefault();
        // First navigate to dashboard
        window.location.hash = '#/dashboard';
        // Then reload after a brief delay to allow navigation to complete
        setTimeout(() => {
          window.location.reload();
        }, 100);
      });
    }
  };

  // Setup dashboard link reload functionality
  setupDashboardLinkReload();

  // Re-setup dashboard link reload when auth state changes
  supabase.auth.onAuthStateChange(() => {
    // Small delay to ensure DOM elements are updated
    setTimeout(setupDashboardLinkReload, 100);
  });
}

// Function to handle navigation
function handleNavigation() {
  const path = window.location.pathname;
  const navLinks = document.querySelectorAll('nav a');
  const welcomeMessage = document.getElementById('welcomeMessage');
  const profileSettingsBtn = document.getElementById('profileSettingsBtn');

  // Hide welcome message and profile settings by default
  if (welcomeMessage) welcomeMessage.classList.add('hidden');
  if (profileSettingsBtn) profileSettingsBtn.classList.add('hidden');

  // Show welcome message and profile settings only on dashboard page
  if (path === '/dashboard') {
    if (welcomeMessage) welcomeMessage.classList.remove('hidden');
    if (profileSettingsBtn) profileSettingsBtn.classList.remove('hidden');
  }

  navLinks.forEach(link => {
    if (link.getAttribute('href') === path) {
      link.classList.add('text-blue-600', 'dark:text-blue-500');
      link.classList.remove('text-gray-900', 'dark:text-white');
    } else {
      link.classList.remove('text-blue-600', 'dark:text-blue-500');
      link.classList.add('text-gray-900', 'dark:text-white');
    }
  });

  const mainContent = document.getElementById('mainContent');
  if (mainContent) {
    mainContent.innerHTML = renderPage(path);
  }
}
