import supabase from '../config/supabase';
import { getLoginModalTemplate, getSignupModalTemplate } from './AuthModalTemplates';
import { logAccountCreation } from '../utils/accountLogging';
import { setupLoginTypingAnimation } from '../utils/loginTypingAnimation';

export function createLoginModal() {
  return getLoginModalTemplate();
}

export function createSignupModal() {
  return getSignupModalTemplate();
}

// Function to setup auth event listeners
export function setupAuthEventListeners() {
  // Login form handler
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('login-email') as HTMLInputElement).value;
      const password = (document.getElementById('login-password') as HTMLInputElement).value;
      const errorDiv = document.getElementById('login-error');
      const submitButton = loginForm.querySelector('button[type="submit"]') as HTMLButtonElement;

      try {
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Check if email is verified
          if (!data.user.email_confirmed_at) {
            throw new Error('Please verify your email before logging in.');
          }

          // Redirect to home (hash route) and refresh
          window.location.hash = '/';
          setTimeout(() => {
            window.location.reload();
          }, 50);
        }
      } catch (err: any) {
        if (errorDiv) {
          const errorText = errorDiv.querySelector('span');
          if (errorText) {
            errorText.textContent = err.message;
          } else {
            errorDiv.textContent = err.message;
          }
          errorDiv.classList.remove('hidden');
        }
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
      }
    });
  }

  // Typing animation for login inputs
  setupLoginTypingAnimation();

  // Signup form handler
  const signupForm = document.getElementById('signup-form') as HTMLFormElement;
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('signup-email') as HTMLInputElement).value;
      const password = (document.getElementById('signup-password') as HTMLInputElement).value;
      const firstName = (document.getElementById('signup-firstname') as HTMLInputElement).value;
      const lastName = (document.getElementById('signup-lastname') as HTMLInputElement).value;
      const errorDiv = document.getElementById('signup-error');
      const successDiv = document.getElementById('signup-success');
      const submitButton = signupForm.querySelector('button[type="submit"]') as HTMLButtonElement;

      try {
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Creating Account...';

        // Validate password length
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        // Check if user already exists
        const { data: existingUser } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (existingUser?.user) {
          throw new Error('An account with this email already exists. Please login instead.');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            },
            emailRedirectTo: `${window.location.origin}/#/`,
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('An account with this email already exists. Please login instead.');
          }
          if (error.status === 409) {
            throw new Error('Account creation conflict. Please try again or contact support.');
          }
          throw error;
        }

        if (data.user) {
          // Upsert the user_roles table with first_name, last_name, and email
          const { error: upsertError } = await supabase
            .from('user_roles')
            .upsert({ 
              user_id: data.user.id,
              first_name: firstName,
              last_name: lastName,
              email: email,
              role: 'visitor' // Ensure default role
            }, {
              onConflict: 'user_id'
            });

          if (upsertError) {
            console.error('Error upserting user_roles with user data:', upsertError);
            // Log the error but don't throw it as the account was created successfully
            // The user can still verify their email and login
          }

          // Log account creation
          logAccountCreation(data.user.id, email, firstName, lastName);

          // Show success message
          if (successDiv) {
            const successText = successDiv.querySelector('span');
            if (successText) {
              successText.textContent = 'Account created successfully! Please check your email to verify your account.';
            } else {
              successDiv.innerHTML = `
                <div class="flex items-center">
                  <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Account created successfully! Please check your email to verify your account.</span>
                </div>
              `;
            }
            successDiv.classList.remove('hidden');
          }

          // Clear form
          signupForm.reset();

          // Hide modal after 3 seconds
          setTimeout(() => {
            const modal = document.getElementById('signup-modal');
            if (modal) {
              closeModal(modal);
            }
          }, 3000);
        }
      } catch (err: any) {
        if (errorDiv) {
          const errorText = errorDiv.querySelector('span');
          if (errorText) {
            errorText.textContent = err.message;
          } else {
            errorDiv.textContent = err.message;
          }
          errorDiv.classList.remove('hidden');
        }
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = 'Create Account';
      }
    });
  }

  // Close modal buttons with animation
  const closeButtons = document.querySelectorAll('.auth-modal-close');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('[id$="-modal"]');
      if (modal) {
        closeModal(modal);
      }
    });
  });

  // Close modal on backdrop click
  const loginModal = document.getElementById('login-modal');
  const signupModal = document.getElementById('signup-modal');
  
  [loginModal, signupModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (loginModal && !loginModal.classList.contains('hidden')) {
        closeModal(loginModal);
      }
      if (signupModal && !signupModal.classList.contains('hidden')) {
        closeModal(signupModal);
      }
    }
  });
}

// Helper function to close modal with animation
function closeModal(modal: HTMLElement) {
  const content = modal.querySelector('.auth-modal-content');
  if (content) {
    content.classList.remove('auth-modal-content-open');
    content.classList.add('auth-modal-content-close');
    modal.classList.add('auth-modal-backdrop-close');
    
    setTimeout(() => {
      modal.classList.add('hidden');
      content.classList.remove('auth-modal-content-close');
      modal.classList.remove('auth-modal-backdrop-close');
      document.body.style.overflow = '';
      
      // Clear any error/success messages when closing
      const errorDiv = modal.querySelector('[id$="-error"]');
      const successDiv = modal.querySelector('[id$="-success"]');
      if (errorDiv) {
        errorDiv.classList.add('hidden');
        const errorText = errorDiv.querySelector('span');
        if (errorText) {
          errorText.textContent = '';
        } else {
          errorDiv.textContent = '';
        }
      }
      if (successDiv) {
        successDiv.classList.add('hidden');
        const successText = successDiv.querySelector('span');
        if (successText) {
          successText.textContent = '';
        } else {
          successDiv.textContent = '';
        }
      }
      
      // Reset forms
      const form = modal.querySelector('form');
      if (form) {
        form.reset();
      }
    }, 300);
  } else {
    modal.classList.add('hidden');
  }
}

// Helper function to open modal with animation
export function openModal(modalId: string) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Force reflow to ensure the hidden class is removed before animation
    void modal.offsetWidth;
    
    // Trigger content animation
    const content = modal.querySelector('.auth-modal-content');
    if (content) {
      requestAnimationFrame(() => {
        content.classList.add('auth-modal-content-open');
      });
    }
  }
}
