import { createClient } from '@supabase/supabase-js';
import { logAction, getLogs } from '../../utils/logging';

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

interface Account {
  user_id: string;
  role: string;
  created_at: string;
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

        const adminTabs = document.getElementById('adminTabs');
        const logsTab = document.getElementById('logsTab');
        const placesTab = document.getElementById('placesTab');
        const accountsTab = document.getElementById('accountsTab');
        const placesContent = document.getElementById('placesContent');
        const accountsContent = document.getElementById('accountsContent');
        const logsContent = document.getElementById('logsContent');

        if (roleData.role === 'log') {
          // Only show logs tab and content
          if (adminTabs) adminTabs.classList.remove('hidden');
          if (logsTab) logsTab.classList.remove('hidden');
          if (placesTab) placesTab.classList.add('hidden');
          if (accountsTab) accountsTab.classList.add('hidden');
          if (placesContent) placesContent.classList.add('hidden');
          if (accountsContent) accountsContent.classList.add('hidden');
          if (logsContent) logsContent.classList.remove('hidden');
          // Load logs immediately
          loadLogs();
        } else if (roleData.role === 'admin') {
          // Admin: show admin tabs, hide logs
          if (adminTabs) adminTabs.classList.remove('hidden');
          if (logsTab) logsTab.classList.add('hidden');
          if (placesTab) placesTab.classList.remove('hidden');
          if (accountsTab) accountsTab.classList.remove('hidden');
          if (placesContent) placesContent.classList.remove('hidden');
          if (accountsContent) accountsContent.classList.add('hidden');
          if (logsContent) logsContent.classList.add('hidden');
          loadPlaces();
        } else {
          // Other roles: hide all admin/logs tabs
          if (adminTabs) adminTabs.classList.add('hidden');
          if (logsTab) logsTab.classList.add('hidden');
          if (placesTab) placesTab.classList.add('hidden');
          if (accountsTab) accountsTab.classList.add('hidden');
          if (placesContent) placesContent.classList.add('hidden');
          if (accountsContent) accountsContent.classList.add('hidden');
          if (logsContent) logsContent.classList.add('hidden');
        }
      }
    }

    // Setup tab switching
    const placesTab = document.getElementById('placesTab');
    const accountsTab = document.getElementById('accountsTab');
    const logsTab = document.getElementById('logsTab');
    const placesContent = document.getElementById('placesContent');
    const accountsContent = document.getElementById('accountsContent');
    const logsContent = document.getElementById('logsContent');

    placesTab?.addEventListener('click', () => {
      placesTab.classList.add('bg-blue-600', 'text-white');
      placesTab.classList.remove('bg-gray-100', 'text-gray-700');
      accountsTab?.classList.remove('bg-blue-600', 'text-white');
      accountsTab?.classList.add('bg-gray-100', 'text-gray-700');
      logsTab?.classList.remove('bg-blue-600', 'text-white');
      logsTab?.classList.add('bg-gray-100', 'text-gray-700');
      placesContent?.classList.remove('hidden');
      accountsContent?.classList.add('hidden');
      logsContent?.classList.add('hidden');
    });

    accountsTab?.addEventListener('click', () => {
      accountsTab.classList.add('bg-blue-600', 'text-white');
      accountsTab.classList.remove('bg-gray-100', 'text-gray-700');
      placesTab?.classList.remove('bg-blue-600', 'text-white');
      placesTab?.classList.add('bg-gray-100', 'text-gray-700');
      logsTab?.classList.remove('bg-blue-600', 'text-white');
      logsTab?.classList.add('bg-gray-100', 'text-gray-700');
      accountsContent?.classList.remove('hidden');
      placesContent?.classList.add('hidden');
      logsContent?.classList.add('hidden');
      
      // Load accounts when switching to accounts tab
      loadAccounts();
    });

    logsTab?.addEventListener('click', () => {
      logsTab.classList.add('bg-blue-600', 'text-white');
      logsTab.classList.remove('bg-gray-100', 'text-gray-700');
      placesTab?.classList.remove('bg-blue-600', 'text-white');
      placesTab?.classList.add('bg-gray-100', 'text-gray-700');
      accountsTab?.classList.remove('bg-blue-600', 'text-white');
      accountsTab?.classList.add('bg-gray-100', 'text-gray-700');
      logsContent?.classList.remove('hidden');
      placesContent?.classList.add('hidden');
      accountsContent?.classList.add('hidden');
      
      // Load logs when switching to logs tab
      loadLogs();
    });

    // Show profile settings button when logged in
    const profileSettingsBtn = document.getElementById('profileSettingsBtn');
    if (profileSettingsBtn) {
      profileSettingsBtn.classList.remove('hidden');
    }

    // Setup modal event listeners
    setupModalEventListeners();
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
            <button 
              id="logsTab"
              class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Logs
            </button>
          </div>
        </div>
      </div>

      <!-- Admin Content -->
      <div id="placesContent" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Places Management</h2>
          <div class="flex items-center space-x-4">
            <!-- Search and Filter Section -->
            <div class="flex items-center space-x-3">
              <!-- Search Input -->
              <div class="relative">
                <input 
                  type="text" 
                  id="placesSearchInput"
                  placeholder="Search places..."
                  class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
              
              <!-- Availability Filter -->
              <select 
                id="availabilityFilter"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Places</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>
            </div>
            
            <button 
              id="addPlaceBtn"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add New Place
            </button>
          </div>
        </div>
        <div id="placesList" class="space-y-4">
          <!-- Places will be loaded here -->
        </div>
      </div>

      <div id="accountsContent" class="hidden bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Accounts Management</h2>
          <div class="flex items-center space-x-4">
            <!-- Search and Filter Section -->
            <div class="flex items-center space-x-3">
              <!-- Search Input -->
              <div class="relative">
                <input 
                  type="text" 
                  id="accountsSearchInput"
                  placeholder="Search accounts..."
                  class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
              
              <!-- Role Filter -->
              <select 
                id="roleFilter"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Roles</option>
                <option value="log">Log</option>
                <option value="personnel">Personnel</option>
                <option value="visitor">Visitor</option>
                <option value="guest">Guest</option>
              </select>
            </div>
          </div>
        </div>
        <div id="accountsList">
          <!-- Accounts will be loaded here -->
        </div>
      </div>

      <div id="logsContent" class="hidden bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">System Logs</h2>
          <button 
            id="refreshLogsBtn"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Refresh Logs
          </button>
        </div>
        <div id="logsList" class="space-y-4">
          <!-- Logs will be loaded here -->
        </div>
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
              <div>
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">User ID</h4>
                <p id="modalUserId" class="mt-1 text-sm font-mono text-gray-600 dark:text-gray-400">Loading...</p>
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
let allPlaces: Place[] = [];
let filteredPlaces: Place[] = [];

// Function to load accounts from the database
let allAccounts: Account[] = [];
let filteredAccounts: Account[] = [];

async function loadPlaces() {
  const { data: places, error } = await supabase
    .from('places_to_visit')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error loading places:', error);
    return;
  }

  allPlaces = places || [];
  filteredPlaces = [...allPlaces];
  renderPlaces();
}

// Function to render places based on current filters
function renderPlaces() {
  const placesList = document.getElementById('placesList');
  if (placesList) {
    if (filteredPlaces.length === 0) {
      placesList.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400">No places found matching your criteria.</p>
        </div>
      `;
      return;
    }

    placesList.innerHTML = filteredPlaces.map((place: Place) => `
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
              data-place-id="${place.id}"
              onchange="window.togglePlaceAvailability('${place.id}', this.checked)"
            >
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Available</span>
          </label>
          <button 
            onclick="window.editPlace('${place.id}')"
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

// Function to apply search and filter
function applySearchAndFilter() {
  const searchInput = document.getElementById('placesSearchInput') as HTMLInputElement;
  const availabilityFilter = document.getElementById('availabilityFilter') as HTMLSelectElement;
  
  const searchTerm = searchInput?.value.toLowerCase() || '';
  const availabilityValue = availabilityFilter?.value || 'all';

  // Start with all places
  let filtered = [...allPlaces];

  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter(place => 
      place.name.toLowerCase().includes(searchTerm) ||
      place.description?.toLowerCase().includes(searchTerm) ||
      place.location.toLowerCase().includes(searchTerm)
    );
  }

  // Apply availability filter
  if (availabilityValue === 'available') {
    filtered = filtered.filter(place => place.is_available);
  } else if (availabilityValue === 'unavailable') {
    filtered = filtered.filter(place => !place.is_available);
  }

  filteredPlaces = filtered;
  renderPlaces();
}

// Function to load accounts from the database
async function loadAccounts() {
  const { data: accounts, error } = await supabase
    .from('user_roles')
    .select('user_id, role, created_at')
    .neq('role', 'admin')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading accounts:', error);
    return;
  }

  allAccounts = accounts || [];
  filteredAccounts = [...allAccounts];
  renderAccounts();
}

// Function to render accounts based on current filters
function renderAccounts() {
  const accountsList = document.getElementById('accountsList');
  if (accountsList) {
    if (filteredAccounts.length === 0) {
      accountsList.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400">No accounts found matching your criteria.</p>
        </div>
      `;
      return;
    }

    accountsList.innerHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            ${filteredAccounts.map((account: Account) => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                  ${account.user_id.substring(0, 8)}...
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    account.role === 'log' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    account.role === 'personnel' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    account.role === 'visitor' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }">
                    ${account.role.charAt(0).toUpperCase() + account.role.slice(1)}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  ${new Date(account.created_at).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <select 
                    onchange="window.changeUserRole('${account.user_id}', this.value)"
                    class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    style="min-width: 120px;"
                  >
                    <option value="log" ${account.role === 'log' ? 'selected' : ''}>Log</option>
                    <option value="personnel" ${account.role === 'personnel' ? 'selected' : ''}>Personnel</option>
                    <option value="visitor" ${account.role === 'visitor' ? 'selected' : ''}>Visitor</option>
                    <option value="guest" ${account.role === 'guest' ? 'selected' : ''}>Guest</option>
                  </select>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

// Function to apply search and filter for accounts
function applySearchAndFilterForAccounts() {
  const searchInput = document.getElementById('accountsSearchInput') as HTMLInputElement;
  const roleFilter = document.getElementById('roleFilter') as HTMLSelectElement;
  
  const searchTerm = searchInput?.value.toLowerCase() || '';
  const roleValue = roleFilter?.value || 'all';

  // Start with all accounts
  let filtered = [...allAccounts];

  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter(account => 
      account.user_id.toLowerCase().includes(searchTerm) ||
      account.role.toLowerCase().includes(searchTerm) ||
      new Date(account.created_at).toLocaleDateString().includes(searchTerm)
    );
  }

  // Apply role filter
  if (roleValue !== 'all') {
    filtered = filtered.filter(account => account.role === roleValue);
  }

  filteredAccounts = filtered;
  renderAccounts();
}

// Function to load logs from the database
async function loadLogs() {
  const logs = await getLogs();

  const logsList = document.getElementById('logsList');
  if (logsList) {
    if (logs.length === 0) {
      logsList.innerHTML = `
        <p class="text-gray-600 dark:text-gray-300">No logs found.</p>
      `;
      return;
    }

    logsList.innerHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            ${logs.map((log: any) => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  ${new Date(log.created_at).toLocaleString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  ${log.user_id ? log.user_id.substring(0, 8) + '...' : 'Unknown User'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    log.action === 'password_change' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    log.action === 'place_update' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    log.action === 'place_availability_toggle' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    log.action === 'place_create' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }">
                    ${log.action.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  ${formatLogDetails(log.details, log.action)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

// Function to format log details for display
function formatLogDetails(details: any, action?: string): string {
  if (!details) return 'No details';

  try {
    if (typeof details === 'string') {
      return details;
    }

    // Pretty formatting for known log actions
    if (details.place_id && details.hasOwnProperty('is_available')) {
      // place_availability_toggle
      return `Place ID: <span class="font-mono">${String(details.place_id).substring(0, 8)}...</span><br>Availability: <span class="font-semibold">${details.is_available ? 'Available' : 'Unavailable'}</span>`;
    }
    if (details.place_id && details.old_name !== undefined && details.new_name !== undefined) {
      // place_update
      return `Place ID: <span class="font-mono">${String(details.place_id).substring(0, 8)}...</span><br>
        <span class="block">Name: <span class="line-through text-red-500">${details.old_name}</span> → <span class="text-green-600">${details.new_name}</span></span>
        <span class="block">Description: <span class="line-through text-red-500">${details.old_description || 'None'}</span> → <span class="text-green-600">${details.new_description || 'None'}</span></span>
        <span class="block">Location: <span class="line-through text-red-500">${details.old_location}</span> → <span class="text-green-600">${details.new_location}</span></span>`;
    }
    if (details.place_name && details.place_location) {
      // place_create
      return `New Place: <span class="font-semibold">${details.place_name}</span><br>Description: ${details.place_description || 'None'}<br>Location: ${details.place_location}`;
    }
    if (details.timestamp) {
      // password_change
      return `Password changed at <span class="font-mono">${new Date(details.timestamp).toLocaleString()}</span>`;
    }

    // Fallback: generic pretty print
    return Object.entries(details)
      .map(([key, value]) => `<span class="block"><span class="font-semibold">${key}:</span> ${typeof value === 'string' && value.length > 32 ? value.substring(0, 32) + '...' : value}</span>`)
      .join('');
  } catch (error) {
    return 'Error formatting details';
  }
}

// Function to change user role
async function changeUserRole(userId: string, newRole: string) {
  // Show confirmation popup
  const confirmed = confirm(`Are you sure you want to change this user's role to ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}?`);
  
  if (!confirmed) {
    // If user cancels, reload accounts to reset the dropdown to current value
    loadAccounts();
    return;
  }

  const { error } = await supabase
    .from('user_roles')
    .update({ role: newRole })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating user role:', error);
    showNotification('Error updating user role. Please try again.', 'error');
    return;
  }

  showNotification(`User role changed to ${newRole.charAt(0).toUpperCase() + newRole.slice(1)} successfully!`, 'success');
  loadAccounts(); // Reload the accounts list
}

// Function to toggle place availability
async function togglePlaceAvailability(placeId: string, isAvailable: boolean) {
  // Find the checkbox that was clicked
  const checkbox = document.querySelector(`input[data-place-id="${placeId}"]`) as HTMLInputElement;
  if (!checkbox) return;

  // Show loading state
  checkbox.disabled = true;
  
  const { error } = await supabase
    .from('places_to_visit')
    .update({ is_available: isAvailable })
    .eq('id', placeId);

  if (error) {
    console.error('Error updating place availability:', error);
    // Revert the toggle if there was an error
    checkbox.checked = !isAvailable;
    // Show error message
    showNotification('Error updating availability. Please try again.', 'error');
  } else {
    // Log the action
    await logAction('place_availability_toggle', {
      place_id: placeId,
      is_available: isAvailable
    });
    
    // Show success message
    showNotification(`Place ${isAvailable ? 'made available' : 'made unavailable'} successfully!`, 'success');
  }

  // Re-enable the checkbox
  checkbox.disabled = false;
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
    showNotification('Error loading place details.', 'error');
    return;
  }

  const modal = document.getElementById('editPlaceModal');
  const form = document.getElementById('editPlaceForm') as HTMLFormElement;
  const idInput = document.getElementById('editPlaceId') as HTMLInputElement;
  const nameInput = document.getElementById('editPlaceName') as HTMLInputElement;
  const descriptionInput = document.getElementById('editPlaceDescription') as HTMLTextAreaElement;
  const locationInput = document.getElementById('editPlaceLocation') as HTMLInputElement;
  const submitBtn = form?.querySelector('button[type="submit"]') as HTMLButtonElement;
  const modalTitle = modal?.querySelector('h3') as HTMLHeadingElement;

  if (modal && form && idInput && nameInput && descriptionInput && locationInput) {
    idInput.value = place.id;
    nameInput.value = place.name;
    descriptionInput.value = place.description || '';
    locationInput.value = place.location;

    // Update modal title and button text for edit mode
    if (modalTitle) {
      modalTitle.textContent = 'Edit Place';
    }
    if (submitBtn) {
      submitBtn.textContent = 'Save Changes';
    }

    modal.classList.remove('hidden');

    // Handle form submission for editing place
    const handleSubmit = async (e: Event) => {
      e.preventDefault();
      
      // Show loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
      }
      
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
        showNotification('Error updating place. Please try again.', 'error');
        // Reset button state
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Save Changes';
        }
        return;
      }

      // Log the action
      await logAction('place_update', {
        place_id: placeId,
        old_name: place.name,
        new_name: nameInput.value,
        old_description: place.description,
        new_description: descriptionInput.value,
        old_location: place.location,
        new_location: locationInput.value
      });

      showNotification('Place updated successfully!', 'success');
      modal.classList.add('hidden');
      loadPlaces(); // Reload the places list
      
      // Reset button state
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
      }

      // Remove the event listener to prevent conflicts
      form.removeEventListener('submit', handleSubmit);
    };

    // Remove any existing submit handlers and add the new one
    form.removeEventListener('submit', handleSubmit);
    form.addEventListener('submit', handleSubmit);
  }
}

// Function to show notifications
function showNotification(message: string, type: 'success' | 'error') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());

  const notification = document.createElement('div');
  notification.className = `notification fixed top-4 right-4 z-50 px-6 py-3 rounded-md shadow-lg transition-all duration-300 ${
    type === 'success' 
      ? 'bg-green-500 text-white' 
      : 'bg-red-500 text-white'
  }`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  // This is now handled in setupModalEventListeners() which is called after the page loads
});

// Make functions globally available
(window as any).togglePlaceAvailability = togglePlaceAvailability;
(window as any).editPlace = editPlace;
(window as any).changeUserRole = changeUserRole;

// Setup modal event listeners
function setupModalEventListeners() {
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

        // Set user ID
        const modalUserId = document.getElementById('modalUserId');
        if (modalUserId) {
          modalUserId.textContent = user.id;
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

          // Log the password change
          await logAction('password_change', {
            timestamp: new Date().toISOString()
          });

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
      const form = document.getElementById('editPlaceForm') as HTMLFormElement;
      const modalTitle = modal?.querySelector('h3') as HTMLHeadingElement;
      const submitBtn = form?.querySelector('button[type="submit"]') as HTMLButtonElement;
      
      if (modal) {
        modal.classList.add('hidden');
        
        // Reset modal title and button text
        if (modalTitle) {
          modalTitle.textContent = 'Edit Place';
        }
        if (submitBtn) {
          submitBtn.textContent = 'Save Changes';
          submitBtn.disabled = false;
        }
        
        // Reset form
        if (form) {
          form.reset();
        }
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
      const submitBtn = form?.querySelector('button[type="submit"]') as HTMLButtonElement;
      const modalTitle = modal?.querySelector('h3') as HTMLHeadingElement;

      if (modal && form && idInput && nameInput && descriptionInput && locationInput) {
        // Clear form
        idInput.value = '';
        nameInput.value = '';
        descriptionInput.value = '';
        locationInput.value = '';

        // Update modal title and button text for add mode
        if (modalTitle) {
          modalTitle.textContent = 'Add New Place';
        }
        if (submitBtn) {
          submitBtn.textContent = 'Add Place';
        }

        modal.classList.remove('hidden');

        // Handle form submission for adding new place
        const handleSubmit = async (e: Event) => {
          e.preventDefault();
          
          // Show loading state
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Adding...';
          }
          
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
            showNotification('Error adding place. Please try again.', 'error');
            // Reset button state
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Add Place';
            }
            return;
          }

          // Log the action
          await logAction('place_create', {
            place_name: nameInput.value,
            place_description: descriptionInput.value,
            place_location: locationInput.value
          });

          showNotification('Place added successfully!', 'success');
          modal.classList.add('hidden');
          loadPlaces(); // Reload the places list
          
          // Reset button state
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Place';
          }

          // Remove the event listener to prevent conflicts
          form.removeEventListener('submit', handleSubmit);
        };

        // Remove any existing submit handlers and add the new one
        form.removeEventListener('submit', handleSubmit);
        form.addEventListener('submit', handleSubmit);
      }
    });
  }

  // Refresh logs button
  const refreshLogsBtn = document.getElementById('refreshLogsBtn');
  if (refreshLogsBtn) {
    refreshLogsBtn.addEventListener('click', () => {
      loadLogs();
      showNotification('Logs refreshed successfully!', 'success');
    });
  }

  // Search and filter event listeners
  const placesSearchInput = document.getElementById('placesSearchInput');
  const availabilityFilter = document.getElementById('availabilityFilter');

  // Search input event listener
  placesSearchInput?.addEventListener('input', () => {
    applySearchAndFilter();
  });

  // Availability filter event listener
  availabilityFilter?.addEventListener('change', () => {
    applySearchAndFilter();
  });

  // Accounts search and filter event listeners
  const accountsSearchInput = document.getElementById('accountsSearchInput');
  const roleFilter = document.getElementById('roleFilter');

  // Accounts search input event listener
  accountsSearchInput?.addEventListener('input', () => {
    applySearchAndFilterForAccounts();
  });

  // Role filter event listener
  roleFilter?.addEventListener('change', () => {
    applySearchAndFilterForAccounts();
  });
} 