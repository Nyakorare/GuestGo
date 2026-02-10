import { getThemePreference, updateTheme } from './utils/theme';
import { updateNavigation, clearUserCache, updateNavigationState } from './utils/navigation';
import { setupEventListeners } from './utils/eventHandlers';
import { createLoginModal, createSignupModal, setupAuthEventListeners } from './components/AuthModals';
import { createProfileSettingsModal } from './components/ProfileSettingsModal';
import { initializeSessionManager } from './utils/sessionManager';
import { initLogoHoverAnimations } from './utils/logoHoverAnimations';
import supabase from './config/supabase';

// Cache for DOM elements to avoid repeated queries
const domCache = new Map<string, HTMLElement>();

// Get cached DOM element
function getCachedElement(id: string): HTMLElement | null {
  if (!domCache.has(id)) {
    const element = document.getElementById(id);
    if (element) {
      domCache.set(id, element);
    }
    return element;
  }
  return domCache.get(id) || null;
}

// Optimized auth state update
function updateAuthUI(session: any) {
  const dashboardLink = getCachedElement('dashboard-link');
  const mobileDashboardLink = getCachedElement('mobile-dashboard-link');
  const guardDashboardLink = getCachedElement('guard-dashboard-link');
  const mobileGuardDashboardLink = getCachedElement('mobile-guard-dashboard-link');
  const welcomeMessage = getCachedElement('welcome-message');
  const qrScannerLink = getCachedElement('qr-scanner-link');
  const mobileQrScannerLink = getCachedElement('mobile-qr-scanner-link');

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

    // Show QR scanner link for personnel
    if (qrScannerLink) qrScannerLink.classList.remove('hidden');
    if (mobileQrScannerLink) mobileQrScannerLink.classList.remove('hidden');

    // Show guard dashboard link for guards
    if (guardDashboardLink) guardDashboardLink.classList.remove('hidden');
    if (mobileGuardDashboardLink) mobileGuardDashboardLink.classList.remove('hidden');
  } else {
    // Hide dashboard link
    if (dashboardLink) dashboardLink.classList.add('hidden');
    if (mobileDashboardLink) mobileDashboardLink.classList.add('hidden');

    // Hide welcome message
    if (welcomeMessage) welcomeMessage.classList.add('hidden');

    // Hide QR scanner link
    if (qrScannerLink) qrScannerLink.classList.add('hidden');
    if (mobileQrScannerLink) mobileQrScannerLink.classList.add('hidden');

    // Hide guard dashboard link
    if (guardDashboardLink) guardDashboardLink.classList.add('hidden');
    if (mobileGuardDashboardLink) mobileGuardDashboardLink.classList.add('hidden');
  }
}

export default function setupApp() {
  // Handle Supabase auth callback from email verification
  // Supabase adds tokens to the URL (either hash or query params), so we need to process them
  const handleAuthCallback = async () => {
    // Check hash first (for SPAs)
    let hashParams: URLSearchParams | null = null;
    let queryParams: URLSearchParams | null = null;
    
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      // Check if hash contains auth tokens (format: #access_token=... or #/access_token=...)
      if (hash.includes('access_token') || hash.includes('type=')) {
        // Remove leading #/ if present
        const cleanHash = hash.startsWith('/') ? hash.substring(1) : hash;
        hashParams = new URLSearchParams(cleanHash);
      }
    }
    
    // Also check query parameters (fallback)
    if (window.location.search) {
      queryParams = new URLSearchParams(window.location.search.substring(1));
    }
    
    const params = hashParams || queryParams;
    if (!params) return;
    
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const type = params.get('type');
    
    // If we have auth tokens in the URL, process them
    if (accessToken && (type === 'email' || type === 'recovery' || type === 'signup')) {
      try {
        // Exchange the tokens for a session
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (error) {
          console.error('Error setting session:', error);
        } else if (data.session) {
          // Clear the hash/query to remove tokens from URL
          window.history.replaceState(null, '', window.location.pathname);
          window.location.hash = '/';
          // Refresh to update UI
          setTimeout(() => {
            window.location.reload();
          }, 100);
          return;
        }
      } catch (err) {
        console.error('Error processing auth callback:', err);
      }
    }
    
    // Clean up URL if we have auth-related params but didn't process them
    if (params.has('access_token') || params.has('type')) {
      window.history.replaceState(null, '', window.location.pathname);
      window.location.hash = '/';
    }
  };
  
  // Process auth callback if present
  handleAuthCallback();

  // Initialize theme
  const theme = getThemePreference();
  updateTheme(theme);
  
  // Expose supabase client globally for use in inline scripts
  (window as any).supabaseClient = supabase;

  const app = document.querySelector<HTMLDivElement>('#app')!;
  
  // Inject style for active tab text color
  if (!document.getElementById('active-tab-style')) {
    const style = document.createElement('style');
    style.id = 'active-tab-style';
    style.textContent = `
      /* Light mode active tab - no special styling, just font weight */
      html:not(.dark) nav a.nav-link-enhanced.active {
        font-weight: 600 !important;
      }
      /* Dark mode active tab */
      html.dark nav a.nav-link-enhanced.active {
        color: rgb(147, 197, 253) !important; /* blue-300 - light blue for dark mode */
        font-weight: 600 !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  app.innerHTML = `    <div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      <nav class="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 backdrop-blur-lg border-b border-gray-100 dark:border-gray-700 shadow-md z-40 navbar-transition">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            <!-- Logo, brand name and theme toggle -->
            <div class="flex items-center space-x-3">
              <a href="#/" class="flex items-center space-x-3 group cursor-pointer no-underline transition-all duration-300 hover:scale-105 active:scale-95">
                <img id="guestgo-logo" src="/guestgo-logo-no_word.png" alt="GuestGo Logo" class="h-9 w-auto transition-all duration-300 group-hover:scale-110 group-hover:brightness-110 group-active:scale-95">
                <div class="flex-shrink-0 text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-110 group-hover:from-blue-700 group-hover:to-blue-600 dark:group-hover:from-blue-300 dark:group-hover:to-blue-200 group-active:scale-95">
                  GuestGo
                </div>
              </a>
              <!-- Dark mode toggle button -->
              <button id="theme-toggle" class="theme-toggle-btn p-2 rounded-lg text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 active:scale-95">
                <!-- Sun icon (shown in dark mode) -->
                <svg id="theme-toggle-light-icon" class="theme-toggle-icon ${theme === 'dark' ? '' : 'hidden'} w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
                </svg>
                <!-- Moon icon (shown in light mode) -->
                <svg id="theme-toggle-dark-icon" class="theme-toggle-icon ${theme === 'dark' ? 'hidden' : ''} w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                </svg>
              </button>
            </div>

            <!-- Navigation Links -->
            <div class="hidden md:flex items-center space-x-1">
              <a href="#/" class="nav-link-enhanced">Home</a>
              <a href="#/about" class="nav-link-enhanced">About</a>
              <a href="#/contact" class="nav-link-enhanced">Contact Us</a>
              <a href="#/track-schedule" class="nav-link-enhanced" id="track-schedule-link">Track Schedule</a>
              <a href="#/dashboard" class="nav-link-enhanced hidden" id="dashboard-link">Dashboard</a>
              <a href="#/guard-dashboard" class="nav-link-enhanced hidden" id="guard-dashboard-link">Guard Dashboard</a>
              <a href="#/qr-scanner" class="nav-link-enhanced hidden" id="qr-scanner-link">QR Scanner</a>
            </div>

            <!-- Right side menu -->
            <div class="flex items-center space-x-3">
              <span id="welcome-message" class="hidden px-3 py-1.5 text-sm font-medium text-gray-800 dark:text-gray-200 bg-blue-50 dark:bg-gray-700 rounded-lg border border-blue-100 dark:border-gray-600"></span>
              <!-- Session Timer -->
              <div id="session-timer-container" class="hidden relative group px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/40 border border-blue-300 dark:border-blue-700/50 rounded-lg shadow-sm">
                <span class="text-sm font-mono font-semibold text-blue-800 dark:text-blue-200">
                  <span class="mr-1">⏱</span>
                  <span id="session-timer">00:00</span>
                </span>
                <div
                  id="session-timer-tooltip"
                  class="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 px-3 py-2 text-xs leading-snug text-center bg-gray-900 text-white dark:bg-gray-700 dark:text-gray-100 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50"
                  role="status"
                  aria-live="polite"
                >
                  <span id="session-timer-tooltip-text">Stay active to keep your session.</span>
                </div>
              </div>
              <div class="relative">
                <button 
                  id="profileSettingsBtn"
                  class="hidden p-2 rounded-lg text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 active:scale-95"
                >
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <div id="profile-dropdown" class="hidden absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-600 z-50 dropdown-transition overflow-hidden">
                  <div class="py-1">
                    <button id="account-settings-btn" class="block w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                      Account Settings
                    </button>
                    <button id="profile-logout-btn" class="block w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
              <div class="hidden md:flex items-center" id="auth-menu-container" style="display: none;">
                <div class="relative">
                  <button id="auth-menu-button" class="flex items-center p-2 rounded-lg text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 active:scale-95">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                    </svg>
                  </button>
                  <div id="auth-dropdown" class="hidden absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-600 z-50 dropdown-transition overflow-hidden">
                    <div class="py-1" id="auth-dropdown-content">
                      <!-- Content will be dynamically updated based on auth state -->
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mobile menu button -->
              <div class="md:hidden flex items-center">
                <button id="mobile-menu-button" class="p-2 rounded-lg text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 active:scale-95">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile menu -->
          <div id="mobile-menu" class="hidden md:hidden border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 backdrop-blur-lg">
            <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#/" class="block px-3 py-2.5 rounded-lg text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 font-medium">Home</a>
              <a href="#/about" class="block px-3 py-2.5 rounded-lg text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 font-medium">About</a>
              <a href="#/contact" class="block px-3 py-2.5 rounded-lg text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 font-medium">Contact Us</a>
              <a href="#/track-schedule" class="block px-3 py-2.5 rounded-lg text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 font-medium" id="mobile-track-schedule-link">Track Schedule</a>
              <a href="#/dashboard" class="block px-3 py-2.5 rounded-lg text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 font-medium hidden" id="mobile-dashboard-link">Dashboard</a>
              <a href="#/guard-dashboard" class="block px-3 py-2.5 rounded-lg text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 font-medium hidden" id="mobile-guard-dashboard-link">Guard Dashboard</a>
              <a href="#/qr-scanner" class="block px-3 py-2.5 rounded-lg text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 font-medium hidden" id="mobile-qr-scanner-link">QR Scanner</a>
              <div id="mobile-auth-buttons" style="display: none;">
                <!-- Content will be dynamically updated based on auth state -->
              </div>
            </div>
          </div>
        </div>
      </nav>

    <!-- Main content with padding to account for fixed navbar -->
    <main class="pt-20 container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="page-transition text-gray-900 dark:text-white">
      </div>
    </main>

    ${createLoginModal()}
    ${createSignupModal()}
    ${createProfileSettingsModal()}
  `;

  // Initialize page content
  updateNavigation();

  // Setup all event listeners
  setupEventListeners();
  setupAuthEventListeners();
  
  // Initialize session management
  initializeSessionManager();
  
  // Initialize logo hover animations
  initLogoHoverAnimations();
  
  // Theme toggle functionality
  const themeToggleButton = getCachedElement('theme-toggle');
  themeToggleButton?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    updateTheme(isDark ? 'light' : 'dark');
    // Update active tab colors after theme change
    setTimeout(() => {
      const currentPath = window.location.hash.slice(1) || '/';
      updateNavigationState(currentPath);
    }, 50);
  });

  // Optimized dashboard link reload functionality
  const setupDashboardLinkReload = () => {
    const dashboardLink = getCachedElement('dashboard-link');
    const mobileDashboardLink = getCachedElement('mobile-dashboard-link');

    const handleDashboardClick = (e: Event) => {
      e.preventDefault();
      window.location.hash = '#/dashboard';
      setTimeout(() => {
        window.location.reload();
      }, 100);
    };

    // Remove existing listeners to prevent duplicates
    dashboardLink?.removeEventListener('click', handleDashboardClick);
    mobileDashboardLink?.removeEventListener('click', handleDashboardClick);

    // Add new listeners
    dashboardLink?.addEventListener('click', handleDashboardClick);
    mobileDashboardLink?.addEventListener('click', handleDashboardClick);
  };

  // Setup dashboard link reload functionality
  setupDashboardLinkReload();

  // Check initial auth state and update UI
  supabase.auth.getSession().then(({ data: { session } }) => {
    updateAuthUI(session);
  });

  // Listen for auth state changes with optimized handling
  supabase.auth.onAuthStateChange((_event, session) => {
    updateAuthUI(session);
    
    // Clear user cache when auth state changes
    clearUserCache();
    
    // Re-setup dashboard link reload when auth state changes
    setTimeout(setupDashboardLinkReload, 100);
    
    // Update schedule button visibility when auth state changes
    if ((window as any).updateScheduleButtonVisibility) {
      (window as any).updateScheduleButtonVisibility();
    }
  });
}
