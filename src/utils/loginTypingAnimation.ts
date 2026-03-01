function setupTypingAnimationForModal(modalId: string, inputIds: string[]): void {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  let indicator = modal.querySelector('.auth-typing-indicator') as HTMLElement | null;

  if (!indicator) {
    indicator = document.createElement('p');
    indicator.className =
      'auth-typing-indicator mt-1 text-xs text-blue-500 dark:text-blue-300 opacity-0 transition-opacity duration-200';
    indicator.textContent = 'Typing...';

    const headingContainer =
      modal.querySelector('.auth-modal-content h2')?.parentElement ||
      modal.querySelector('.auth-modal-content');

    if (headingContainer) {
      headingContainer.appendChild(indicator);
    }
  }

  const inputs: HTMLInputElement[] = [];
  inputIds.forEach((id) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) inputs.push(el);
  });

  if (!inputs.length || !indicator) return;

  let typingTimeout: number | null = null;

  const hideTyping = () => {
    if (!indicator) return;
    indicator.classList.remove('auth-typing-active');
    indicator.classList.remove('opacity-100');
    indicator.classList.add('opacity-0');
    inputs.forEach((input) => input.classList.remove('auth-input-typing'));
  };

  const showTyping = (activeInput: HTMLInputElement) => {
    if (!indicator) return;
    indicator.classList.add('auth-typing-active');
    indicator.classList.remove('opacity-0');
    indicator.classList.add('opacity-100');

    inputs.forEach((input) => input.classList.remove('auth-input-typing'));
    activeInput.classList.add('auth-input-typing');

    if (typingTimeout !== null) {
      window.clearTimeout(typingTimeout);
    }

    typingTimeout = window.setTimeout(() => {
      hideTyping();
    }, 600);
  };

  inputs.forEach((input) => {
    input.addEventListener('input', () => showTyping(input));
    input.addEventListener('blur', hideTyping);
  });
}

export function setupLoginTypingAnimation(): void {
  setupTypingAnimationForModal('login-modal', ['login-email', 'login-password']);
}

export function setupSignupTypingAnimation(): void {
  setupTypingAnimationForModal('signup-modal', [
    'signup-firstname',
    'signup-lastname',
    'signup-email',
    'signup-password',
  ]);
}

