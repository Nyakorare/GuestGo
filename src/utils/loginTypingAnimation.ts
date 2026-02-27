export function setupLoginTypingAnimation(): void {
  const loginModal = document.getElementById('login-modal');
  if (!loginModal) return;

  // Create or reuse a typing indicator element
  let indicator = loginModal.querySelector('.login-typing-indicator') as HTMLElement | null;

  if (!indicator) {
    indicator = document.createElement('p');
    indicator.className =
      'login-typing-indicator mt-1 text-xs text-blue-500 dark:text-blue-300 opacity-0 transition-opacity duration-200';
    indicator.textContent = 'Typing...';

    const headingContainer =
      loginModal.querySelector('.auth-modal-content h2')?.parentElement ||
      loginModal.querySelector('.auth-modal-content');

    if (headingContainer) {
      headingContainer.appendChild(indicator);
    }
  }

  const emailInput = document.getElementById('login-email') as HTMLInputElement | null;
  const passwordInput = document.getElementById('login-password') as HTMLInputElement | null;

  if (!emailInput || !passwordInput || !indicator) return;

  let typingTimeout: number | null = null;

  const hideTyping = () => {
    if (!indicator) return;
    indicator.classList.remove('login-typing-active');
    indicator.classList.remove('opacity-100');
    indicator.classList.add('opacity-0');
  };

  const showTyping = () => {
    if (!indicator) return;
    indicator.classList.add('login-typing-active');
    indicator.classList.remove('opacity-0');
    indicator.classList.add('opacity-100');

    if (typingTimeout !== null) {
      window.clearTimeout(typingTimeout);
    }

    typingTimeout = window.setTimeout(() => {
      hideTyping();
    }, 600);
  };

  [emailInput, passwordInput].forEach((input) => {
    input.addEventListener('input', showTyping);
    input.addEventListener('blur', hideTyping);
  });
}

