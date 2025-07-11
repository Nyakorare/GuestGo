import { HomePage } from '../pages/Home';
import { AboutPage } from '../pages/About';
import { ContactPage } from '../pages/Contact';
import { DashboardPage } from '../pages/dashboard';
import { QRScannerPage } from '../pages/QRScanner';
import { GatePage, setupGatePage } from '../pages/GatePage';
import { setupAboutPageInteractivity } from './eventHandlers';
import { performanceMonitor } from './performance';

// Cache for page content to avoid re-rendering
const pageCache = new Map<string, string>();

// Cache for user data to reduce database calls
let userDataCache: { user: any; role: string | null } | null = null;
let userDataCacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

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
    case '/qr-scanner':
      return QRScannerPage();
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
    const { data: { user } } = await import('../config/supabase').then(m => m.default.auth.getUser());
    let role = null;
    
    if (user) {
      try {
        const { data: roleData } = await import('../config/supabase').then(m => m.default
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single());
        role = roleData?.role || null;
      } catch (error) {
        console.log('Role not found for user');
      }
    }

    // Update cache
    userDataCache = { user, role };
    userDataCacheTime = now;
    
    return { user, role };
  } catch (error) {
    console.log('User not authenticated');
    userDataCache = { user: null, role: null };
    userDataCacheTime = now;
    return { user: null, role: null };
  }
}

// Clear user cache when needed
export function clearUserCache() {
  userDataCache = null;
  userDataCacheTime = 0;
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
  
  if (!mainContent) return;

  // Show loading state
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'page-transition';
  loadingDiv.innerHTML = '<div class="flex justify-center items-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>';
  
  // Update content with loading state
  mainContent.innerHTML = '';
  mainContent.appendChild(loadingDiv);

  try {
    // Get user data (cached)
    const { user, role } = await getUserData();
    
    // Check access permissions
    if (path === '/qr-scanner' && role !== 'personnel') {
      window.location.hash = '/';
      performanceMonitor.endNavigation(path);
      return;
    }
    
    if (path.startsWith('/gate/') && role !== 'admin') {
      window.location.hash = '/dashboard';
      performanceMonitor.endNavigation(path);
      return;
    }

    // Get or create cached page content
    let pageContent: string;
    if (pageCache.has(path)) {
      pageContent = pageCache.get(path)!;
      console.log(`📦 Using cached content for: ${path}`);
    } else {
      pageContent = renderPage(path);
      // Cache non-dynamic pages
      if (!path.startsWith('/gate/')) {
        pageCache.set(path, pageContent);
        console.log(`💾 Cached new content for: ${path}`);
      }
    }

    // Update DOM efficiently
    const contentDiv = document.createElement('div');
    contentDiv.className = 'page-transition';
    contentDiv.innerHTML = pageContent;
    
    // Replace loading state with actual content
    mainContent.innerHTML = '';
    mainContent.appendChild(contentDiv);

    // Setup page-specific functionality
    await setupPageFunctionality(path, user, role);

    // Update navigation state
    updateNavigationState(path);

    // End performance monitoring
    performanceMonitor.endNavigation(path);

  } catch (error) {
    console.error('Navigation error:', error);
    // Fallback to home page
    window.location.hash = '/';
    performanceMonitor.endNavigation(path);
  }
}

async function setupPageFunctionality(path: string, user: any, role: string | null) {
  // Setup page-specific interactivity
  if (path === '/about') {
    setupAboutPageInteractivity();
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
