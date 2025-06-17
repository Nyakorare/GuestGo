import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://srfcewglmzczveopbwsk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyZmNld2dsbXpjenZlb3Bid3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDI5ODEsImV4cCI6MjA2NTU3ODk4MX0.H6b6wbYOVytt2VOirSmJnjMkm-ba3H-i0LkCszxqYLY'
);

interface Place {
  id: string;
  name: string;
  description: string;
  location: string;
  is_available: boolean;
}

export function DashboardPage() {
  // Initialize the page
  setTimeout(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      window.location.href = '/';
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData) {
      const roleElement = document.getElementById('userRole');
      if (roleElement) {
        // Capitalize first letter of role
        const role = roleData.role.charAt(0).toUpperCase() + roleData.role.slice(1);
        roleElement.textContent = role;

        // Show/hide admin tabs based on role
        const adminTabs = document.getElementById('adminTabs');
        if (adminTabs) {
          if (roleData.role === 'admin') {
            adminTabs.classList.remove('hidden');
            // Load places if admin
            loadPlaces();
          } else {
            adminTabs.classList.add('hidden');
            // Hide places content for non-admin users
            const placesContent = document.getElementById('placesContent');
            if (placesContent) {
              placesContent.classList.add('hidden');
            }
          }
        }
      }
    }

    // Setup tab switching
    const placesTab = document.getElementById('placesTab');
    const accountsTab = document.getElementById('accountsTab');
    const placesContent = document.getElementById('placesContent');
    const accountsContent = document.getElementById('accountsContent');

    placesTab?.addEventListener('click', () => {
      placesTab.classList.add('bg-blue-600', 'text-white');
      placesTab.classList.remove('bg-gray-100', 'text-gray-700');
      accountsTab?.classList.remove('bg-blue-600', 'text-white');
      accountsTab?.classList.add('bg-gray-100', 'text-gray-700');
      placesContent?.classList.remove('hidden');
      accountsContent?.classList.add('hidden');
    });

    accountsTab?.addEventListener('click', () => {
      accountsTab.classList.add('bg-blue-600', 'text-white');
      accountsTab.classList.remove('bg-gray-100', 'text-gray-700');
      placesTab?.classList.remove('bg-blue-600', 'text-white');
      placesTab?.classList.add('bg-gray-100', 'text-gray-700');
      accountsContent?.classList.remove('hidden');
      placesContent?.classList.add('hidden');
    });

    // Show profile settings button when logged in
    const profileSettingsBtn = document.getElementById('profileSettingsBtn');
    if (profileSettingsBtn) {
      profileSettingsBtn.classList.remove('hidden');
    }
  }, 0);

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-4">
          <img src="/guestgo-logo.png" alt="GuestGo Logo" class="h-16 w-16" />
          <div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
              Dashboard
            </h1>
            <p class="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-200">
              Your current role: <span id="userRole" class="font-semibold text-blue-600 dark:text-blue-500">Loading...</span>
            </p>
          </div>
        </div>

        <!-- Admin Tabs -->
        <div id="adminTabs" class="hidden">
          <div class="flex space-x-2">
            <button 
              id="placesTab"
              class="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Places
            </button>
            <button 
              id="accountsTab"
              class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Accounts
            </button>
          </div>
        </div>
      </div>

      <!-- Admin Content -->
      <div id="placesContent" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Places Management</h2>
          <button 
            id="addPlaceBtn"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add New Place
          </button>
        </div>
        <div id="placesList" class="space-y-4">
          <!-- Places will be loaded here -->
        </div>
      </div>

      <div id="accountsContent" class="hidden bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Accounts Management</h2>
        <p class="text-gray-600 dark:text-gray-300">Manage user accounts here.</p>
      </div>

      <!-- Edit Place Modal -->
      <div id="editPlaceModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div class="mt-3">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Edit Place</h3>
              <button 
                id="closeEditModalBtn"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form id="editPlaceForm" class="space-y-4">
              <input type="hidden" id="editPlaceId">
              <div>
                <label for="editPlaceName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input 
                  type="text" 
                  id="editPlaceName" 
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
              </div>
              <div>
                <label for="editPlaceDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea 
                  id="editPlaceDescription" 
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                ></textarea>
              </div>
              <div>
                <label for="editPlaceLocation" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                <input 
                  type="text" 
                  id="editPlaceLocation" 
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
              </div>
              <div class="flex justify-end">
                <button 
                  type="submit"
                  class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Profile Settings Modal -->
      <div id="profileSettingsModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div class="mt-3">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Profile Settings</h3>
              <button 
                id="closeProfileModalBtn"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Your Role</h4>
                <p id="modalUserRole" class="mt-1 text-lg font-semibold text-blue-600 dark:text-blue-500">Loading...</p>
              </div>
              <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                <form id="passwordChangeForm" class="space-y-4">
                  <div>
                    <label for="currentPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                    <input 
                      type="password" 
                      id="currentPassword" 
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                  </div>
                  <div>
                    <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                    <input 
                      type="password" 
                      id="newPassword" 
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      minlength="6"
                    >
                  </div>
                  <div>
                    <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                    <input 
                      type="password" 
                      id="confirmPassword" 
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      minlength="6"
                    >
                  </div>
                  <div id="passwordError" class="hidden text-red-600 text-sm"></div>
                  <div id="passwordSuccess" class="hidden text-green-600 text-sm"></div>
                  <div class="flex justify-end">
                    <button 
                      type="submit"
                      id="changePasswordBtn"
                      class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Function to load places from the database
async function loadPlaces() {
  const { data: places, error } = await supabase
    .from('places_to_visit')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error loading places:', error);
    return;
  }

  const placesList = document.getElementById('placesList');
  if (placesList) {
    placesList.innerHTML = places.map((place: Place) => `
      <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="flex-1">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">${place.name}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">${place.description || 'No description'}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Location: ${place.location}</p>
        </div>
        <div class="flex items-center space-x-4">
          <label class="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              class="sr-only peer" 
              ${place.is_available ? 'checked' : ''}
              onchange="togglePlaceAvailability('${place.id}', this.checked)"
            >
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Available</span>
          </label>
          <button 
            onclick="editPlace('${place.id}')"
            class="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  }
}

// Function to toggle place availability
async function togglePlaceAvailability(placeId: string, isAvailable: boolean) {
  const { error } = await supabase
    .from('places_to_visit')
    .update({ is_available: isAvailable })
    .eq('id', placeId);

  if (error) {
    console.error('Error updating place availability:', error);
    // Revert the toggle if there was an error
    const checkbox = document.querySelector(`input[onchange*="${placeId}"]`) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = !isAvailable;
    }
  }
}

// Function to edit place
async function editPlace(placeId: string) {
  const { data: place, error } = await supabase
    .from('places_to_visit')
    .select('*')
    .eq('id', placeId)
    .single();

  if (error) {
    console.error('Error loading place:', error);
    return;
  }

  const modal = document.getElementById('editPlaceModal');
  const form = document.getElementById('editPlaceForm') as HTMLFormElement;
  const idInput = document.getElementById('editPlaceId') as HTMLInputElement;
  const nameInput = document.getElementById('editPlaceName') as HTMLInputElement;
  const descriptionInput = document.getElementById('editPlaceDescription') as HTMLTextAreaElement;
  const locationInput = document.getElementById('editPlaceLocation') as HTMLInputElement;

  if (modal && form && idInput && nameInput && descriptionInput && locationInput) {
    idInput.value = place.id;
    nameInput.value = place.name;
    descriptionInput.value = place.description || '';
    locationInput.value = place.location;

    modal.classList.remove('hidden');

    // Handle form submission
    form.onsubmit = async (e) => {
      e.preventDefault();
      
      const { error } = await supabase
        .from('places_to_visit')
        .update({
          name: nameInput.value,
          description: descriptionInput.value,
          location: locationInput.value
        })
        .eq('id', placeId);

      if (error) {
        console.error('Error updating place:', error);
        return;
      }

      modal.classList.add('hidden');
      loadPlaces(); // Reload the places list
    };
  }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Profile settings button
  const profileSettingsBtn = document.getElementById('profileSettingsBtn');
  const profileSettingsModal = document.getElementById('profileSettingsModal');
  const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
  const modalUserRole = document.getElementById('modalUserRole');
  const passwordChangeForm = document.getElementById('passwordChangeForm') as HTMLFormElement;
  const passwordError = document.getElementById('passwordError');
  const passwordSuccess = document.getElementById('passwordSuccess');

  // Function to close the modal
  const closeModal = () => {
    if (profileSettingsModal) {
      profileSettingsModal.classList.add('hidden');
      // Reset form and messages
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
    }
  };

  if (profileSettingsBtn && profileSettingsModal && closeProfileModalBtn && modalUserRole) {
    // Show modal when clicking the gear icon
    profileSettingsBtn.addEventListener('click', async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get user's role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleData) {
          // Capitalize first letter of role
          const role = roleData.role.charAt(0).toUpperCase() + roleData.role.slice(1);
          modalUserRole.textContent = role;
        } else {
          modalUserRole.textContent = 'User';
        }
      }
      
      profileSettingsModal.classList.remove('hidden');
    });

    // Close modal when clicking the close button
    closeProfileModalBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    profileSettingsModal.addEventListener('click', (e) => {
      if (e.target === profileSettingsModal) {
        closeModal();
      }
    });

    // Close modal when pressing Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !profileSettingsModal.classList.contains('hidden')) {
        closeModal();
      }
    });

    // Handle password change
    if (passwordChangeForm) {
      passwordChangeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = (document.getElementById('currentPassword') as HTMLInputElement).value;
        const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;
        const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement).value;

        // Reset messages
        if (passwordError) {
          passwordError.classList.add('hidden');
          passwordError.textContent = '';
        }
        if (passwordSuccess) {
          passwordSuccess.classList.add('hidden');
          passwordSuccess.textContent = '';
        }

        // Validate passwords match
        if (newPassword !== confirmPassword) {
          if (passwordError) {
            passwordError.textContent = 'New passwords do not match';
            passwordError.classList.remove('hidden');
          }
          return;
        }

        try {
          // Update password
          const { error } = await supabase.auth.updateUser({
            password: newPassword
          });

          if (error) throw error;

          // Show success message
          if (passwordSuccess) {
            passwordSuccess.textContent = 'Password updated successfully';
            passwordSuccess.classList.remove('hidden');
          }

          // Reset form
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
            passwordError.textContent = err.message;
            passwordError.classList.remove('hidden');
          }
        }
      });
    }
  }

  // Close edit modal button
  const closeEditModalBtn = document.getElementById('closeEditModalBtn');
  if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener('click', () => {
      const modal = document.getElementById('editPlaceModal');
      if (modal) {
        modal.classList.add('hidden');
      }
    });
  }

  // Add place button
  const addPlaceBtn = document.getElementById('addPlaceBtn');
  if (addPlaceBtn) {
    addPlaceBtn.addEventListener('click', () => {
      const modal = document.getElementById('editPlaceModal');
      const form = document.getElementById('editPlaceForm') as HTMLFormElement;
      const idInput = document.getElementById('editPlaceId') as HTMLInputElement;
      const nameInput = document.getElementById('editPlaceName') as HTMLInputElement;
      const descriptionInput = document.getElementById('editPlaceDescription') as HTMLTextAreaElement;
      const locationInput = document.getElementById('editPlaceLocation') as HTMLInputElement;

      if (modal && form && idInput && nameInput && descriptionInput && locationInput) {
        // Clear form
        idInput.value = '';
        nameInput.value = '';
        descriptionInput.value = '';
        locationInput.value = '';

        modal.classList.remove('hidden');

        // Handle form submission
        form.onsubmit = async (e) => {
          e.preventDefault();
          
          const { error } = await supabase
            .from('places_to_visit')
            .insert({
              name: nameInput.value,
              description: descriptionInput.value,
              location: locationInput.value,
              is_available: true
            });

          if (error) {
            console.error('Error adding place:', error);
            return;
          }

          modal.classList.add('hidden');
          loadPlaces(); // Reload the places list
        };
      }
    });
  }
}); 