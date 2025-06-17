import { HomePage } from '../pages/home';
import { AboutPage } from '../pages/about';
import { ContactPage } from '../pages/contact';
import { DashboardPage } from '../pages/dashboard';

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

  switch (path) {
    case '/':
      return HomePage();
    case '/about':
      return AboutPage();
    case '/contact':
      return ContactPage();
    case '/dashboard':
      return DashboardPage();
    default:
      return HomePage();
  }
}

export function updateNavigation() {
  const path = window.location.hash.slice(1) || '/';
  const mainContent = document.querySelector('main');
  if (mainContent) {
    const content = document.createElement('div');
    content.className = 'page-transition';
    content.innerHTML = renderPage(path);
    
    mainContent.innerHTML = '';
    mainContent.appendChild(content);
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
