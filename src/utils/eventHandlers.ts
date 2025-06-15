export function setupModalListeners(modalId: string, openButtonClass: string) {
  const modal = document.getElementById(modalId);
  const openButtons = document.querySelectorAll(`.${openButtonClass}`);
  const closeButtons = modal?.querySelectorAll('.close-modal');

  openButtons.forEach(button => {
    button.addEventListener('click', () => {
      modal?.classList.remove('hidden');
      const authDropdown = document.getElementById('auth-dropdown');
      authDropdown?.classList.add('hidden');
    });
  });

  closeButtons?.forEach(button => {
    button.addEventListener('click', () => {
      modal?.classList.add('hidden');
    });
  });

  // Close modal when clicking outside
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
}

export function setupEventListeners() {
  // Mobile menu toggle functionality
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  mobileMenuButton?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('hidden');
  });

  // Auth dropdown functionality
  const authMenuButton = document.getElementById('auth-menu-button');
  const authDropdown = document.getElementById('auth-dropdown');
  
  authMenuButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    authDropdown?.classList.toggle('hidden');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    authDropdown?.classList.add('hidden');
  });

  // Setup modal listeners for both desktop and mobile
  setupModalListeners('login-modal', 'mobile-login-button');
  setupModalListeners('signup-modal', 'mobile-signup-button');
  
  const loginButton = document.getElementById('login-button');
  const signupButton = document.getElementById('signup-button');
  const loginModal = document.getElementById('login-modal');
  const signupModal = document.getElementById('signup-modal');

  loginButton?.addEventListener('click', () => {
    loginModal?.classList.remove('hidden');
  });

  signupButton?.addEventListener('click', () => {
    signupModal?.classList.remove('hidden');
  });
}
