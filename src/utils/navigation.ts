import { HomePage } from '../pages/Home';
import { AboutPage } from '../pages/About';
import { ContactPage } from '../pages/Contact';
import { DashboardPage } from '../pages/dashboard';
import { QRScannerPage } from '../pages/QRScanner';
import { GatePage, setupGatePage } from '../pages/GatePage';
import { setupAboutPageInteractivity } from './eventHandlers';

export function renderPage(path: string) {
  // Hide welcome message and profile settings by default
  const welcomeMessage = document.getElementById('welcomeMessage');
  const profileSettingsBtn = document.getElementById('profileSettingsBtn');
  if (welcomeMessage) welcomeMessage.classList.add('hidden');
  if (profileSettingsBtn) profileSettingsBtn.classList.add('hidden');

  // Show welcome message and profile settings only on dashboard page
  if (path === '/dashboard') {
    if (welcomeMessage) welcomeMessage.classList.remove('hidden');
    if (profileSettingsBtn) profileSettingsBtn.classList.remove('hidden');
  }

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

export async function updateNavigation() {
  const path = window.location.hash.slice(1) || '/';
  const mainContent = document.querySelector('main');
  
  // Check if user is authenticated and get their role
  let userRole = null;
  try {
    const { data: { user } } = await import('../config/supabase').then(m => m.default.auth.getUser());
    if (user) {
      const { data: roleData } = await import('../config/supabase').then(m => m.default
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single());
      if (roleData) {
        userRole = roleData.role;
      }
    }
  } catch (error) {
    console.log('User not authenticated or role not found');
  }
  
  if (mainContent) {
    const content = document.createElement('div');
    content.className = 'page-transition';
    content.innerHTML = renderPage(path);
    
    mainContent.innerHTML = '';
    mainContent.appendChild(content);
    if (path === '/about') {
      setupAboutPageInteractivity();
    }
    if (path === '/qr-scanner') {
      // Check if user has personnel role before allowing access
      if (userRole !== 'personnel') {
        // Redirect to home page if not personnel
        window.location.hash = '/';
        return;
      }
      // Import and initialize QR scanner functionality
      import('../pages/QRScanner').then(({ initializeQRScanner }) => {
        setTimeout(() => {
          initializeQRScanner();
        }, 100);
      });
    }
    
    // Handle gate page setup
    if (path.startsWith('/gate/')) {
      const gateId = path.split('/')[2];
      if (gateId) {
        // Check if user has admin role before allowing access
        if (userRole !== 'admin') {
          // Redirect to dashboard if not admin
          window.location.hash = '/dashboard';
          return;
        }
        // Setup gate page functionality
        setTimeout(() => {
          setupGatePage(gateId);
        }, 100);
      }
    }
  }

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
}

// Track previous hash for transition detection
let previousHash = window.location.hash;
window.addEventListener('hashchange', () => {
  const newHash = window.location.hash;
  // If navigating from a gate details page to dashboard, force reload
  if (previousHash.startsWith('#/gate/') && newHash === '#/dashboard') {
    window.location.reload();
  }
  previousHash = newHash;
});
