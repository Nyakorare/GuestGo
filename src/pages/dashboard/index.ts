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
  assigned_personnel?: Personnel[];
}

interface Personnel {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  assigned_at: string;
  assigned_by: string;
}

interface Account {
  user_id: string;
  role: string;
  created_at: string;
  email?: string;
  first_name?: string;
  last_name?: string;
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
        } else if (roleData.role === 'personnel') {
          // Personnel: show personnel content, hide admin tabs
          if (adminTabs) adminTabs.classList.add('hidden');
          if (logsTab) logsTab.classList.add('hidden');
          if (placesTab) placesTab.classList.add('hidden');
          if (accountsTab) accountsTab.classList.add('hidden');
          if (placesContent) placesContent.classList.add('hidden');
          if (accountsContent) accountsContent.classList.add('hidden');
          if (logsContent) logsContent.classList.add('hidden');
          loadPersonnelDashboard();
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
          <div class="flex items-center space-x-4">
            <!-- Search and Filter Section -->
            <div class="flex items-center space-x-3">
              <!-- Search Input -->
              <div class="relative">
                <input 
                  type="text" 
                  id="logsSearchInput"
                  placeholder="Search logs..."
                  class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
              
              <!-- Action Filter -->
              <select 
                id="actionFilter"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Actions</option>
                <option value="password_change">Password Change</option>
                <option value="place_update">Place Update</option>
                <option value="place_availability_toggle">Place Availability Toggle</option>
                <option value="place_create">Place Create</option>
                <option value="personnel_assignment">Personnel Assignment</option>
                <option value="personnel_removal">Personnel Removal</option>
                <option value="personnel_availability_change">Personnel Availability Change</option>
              </select>
            </div>
            
            <button 
              id="refreshLogsBtn"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Refresh Logs
            </button>
          </div>
        </div>
        <div id="logsList" class="space-y-4">
          <!-- Logs will be loaded here -->
        </div>
      </div>

      <!-- Personnel Dashboard Content -->
      <div id="personnelContent" class="hidden bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">My Assignment</h2>
          <div class="flex items-center space-x-4">
            <button 
              id="refreshPersonnelBtn"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Refresh
            </button>
          </div>
        </div>
        <div id="personnelAssignmentInfo" class="space-y-4">
          <!-- Personnel assignment info will be loaded here -->
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

      <!-- Personnel Assignment Modal -->
      <div id="personnelAssignmentModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div class="mt-3">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Assign Personnel</h3>
              <button 
                id="closePersonnelModalBtn"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label for="personnelSelect" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Personnel</label>
                <select 
                  id="personnelSelect" 
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select personnel...</option>
                </select>
              </div>
              <div id="personnelAssignmentError" class="hidden text-red-600 text-sm"></div>
              <div id="personnelAssignmentSuccess" class="hidden text-green-600 text-sm"></div>
              <div class="flex justify-end">
                <button 
                  id="assignPersonnelBtn"
                  class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Assign Personnel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Personnel Availability Modal -->
      <div id="personnelAvailabilityModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div class="mt-3">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Update Availability</h3>
              <button 
                id="closeAvailabilityModalBtn"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form id="availabilityForm" class="space-y-4">
              <input type="hidden" id="availabilityPlaceId">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Availability Status</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input 
                      type="radio" 
                      name="availability" 
                      value="available" 
                      id="availableRadio"
                      class="mr-2"
                      checked
                    >
                    <span class="text-sm text-gray-700 dark:text-gray-300">Available</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      type="radio" 
                      name="availability" 
                      value="unavailable" 
                      id="unavailableRadio"
                      class="mr-2"
                    >
                    <span class="text-sm text-gray-700 dark:text-gray-300">Unavailable</span>
                  </label>
                </div>
              </div>
              <div id="reasonField" class="hidden">
                <label for="unavailabilityReason" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Unavailability</label>
                <textarea 
                  id="unavailabilityReason" 
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Please provide a reason for your unavailability..."
                  required
                ></textarea>
              </div>
              <div id="availabilityError" class="hidden text-red-600 text-sm"></div>
              <div id="availabilitySuccess" class="hidden text-green-600 text-sm"></div>
              <div class="flex justify-end">
                <button 
                  type="submit"
                  id="updateAvailabilityBtn"
                  class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Update Availability
                </button>
              </div>
            </form>
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

// Function to load logs from the database
let allLogs: any[] = [];
let filteredLogs: any[] = [];

async function loadPlaces() {
  // First, get all places
  const { data: places, error: placesError } = await supabase
    .from('places_to_visit')
    .select('*')
    .order('name');

  if (placesError) {
    console.error('Error loading places:', placesError);
    return;
  }

  // Get all personnel assignments (with error handling)
  let assignments: any[] = [];
  try {
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('place_personnel')
      .select('*');

    if (assignmentsError) {
      console.error('Error loading personnel assignments:', assignmentsError);
      // Continue without assignments - places will be marked as unavailable
    } else {
      assignments = assignmentsData || [];
    }
  } catch (error) {
    console.error('Error accessing place_personnel table:', error);
    // Continue without assignments
  }

  // Get all personnel users (with error handling)
  let personnelUsers: any[] = [];
  try {
    const { data: personnelData, error: personnelError } = await supabase
      .from('user_roles')
      .select('user_id, first_name, last_name')
      .eq('role', 'personnel');

    if (personnelError) {
      console.error('Error loading personnel users:', personnelError);
    } else {
      personnelUsers = personnelData || [];
    }
  } catch (error) {
    console.error('Error accessing user_roles table:', error);
  }

  // Create a map of personnel users for quick lookup
  const personnelMap = new Map();
  personnelUsers.forEach(user => {
    personnelMap.set(user.user_id, {
      email: 'personnel@example.com', // We'll get email from auth.users if needed
      first_name: user.first_name || '',
      last_name: user.last_name || ''
    });
  });

  // Create a map of places that have personnel assigned
  const availablePlaceIds = new Set(assignments.map(a => a.place_id));

  // Combine places with their personnel assignments
  const placesWithPersonnel = places?.map(place => {
    const placeAssignments = assignments.filter(assignment => assignment.place_id === place.id);
    const assignedPersonnel = placeAssignments.map(assignment => {
      const personnelInfo = personnelMap.get(assignment.personnel_id) || {
        email: 'Unknown',
        first_name: '',
        last_name: ''
      };
      
      return {
        id: assignment.id,
        user_id: assignment.personnel_id,
        email: personnelInfo.email,
        first_name: personnelInfo.first_name,
        last_name: personnelInfo.last_name,
        assigned_at: assignment.assigned_at,
        assigned_by: assignment.assigned_by
      };
    });

    return {
      ...place,
      is_available: availablePlaceIds.has(place.id),
      assigned_personnel: assignedPersonnel
    };
  }) || [];

  allPlaces = placesWithPersonnel;
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
          <div class="mt-2">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              place.is_available 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }">
              ${place.is_available ? 'Available' : 'Unavailable'}
            </span>
          </div>
          ${place.assigned_personnel && place.assigned_personnel.length > 0 ? `
            <div class="mt-2">
              <p class="text-sm text-gray-600 dark:text-gray-300 font-medium">Assigned Personnel:</p>
              <div class="mt-1 space-y-1">
                ${place.assigned_personnel.map(personnel => `
                  <div class="flex items-center justify-between bg-white dark:bg-gray-600 rounded px-2 py-1">
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      ${personnel.first_name || personnel.last_name ? 
                        `${personnel.first_name || ''} ${personnel.last_name || ''}` : 
                        `Personnel (${personnel.user_id.substring(0, 8)}...)`
                      }
                      <br><span class="text-xs text-gray-500 font-mono">${personnel.user_id.substring(0, 8)}...</span>
                    </span>
                    <button 
                      onclick="window.removePersonnelFromPlace('${place.id}', '${personnel.user_id}')"
                      class="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 text-sm"
                      title="Remove personnel"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : `
            <div class="mt-2">
              <p class="text-sm text-gray-500 dark:text-gray-400">No personnel assigned</p>
            </div>
          `}
        </div>
        <div class="flex items-center space-x-4">
          <button 
            onclick="window.assignPersonnelToPlace('${place.id}')"
            class="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
            title="Assign personnel"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
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
  try {
    const { data: accounts, error } = await supabase
      .from('user_roles')
      .select('user_id, role, created_at, first_name, last_name')
      .neq('role', 'admin')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading accounts:', error);
      return;
    }

    // Transform the data to include user information
    allAccounts = accounts?.map(account => ({
      user_id: account.user_id,
      role: account.role,
      created_at: account.created_at,
      email: 'user@example.com', // We'll get email from auth.users if needed
      first_name: account.first_name || '',
      last_name: account.last_name || ''
    })) || [];
    
    filteredAccounts = [...allAccounts];
    renderAccounts();
  } catch (error) {
    console.error('Error in loadAccounts:', error);
  }
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            ${filteredAccounts.map((account: Account) => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      ${account.first_name || account.last_name ? 
                        `${account.first_name || ''} ${account.last_name || ''}` : 
                        'Unknown User'
                      }
                    </div>
                    <div class="text-xs text-gray-400 dark:text-gray-500 font-mono">
                      ${account.user_id.substring(0, 8)}...
                    </div>
                  </div>
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
    filtered = filtered.filter(account => {
      const userId = account.user_id ? account.user_id.toLowerCase() : '';
      const role = account.role ? account.role.toLowerCase() : '';
      const email = account.email ? account.email.toLowerCase() : '';
      const firstName = account.first_name ? account.first_name.toLowerCase() : '';
      const lastName = account.last_name ? account.last_name.toLowerCase() : '';
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      const date = new Date(account.created_at).toLocaleDateString().toLowerCase();
      
      return userId.includes(searchTerm) || 
             role.includes(searchTerm) || 
             email.includes(searchTerm) ||
             firstName.includes(searchTerm) ||
             lastName.includes(searchTerm) ||
             fullName.includes(searchTerm) ||
             date.includes(searchTerm);
    });
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
  try {
    const logs = await getLogs();
    allLogs = logs || [];
    filteredLogs = [...allLogs];
    renderLogs();
  } catch (error) {
    console.error('Error loading logs:', error);
    const logsList = document.getElementById('logsList');
    if (logsList) {
      logsList.innerHTML = `
        <p class="text-red-600 dark:text-red-400">Error loading logs. Please try again.</p>
      `;
    }
    throw error; // Re-throw the error so it can be caught by the calling function
  }
}

// Function to render logs based on current filters
function renderLogs() {
  const logsList = document.getElementById('logsList');
  if (logsList) {
    if (filteredLogs.length === 0) {
      logsList.innerHTML = `
        <p class="text-gray-600 dark:text-gray-300">No logs found matching your criteria.</p>
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
            ${filteredLogs.map((log: any) => `
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
                    log.action === 'personnel_assignment' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    log.action === 'personnel_removal' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    log.action === 'personnel_availability_change' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
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
function formatLogDetails(details: any, action: string): string {
  if (!details) return 'No details available';
  
  try {
    const parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;
    
    switch (action) {
      case 'password_change':
        return `Password changed for user`;
      case 'place_update':
        const changes = [];
        if (parsedDetails.old_name !== parsedDetails.new_name) {
          changes.push(`Name: "${parsedDetails.old_name}" → "${parsedDetails.new_name}"`);
        }
        if (parsedDetails.old_description !== parsedDetails.new_description) {
          changes.push(`Description: "${parsedDetails.old_description || 'None'}" → "${parsedDetails.new_description || 'None'}"`);
        }
        if (parsedDetails.old_location !== parsedDetails.new_location) {
          changes.push(`Location: "${parsedDetails.old_location}" → "${parsedDetails.new_location}"`);
        }
        return changes.length > 0 ? changes.join(', ') : 'Place details updated';
      case 'place_availability_toggle':
        return `Place availability toggled: ${parsedDetails.name || 'Unknown place'} - ${parsedDetails.is_available ? 'Available' : 'Unavailable'}`;
      case 'place_create':
        return `New place created: "${parsedDetails.name || 'Unknown place'}" at ${parsedDetails.location || 'Unknown location'}`;
      case 'personnel_assignment':
        return `Personnel (${parsedDetails.personnel_id ? parsedDetails.personnel_id.substring(0, 8) + '...' : 'Unknown'}) assigned to place (${parsedDetails.place_id ? parsedDetails.place_id.substring(0, 8) + '...' : 'Unknown'})`;
      case 'personnel_removal':
        return `Personnel (${parsedDetails.personnel_id ? parsedDetails.personnel_id.substring(0, 8) + '...' : 'Unknown'}) removed from place (${parsedDetails.place_id ? parsedDetails.place_id.substring(0, 8) + '...' : 'Unknown'})`;
      case 'personnel_availability_change':
        const status = parsedDetails.is_available ? 'Available' : 'Unavailable';
        const reason = parsedDetails.unavailability_reason ? ` (Reason: ${parsedDetails.unavailability_reason})` : '';
        return `Personnel availability changed to ${status} for place (${parsedDetails.place_id ? parsedDetails.place_id.substring(0, 8) + '...' : 'Unknown'})${reason}`;
      default:
        return JSON.stringify(parsedDetails, null, 2);
    }
  } catch (error) {
    return 'Error parsing details';
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
(window as any).editPlace = editPlace;
(window as any).changeUserRole = changeUserRole;
(window as any).assignPersonnelToPlace = assignPersonnelToPlace;
(window as any).removePersonnelFromPlace = removePersonnelFromPlace;
(window as any).togglePersonnelAvailability = togglePersonnelAvailability;

// Setup dashboard-specific event listeners
function setupDashboardEventListeners() {
  console.log('Setting up dashboard event listeners...');
  
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

  // Close personnel assignment modal button
  const closePersonnelModalBtn = document.getElementById('closePersonnelModalBtn');
  if (closePersonnelModalBtn) {
    closePersonnelModalBtn.addEventListener('click', () => {
      const modal = document.getElementById('personnelAssignmentModal');
      const errorDiv = document.getElementById('personnelAssignmentError');
      const successDiv = document.getElementById('personnelAssignmentSuccess');
      
      if (modal) {
        modal.classList.add('hidden');
        
        // Clear messages
        if (errorDiv) {
          errorDiv.classList.add('hidden');
          errorDiv.textContent = '';
        }
        if (successDiv) {
          successDiv.classList.add('hidden');
          successDiv.textContent = '';
        }
      }
    });
  }

  // Close availability modal button
  const closeAvailabilityModalBtn = document.getElementById('closeAvailabilityModalBtn');
  if (closeAvailabilityModalBtn) {
    closeAvailabilityModalBtn.addEventListener('click', () => {
      const modal = document.getElementById('personnelAvailabilityModal');
      const errorDiv = document.getElementById('availabilityError');
      const successDiv = document.getElementById('availabilitySuccess');
      const reasonTextarea = document.getElementById('unavailabilityReason') as HTMLTextAreaElement;
      
      if (modal) {
        modal.classList.add('hidden');
        
        // Clear messages and form
        if (errorDiv) {
          errorDiv.classList.add('hidden');
          errorDiv.textContent = '';
        }
        if (successDiv) {
          successDiv.classList.add('hidden');
          successDiv.textContent = '';
        }
        if (reasonTextarea) {
          reasonTextarea.value = '';
        }
      }
    });
  }

  // Refresh personnel button
  const refreshPersonnelBtn = document.getElementById('refreshPersonnelBtn');
  if (refreshPersonnelBtn) {
    refreshPersonnelBtn.addEventListener('click', async () => {
      try {
        // Show loading state
        refreshPersonnelBtn.disabled = true;
        refreshPersonnelBtn.textContent = 'Refreshing...';
        
        // Load personnel dashboard
        await loadPersonnelDashboard();
        
        // Show success notification
        showNotification('Dashboard refreshed successfully!', 'success');
      } catch (error) {
        console.error('Error refreshing personnel dashboard:', error);
        showNotification('Error refreshing dashboard. Please try again.', 'error');
      } finally {
        // Reset button state
        refreshPersonnelBtn.disabled = false;
        refreshPersonnelBtn.textContent = 'Refresh';
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
  const refreshLogsBtn = document.getElementById('refreshLogsBtn') as HTMLButtonElement;
  console.log('Refresh logs button found:', !!refreshLogsBtn);
  if (refreshLogsBtn) {
    refreshLogsBtn.addEventListener('click', async () => {
      console.log('Refresh logs button clicked');
      try {
        // Show loading state
        refreshLogsBtn.disabled = true;
        refreshLogsBtn.textContent = 'Refreshing...';
        
        // Load logs
        await loadLogs();
        
        // Show success notification
        showNotification('Logs refreshed successfully!', 'success');
      } catch (error) {
        console.error('Error refreshing logs:', error);
        showNotification('Error refreshing logs. Please try again.', 'error');
      } finally {
        // Reset button state
        refreshLogsBtn.disabled = false;
        refreshLogsBtn.textContent = 'Refresh Logs';
      }
    });
  } else {
    console.warn('Refresh logs button not found');
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

  // Logs search and filter event listeners
  const logsSearchInput = document.getElementById('logsSearchInput');
  const actionFilter = document.getElementById('actionFilter');

  // Logs search input event listener
  logsSearchInput?.addEventListener('input', () => {
    applySearchAndFilterForLogs();
  });

  // Action filter event listener
  actionFilter?.addEventListener('change', () => {
    applySearchAndFilterForLogs();
  });
  
  console.log('Dashboard event listeners setup complete');
}

// Initialize dashboard event listeners
setTimeout(() => {
  setupDashboardEventListeners();
}, 100);

// Function to apply search and filter for logs
function applySearchAndFilterForLogs() {
  const searchInput = document.getElementById('logsSearchInput') as HTMLInputElement;
  const actionFilter = document.getElementById('actionFilter') as HTMLSelectElement;
  
  const searchTerm = searchInput?.value.toLowerCase() || '';
  const actionValue = actionFilter?.value || 'all';

  // Start with all logs
  let filtered = [...allLogs];

  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter(log => {
      // Search in user ID
      const userId = log.user_id ? log.user_id.toLowerCase() : '';
      if (userId.includes(searchTerm)) return true;
      
      // Search in action
      const action = log.action ? log.action.toLowerCase() : '';
      if (action.includes(searchTerm)) return true;
      
      // Search in details (convert to string for searching)
      const details = log.details ? JSON.stringify(log.details).toLowerCase() : '';
      if (details.includes(searchTerm)) return true;
      
      // Search in timestamp
      const timestamp = new Date(log.created_at).toLocaleString().toLowerCase();
      if (timestamp.includes(searchTerm)) return true;
      
      return false;
    });
  }

  // Apply action filter
  if (actionValue !== 'all') {
    filtered = filtered.filter(log => log.action === actionValue);
  }

  filteredLogs = filtered;
  renderLogs();
}

// Function to assign personnel to a place
async function assignPersonnelToPlace(placeId: string) {
  // Check if current user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showNotification('You must be logged in to perform this action.', 'error');
    return;
  }

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!roleData || roleData.role !== 'admin') {
    showNotification('Only admin users can assign personnel to places.', 'error');
    return;
  }

  const modal = document.getElementById('personnelAssignmentModal');
  const personnelSelect = document.getElementById('personnelSelect') as HTMLSelectElement;
  const assignBtn = document.getElementById('assignPersonnelBtn') as HTMLButtonElement;
  const errorDiv = document.getElementById('personnelAssignmentError');
  const successDiv = document.getElementById('personnelAssignmentSuccess');

  if (modal && personnelSelect && assignBtn) {
    // Clear previous content
    personnelSelect.innerHTML = '<option value="">Select personnel...</option>';
    if (errorDiv) errorDiv.classList.add('hidden');
    if (successDiv) successDiv.classList.add('hidden');

    // Get all personnel users
    const { data: personnelUsers, error } = await supabase
      .from('user_roles')
      .select('user_id, first_name, last_name')
      .eq('role', 'personnel');

    if (error) {
      console.error('Error loading personnel users:', error);
      if (errorDiv) {
        errorDiv.textContent = 'Error loading personnel users';
        errorDiv.classList.remove('hidden');
      }
      return;
    }

    // Get already assigned personnel for this place
    const { data: assignedPersonnel } = await supabase
      .from('place_personnel')
      .select('personnel_id')
      .eq('place_id', placeId);

    const assignedIds = new Set(assignedPersonnel?.map(p => p.personnel_id) || []);

    // Add personnel options (excluding already assigned ones)
    personnelUsers?.forEach(user => {
      if (!assignedIds.has(user.user_id)) {
        const option = document.createElement('option');
        option.value = user.user_id;
        
        // Create display text
        let displayText = '';
        if (user.first_name || user.last_name) {
          displayText = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        } else {
          displayText = `Personnel (${user.user_id.substring(0, 8)}...)`;
        }
        
        option.textContent = displayText;
        personnelSelect.appendChild(option);
      }
    });

    // Show modal
    modal.classList.remove('hidden');

    // Handle assignment
    const handleAssignment = async () => {
      const selectedPersonnelId = personnelSelect.value;
      
      if (!selectedPersonnelId) {
        if (errorDiv) {
          errorDiv.textContent = 'Please select a personnel member';
          errorDiv.classList.remove('hidden');
        }
        return;
      }

      // Show loading state
      assignBtn.disabled = true;
      assignBtn.textContent = 'Assigning...';

      try {
        const { data, error } = await supabase.rpc('assign_personnel_to_place', {
          p_place_id: placeId,
          p_personnel_id: selectedPersonnelId,
          p_assigned_by: (await supabase.auth.getUser()).data.user?.id
        });

        if (error) throw error;

        // Log the action
        await logAction('personnel_assignment', {
          place_id: placeId,
          personnel_id: selectedPersonnelId,
          assigned_at: new Date().toISOString()
        });

        // Show success message
        if (successDiv) {
          successDiv.textContent = 'Personnel assigned successfully!';
          successDiv.classList.remove('hidden');
        }

        // Close modal after 2 seconds
        setTimeout(() => {
          modal.classList.add('hidden');
          loadPlaces(); // Reload places
        }, 2000);

      } catch (err: any) {
        if (errorDiv) {
          errorDiv.textContent = err.message || 'Error assigning personnel';
          errorDiv.classList.remove('hidden');
        }
      } finally {
        // Reset button state
        assignBtn.disabled = false;
        assignBtn.textContent = 'Assign Personnel';
      }
    };

    // Remove existing listeners and add new one
    assignBtn.removeEventListener('click', handleAssignment);
    assignBtn.addEventListener('click', handleAssignment);
  }
}

// Function to remove personnel from a place
async function removePersonnelFromPlace(placeId: string, personnelId: string) {
  // Check if current user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showNotification('You must be logged in to perform this action.', 'error');
    return;
  }

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!roleData || roleData.role !== 'admin') {
    showNotification('Only admin users can remove personnel from places.', 'error');
    return;
  }

  // Show confirmation
  const confirmed = confirm('Are you sure you want to remove this personnel from the place?');
  
  if (!confirmed) {
    return;
  }

  try {
    const { data, error } = await supabase.rpc('remove_personnel_from_place', {
      p_place_id: placeId,
      p_personnel_id: personnelId,
      p_removed_by: (await supabase.auth.getUser()).data.user?.id
    });

    if (error) throw error;

    // Log the action
    await logAction('personnel_removal', {
      place_id: placeId,
      personnel_id: personnelId,
      removed_at: new Date().toISOString()
    });

    showNotification('Personnel removed successfully!', 'success');
    loadPlaces(); // Reload places

  } catch (err: any) {
    console.error('Error removing personnel:', err);
    showNotification(err.message || 'Error removing personnel', 'error');
  }
}

// Function to load personnel dashboard
async function loadPersonnelDashboard() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user found');
    return;
  }

  try {
    // Get personnel's assigned place and availability
    const { data: availabilityData, error } = await supabase.rpc('get_personnel_availability', {
      p_personnel_id: user.id
    });

    if (error) {
      console.error('Error loading personnel availability:', error);
      return;
    }

    const personnelContent = document.getElementById('personnelContent');
    const personnelAssignmentInfo = document.getElementById('personnelAssignmentInfo');

    if (personnelContent) {
      personnelContent.classList.remove('hidden');
    }

    if (personnelAssignmentInfo) {
      if (availabilityData && availabilityData.length > 0) {
        const assignment = availabilityData[0]; // Personnel can only be assigned to one place
        personnelAssignmentInfo.innerHTML = `
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">${assignment.place_name}</h3>
              <span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                assignment.is_available 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }">
                ${assignment.is_available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            
            <div class="space-y-3">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-300">${assignment.place_description || 'No description available'}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-300"><strong>Location:</strong> ${assignment.place_location || 'No location specified'}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-300"><strong>Assigned since:</strong> ${new Date(assignment.assigned_at).toLocaleDateString()}</p>
              </div>
              ${!assignment.is_available && assignment.unavailability_reason ? `
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-300"><strong>Reason for unavailability:</strong></p>
                  <p class="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-600 p-2 rounded mt-1">${assignment.unavailability_reason}</p>
                </div>
              ` : ''}
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-300"><strong>Last updated:</strong> ${new Date(assignment.updated_at).toLocaleString()}</p>
              </div>
            </div>
            
            <div class="mt-6">
              <button 
                onclick="window.togglePersonnelAvailability('${assignment.place_id}', ${assignment.is_available})"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                ${assignment.is_available ? 'Mark as Unavailable' : 'Mark as Available'}
              </button>
            </div>
          </div>
        `;
      } else {
        personnelAssignmentInfo.innerHTML = `
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <div class="text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Assignment</h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">You are not currently assigned to any place.</p>
            </div>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('Error in loadPersonnelDashboard:', error);
  }
}

// Function to toggle personnel availability
async function togglePersonnelAvailability(placeId: string, currentAvailability: boolean) {
  const modal = document.getElementById('personnelAvailabilityModal');
  const availabilityForm = document.getElementById('availabilityForm') as HTMLFormElement;
  const placeIdInput = document.getElementById('availabilityPlaceId') as HTMLInputElement;
  const availableRadio = document.getElementById('availableRadio') as HTMLInputElement;
  const unavailableRadio = document.getElementById('unavailableRadio') as HTMLInputElement;
  const reasonField = document.getElementById('reasonField');
  const reasonTextarea = document.getElementById('unavailabilityReason') as HTMLTextAreaElement;
  const errorDiv = document.getElementById('availabilityError');
  const successDiv = document.getElementById('availabilitySuccess');
  const updateBtn = document.getElementById('updateAvailabilityBtn') as HTMLButtonElement;

  if (modal && availabilityForm && placeIdInput) {
    // Set the place ID
    placeIdInput.value = placeId;
    
    // Set current availability state
    if (currentAvailability) {
      availableRadio.checked = true;
      unavailableRadio.checked = false;
      if (reasonField) reasonField.classList.add('hidden');
    } else {
      availableRadio.checked = false;
      unavailableRadio.checked = true;
      if (reasonField) reasonField.classList.remove('hidden');
    }

    // Clear previous messages
    if (errorDiv) {
      errorDiv.classList.add('hidden');
      errorDiv.textContent = '';
    }
    if (successDiv) {
      successDiv.classList.add('hidden');
      successDiv.textContent = '';
    }

    // Show modal
    modal.classList.remove('hidden');

    // Handle radio button changes
    const handleRadioChange = () => {
      if (unavailableRadio.checked) {
        if (reasonField) reasonField.classList.remove('hidden');
        if (reasonTextarea) reasonTextarea.required = true;
      } else {
        if (reasonField) reasonField.classList.add('hidden');
        if (reasonTextarea) reasonTextarea.required = false;
      }
    };

    availableRadio.addEventListener('change', handleRadioChange);
    unavailableRadio.addEventListener('change', handleRadioChange);

    // Handle form submission
    const handleSubmit = async (e: Event) => {
      e.preventDefault();
      
      const isAvailable = availableRadio.checked;
      const reason = unavailableRadio.checked ? reasonTextarea.value.trim() : null;

      if (unavailableRadio.checked && (!reason || reason.length === 0)) {
        if (errorDiv) {
          errorDiv.textContent = 'Please provide a reason for unavailability';
          errorDiv.classList.remove('hidden');
        }
        return;
      }

      // Show loading state
      updateBtn.disabled = true;
      updateBtn.textContent = 'Updating...';

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        const { data, error } = await supabase.rpc('update_personnel_availability', {
          p_personnel_id: user.id,
          p_place_id: placeId,
          p_is_available: isAvailable,
          p_unavailability_reason: reason,
          p_updated_by: user.id
        });

        if (error) throw error;

        // Log the action
        await logAction('personnel_availability_change', {
          place_id: placeId,
          is_available: isAvailable,
          unavailability_reason: reason,
          updated_at: new Date().toISOString()
        });

        // Show success message
        if (successDiv) {
          successDiv.textContent = 'Availability updated successfully!';
          successDiv.classList.remove('hidden');
        }

        // Close modal after 2 seconds and reload dashboard
        setTimeout(() => {
          modal.classList.add('hidden');
          loadPersonnelDashboard();
        }, 2000);

      } catch (err: any) {
        if (errorDiv) {
          errorDiv.textContent = err.message || 'Error updating availability';
          errorDiv.classList.remove('hidden');
        }
      } finally {
        // Reset button state
        updateBtn.disabled = false;
        updateBtn.textContent = 'Update Availability';
      }
    };

    // Remove existing listeners and add new ones
    availabilityForm.removeEventListener('submit', handleSubmit);
    availabilityForm.addEventListener('submit', handleSubmit);
  }
} 