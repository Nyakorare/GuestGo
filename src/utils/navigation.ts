import { HomePage } from '../pages/Home';
import { AboutPage } from '../pages/About';
import { ContactPage } from '../pages/Contact';

export function renderPage(route: string) {
  switch(route) {
    case '/about':
      return AboutPage();
    case '/contact':
      return ContactPage();
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
}
