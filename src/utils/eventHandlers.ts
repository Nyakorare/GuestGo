import supabase from '../config/supabase';
import { logAction } from './logging';
import { openModal } from '../components/AuthModals';
import { setupVisitLocationsStatModal } from '../components/mini-features/VisitLocationsStatModal';


// Function to show logout modal after password change
function showPasswordChangeLogoutModal() {
  // Remove any existing modal
  const existingModal = document.getElementById('password-change-logout-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal HTML
  const modalHTML = `
    <div id="password-change-logout-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300">
        <!-- Header with gradient background -->
        <div class="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-t-2xl p-6">
          <div class="flex items-center space-x-3">
            <div class="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white">Password Changed</h3>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <div class="mb-6">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                  <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div class="flex-1">
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Your password has been successfully changed. For security reasons, you have been logged out. Please log in again with your new password.
                </p>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <div class="flex justify-end">
            <button 
              id="passwordChangeLogoutOkBtn"
              class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              OK, Log Me Out
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Lock body scroll while modal is open
  document.body.classList.add('overflow-hidden');

  // Setup event listeners
  const modal = document.getElementById('password-change-logout-modal');
  const okBtn = document.getElementById('passwordChangeLogoutOkBtn');

  const handleLogout = async () => {
    if (modal) {
      modal.remove();
    }
    // Restore body scroll
    document.body.classList.remove('overflow-hidden');
    
    // Log out the user
    await supabase.auth.signOut();
    
    // Redirect to home page
    window.location.hash = '/';
    
    // Reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 50);
  };

  okBtn?.addEventListener('click', handleLogout);

  // Close on background click
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      handleLogout();
    }
  });

  // Close on escape key
  const escapeHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && modal) {
      handleLogout();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

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

function updateAuthMenu(isLoggedIn: boolean) {
  const authDropdownContent = document.getElementById('auth-dropdown-content');
  const mobileAuthButtons = document.getElementById('mobile-auth-buttons');

  if (isLoggedIn) {
    // Desktop dropdown content
    if (authDropdownContent) {
      authDropdownContent.innerHTML = `
        <button id="logout-button" class="auth-dropdown-button block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:text-red-500 dark:hover:bg-gray-700 transition-colors duration-200">
          Logout
        </button>
      `;
    }

    // Mobile menu content
    if (mobileAuthButtons) {
      mobileAuthButtons.innerHTML = `
        <button id="mobile-logout-button" class="block w-full text-left px-3 py-2 text-red-600 dark:text-red-500 font-medium">
          Logout
        </button>
      `;
    }
  } else {
    // Desktop dropdown content
    if (authDropdownContent) {
      authDropdownContent.innerHTML = `
        <button id="login-button" class="auth-dropdown-button block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200">Login</button>
        <button id="signup-button" class="auth-dropdown-button block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200">Sign Up</button>
      `;
    }

    // Mobile menu content
    if (mobileAuthButtons) {
      mobileAuthButtons.innerHTML = `
        <button class="mobile-login-button block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">Login</button>
        <button class="mobile-signup-button block w-full text-left px-3 py-2 text-blue-600 dark:text-blue-500 font-medium">Sign Up</button>
      `;
    }
  }

  // Setup event listeners for the new buttons
  setupAuthButtonListeners();
}

function setupAuthButtonListeners() {
  // Helper function to close dropdown with animation
  const closeDropdownAnimated = () => {
    const authDropdown = document.getElementById('auth-dropdown');
    if (authDropdown) {
      authDropdown.classList.remove('dropdown-open');
      authDropdown.classList.add('dropdown-close');
      setTimeout(() => {
        if (authDropdown.classList.contains('dropdown-close')) {
          authDropdown.classList.add('hidden');
        }
      }, 200);
    }
  };

  // Login button click handler
  const loginButton = document.getElementById('login-button');
  loginButton?.addEventListener('click', () => {
    // Add click animation
    loginButton.classList.add('auth-button-clicked');
    setTimeout(() => {
      loginButton.classList.remove('auth-button-clicked');
    }, 300);
    
    // Close dropdown with animation
    closeDropdownAnimated();
    
    // Open modal after a short delay for smooth transition
    setTimeout(() => {
      openModal('login-modal');
    }, 150);
  });

  // Signup button click handler
  const signupButton = document.getElementById('signup-button');
  signupButton?.addEventListener('click', () => {
    // Add click animation
    signupButton.classList.add('auth-button-clicked');
    setTimeout(() => {
      signupButton.classList.remove('auth-button-clicked');
    }, 300);
    
    // Close dropdown with animation
    closeDropdownAnimated();
    
    // Open modal after a short delay for smooth transition
    setTimeout(() => {
      openModal('signup-modal');
    }, 150);
  });

  // Logout button click handler
  const logoutButton = document.getElementById('logout-button');
  const mobileLogoutButton = document.getElementById('mobile-logout-button');
  
  const handleLogout = async () => {
    // Add click animation to logout button
    if (logoutButton) {
      logoutButton.classList.add('auth-button-clicked');
      setTimeout(() => {
        logoutButton.classList.remove('auth-button-clicked');
      }, 300);
    }
    
    // Close dropdown with animation
    closeDropdownAnimated();
    
    await supabase.auth.signOut();
    window.location.hash = '/';
    setTimeout(() => {
      window.location.reload();
    }, 50);
  };

  logoutButton?.addEventListener('click', handleLogout);
  mobileLogoutButton?.addEventListener('click', handleLogout);

  // Mobile login button click handler
  const mobileLoginButton = document.querySelector('.mobile-login-button');
  mobileLoginButton?.addEventListener('click', () => {
    openModal('login-modal');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu?.classList.add('hidden');
  });

  // Mobile signup button click handler
  const mobileSignupButton = document.querySelector('.mobile-signup-button');
  mobileSignupButton?.addEventListener('click', () => {
    openModal('signup-modal');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu?.classList.add('hidden');
  });
}

export function setupEventListeners() {
  // Mobile menu toggle functionality
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  mobileMenuButton?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('hidden');
  });

  // Update navigation based on user role
  updateNavigationBasedOnRole();

  // Profile settings dropdown functionality - now handled in separate file
  // Use dynamic import to avoid circular dependencies
  (async () => {
    try {
      const { setupProfileSettingsDropdown } = await import('../components/ProfileSettingsDropdown');
      setupProfileSettingsDropdown();
    } catch (err) {
      console.error('Error loading ProfileSettingsDropdown:', err);
    }
  })();

  // Function to close the modal
  const profileSettingsModal = document.getElementById('profileSettingsModal');
  const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
  
  const closeModal = () => {
    if (profileSettingsModal) {
      profileSettingsModal.classList.add('hidden');
      // Reset form and messages
      const passwordChangeForm = document.getElementById('passwordChangeForm') as HTMLFormElement;
      const passwordError = document.getElementById('passwordError');
      const passwordSuccess = document.getElementById('passwordSuccess');
      const submitBtn = passwordChangeForm?.querySelector('button[type="submit"]') as HTMLButtonElement;
      const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
      const passwordMatchIcon = document.getElementById('passwordMatchIcon');
      const passwordMismatchIcon = document.getElementById('passwordMismatchIcon');
      const passwordMatchFeedback = document.getElementById('passwordMatchFeedback');
      
      if (passwordChangeForm) {
        passwordChangeForm.reset();
      }
      if (passwordError) {
        passwordError.classList.add('hidden');
        const errorSpan = passwordError.querySelector('span');
        if (errorSpan) errorSpan.textContent = '';
      }
      if (passwordSuccess) {
        passwordSuccess.classList.add('hidden');
        const successSpan = passwordSuccess.querySelector('span');
        if (successSpan) successSpan.textContent = '';
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Change Password';
      }
      // Reset password match feedback
      const currentPasswordInput = document.getElementById('currentPassword') as HTMLInputElement;
      const currentPasswordLoadingIcon = document.getElementById('currentPasswordLoadingIcon');
      const currentPasswordCorrectIcon = document.getElementById('currentPasswordCorrectIcon');
      const currentPasswordIncorrectIcon = document.getElementById('currentPasswordIncorrectIcon');
      const currentPasswordFeedback = document.getElementById('currentPasswordFeedback');
      const newPasswordInput = document.getElementById('newPassword') as HTMLInputElement;

      if (passwordMatchIcon) passwordMatchIcon.classList.add('hidden');
      if (passwordMismatchIcon) passwordMismatchIcon.classList.add('hidden');
      if (passwordMatchFeedback) {
        passwordMatchFeedback.textContent = '';
        passwordMatchFeedback.classList.remove('text-green-600', 'text-red-600', 'dark:text-green-400', 'dark:text-red-400');
      }
      if (confirmPasswordInput) {
        confirmPasswordInput.classList.remove('border-green-500', 'border-red-500', 'focus:border-green-500', 'focus:border-red-500');
        confirmPasswordInput.classList.add('border-gray-300', 'dark:border-gray-600');
      }
      // Reset current password verification state
      if (currentPasswordLoadingIcon) currentPasswordLoadingIcon.classList.add('hidden');
      if (currentPasswordCorrectIcon) currentPasswordCorrectIcon.classList.add('hidden');
      if (currentPasswordIncorrectIcon) currentPasswordIncorrectIcon.classList.add('hidden');
      if (currentPasswordFeedback) {
        currentPasswordFeedback.textContent = '';
        currentPasswordFeedback.classList.remove('text-green-600', 'text-red-600', 'dark:text-green-400', 'dark:text-red-400');
      }
      if (currentPasswordInput) {
        currentPasswordInput.classList.remove('border-green-500', 'border-red-500', 'focus:border-green-500', 'focus:border-red-500');
        currentPasswordInput.classList.add('border-gray-300', 'dark:border-gray-600');
        // Re-enable the input when modal is closed/reset
        currentPasswordInput.disabled = false;
      }
      // Disable new password fields
      if (newPasswordInput) {
        newPasswordInput.disabled = true;
      }
      if (confirmPasswordInput) {
        confirmPasswordInput.disabled = true;
      }
    }
  };

  // Close modal when clicking the close button
  closeProfileModalBtn?.addEventListener('click', closeModal);

  // Close modal when clicking outside
  profileSettingsModal?.addEventListener('click', (e) => {
    if (e.target === profileSettingsModal) {
      closeModal();
    }
  });

  // Close modal when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && profileSettingsModal && !profileSettingsModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Profile logout button click handler is now handled in ProfileSettingsDropdown.ts

  // Handle password change form
  const passwordChangeForm = document.getElementById('passwordChangeForm') as HTMLFormElement;
  if (passwordChangeForm) {
    // Get all password-related elements
    const currentPasswordInput = document.getElementById('currentPassword') as HTMLInputElement;
    const newPasswordInput = document.getElementById('newPassword') as HTMLInputElement;
    const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
    const passwordMatchIcon = document.getElementById('passwordMatchIcon');
    const passwordMismatchIcon = document.getElementById('passwordMismatchIcon');
    const passwordMatchFeedback = document.getElementById('passwordMatchFeedback');
    const currentPasswordLoadingIcon = document.getElementById('currentPasswordLoadingIcon');
    const currentPasswordCorrectIcon = document.getElementById('currentPasswordCorrectIcon');
    const currentPasswordIncorrectIcon = document.getElementById('currentPasswordIncorrectIcon');
    const currentPasswordFeedback = document.getElementById('currentPasswordFeedback');

    // Track current password verification state
    let isCurrentPasswordValid = false;
    let passwordVerificationTimeout: NodeJS.Timeout | null = null;
    let currentUserEmail: string | null = null;

    // Get current user email
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        currentUserEmail = user.email;
      }
    })();

    // Function to verify current password
    const verifyCurrentPassword = async (password: string) => {
      if (!password || !currentUserEmail) {
        isCurrentPasswordValid = false;
        updatePasswordFieldsState();
        return;
      }

      // Show loading icon
      if (currentPasswordLoadingIcon) currentPasswordLoadingIcon.classList.remove('hidden');
      if (currentPasswordCorrectIcon) currentPasswordCorrectIcon.classList.add('hidden');
      if (currentPasswordIncorrectIcon) currentPasswordIncorrectIcon.classList.add('hidden');
      if (currentPasswordFeedback) {
        currentPasswordFeedback.textContent = '';
        currentPasswordFeedback.classList.remove('text-green-600', 'text-red-600', 'dark:text-green-400', 'dark:text-red-400');
      }

      try {
        // Try to sign in with the current password to verify it
        const { error } = await supabase.auth.signInWithPassword({
          email: currentUserEmail,
          password: password
        });

        if (error) {
          // Password is incorrect
          isCurrentPasswordValid = false;
          if (currentPasswordLoadingIcon) currentPasswordLoadingIcon.classList.add('hidden');
          if (currentPasswordCorrectIcon) currentPasswordCorrectIcon.classList.add('hidden');
          if (currentPasswordIncorrectIcon) currentPasswordIncorrectIcon.classList.remove('hidden');
          if (currentPasswordInput) {
            currentPasswordInput.classList.remove('border-green-500', 'focus:border-green-500', 'border-gray-300', 'dark:border-gray-600');
            currentPasswordInput.classList.add('border-red-500', 'focus:border-red-500');
          }
          if (currentPasswordFeedback) {
            currentPasswordFeedback.textContent = 'Incorrect password';
            currentPasswordFeedback.classList.remove('text-green-600', 'dark:text-green-400');
            currentPasswordFeedback.classList.add('text-red-600', 'dark:text-red-400');
          }
        } else {
          // Password is correct
          isCurrentPasswordValid = true;
          if (currentPasswordLoadingIcon) currentPasswordLoadingIcon.classList.add('hidden');
          if (currentPasswordCorrectIcon) currentPasswordCorrectIcon.classList.remove('hidden');
          if (currentPasswordIncorrectIcon) currentPasswordIncorrectIcon.classList.add('hidden');
          if (currentPasswordInput) {
            currentPasswordInput.classList.remove('border-red-500', 'focus:border-red-500', 'border-gray-300', 'dark:border-gray-600');
            currentPasswordInput.classList.add('border-green-500', 'focus:border-green-500');
            // Disable the input but keep the value visible
            currentPasswordInput.disabled = true;
          }
          if (currentPasswordFeedback) {
            currentPasswordFeedback.textContent = 'Password verified';
            currentPasswordFeedback.classList.remove('text-red-600', 'dark:text-red-400');
            currentPasswordFeedback.classList.add('text-green-600', 'dark:text-green-400');
          }
        }
      } catch (err) {
        // Error verifying password
        isCurrentPasswordValid = false;
        if (currentPasswordLoadingIcon) currentPasswordLoadingIcon.classList.add('hidden');
        if (currentPasswordCorrectIcon) currentPasswordCorrectIcon.classList.add('hidden');
        if (currentPasswordIncorrectIcon) currentPasswordIncorrectIcon.classList.remove('hidden');
        if (currentPasswordInput) {
          currentPasswordInput.classList.remove('border-green-500', 'focus:border-green-500', 'border-gray-300', 'dark:border-gray-600');
          currentPasswordInput.classList.add('border-red-500', 'focus:border-red-500');
        }
        if (currentPasswordFeedback) {
          currentPasswordFeedback.textContent = 'Error verifying password';
          currentPasswordFeedback.classList.remove('text-green-600', 'dark:text-green-400');
          currentPasswordFeedback.classList.add('text-red-600', 'dark:text-red-400');
        }
      } finally {
        updatePasswordFieldsState();
      }
    };

    // Function to update password fields state
    const updatePasswordFieldsState = () => {
      if (isCurrentPasswordValid) {
        // Enable new password fields
        if (newPasswordInput) {
          newPasswordInput.disabled = false;
        }
        if (confirmPasswordInput) {
          confirmPasswordInput.disabled = false;
        }
      } else {
        // Disable new password fields
        if (newPasswordInput) {
          newPasswordInput.disabled = true;
          newPasswordInput.value = '';
        }
        if (confirmPasswordInput) {
          confirmPasswordInput.disabled = true;
          confirmPasswordInput.value = '';
        }
        // Reset password match feedback
        if (passwordMatchIcon) passwordMatchIcon.classList.add('hidden');
        if (passwordMismatchIcon) passwordMismatchIcon.classList.add('hidden');
        if (passwordMatchFeedback) {
          passwordMatchFeedback.textContent = '';
          passwordMatchFeedback.classList.remove('text-green-600', 'text-red-600', 'dark:text-green-400', 'dark:text-red-400');
        }
        if (confirmPasswordInput) {
          confirmPasswordInput.classList.remove('border-green-500', 'border-red-500', 'focus:border-green-500', 'focus:border-red-500');
          confirmPasswordInput.classList.add('border-gray-300', 'dark:border-gray-600');
        }
      }
    };

    // Debounced password verification
    const debouncedVerifyPassword = (password: string) => {
      if (passwordVerificationTimeout) {
        clearTimeout(passwordVerificationTimeout);
      }
      passwordVerificationTimeout = setTimeout(() => {
        verifyCurrentPassword(password);
      }, 500); // Wait 500ms after user stops typing
    };

    // Add event listeners for current password verification
    currentPasswordInput?.addEventListener('input', (e) => {
      const password = (e.target as HTMLInputElement).value;
      // Don't verify if input is disabled (already verified)
      if (currentPasswordInput?.disabled) {
        return;
      }
      if (password.length === 0) {
        // Reset state when field is empty
        isCurrentPasswordValid = false;
        if (currentPasswordLoadingIcon) currentPasswordLoadingIcon.classList.add('hidden');
        if (currentPasswordCorrectIcon) currentPasswordCorrectIcon.classList.add('hidden');
        if (currentPasswordIncorrectIcon) currentPasswordIncorrectIcon.classList.add('hidden');
        if (currentPasswordFeedback) {
          currentPasswordFeedback.textContent = '';
          currentPasswordFeedback.classList.remove('text-green-600', 'text-red-600', 'dark:text-green-400', 'dark:text-red-400');
        }
        if (currentPasswordInput) {
          currentPasswordInput.classList.remove('border-green-500', 'border-red-500', 'focus:border-green-500', 'focus:border-red-500');
          currentPasswordInput.classList.add('border-gray-300', 'dark:border-gray-600');
        }
        updatePasswordFieldsState();
      } else {
        debouncedVerifyPassword(password);
      }
    });

    // Initialize fields as disabled
    updatePasswordFieldsState();

    const checkPasswordMatch = () => {
      const newPassword = newPasswordInput?.value || '';
      const confirmPassword = confirmPasswordInput?.value || '';

      if (confirmPassword.length === 0) {
        // No feedback if confirm password is empty
        if (passwordMatchIcon) passwordMatchIcon.classList.add('hidden');
        if (passwordMismatchIcon) passwordMismatchIcon.classList.add('hidden');
        if (passwordMatchFeedback) {
          passwordMatchFeedback.textContent = '';
          passwordMatchFeedback.classList.remove('text-green-600', 'text-red-600', 'dark:text-green-400', 'dark:text-red-400');
        }
        // Reset border to default
        if (confirmPasswordInput) {
          confirmPasswordInput.classList.remove('border-green-500', 'border-red-500', 'focus:border-green-500', 'focus:border-red-500');
          confirmPasswordInput.classList.add('border-gray-300', 'dark:border-gray-600');
        }
        return;
      }

      if (newPassword.length > 0 && confirmPassword.length > 0) {
        if (newPassword === confirmPassword) {
          // Passwords match
          if (passwordMatchIcon) passwordMatchIcon.classList.remove('hidden');
          if (passwordMismatchIcon) passwordMismatchIcon.classList.add('hidden');
          if (passwordMatchFeedback) {
            passwordMatchFeedback.textContent = 'Passwords match';
            passwordMatchFeedback.classList.remove('text-red-600', 'dark:text-red-400');
            passwordMatchFeedback.classList.add('text-green-600', 'dark:text-green-400');
          }
          // Update border color to green
          if (confirmPasswordInput) {
            confirmPasswordInput.classList.remove('border-red-500', 'focus:border-red-500', 'border-gray-300', 'dark:border-gray-600');
            confirmPasswordInput.classList.add('border-green-500', 'focus:border-green-500');
          }
        } else {
          // Passwords don't match
          if (passwordMatchIcon) passwordMatchIcon.classList.add('hidden');
          if (passwordMismatchIcon) passwordMismatchIcon.classList.remove('hidden');
          if (passwordMatchFeedback) {
            passwordMatchFeedback.textContent = 'Passwords do not match';
            passwordMatchFeedback.classList.remove('text-green-600', 'dark:text-green-400');
            passwordMatchFeedback.classList.add('text-red-600', 'dark:text-red-400');
          }
          // Update border color to red
          if (confirmPasswordInput) {
            confirmPasswordInput.classList.remove('border-green-500', 'focus:border-green-500', 'border-gray-300', 'dark:border-gray-600');
            confirmPasswordInput.classList.add('border-red-500', 'focus:border-red-500');
          }
        }
      }
    };

    // Add event listeners for live feedback
    newPasswordInput?.addEventListener('input', checkPasswordMatch);
    newPasswordInput?.addEventListener('keyup', checkPasswordMatch);
    confirmPasswordInput?.addEventListener('input', checkPasswordMatch);
    confirmPasswordInput?.addEventListener('keyup', checkPasswordMatch);

    passwordChangeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const currentPassword = (document.getElementById('currentPassword') as HTMLInputElement).value;
      const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;
      const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement).value;
      const passwordError = document.getElementById('passwordError');
      const passwordSuccess = document.getElementById('passwordSuccess');
      const submitBtn = passwordChangeForm.querySelector('button[type="submit"]') as HTMLButtonElement;

      // Reset messages
      if (passwordError) {
        passwordError.classList.add('hidden');
        const errorSpan = passwordError.querySelector('span');
        if (errorSpan) errorSpan.textContent = '';
      }
      if (passwordSuccess) {
        passwordSuccess.classList.add('hidden');
        const successSpan = passwordSuccess.querySelector('span');
        if (successSpan) successSpan.textContent = '';
      }

      // Validate current password is provided
      if (!currentPassword) {
        if (passwordError) {
          const errorSpan = passwordError.querySelector('span');
          if (errorSpan) errorSpan.textContent = 'Current password is required';
          passwordError.classList.remove('hidden');
        }
        return;
      }

      // Validate that current password has been verified
      if (!isCurrentPasswordValid) {
        if (passwordError) {
          const errorSpan = passwordError.querySelector('span');
          if (errorSpan) errorSpan.textContent = 'Please verify your current password first';
          passwordError.classList.remove('hidden');
        }
        return;
      }

      // Validate new password is provided
      if (!newPassword) {
        if (passwordError) {
          const errorSpan = passwordError.querySelector('span');
          if (errorSpan) errorSpan.textContent = 'New password is required';
          passwordError.classList.remove('hidden');
        }
        return;
      }

      // Validate new password length
      if (newPassword.length < 6) {
        if (passwordError) {
          const errorSpan = passwordError.querySelector('span');
          if (errorSpan) errorSpan.textContent = 'New password must be at least 6 characters long';
          passwordError.classList.remove('hidden');
        }
        return;
      }

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        if (passwordError) {
          const errorSpan = passwordError.querySelector('span');
          if (errorSpan) errorSpan.textContent = 'New passwords do not match';
          passwordError.classList.remove('hidden');
        }
        return;
      }

      // Show loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';
      }

      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) throw error;

        // Log the password change
        await logAction('password_change', {
          timestamp: new Date().toISOString()
        });

        // Close the profile settings modal
        if (profileSettingsModal) {
          profileSettingsModal.classList.add('hidden');
        }

        // Show logout modal and sign out
        showPasswordChangeLogoutModal();
      } catch (err: any) {
        if (passwordError) {
          const errorSpan = passwordError.querySelector('span');
          if (errorSpan) errorSpan.textContent = err.message || 'Failed to update password';
          passwordError.classList.remove('hidden');
        }
        if (passwordSuccess) {
          passwordSuccess.classList.add('hidden');
        }
      } finally {
        // Reset button state
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Change Password';
        }
      }
    });
  }

  // Auth dropdown functionality with animations
  const authMenuButton = document.getElementById('auth-menu-button');
  const authDropdown = document.getElementById('auth-dropdown');
  
  const openDropdown = () => {
    if (authDropdown) {
      authDropdown.classList.remove('hidden', 'dropdown-close');
      // Force reflow to ensure transition works
      void authDropdown.offsetWidth;
      authDropdown.classList.add('dropdown-open');
    }
  };

  const closeDropdown = () => {
    if (authDropdown) {
      authDropdown.classList.remove('dropdown-open');
      authDropdown.classList.add('dropdown-close');
      // Hide after animation completes
      setTimeout(() => {
        if (authDropdown.classList.contains('dropdown-close')) {
          authDropdown.classList.add('hidden');
        }
      }, 200);
    }
  };
  
  authMenuButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (authDropdown?.classList.contains('dropdown-open')) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (authDropdown && !authDropdown.contains(e.target as Node) && !authMenuButton?.contains(e.target as Node)) {
      closeDropdown();
    }
  });

  // Setup modal listeners for both desktop and mobile
  setupModalListeners('login-modal', 'mobile-login-button');
  setupModalListeners('signup-modal', 'mobile-signup-button');

  // Check initial auth state and update menu
  supabase.auth.getSession().then(({ data: { session } }) => {
    updateAuthMenu(!!session);
  });

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((_event, session) => {
    updateAuthMenu(!!session);
    // Update navigation based on role when auth state changes
    updateNavigationBasedOnRole();
    // Update schedule button visibility when auth state changes
    if ((window as any).updateScheduleButtonVisibility) {
      (window as any).updateScheduleButtonVisibility();
    }
  });
}

export function setupAboutPageInteractivity() {
  // FAQ Dropdown with improved animations
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', function() {
      const faqItem = this.closest('.faq-item');
      const answer = this.parentElement.querySelector('.faq-answer');
      const icon = this.querySelector('.faq-icon');
      
      // Close all other FAQ items
      document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem) {
          item.classList.remove('active');
          const otherAnswer = item.querySelector('.faq-answer');
          const otherIcon = item.querySelector('.faq-icon');
          if (otherAnswer) {
            otherAnswer.style.maxHeight = '0px';
            otherAnswer.style.paddingTop = '0rem';
            otherAnswer.style.paddingBottom = '0rem';
          }
          if (otherIcon) {
            otherIcon.style.transform = 'rotate(0deg)';
          }
        }
      });
      
      // Toggle current FAQ item
      const isActive = faqItem.classList.contains('active');
      if (isActive) {
        faqItem.classList.remove('active');
        if (answer) {
          answer.style.maxHeight = '0px';
          answer.style.paddingTop = '0rem';
          answer.style.paddingBottom = '0rem';
        }
        if (icon) {
          icon.style.transform = 'rotate(0deg)';
        }
      } else {
        faqItem.classList.add('active');
        if (answer) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
          answer.style.paddingTop = '1rem';
          answer.style.paddingBottom = '1rem';
        }
        if (icon) {
          icon.style.transform = 'rotate(180deg)';
        }
      }
    });
  });

  // Team Member Popup with smooth animations
  const teamDetails = {
    glenn: { name: 'Glenn', title: 'Founder & CEO', bio: 'Visionary leader with a passion for guest experience and technology.', img: '/glenn.jpg' },
    justine: { name: 'Justine', title: 'Product Manager', bio: 'Ensures GuestGo delivers value and innovation to every client.', img: '/justine.jpg' },
    ken: { name: 'Ken', title: 'Lead Developer', bio: 'Architects robust, scalable systems for seamless guest management.', img: '/ken.jpg' },
    kurt: { name: 'Kurt', title: 'UI/UX Designer', bio: 'Designs intuitive and beautiful interfaces for all users.', img: '/kurt.jpg' },
    walter: { name: 'Walter', title: 'QA Engineer', bio: 'Guarantees quality and reliability across the platform.', img: '/walter.jpg' },
  };
  
  // Create modal dynamically and append to body
  function createTeamModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('team-modal');
    if (existingModal) {
      existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'team-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-0 flex items-start justify-center z-[9999] hidden backdrop-blur-sm transition-all duration-300 ease-out overflow-y-auto pt-4 sm:pt-8 md:pt-12';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.right = '0';
    modal.style.bottom = '0';
    
    modal.innerHTML = `
      <div class="team-modal-card bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4 mt-4 sm:mt-8 relative transform scale-75 opacity-0 transition-all duration-500 ease-out overflow-hidden border border-gray-200 dark:border-gray-700">
        <div class="team-modal-accent absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 origin-left"></div>
        <div class="team-modal-dots team-modal-dots--tr absolute top-6 right-6 w-16 h-16 opacity-10 dark:opacity-20" aria-hidden="true"></div>
        <div class="team-modal-dots team-modal-dots--bottom absolute bottom-6 left-6 w-12 h-12 opacity-10 dark:opacity-20" aria-hidden="true"></div>
        <button id="close-team-modal" class="team-modal-close-btn absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl transition-colors duration-200 transform hover:scale-110 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">&times;</button>
        <div id="team-modal-content" class="relative z-[1] p-4 sm:p-6 md:p-8 pt-6"></div>
      </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
  }
  
  // Initialize modal
  let teamModal = createTeamModal();
  
  // Function to close modal
  function closeTeamModal() {
    if (teamModal) {
      teamModal.classList.remove('show');
      document.body.style.overflow = '';
      
      setTimeout(() => {
        teamModal.classList.add('hidden');
      }, 500);
    }
  }
  
  // Cleanup function to remove modal when navigating away
  function cleanupTeamModal() {
    if (teamModal && document.body.contains(teamModal)) {
      document.body.style.overflow = '';
      teamModal.remove();
    }
  }
  
  // Store cleanup function for navigation cleanup
  (window as any).cleanupAboutPage = cleanupTeamModal;
  
  document.querySelectorAll('.team-member').forEach(btn => {
    btn.addEventListener('click', function() {
      const member = this.getAttribute('data-member');
      const details = teamDetails[member];
      if (details) {
        // Ensure modal exists
        if (!teamModal || !document.body.contains(teamModal)) {
          teamModal = createTeamModal();
        }
        
        const modalContent = document.getElementById('team-modal-content');
        
        if (modalContent) {
          modalContent.innerHTML = `
            <div class="team-modal-anim team-modal-avatar-wrap flex justify-center mb-4 sm:mb-5" style="animation-delay: 0.15s">
              <div class="team-modal-avatar-ring rounded-full p-1 bg-gradient-to-br from-blue-500 to-indigo-600">
                <img src="${details.img}" alt="${details.name}" class="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover block">
              </div>
            </div>
            <h3 class="team-modal-anim team-modal-name text-xl sm:text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white" style="animation-delay: 0.25s">${details.name}</h3>
            <p class="team-modal-anim team-modal-title text-blue-600 dark:text-blue-400 font-semibold mb-3 text-sm sm:text-base text-center" style="animation-delay: 0.35s">${details.title}</p>
            <div class="team-modal-anim team-modal-divider h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent mb-3" style="animation-delay: 0.45s"></div>
            <p class="team-modal-anim team-modal-bio text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed" style="animation-delay: 0.55s">${details.bio}</p>
          `;
        }
        
        if (teamModal) {
          teamModal.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
          
          // Small delay to ensure the modal is visible before animating
          setTimeout(() => {
            teamModal.classList.add('show');
          }, 10);
        }
      }
    });
  });
  
  // Close team modal with smooth animation
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.id === 'close-team-modal') {
      closeTeamModal();
    }
  });
  
  // Close modal when clicking outside
  if (teamModal) {
    teamModal.addEventListener('click', (e) => {
      if (e.target === teamModal) {
        closeTeamModal();
      }
    });
  }
  
  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && teamModal && !teamModal.classList.contains('hidden')) {
      closeTeamModal();
    }
  });

  // Setup "Visit Locations" stat card modal + highlight animation
  setupVisitLocationsStatModal();

  // Load real statistics from database
  (async () => {
    try {
      // Get visit statistics using RPC function
      const { data: visitStats, error: statsError } = await supabase
        .rpc('get_visit_statistics');
      
      // Get total places count
      const { count: placesCount, error: placesError } = await supabase
        .from('places_to_visit')
        .select('*', { count: 'exact', head: true });
      
      if (!statsError && visitStats && visitStats.length > 0) {
        const stats = visitStats[0];
        
        // Total Visits
        const totalVisitsEl = document.getElementById('stat-total-visits');
        if (totalVisitsEl) {
          animateCounter(totalVisitsEl, Number(stats.total_visits) || 0);
        }
        
        // Completed Today (completed + completed_flagged)
        const completedTodayEl = document.getElementById('stat-completed-today');
        if (completedTodayEl) {
          const completedToday = (Number(stats.today_completed) || 0) + (Number(stats.today_completed_flagged) || 0);
          animateCounter(completedTodayEl, completedToday);
        }
        
        // Success Rate (completed visits / total visits * 100)
        const successRateEl = document.getElementById('stat-success-rate');
        if (successRateEl) {
          const totalVisits = Number(stats.total_visits) || 0;
          const completedVisits = (Number(stats.completed_visits) || 0) + (Number(stats.completed_flagged_visits) || 0);
          const successRate = totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0;
          animateCounter(successRateEl, successRate, 0);
        }
      }
      
      // Visit Locations (Places)
      const placesEl = document.getElementById('stat-places');
      if (placesEl && !placesError) {
        animateCounter(placesEl, placesCount || 0);
      }
      
    } catch (error) {
      console.error('Error loading statistics:', error);
      // Set default values on error
      const elements = [
        'stat-total-visits',
        'stat-completed-today',
        'stat-places',
        'stat-success-rate'
      ];
      elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.textContent = id === 'stat-success-rate' ? '0%' : '0';
        }
      });
    }
  })();

  // Setup scroll to top button
  import('../components/DocumentationNavigationButtons').then(({ setupScrollToTopButton }) => {
    setupScrollToTopButton();
  });

  function animateCounter(el: HTMLElement, target: number, decimals = 0) {
    let count = 0;
    const increment = Math.max(1, Math.floor(target / 100));
    const duration = 2000; // 2 seconds
    const steps = 60; // 60 steps for smooth animation
    const stepDuration = duration / steps;
    
    function update() {
      if (count < target) {
        count = Math.min(target, count + increment);
        const displayValue = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString();
        el.innerText = el.id === 'stat-success-rate' ? displayValue + '%' : displayValue;
        
        // Add a subtle scale effect during counting
        el.style.transform = 'scale(1.1)';
        setTimeout(() => {
          el.style.transform = 'scale(1)';
        }, 100);
        
        setTimeout(update, stepDuration);
      } else {
        const finalValue = decimals > 0 ? target.toFixed(decimals) : target.toLocaleString();
        el.innerText = el.id === 'stat-success-rate' ? finalValue + '%' : finalValue;
        el.style.transform = 'scale(1)';
      }
    }
    update();
  }

  // Setup QR Share Modal
  import('../components/mini-features/QRShareModal').then(({ setupQRShareModal, openQRShareModal }) => {
    setupQRShareModal().then(() => {
      const qrShareBtn = document.getElementById('qr-share-btn');
      qrShareBtn?.addEventListener('click', () => {
        openQRShareModal();
      });
    });
  }).catch(error => {
    console.error('Error setting up QR share modal:', error);
  });

  // Setup Timeline Toggle
  function setupTimelineToggle() {
    const timelineToggleBtn = document.getElementById('timeline-toggle-btn');
    const timelineContainer = document.getElementById('timeline-container');
    
    if (timelineToggleBtn && timelineContainer) {
      // Check if already initialized
      if (timelineToggleBtn.dataset.initialized === 'true') {
        return;
      }
      
      timelineToggleBtn.dataset.initialized = 'true';
      let isExpanded = false;
      
      timelineToggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        isExpanded = !isExpanded;
        
        const container = document.getElementById('timeline-container');
        const icon = document.getElementById('timeline-toggle-icon');
        
        if (container) {
          if (isExpanded) {
            container.classList.add('show');
            timelineToggleBtn.setAttribute('aria-expanded', 'true');
            if (icon) {
              icon.style.transform = 'rotate(180deg)';
            }
          } else {
            container.classList.remove('show');
            timelineToggleBtn.setAttribute('aria-expanded', 'false');
            if (icon) {
              icon.style.transform = 'rotate(0deg)';
            }
          }
        }
      });
    }
  }
  
  // Try to setup immediately and also after delays to catch dynamic content
  setupTimelineToggle();
  setTimeout(setupTimelineToggle, 100);
  setTimeout(setupTimelineToggle, 300);
  setTimeout(setupTimelineToggle, 500);
  
  // Also setup on DOMContentLoaded if not already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupTimelineToggle);
  }

  // Setup scroll to top button and home button
  import('../components/DocumentationNavigationButtons').then(({ setupScrollToTopButton }) => {
    setupScrollToTopButton();
  });
  import('../components/HomeButton').then(({ setupHomeButton }) => {
    setupHomeButton();
  });
}

// Function to update navigation based on user role
async function updateNavigationBasedOnRole() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get user's role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleData) {
        const userRole = roleData.role;
        
        // Get navigation elements
        const qrScannerLink = document.getElementById('qr-scanner-link');
        const mobileQrScannerLink = document.getElementById('mobile-qr-scanner-link');
        const dashboardLink = document.getElementById('dashboard-link');
        const mobileDashboardLink = document.getElementById('mobile-dashboard-link');
        const guardDashboardLink = document.getElementById('guard-dashboard-link');
        const mobileGuardDashboardLink = document.getElementById('mobile-guard-dashboard-link');
        const trackScheduleLink = document.getElementById('track-schedule-link');
        const mobileTrackScheduleLink = document.getElementById('mobile-track-schedule-link');
        
        // Show/hide QR Scanner links based on role
        if (userRole === 'personnel') {
          qrScannerLink?.classList.remove('hidden');
          mobileQrScannerLink?.classList.remove('hidden');
        } else {
          qrScannerLink?.classList.add('hidden');
          mobileQrScannerLink?.classList.add('hidden');
        }
        
        // Show/hide Guard Dashboard links based on role
        if (userRole === 'guard') {
          guardDashboardLink?.classList.remove('hidden');
          mobileGuardDashboardLink?.classList.remove('hidden');
        } else {
          guardDashboardLink?.classList.add('hidden');
          mobileGuardDashboardLink?.classList.add('hidden');
        }
        
        // Show/hide Track Schedule links based on role (hide for logs, guards, and personnel)
        if (userRole === 'log' || userRole === 'guard' || userRole === 'personnel') {
          trackScheduleLink?.classList.add('hidden');
          mobileTrackScheduleLink?.classList.add('hidden');
        } else {
          trackScheduleLink?.classList.remove('hidden');
          mobileTrackScheduleLink?.classList.remove('hidden');
        }
        
        // Show dashboard link for all authenticated users
        dashboardLink?.classList.remove('hidden');
        mobileDashboardLink?.classList.remove('hidden');
      }
    } else {
      // Hide QR Scanner links for non-authenticated users
      const qrScannerLink = document.getElementById('qr-scanner-link');
      const mobileQrScannerLink = document.getElementById('mobile-qr-scanner-link');
      const dashboardLink = document.getElementById('dashboard-link');
      const mobileDashboardLink = document.getElementById('mobile-dashboard-link');
      const guardDashboardLink = document.getElementById('guard-dashboard-link');
      const mobileGuardDashboardLink = document.getElementById('mobile-guard-dashboard-link');
      const trackScheduleLink = document.getElementById('track-schedule-link');
      const mobileTrackScheduleLink = document.getElementById('mobile-track-schedule-link');
      
      qrScannerLink?.classList.add('hidden');
      mobileQrScannerLink?.classList.add('hidden');
      dashboardLink?.classList.add('hidden');
      mobileDashboardLink?.classList.add('hidden');
      guardDashboardLink?.classList.add('hidden');
      mobileGuardDashboardLink?.classList.add('hidden');
      // Track schedule links remain visible for non-authenticated users
    }
  } catch (error) {
    console.error('Error updating navigation based on role:', error);
  }
}