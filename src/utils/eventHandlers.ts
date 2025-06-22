import supabase from '../config/supabase';
import { logAction } from './logging';

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
        <button id="logout-button" class="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:text-red-500 dark:hover:bg-gray-700 transition-colors duration-200">
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
        <button id="login-button" class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200">Login</button>
        <button id="signup-button" class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200">Sign Up</button>
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
  // Login button click handler
  const loginButton = document.getElementById('login-button');
  const loginModal = document.getElementById('login-modal');
  loginButton?.addEventListener('click', () => {
    loginModal?.classList.remove('hidden');
    const authDropdown = document.getElementById('auth-dropdown');
    authDropdown?.classList.add('hidden');
  });

  // Signup button click handler
  const signupButton = document.getElementById('signup-button');
  const signupModal = document.getElementById('signup-modal');
  signupButton?.addEventListener('click', () => {
    signupModal?.classList.remove('hidden');
    const authDropdown = document.getElementById('auth-dropdown');
    authDropdown?.classList.add('hidden');
  });

  // Logout button click handler
  const logoutButton = document.getElementById('logout-button');
  const mobileLogoutButton = document.getElementById('mobile-logout-button');
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  logoutButton?.addEventListener('click', handleLogout);
  mobileLogoutButton?.addEventListener('click', handleLogout);

  // Mobile login button click handler
  const mobileLoginButton = document.querySelector('.mobile-login-button');
  mobileLoginButton?.addEventListener('click', () => {
    loginModal?.classList.remove('hidden');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu?.classList.add('hidden');
  });

  // Mobile signup button click handler
  const mobileSignupButton = document.querySelector('.mobile-signup-button');
  mobileSignupButton?.addEventListener('click', () => {
    signupModal?.classList.remove('hidden');
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

  // Profile settings dropdown functionality
  const profileSettingsBtn = document.getElementById('profileSettingsBtn');
  const profileDropdown = document.getElementById('profile-dropdown');
  const accountSettingsBtn = document.getElementById('account-settings-btn');
  const profileLogoutBtn = document.getElementById('profile-logout-btn');
  const profileSettingsModal = document.getElementById('profileSettingsModal');
  const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
  
  // Function to close the modal
  const closeModal = () => {
    if (profileSettingsModal) {
      profileSettingsModal.classList.add('hidden');
      // Reset form and messages
      const passwordChangeForm = document.getElementById('passwordChangeForm') as HTMLFormElement;
      const passwordError = document.getElementById('passwordError');
      const passwordSuccess = document.getElementById('passwordSuccess');
      const submitBtn = passwordChangeForm?.querySelector('button[type="submit"]') as HTMLButtonElement;
      
      if (passwordChangeForm) {
        passwordChangeForm.reset();
      }
      if (passwordError) {
        passwordError.classList.add('hidden');
        passwordError.textContent = '';
      }
      if (passwordSuccess) {
        passwordSuccess.classList.add('hidden');
        passwordSuccess.textContent = '';
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Change Password';
      }
    }
  };

  profileSettingsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown?.classList.toggle('hidden');
  });

  // Close profile dropdown when clicking outside
  document.addEventListener('click', () => {
    profileDropdown?.classList.add('hidden');
  });

  // Account settings button click handler
  accountSettingsBtn?.addEventListener('click', async () => {
    if (profileSettingsModal) {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get user's role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        const modalUserRole = document.getElementById('modalUserRole');
        const modalUserId = document.getElementById('modalUserId');
        
        if (modalUserRole) {
          if (roleData) {
            // Capitalize first letter of role
            const role = roleData.role.charAt(0).toUpperCase() + roleData.role.slice(1);
            modalUserRole.textContent = role;
          } else {
            modalUserRole.textContent = 'User';
          }
        }

        // Set user ID
        if (modalUserId) {
          modalUserId.textContent = user.id;
        }
      }
      
      profileSettingsModal.classList.remove('hidden');
      profileDropdown?.classList.add('hidden');
    }
  });

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

  // Profile logout button click handler
  profileLogoutBtn?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  });

  // Handle password change form
  const passwordChangeForm = document.getElementById('passwordChangeForm') as HTMLFormElement;
  if (passwordChangeForm) {
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
        passwordError.textContent = '';
      }
      if (passwordSuccess) {
        passwordSuccess.classList.add('hidden');
        passwordSuccess.textContent = '';
      }

      // Validate current password is provided
      if (!currentPassword) {
        if (passwordError) {
          passwordError.textContent = 'Current password is required';
          passwordError.classList.remove('hidden');
        }
        return;
      }

      // Validate new password is provided
      if (!newPassword) {
        if (passwordError) {
          passwordError.textContent = 'New password is required';
          passwordError.classList.remove('hidden');
        }
        return;
      }

      // Validate new password length
      if (newPassword.length < 6) {
        if (passwordError) {
          passwordError.textContent = 'New password must be at least 6 characters long';
          passwordError.classList.remove('hidden');
        }
        return;
      }

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        if (passwordError) {
          passwordError.textContent = 'New passwords do not match';
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

        if (passwordSuccess) {
          passwordSuccess.textContent = 'Password updated successfully';
          passwordSuccess.classList.remove('hidden');
        }
        if (passwordError) {
          passwordError.classList.add('hidden');
        }
        passwordChangeForm.reset();

        // Hide success message after 3 seconds
        setTimeout(() => {
          if (passwordSuccess) {
            passwordSuccess.classList.add('hidden');
            passwordSuccess.textContent = '';
          }
        }, 3000);
      } catch (err: any) {
        if (passwordError) {
          passwordError.textContent = err.message || 'Failed to update password';
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

  // Check initial auth state and update menu
  supabase.auth.getSession().then(({ data: { session } }) => {
    updateAuthMenu(!!session);
  });

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((_event, session) => {
    updateAuthMenu(!!session);
  });
}
