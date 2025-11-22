import { HomePage } from '../pages/Home';
import { AboutPage } from '../pages/About';
import { ContactPage, setupContactPage } from '../pages/Contact';
import { DashboardPage } from '../pages/dashboard';
import { QRScannerPage } from '../pages/QRScanner';
import { GatePage, setupGatePage } from '../pages/GatePage';
import { GuardDashboardPage } from '../pages/GuardDashboard';
import { TrackSchedulePage, initTrackSchedulePage } from '../pages/TrackSchedule';
import { setupAboutPageInteractivity } from './eventHandlers';
import { performanceMonitor } from './performance';
import { showLoadingOverlay, hideLoadingOverlay } from './loadingOverlay';

// Cache for page content to avoid re-rendering
const pageCache = new Map<string, string>();

// Cache for user data to reduce database calls
let userDataCache: { user: any; role: string | null } | null = null;
let userDataCacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds
const SUPABASE_REQUEST_TIMEOUT = 8000;
const NAVIGATION_USER_FALLBACK_TIMEOUT = 5000;
const SUPABASE_STORAGE_KEY = deriveSupabaseStorageKey();

function deriveSupabaseStorageKey(): string | null {
  try {
    const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL as string | undefined;
    if (!supabaseUrl) return null;
    const url = new URL(supabaseUrl);
    const projectRef = url.hostname.split('.')[0];
    if (!projectRef) return null;
    return `sb-${projectRef}-auth-token`;
  } catch {
    return null;
  }
}

function getRoleFromUserMetadata(user: any): string | null {
  if (!user) return null;
  const metaRole =
    (user as any)?.user_metadata?.role ||
    (user as any)?.app_metadata?.role ||
    null;
  if (!metaRole || typeof metaRole !== 'string') {
    return null;
  }
  return normalizeRole(metaRole);
}

function getCachedSessionUser(): any | null {
  if (typeof window === 'undefined' || !SUPABASE_STORAGE_KEY) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(SUPABASE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const session = parsed.currentSession || parsed.session || null;
    const user = session?.user || parsed.currentUser || null;
    return user ?? null;
  } catch (error) {
    console.warn('[Navigation] Unable to read cached Supabase session:', error);
    return null;
  }
}

function normalizeRole(role: string | null): string | null {
  if (!role || typeof role !== 'string') {
    return null;
  }

  const normalized = role.toLowerCase();
  if (normalized === 'logs') {
    return 'log';
  }
  if (normalized === 'guards') {
    return 'guard';
  }
  if (normalized === 'personel') {
    return 'personnel';
  }
  return normalized;
}

function withTimeout<T>(promiseFactory: () => Promise<T>, timeoutMs: number, label: string): Promise<T> {
	if (typeof window === 'undefined') {
		return promiseFactory();
	}

	return new Promise<T>((resolve, reject) => {
		let timeoutId: number | undefined = window.setTimeout(() => {
			timeoutId = undefined;
			reject(new Error(`${label} timed out after ${timeoutMs}ms`));
		}, timeoutMs);

		promiseFactory()
			.then((result) => {
				if (timeoutId !== undefined) {
					clearTimeout(timeoutId);
				}
				resolve(result);
			})
			.catch((error) => {
				if (timeoutId !== undefined) {
					clearTimeout(timeoutId);
				}
				reject(error);
			});
	});
}

// Debounce function to prevent rapid navigation calls
let navigationTimeout: number | null = null;

// Preload critical pages
function preloadPages() {
  const criticalPages = ['/', '/about', '/contact'];
  criticalPages.forEach(path => {
    if (!pageCache.has(path)) {
      pageCache.set(path, renderPage(path));
    }
  });
}

export function renderPage(path: string): string {
  // Handle gate page routes
  if (path.startsWith('/gate/')) {
    const gateId = path.split('/')[2];
    if (gateId) {
      return GatePage(gateId);
    }
  }

  switch (path) {
    case '/':
      return HomePage();
    case '/about':
      return AboutPage();
    case '/contact':
      return ContactPage();
    case '/dashboard':
      return DashboardPage();
    case '/guard-dashboard':
      return GuardDashboardPage();
    case '/qr-scanner':
      return QRScannerPage();
    case '/track-schedule':
      return TrackSchedulePage();
    default:
      return HomePage();
  }
}

// Optimized user data fetching with caching
async function getUserData(): Promise<{ user: any; role: string | null }> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (userDataCache && (now - userDataCacheTime) < CACHE_DURATION) {
    return userDataCache;
  }

  try {
    const supabaseClient = await import('../config/supabase').then(m => m.default);
    let user: any = null;
    let role: string | null = null;

    try {
      const sessionResponse = await supabaseClient.auth.getSession();
      user = sessionResponse?.data?.session?.user ?? null;
    } catch (error) {
      console.warn('[Navigation] auth.getSession failed:', error);
    }
    
    if (user) {
      try {
        const roleResponse = await withTimeout(
          () =>
            supabaseClient
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
              .maybeSingle(),
          SUPABASE_REQUEST_TIMEOUT,
          'user role lookup'
        );
        role = roleResponse?.data?.role || null;
      } catch (error) {
        console.warn('[Navigation] user role lookup failed or timed out:', error);
      }
    }

    // Fallbacks: try metadata if DB role not found (e.g., deployment without user_roles seeded)
    if (!role && user) {
      role = getRoleFromUserMetadata(user);
    }

    role = normalizeRole(role);

    // Update cache
    userDataCache = { user, role };
    userDataCacheTime = now;
    
    return { user, role };
  } catch (error) {
    console.error('[Navigation] getUserData failed:', error);
    const cachedUser = getCachedSessionUser();
    const fallbackRole = getRoleFromUserMetadata(cachedUser);
    const fallbackData = { user: cachedUser, role: fallbackRole };
    userDataCache = fallbackData;
    userDataCacheTime = now;
    return fallbackData;
  }
}

// Clear user cache when needed
export function clearUserCache() {
  userDataCache = null;
  userDataCacheTime = 0;
}

async function getFallbackUserData(): Promise<{ user: any; role: string | null }> {
  if (userDataCache) {
    return userDataCache;
  }

  const cachedUser = getCachedSessionUser();
  if (cachedUser) {
    return {
      user: cachedUser,
      role: getRoleFromUserMetadata(cachedUser)
    };
  }

  return { user: null, role: null };
}

// Optimized navigation update with debouncing
export async function updateNavigation() {
  // Debounce rapid navigation calls
  if (navigationTimeout) {
    clearTimeout(navigationTimeout);
  }

  return new Promise<void>((resolve) => {
    navigationTimeout = setTimeout(async () => {
      await performNavigation();
      resolve();
    }, 50); // 50ms debounce
  });
}

async function performNavigation() {
  const path = window.location.hash.slice(1) || '/';
  
  // Start performance monitoring
  performanceMonitor.startNavigation(path);
  
  const mainContent = document.querySelector('main');
  const navbar = document.querySelector('nav');
  
  if (!mainContent) return;

  // Hide navbar and show loading overlay
  if (navbar) {
    navbar.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    navbar.style.opacity = '0';
    navbar.style.transform = 'translateY(-10px)';
  }
  
  // Show global loading overlay
  showLoadingOverlay('Loading page...');

  try {
    // Get user data (cached) but never let it block navigation
    let user = null;
    let role: string | null = null;
    let userFetchTimedOut = false;
    let fallbackTimeoutId: number | null = null;

    try {
      const userDataPromise = getUserData();
      const fallbackPromise = new Promise<{ user: any; role: string | null }>((resolve) => {
        fallbackTimeoutId = window.setTimeout(() => {
          userFetchTimedOut = true;
          console.warn('[Navigation] getUserData fallback triggered. Proceeding with cached/session data and will retry in background.');
          getFallbackUserData()
            .then(resolve)
            .catch(() => resolve({ user: null, role: null }));
        }, NAVIGATION_USER_FALLBACK_TIMEOUT);
      });

      const userData = await Promise.race([userDataPromise, fallbackPromise]);
      if (fallbackTimeoutId !== null) {
        clearTimeout(fallbackTimeoutId);
      }
      user = userData.user;
      role = userData.role;

      if (userFetchTimedOut) {
        userDataPromise
          .then((finalData) => {
            if (!finalData) return;
            const gainedUser = !user && finalData.user;
            const gainedRole = !role && finalData.role;
            if (gainedUser || gainedRole) {
              setTimeout(() => {
                updateNavigation();
              }, 0);
            }
          })
          .catch((error) => {
            console.warn('[Navigation] Deferred user data retrieval failed:', error);
          });
      }
    } catch (error) {
      console.warn('[Navigation] getUserData failed:', error);
      user = null;
      role = null;
    }

    if (userFetchTimedOut) {
      console.warn('[Navigation] getUserData fallback triggered. Proceeding without user data to avoid blocking UI.');
    }

    // If navigating to a protected route and we have a user but no role yet,
    // force a single re-fetch to avoid redirecting due to a race condition.
    const isProtectedRoute = path === '/qr-scanner' || path === '/guard-dashboard' || path === '/track-schedule' || path.startsWith('/gate/');
    if (isProtectedRoute && user && !role) {
      // Retry up to 3 times with small delays to account for production latency
      const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
      for (let attempt = 0; attempt < 3 && !role; attempt++) {
        clearUserCache();
        const refreshed = await getUserData();
        user = refreshed.user;
        role = refreshed.role;
        if (!role) {
          await sleep(200);
        }
      }
    }
    
    // Check access permissions - allow access but show appropriate content based on role
    if (path === '/qr-scanner') {
      // Allow access to QR scanner for all authenticated users
      // The page will show appropriate content based on user role
    }
    
    if (path === '/guard-dashboard') {
      // Allow access to guard dashboard for all authenticated users
      // The page will show appropriate content based on user role
    }
    
    // Deny track schedule to logs/log, guard, and personnel roles (accept both variants for logs)
    if (path === '/track-schedule' && (role === 'log' || role === 'logs' || role === 'guard' || role === 'personnel')) {
      window.location.hash = '/';
      hideLoadingOverlay();
      showNavbar();
      performanceMonitor.endNavigation(path);
      return;
    }
    
    if (path.startsWith('/gate/') && role !== 'admin') {
      window.location.hash = '/dashboard';
      hideLoadingOverlay();
      showNavbar();
      performanceMonitor.endNavigation(path);
      return;
    }

    // Get or create cached page content
    let pageContent: string;
    if (pageCache.has(path)) {
      pageContent = pageCache.get(path)!;
    } else {
      pageContent = renderPage(path);
      // Cache non-dynamic pages
      if (!path.startsWith('/gate/')) {
        pageCache.set(path, pageContent);
      }
    }

    // Cleanup previous page resources
    if ((window as any).cleanupAboutPage && path !== '/about') {
      (window as any).cleanupAboutPage();
    }
    
    // Update DOM efficiently with smooth transition
    const contentDiv = document.createElement('div');
    contentDiv.className = 'page-transition';
    contentDiv.style.opacity = '0';
    contentDiv.style.transform = 'translateY(20px)';
    contentDiv.innerHTML = pageContent;
    
    // Replace content
    mainContent.innerHTML = '';
    mainContent.appendChild(contentDiv);

    // Setup page-specific functionality
    await setupPageFunctionality(path, user, role);

    // Update navigation state
    updateNavigationState(path);
    
    // Update schedule button visibility when navigating to home page
    if (path === '/' && (window as any).updateScheduleButtonVisibility) {
      (window as any).updateScheduleButtonVisibility();
    }

    // Animate content in and show navbar
    setTimeout(() => {
      contentDiv.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
      contentDiv.style.opacity = '1';
      contentDiv.style.transform = 'translateY(0)';
      
      // Hide loading overlay and show navbar after content animation starts
      setTimeout(() => {
        hideLoadingOverlay();
        // Add a slight delay before showing navbar for smoother transition
        setTimeout(() => {
          showNavbar();
        }, 150);
      }, 100);
    }, 50);

    // End performance monitoring
    performanceMonitor.endNavigation(path);

  } catch (error) {
    console.error('Navigation error:', error);
    hideLoadingOverlay();
    showNavbar();
    // Fallback to home page
    window.location.hash = '/';
    performanceMonitor.endNavigation(path);
  }
}

// Helper function to show navbar with animation
function showNavbar() {
  const navbar = document.querySelector('nav');
  if (navbar) {
    navbar.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    navbar.style.opacity = '1';
    navbar.style.transform = 'translateY(0)';
  }
}

async function setupPageFunctionality(path: string, user: any, role: string | null) {
  // Setup page-specific interactivity
  if (path === '/about') {
    setupAboutPageInteractivity();
  }
  
  if (path === '/contact') {
    // Initialize contact page functionality
    setTimeout(() => {
      setupContactPage();
    }, 100);
  }
  
  if (path === '/qr-scanner') {
    // Import and initialize QR scanner functionality
    import('../pages/QRScanner').then(({ initializeQRScanner }) => {
      setTimeout(() => {
        initializeQRScanner();
      }, 100);
    });
  }
  
  if (path.startsWith('/gate/')) {
    const gateId = path.split('/')[2];
    if (gateId) {
      setTimeout(() => {
        setupGatePage(gateId);
      }, 100);
    }
  }
  
  if (path === '/guard-dashboard') {
    // Import and initialize guard dashboard functionality
    import('../pages/GuardDashboard').then(({ initializeGuardDashboard }) => {
      setTimeout(() => {
        initializeGuardDashboard();
      }, 100);
    });
  }
  
  if (path === '/track-schedule') {
    // Initialize track schedule page functionality
    setTimeout(() => {
      initTrackSchedulePage();
    }, 100);
  }
}

function updateNavigationState(path: string) {
  // Update active navigation link
  document.querySelectorAll('nav a').forEach(link => {
    if (link.getAttribute('href') === '#' + path) {
      link.classList.add('text-blue-600', 'nav-link');
    } else {
      link.classList.remove('text-blue-600');
      link.classList.add('nav-link');
    }
  });

  // Show/hide auth menu based on current page
  const authMenuContainer = document.getElementById('auth-menu-container');
  const mobileAuthButtons = document.getElementById('mobile-auth-buttons');
  
  if (authMenuContainer && mobileAuthButtons) {
    if (path === '/' || path === '') {
      authMenuContainer.style.display = 'flex';
      mobileAuthButtons.style.display = 'block';
    } else {
      authMenuContainer.style.display = 'none';
      mobileAuthButtons.style.display = 'none';
    }
  }

  // Handle welcome message and profile settings visibility
  const welcomeMessage = document.getElementById('welcomeMessage');
  const profileSettingsBtn = document.getElementById('profileSettingsBtn');
  
  if (welcomeMessage) welcomeMessage.classList.add('hidden');
  if (profileSettingsBtn) profileSettingsBtn.classList.add('hidden');

  if (path === '/dashboard') {
    if (welcomeMessage) welcomeMessage.classList.remove('hidden');
    if (profileSettingsBtn) profileSettingsBtn.classList.remove('hidden');
  }
}

// Track previous hash for transition detection
let previousHash = window.location.hash;

// Optimized hash change handler
window.addEventListener('hashchange', () => {
  const newHash = window.location.hash;
  
  // If navigating to home page, refresh the page first
  if (newHash === '#/' || newHash === '') {
    window.location.reload();
    return;
  }
  
  // If navigating from a gate details page to dashboard, force reload
  if (previousHash.startsWith('#/gate/') && newHash === '#/dashboard') {
    window.location.reload();
    return;
  }
  
  previousHash = newHash;
  
  // Use the optimized navigation
  updateNavigation();
});

// Initialize preloading
preloadPages();
