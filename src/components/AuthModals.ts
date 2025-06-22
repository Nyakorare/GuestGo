import supabase from '../config/supabase';

export function createLoginModal() {
  return `
    <div id="login-modal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center hidden z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Login</h2>
          <button class="text-gray-400 hover:text-gray-500 close-modal">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div id="login-error" class="hidden mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"></div>
        <form id="login-form" class="space-y-6">
          <div>
            <label for="login-email" class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="login-email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>
          <div>
            <label for="login-password" class="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" id="login-password" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>
          <div>
            <button type="submit" class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function createSignupModal() {
  return `
    <div id="signup-modal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center hidden z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Sign Up</h2>
          <button class="text-gray-400 hover:text-gray-500 close-modal">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div id="signup-error" class="hidden mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"></div>
        <div id="signup-success" class="hidden mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded"></div>
        <form id="signup-form" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="signup-firstname" class="block text-sm font-medium text-gray-700">First Name</label>
              <input type="text" id="signup-firstname" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            </div>
            <div>
              <label for="signup-lastname" class="block text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" id="signup-lastname" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            </div>
          </div>
          <div>
            <label for="signup-email" class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="signup-email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>
          <div>
            <label for="signup-password" class="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" id="signup-password" required minlength="6" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>
          <div>
            <button type="submit" class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
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

          // Redirect to dashboard
          window.location.href = '/dashboard';
        }
      } catch (err: any) {
        if (errorDiv) {
          errorDiv.textContent = err.message;
          errorDiv.classList.remove('hidden');
        }
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
      }
    });
  }

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
            emailRedirectTo: `${window.location.origin}/auth/callback`,
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

          // Show success message
          if (successDiv) {
            successDiv.innerHTML = `
              <div class="flex items-center">
                <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <p>Account created successfully! Please check your email to verify your account.</p>
              </div>
            `;
            successDiv.classList.remove('hidden');
          }

          // Clear form
          signupForm.reset();

          // Hide modal after 3 seconds
          setTimeout(() => {
            const modal = document.getElementById('signup-modal');
            if (modal) {
              modal.classList.add('hidden');
            }
          }, 3000);
        }
      } catch (err: any) {
        if (errorDiv) {
          errorDiv.textContent = err.message;
          errorDiv.classList.remove('hidden');
        }
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = 'Create Account';
      }
    });
  }

  // Close modal buttons
  const closeButtons = document.querySelectorAll('.close-modal');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('[id$="-modal"]');
      if (modal) {
        modal.classList.add('hidden');
        // Clear any error/success messages when closing
        const errorDiv = modal.querySelector('[id$="-error"]');
        const successDiv = modal.querySelector('[id$="-success"]');
        if (errorDiv) errorDiv.classList.add('hidden');
        if (successDiv) successDiv.classList.add('hidden');
      }
    });
  });
}
