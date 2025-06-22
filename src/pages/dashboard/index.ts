import supabase from '../../config/supabase';
import { logAction, getLogs } from '../../utils/logging';

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
          // Setup admin tab event listeners
          setupAdminTabEventListeners();
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

    // Personnel tab switching
    const assignmentTab = document.getElementById('assignmentTab');
    const visitsTab = document.getElementById('visitsTab');
    const finishedTab = document.getElementById('finishedTab');
    const assignmentContent = document.getElementById('assignmentContent');
    const visitsContent = document.getElementById('visitsContent');
    const finishedContent = document.getElementById('finishedContent');

    assignmentTab?.addEventListener('click', () => {
      assignmentTab.classList.add('bg-blue-600', 'text-white');
      assignmentTab.classList.remove('bg-gray-100', 'text-gray-700');
      visitsTab?.classList.remove('bg-blue-600', 'text-white');
      visitsTab?.classList.add('bg-gray-100', 'text-gray-700');
      finishedTab?.classList.remove('bg-blue-600', 'text-white');
      finishedTab?.classList.add('bg-gray-100', 'text-gray-700');
      assignmentContent?.classList.remove('hidden');
      visitsContent?.classList.add('hidden');
      finishedContent?.classList.add('hidden');
    });

    visitsTab?.addEventListener('click', () => {
      visitsTab.classList.add('bg-blue-600', 'text-white');
      visitsTab.classList.remove('bg-gray-100', 'text-gray-700');
      assignmentTab?.classList.remove('bg-blue-600', 'text-white');
      assignmentTab?.classList.add('bg-gray-100', 'text-gray-700');
      finishedTab?.classList.remove('bg-blue-600', 'text-white');
      finishedTab?.classList.add('bg-gray-100', 'text-gray-700');
      visitsContent?.classList.remove('hidden');
      assignmentContent?.classList.add('hidden');
      finishedContent?.classList.add('hidden');
      loadScheduledVisits();
    });

    finishedTab?.addEventListener('click', () => {
      finishedTab.classList.add('bg-blue-600', 'text-white');
      finishedTab.classList.remove('bg-gray-100', 'text-gray-700');
      assignmentTab?.classList.remove('bg-blue-600', 'text-white');
      assignmentTab?.classList.add('bg-gray-100', 'text-gray-700');
      visitsTab?.classList.remove('bg-blue-600', 'text-white');
      visitsTab?.classList.add('bg-gray-100', 'text-gray-700');
      finishedContent?.classList.remove('hidden');
      assignmentContent?.classList.add('hidden');
      visitsContent?.classList.add('hidden');
      
      // Load finished schedules when switching to finished tab
      loadFinishedSchedules();
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
                <option value="visit_scheduled">Visit Scheduled</option>
                <option value="visit_completed">Visit Completed</option>
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
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Personnel Dashboard</h2>
          <div class="flex items-center space-x-4">
            <!-- Personnel Tabs -->
            <div class="flex space-x-2 mb-6">
              <button 
                id="assignmentTab"
                class="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                My Assignment
              </button>
              <button 
                id="visitsTab"
                class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Scheduled Visits
              </button>
              <button 
                id="finishedTab"
                class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Finished Schedules
              </button>
            </div>
            <button 
              id="refreshPersonnelBtn"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Refresh
            </button>
          </div>
        </div>

        <!-- Assignment Content -->
        <div id="assignmentContent" class="space-y-4">
          <div id="personnelAssignmentInfo" class="space-y-4">
            <!-- Personnel assignment info will be loaded here -->
          </div>
        </div>

        <!-- Scheduled Visits Content -->
        <div id="visitsContent" class="hidden space-y-4">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Scheduled Visits</h3>
            <div class="flex items-center space-x-4">
              <!-- Search and Filter Section -->
              <div class="flex items-center space-x-3">
                <!-- Search Input -->
                <div class="relative">
                  <input 
                    type="text" 
                    id="visitsSearchInput"
                    placeholder="Search visits..."
                    class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
                
                <!-- Status Filter -->
                <select 
                  id="visitStatusFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <!-- Visitor Role Filter -->
                <select 
                  id="visitorRoleFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="visitor">Visitor</option>
                  <option value="guest">Guest</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Schedule Type Tabs -->
          <div class="flex space-x-2 mb-4">
            <button 
              id="allSchedulesTab"
              class="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
            >
              All Schedules
            </button>
            <button 
              id="todaySchedulesTab"
              class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
            >
              Today Schedules
            </button>
            <button 
              id="futureSchedulesTab"
              class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
            >
              Future Schedules
            </button>
          </div>

          <div id="scheduledVisitsList" class="space-y-4">
            <!-- Scheduled visits will be loaded here -->
          </div>
        </div>

        <!-- Finished Schedules Content -->
        <div id="finishedContent" class="hidden space-y-4">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Finished Schedules</h3>
            <div class="flex items-center space-x-4">
              <!-- Search and Filter Section -->
              <div class="flex items-center space-x-3">
                <!-- Search Input -->
                <div class="relative">
                  <input 
                    type="text" 
                    id="finishedSearchInput"
                    placeholder="Search finished visits..."
                    class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>

                <!-- Date Filter -->
                <select 
                  id="finishedDateFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="this_week">This Week</option>
                  <option value="last_week">Last Week</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                </select>

                <!-- Specific Date Filter -->
                <div class="relative">
                  <input 
                    type="date" 
                    id="finishedSpecificDateFilter"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="Select specific date"
                  >
                  <button 
                    id="clearSpecificDateBtn"
                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm hidden"
                    title="Clear date"
                  >
                    ×
                  </button>
                </div>

                <!-- Visitor Role Filter -->
                <select 
                  id="finishedRoleFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="visitor">Visitor</option>
                  <option value="guest">Guest</option>
                </select>
              </div>
            </div>
          </div>

          <div id="finishedVisitsList" class="space-y-4">
            <!-- Finished visits will be loaded here -->
          </div>
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
    await renderLogs();
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
async function renderLogs() {
  const logsList = document.getElementById('logsList');
  if (logsList) {
    if (filteredLogs.length === 0) {
      logsList.innerHTML = `
        <p class="text-gray-600 dark:text-gray-300">No logs found matching your criteria.</p>
      `;
      return;
    }

    // Format all log details asynchronously
    const formattedDetails = await Promise.all(
      filteredLogs.map(async (log: any) => {
        const details = await formatLogDetails(log.details, log.action, log);
        return {
          ...log,
          formattedDetails: details
        };
      })
    );

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
            ${formattedDetails.map((log: any) => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  ${new Date(log.created_at).toLocaleString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  ${log.user_roles ? 
                    `${log.user_roles.first_name || ''} ${log.user_roles.last_name || ''}`.trim() || 
                    log.user_roles.email || 
                    'Unknown User' 
                    : 'Guest User'}
                  ${log.user_roles ? 
                    `<br><span class="text-xs text-gray-500 font-mono">${log.user_id.substring(0, 8)}...</span>` 
                    : ''}
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
                    log.action === 'visit_scheduled' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' :
                    log.action === 'visit_completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }">
                    ${log.action.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  <div class="max-w-md">
                    ${log.formattedDetails}
                  </div>
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
async function formatLogDetails(details: any, action: string, log?: any): Promise<string> {
  if (!details) return 'No details available';
  
  try {
    const parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;
    
    // Helper function to get user display name
    const getUserDisplayName = (userId: string) => {
      if (!userId) return 'Unknown';
      
      // If we have the log object with user_roles, use that
      if (log && log.user_roles && log.user_roles.user_id === userId) {
        const name = `${log.user_roles.first_name || ''} ${log.user_roles.last_name || ''}`.trim();
        return name || log.user_roles.email || `User (${userId.substring(0, 8)}...)`;
      }
      
      // For personnel IDs in details, we don't have user info, so fallback to truncated ID
      return `User (${userId.substring(0, 8)}...)`;
    };

    // Helper function to get place name
    const getPlaceName = async (placeId: string) => {
      if (!placeId) return 'Unknown place';
      
      try {
        const { data: place, error } = await supabase
          .from('places_to_visit')
          .select('name')
          .eq('id', placeId)
          .single();
        
        if (error || !place) {
          return `Place (${placeId.substring(0, 8)}...)`;
        }
        
        return place.name;
      } catch (error) {
        return `Place (${placeId.substring(0, 8)}...)`;
      }
    };

    // Helper function to get user name from user_roles
    const getUserName = async (userId: string) => {
      if (!userId) return 'Unknown user';
      
      try {
        const { data: user, error } = await supabase
          .from('user_roles')
          .select('first_name, last_name, email')
          .eq('user_id', userId)
          .single();
        
        if (error || !user) {
          return `User (${userId.substring(0, 8)}...)`;
        }
        
        const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        return name || user.email || `User (${userId.substring(0, 8)}...)`;
      } catch (error) {
        return `User (${userId.substring(0, 8)}...)`;
      }
    };
    
    switch (action) {
      case 'password_change':
        return `Password changed for user`;
      case 'place_update':
        const changes = [];
        if (parsedDetails.old_name !== parsedDetails.new_name) {
          changes.push(`<div class="mb-1"><span class="font-medium">Name:</span> <span class="text-red-600 dark:text-red-400">"${parsedDetails.old_name}"</span> <span class="text-gray-500">→</span> <span class="text-green-600 dark:text-green-400">"${parsedDetails.new_name}"</span></div>`);
        }
        if (parsedDetails.old_description !== parsedDetails.new_description) {
          changes.push(`<div class="mb-1"><span class="font-medium">Description:</span> <span class="text-red-600 dark:text-red-400">"${parsedDetails.old_description || 'None'}"</span> <span class="text-gray-500">→</span> <span class="text-green-600 dark:text-green-400">"${parsedDetails.new_description || 'None'}"</span></div>`);
        }
        if (parsedDetails.old_location !== parsedDetails.new_location) {
          changes.push(`<div class="mb-1"><span class="font-medium">Location:</span> <span class="text-red-600 dark:text-red-400">"${parsedDetails.old_location}"</span> <span class="text-gray-500">→</span> <span class="text-green-600 dark:text-green-400">"${parsedDetails.new_location}"</span></div>`);
        }
        return changes.length > 0 ? `<div class="space-y-1">${changes.join('')}</div>` : 'Place details updated';
      case 'place_availability_toggle':
        const statusClass = parsedDetails.is_available ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
        const statusText = parsedDetails.is_available ? 'Available' : 'Unavailable';
        return `<div><span class="font-medium">Place:</span> ${parsedDetails.name || 'Unknown place'}</div><div><span class="font-medium">Status:</span> <span class="${statusClass}">${statusText}</span></div>`;
      case 'place_create':
        return `<div><span class="font-medium">Name:</span> ${parsedDetails.place_name || 'Unknown place'}</div><div><span class="font-medium">Location:</span> ${parsedDetails.place_location || 'Unknown location'}</div>`;
      case 'personnel_assignment':
        const personnelName = await getUserName(parsedDetails.personnel_id);
        const assignmentPlaceName = await getPlaceName(parsedDetails.place_id);
        return `<div><span class="font-medium">Personnel:</span> ${personnelName}</div><div><span class="font-medium">Place:</span> ${assignmentPlaceName}</div>`;
      case 'personnel_removal':
        const removedPersonnelName = await getUserName(parsedDetails.personnel_id);
        const removalPlaceName = await getPlaceName(parsedDetails.place_id);
        return `<div><span class="font-medium">Personnel:</span> ${removedPersonnelName}</div><div><span class="font-medium">Place:</span> ${removalPlaceName}</div>`;
      case 'personnel_availability_change':
        const status = parsedDetails.is_available ? 'Available' : 'Unavailable';
        const statusColor = parsedDetails.is_available ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
        const reason = parsedDetails.unavailability_reason ? `<div><span class="font-medium">Reason:</span> ${parsedDetails.unavailability_reason}</div>` : '';
        const availabilityPlaceName = await getPlaceName(parsedDetails.place_id);
        return `<div><span class="font-medium">Place:</span> ${availabilityPlaceName}</div><div><span class="font-medium">Status:</span> <span class="${statusColor}">${status}</span></div>${reason}`;
      case 'visit_scheduled':
        const visitPlaceName = await getPlaceName(parsedDetails.place_id);
        return `<div><span class="font-medium">Visitor:</span> ${parsedDetails.visitor_name || 'Unknown visitor'}</div><div><span class="font-medium">Date:</span> ${new Date(parsedDetails.visit_date).toLocaleDateString()}</div><div><span class="font-medium">Place:</span> ${visitPlaceName}</div><div><span class="font-medium">Purpose:</span> ${parsedDetails.purpose || 'Not specified'}</div>`;
      case 'visit_completed':
        const completedVisitPlaceName = await getPlaceName(parsedDetails.place_id);
        return `<div><span class="font-medium">Visit ID:</span> ${parsedDetails.visit_id ? parsedDetails.visit_id.substring(0, 8) + '...' : 'Unknown'}</div><div><span class="font-medium">Place:</span> ${completedVisitPlaceName}</div><div><span class="font-medium">Completed:</span> ${new Date(parsedDetails.completed_at).toLocaleString()}</div>`;
      default:
        return `<pre class="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">${JSON.stringify(parsedDetails, null, 2)}</pre>`;
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

// Make function available globally
(window as any).changeUserRole = changeUserRole;

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
(window as any).completeVisit = completeVisit;

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
              location: locationInput.value
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
  logsSearchInput?.addEventListener('input', async () => {
    await applySearchAndFilterForLogs();
  });

  // Action filter event listener
  actionFilter?.addEventListener('change', async () => {
    await applySearchAndFilterForLogs();
  });
  
  // Add search and filter event listeners for scheduled visits
  const visitsSearchInput = document.getElementById('visitsSearchInput') as HTMLInputElement;
  if (visitsSearchInput) {
    visitsSearchInput.addEventListener('input', debounce(async () => {
      currentSearchTerm = visitsSearchInput.value;
      await applyVisitsFilters();
    }, 300));
  }

  // Status filter event listener
  const visitStatusFilter = document.getElementById('visitStatusFilter') as HTMLSelectElement;
  if (visitStatusFilter) {
    visitStatusFilter.addEventListener('change', async () => {
      currentStatusFilter = visitStatusFilter.value;
      await applyVisitsFilters();
    });
  }

  // Role filter event listener
  const visitorRoleFilter = document.getElementById('visitorRoleFilter') as HTMLSelectElement;
  if (visitorRoleFilter) {
    visitorRoleFilter.addEventListener('change', async () => {
      currentRoleFilter = visitorRoleFilter.value;
      await applyVisitsFilters();
    });
  }

  // Add search and filter event listeners for finished schedules
  const finishedSearchInput = document.getElementById('finishedSearchInput') as HTMLInputElement;
  if (finishedSearchInput) {
    finishedSearchInput.addEventListener('input', debounce(() => {
      currentFinishedSearchTerm = finishedSearchInput.value;
      applyFinishedFilters();
    }, 300));
  }

  // Finished date filter event listener
  const finishedDateFilter = document.getElementById('finishedDateFilter') as HTMLSelectElement;
  if (finishedDateFilter) {
    finishedDateFilter.addEventListener('change', () => {
      currentFinishedDateFilter = finishedDateFilter.value;
      // Clear specific date when date range is selected
      if (currentFinishedDateFilter !== 'all') {
        currentFinishedSpecificDate = '';
        const specificDateInput = document.getElementById('finishedSpecificDateFilter') as HTMLInputElement;
        if (specificDateInput) {
          specificDateInput.value = '';
        }
        updateClearDateButton();
      }
      applyFinishedFilters();
    });
  }

  // Finished specific date filter event listener
  const finishedSpecificDateFilter = document.getElementById('finishedSpecificDateFilter') as HTMLInputElement;
  if (finishedSpecificDateFilter) {
    finishedSpecificDateFilter.addEventListener('change', () => {
      currentFinishedSpecificDate = finishedSpecificDateFilter.value;
      // Clear date range filter when specific date is selected
      if (currentFinishedSpecificDate) {
        currentFinishedDateFilter = 'all';
        if (finishedDateFilter) {
          finishedDateFilter.value = 'all';
        }
      }
      updateClearDateButton();
      applyFinishedFilters();
    });
  }

  // Clear specific date button event listener
  const clearSpecificDateBtn = document.getElementById('clearSpecificDateBtn');
  if (clearSpecificDateBtn) {
    clearSpecificDateBtn.addEventListener('click', () => {
      currentFinishedSpecificDate = '';
      if (finishedSpecificDateFilter) {
        finishedSpecificDateFilter.value = '';
      }
      updateClearDateButton();
      applyFinishedFilters();
    });
  }

  // Finished role filter event listener
  const finishedRoleFilter = document.getElementById('finishedRoleFilter') as HTMLSelectElement;
  if (finishedRoleFilter) {
    finishedRoleFilter.addEventListener('change', () => {
      currentFinishedRoleFilter = finishedRoleFilter.value;
      applyFinishedFilters();
    });
  }

  // Schedule type tabs event listeners
  const allSchedulesTab = document.getElementById('allSchedulesTab');
  const todaySchedulesTab = document.getElementById('todaySchedulesTab');
  const futureSchedulesTab = document.getElementById('futureSchedulesTab');

  if (allSchedulesTab) {
    allSchedulesTab.addEventListener('click', async () => {
      currentScheduleType = 'all';
      updateScheduleTypeTabs();
      await applyVisitsFilters();
    });
  }

  if (todaySchedulesTab) {
    todaySchedulesTab.addEventListener('click', async () => {
      currentScheduleType = 'today';
      updateScheduleTypeTabs();
      await applyVisitsFilters();
    });
  }

  if (futureSchedulesTab) {
    futureSchedulesTab.addEventListener('click', async () => {
      currentScheduleType = 'future';
      updateScheduleTypeTabs();
      await applyVisitsFilters();
    });
  }

  console.log('Dashboard event listeners setup complete');
}

// Initialize dashboard event listeners
setTimeout(() => {
  setupDashboardEventListeners();
}, 100);

// Add admin tab switching event listeners
function setupAdminTabEventListeners() {
  const placesTab = document.getElementById('placesTab');
  const accountsTab = document.getElementById('accountsTab');
  const placesContent = document.getElementById('placesContent');
  const accountsContent = document.getElementById('accountsContent');

  // Places tab event listener
  placesTab?.addEventListener('click', () => {
    placesTab.classList.add('bg-blue-600', 'text-white');
    placesTab.classList.remove('bg-gray-100', 'text-gray-700');
    accountsTab?.classList.remove('bg-blue-600', 'text-white');
    accountsTab?.classList.add('bg-gray-100', 'text-gray-700');
    placesContent?.classList.remove('hidden');
    accountsContent?.classList.add('hidden');
    loadPlaces();
  });

  // Accounts tab event listener
  accountsTab?.addEventListener('click', () => {
    accountsTab.classList.add('bg-blue-600', 'text-white');
    accountsTab.classList.remove('bg-gray-100', 'text-gray-700');
    placesTab?.classList.remove('bg-blue-600', 'text-white');
    placesTab?.classList.add('bg-gray-100', 'text-gray-700');
    accountsContent?.classList.remove('hidden');
    placesContent?.classList.add('hidden');
    loadAccounts();
  });
}

// Make function available globally
(window as any).setupAdminTabEventListeners = setupAdminTabEventListeners;

// Function to apply search and filter for logs
async function applySearchAndFilterForLogs() {
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
  await renderLogs();
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

    // Note: Scheduled visits will be loaded when the visits tab is clicked
  } catch (error) {
    console.error('Error in loadPersonnelDashboard:', error);
  }
}

// Global variables for visits
let allScheduledVisits: any[] = [];
let allFinishedVisits: any[] = [];
let currentScheduleType = 'all'; // 'all', 'today', 'future'
let currentSearchTerm = '';
let currentStatusFilter = 'all';
let currentRoleFilter = 'all';
let currentFinishedSearchTerm = '';
let currentFinishedRoleFilter = 'all';
let currentFinishedDateFilter = 'all';
let currentFinishedSpecificDate = '';

// Function to load scheduled visits for personnel
async function loadScheduledVisits() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found');
      return;
    }

    const { data, error } = await supabase.rpc('get_personnel_scheduled_visits', {
      p_personnel_id: user.id
    });

    if (error) throw error;

    // Filter out completed visits since we only want pending ones
    allScheduledVisits = (data || []).filter(visit => visit.status !== 'completed');
    await applyVisitsFilters();
  } catch (error) {
    console.error('Error loading scheduled visits:', error);
    showNotification('Error loading scheduled visits', 'error');
  }
}

// Function to load finished schedules for personnel
async function loadFinishedSchedules() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found');
      return;
    }

    // Get all visits for places this personnel is assigned to
    const { data: visits, error: visitsError } = await supabase.rpc('get_personnel_scheduled_visits', {
      p_personnel_id: user.id
    });

    if (visitsError) throw visitsError;

    // Filter for completed visits only
    const completedVisits = (visits || []).filter(visit => visit.status === 'completed');

    // Get unique personnel IDs who completed visits
    const personnelIds = [...new Set(completedVisits.map(visit => visit.completed_by).filter(id => id))];
    
    // Fetch personnel information
    let personnelInfo = {};
    if (personnelIds.length > 0) {
      const { data: personnel, error: personnelError } = await supabase
        .from('user_roles')
        .select('user_id, first_name, last_name, email')
        .in('user_id', personnelIds);
      
      if (personnelError) throw personnelError;
      
      // Create a map of user_id to personnel info
      personnelInfo = personnel?.reduce((acc, person) => {
        acc[person.user_id] = person;
        return acc;
      }, {}) || {};
    }

    // Combine visit data with personnel info
    allFinishedVisits = completedVisits.map(visit => ({
      ...visit,
      completed_by_info: visit.completed_by ? personnelInfo[visit.completed_by] : null
    }));

    applyFinishedFilters();
  } catch (error) {
    console.error('Error loading finished schedules:', error);
    showNotification('Error loading finished schedules', 'error');
  }
}

// Apply filters and search to visits
async function applyVisitsFilters() {
  let filteredVisits = [...allScheduledVisits];

  // Apply schedule type filter
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (currentScheduleType) {
    case 'today':
      filteredVisits = filteredVisits.filter(visit => {
        const visitDate = new Date(visit.visit_date);
        visitDate.setHours(0, 0, 0, 0);
        return visitDate.getTime() === today.getTime();
      });
      break;
    case 'future':
      filteredVisits = filteredVisits.filter(visit => {
        const visitDate = new Date(visit.visit_date);
        visitDate.setHours(0, 0, 0, 0);
        return visitDate.getTime() > today.getTime();
      });
      break;
    // 'all' case - no filtering needed
  }

  // Apply status filter
  if (currentStatusFilter !== 'all') {
    filteredVisits = filteredVisits.filter(visit => visit.status === currentStatusFilter);
  }

  // Apply role filter
  if (currentRoleFilter !== 'all') {
    filteredVisits = filteredVisits.filter(visit => {
      const visitorRole = visit.visitor_role || 'guest';
      return visitorRole === currentRoleFilter;
    });
  }

  // Apply search filter
  if (currentSearchTerm.trim()) {
    const searchLower = currentSearchTerm.toLowerCase();
    filteredVisits = filteredVisits.filter(visit => {
      const visitorName = `${visit.visitor_first_name} ${visit.visitor_last_name}`;
      const visitorEmail = visit.visitor_email || '';
      const purpose = visit.purpose || '';
      const status = visit.status || '';
      
      return visitorName.toLowerCase().includes(searchLower) ||
             visitorEmail.toLowerCase().includes(searchLower) ||
             purpose.toLowerCase().includes(searchLower) ||
             status.toLowerCase().includes(searchLower);
    });
  }

  await displayScheduledVisits(filteredVisits);
}

// Display filtered visits
async function displayScheduledVisits(visits: any[]) {
  const visitsList = document.getElementById('scheduledVisitsList');
  if (!visitsList) return;

  if (visits.length === 0) {
    visitsList.innerHTML = `
      <div class="text-center py-8">
        <div class="text-gray-500 dark:text-gray-400 text-lg">No scheduled visits found</div>
        <div class="text-gray-400 dark:text-gray-500 text-sm mt-2">
          ${currentSearchTerm || currentStatusFilter !== 'all' || currentRoleFilter !== 'all' || currentScheduleType !== 'all' 
            ? 'Try adjusting your search or filters' 
            : 'No visits have been scheduled yet'}
        </div>
      </div>
    `;
    return;
  }

  // Check permissions for all visits
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = null;
  let userAssignments: string[] = [];

  if (user) {
    try {
      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      userRole = roleData?.role;

      // If user is personnel, get their place assignments
      if (userRole === 'personnel') {
        const { data: assignments } = await supabase
          .from('place_personnel')
          .select('place_id')
          .eq('personnel_id', user.id);
        
        userAssignments = assignments?.map(a => a.place_id) || [];
      }
    } catch (error) {
      console.error('Error checking user permissions:', error);
    }
  }

  visitsList.innerHTML = visits.map(visit => {
    const visitorName = `${visit.visitor_first_name} ${visit.visitor_last_name}`;
    const visitorEmail = visit.visitor_email || 'No email';
    const visitorRole = visit.visitor_role || 'guest';
    const isLoggedIn = visit.visitor_user_id !== null;
    const visitorId = isLoggedIn ? visit.visitor_user_id : 'guest';
    const scheduledDate = new Date(visit.visit_date).toLocaleDateString();
    const scheduledTime = new Date(visit.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    const roleColors = {
      visitor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      guest: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };

    // Check if user can complete this visit
    const canComplete = userRole === 'personnel' && 
                       userAssignments.includes(visit.place_id) && 
                       visit.status === 'pending';

    return `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white">${visitorName}</h4>
            <p class="text-gray-600 dark:text-gray-400">${visitorEmail}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              ${isLoggedIn ? 'Logged-in User' : 'Guest User'} • ID: ${visitorId}
            </p>
          </div>
          <div class="flex space-x-2">
            <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColors[visit.status] || statusColors.pending}">
              ${visit.status}
            </span>
            <span class="px-2 py-1 rounded-full text-xs font-medium ${roleColors[visitorRole] || roleColors.guest}">
              ${visitorRole}
            </span>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Scheduled Date</p>
            <p class="text-gray-900 dark:text-white font-medium">${scheduledDate} at ${scheduledTime}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Purpose</p>
            <p class="text-gray-900 dark:text-white">${visit.purpose || 'No purpose specified'}</p>
          </div>
        </div>
        
        ${canComplete ? `
          <div class="flex justify-end">
            <button 
              onclick="completeVisit('${visit.visit_id}')"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium"
            >
              Mark Complete
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Event listeners for search and filters
document.addEventListener('DOMContentLoaded', function() {
  // ... existing event listeners ...

  // Search input event listener
  const visitsSearchInput = document.getElementById('visitsSearchInput') as HTMLInputElement;
  if (visitsSearchInput) {
    visitsSearchInput.addEventListener('input', debounce(() => {
      currentSearchTerm = visitsSearchInput.value;
      applyVisitsFilters();
    }, 300));
  }

  // Status filter event listener
  const visitStatusFilter = document.getElementById('visitStatusFilter') as HTMLSelectElement;
  if (visitStatusFilter) {
    visitStatusFilter.addEventListener('change', async () => {
      currentStatusFilter = visitStatusFilter.value;
      await applyVisitsFilters();
    });
  }

  // Role filter event listener
  const visitorRoleFilter = document.getElementById('visitorRoleFilter') as HTMLSelectElement;
  if (visitorRoleFilter) {
    visitorRoleFilter.addEventListener('change', async () => {
      currentRoleFilter = visitorRoleFilter.value;
      await applyVisitsFilters();
    });
  }

  // Schedule type tabs event listeners
  const allSchedulesTab = document.getElementById('allSchedulesTab');
  const todaySchedulesTab = document.getElementById('todaySchedulesTab');
  const futureSchedulesTab = document.getElementById('futureSchedulesTab');

  if (allSchedulesTab) {
    allSchedulesTab.addEventListener('click', async () => {
      currentScheduleType = 'all';
      updateScheduleTypeTabs();
      await applyVisitsFilters();
    });
  }

  if (todaySchedulesTab) {
    todaySchedulesTab.addEventListener('click', async () => {
      currentScheduleType = 'today';
      updateScheduleTypeTabs();
      await applyVisitsFilters();
    });
  }

  if (futureSchedulesTab) {
    futureSchedulesTab.addEventListener('click', async () => {
      currentScheduleType = 'future';
      updateScheduleTypeTabs();
      await applyVisitsFilters();
    });
  }
});

// Update schedule type tab styles
function updateScheduleTypeTabs() {
  const allSchedulesTab = document.getElementById('allSchedulesTab');
  const todaySchedulesTab = document.getElementById('todaySchedulesTab');
  const futureSchedulesTab = document.getElementById('futureSchedulesTab');

  const activeClasses = 'bg-blue-600 text-white';
  const inactiveClasses = 'bg-gray-100 text-gray-700 hover:bg-gray-200';

  if (allSchedulesTab) {
    allSchedulesTab.className = `px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm ${currentScheduleType === 'all' ? activeClasses : inactiveClasses}`;
  }

  if (todaySchedulesTab) {
    todaySchedulesTab.className = `px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm ${currentScheduleType === 'today' ? activeClasses : inactiveClasses}`;
  }

  if (futureSchedulesTab) {
    futureSchedulesTab.className = `px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm ${currentScheduleType === 'future' ? activeClasses : inactiveClasses}`;
  }
}

// Debounce function for search
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Function to complete a visit
async function completeVisit(visitId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user found');
    showNotification('Authentication error. Please login again.', 'error');
    return;
  }

  try {
    console.log('Attempting to complete visit:', visitId, 'by user:', user.id);
    
    // First, let's check if the visit exists and get its details
    const { data: visitData, error: visitError } = await supabase
      .from('scheduled_visits')
      .select('*')
      .eq('id', visitId)
      .single();
    
    if (visitError || !visitData) {
      console.error('Visit not found:', visitId, visitError);
      showNotification('Visit not found. It may have been deleted or already completed.', 'error');
      return;
    }
    
    console.log('Visit found:', visitData);
    
    // Check user's role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (roleError || !roleData) {
      console.error('User role not found:', user.id, roleError);
      showNotification('User role not found. Please contact an administrator.', 'error');
      return;
    }
    
    console.log('User role:', roleData.role);
    
    // Check if user is assigned to the place
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('place_personnel')
      .select('id')
      .eq('place_id', visitData.place_id)
      .eq('personnel_id', user.id)
      .single();
    
    console.log('Assignment check:', assignmentData, assignmentError);
    
    // Test if the function exists by calling it with invalid parameters first
    try {
      const { error: testError } = await supabase.rpc('complete_visit', {
        p_visit_id: '00000000-0000-0000-0000-000000000000',
        p_completed_by: user.id
      });
      console.log('Function test result:', testError);
    } catch (testErr) {
      console.error('Function test failed:', testErr);
    }
    
    // Test the RPC call with more detailed error handling
    console.log('Calling complete_visit RPC with params:', {
      p_visit_id: visitId,
      p_completed_by: user.id
    });
    
    const { data: rpcData, error } = await supabase.rpc('complete_visit', {
      p_visit_id: visitId,
      p_completed_by: user.id
    });

    console.log('RPC response:', { data: rpcData, error });

    if (error) {
      console.error('Error completing visit:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Provide more specific error messages based on the error
      if (error.message?.includes('Only personnel can complete visits')) {
        showNotification('Only personnel can complete visits. Please contact an administrator.', 'error');
      } else if (error.message?.includes('Personnel is not assigned to this place')) {
        showNotification('You are not assigned to this place. Please contact an administrator.', 'error');
      } else if (error.message?.includes('visit not found') || error.message?.includes('does not exist')) {
        showNotification('Visit not found. It may have been deleted or already completed.', 'error');
      } else {
        showNotification(`Error completing visit: ${error.message || 'Unknown error'}`, 'error');
      }
      return;
    }

    console.log('Visit completed successfully:', rpcData);
    showNotification('Visit marked as completed successfully', 'success');
    
    // Reload both scheduled visits and finished schedules to reflect the change
    await loadScheduledVisits();
    await loadFinishedSchedules();
    
    // Log the action
    await logAction('visit_completed', {
      visit_id: visitId,
      completed_by: user.id,
      completed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error completing visit:', error);
    showNotification('Error completing visit. Please try again.', 'error');
  }
}

// Make function available globally
(window as any).completeVisit = completeVisit;

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

// Apply filters and search to finished visits
function applyFinishedFilters() {
  let filteredVisits = [...allFinishedVisits];

  // Apply specific date filter (takes precedence over date range filter)
  if (currentFinishedSpecificDate) {
    const selectedDate = new Date(currentFinishedSpecificDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    filteredVisits = filteredVisits.filter(visit => {
      const completedDate = new Date(visit.completed_at);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === selectedDate.getTime();
    });
  }
  // Apply date range filter (only if no specific date is selected)
  else if (currentFinishedDateFilter !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Get start of week (Monday)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
    startOfWeek.setDate(today.getDate() - daysToSubtract);
    
    // Get start of last week
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);
    
    // Get start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get start of last month
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    filteredVisits = filteredVisits.filter(visit => {
      const completedDate = new Date(visit.completed_at);
      completedDate.setHours(0, 0, 0, 0);

      switch (currentFinishedDateFilter) {
        case 'today':
          return completedDate.getTime() === today.getTime();
        case 'yesterday':
          return completedDate.getTime() === yesterday.getTime();
        case 'this_week':
          return completedDate >= startOfWeek && completedDate <= today;
        case 'last_week':
          const endOfLastWeek = new Date(startOfWeek);
          endOfLastWeek.setDate(startOfWeek.getDate() - 1);
          return completedDate >= startOfLastWeek && completedDate <= endOfLastWeek;
        case 'this_month':
          return completedDate >= startOfMonth && completedDate <= today;
        case 'last_month':
          const endOfLastMonth = new Date(startOfMonth);
          endOfLastMonth.setDate(startOfMonth.getDate() - 1);
          return completedDate >= startOfLastMonth && completedDate <= endOfLastMonth;
        default:
          return true;
      }
    });
  }

  // Apply role filter
  if (currentFinishedRoleFilter !== 'all') {
    filteredVisits = filteredVisits.filter(visit => {
      const visitorRole = visit.visitor_role || 'guest';
      return visitorRole === currentFinishedRoleFilter;
    });
  }

  // Apply search filter
  if (currentFinishedSearchTerm.trim()) {
    const searchLower = currentFinishedSearchTerm.toLowerCase();
    filteredVisits = filteredVisits.filter(visit => {
      const visitorName = `${visit.visitor_first_name} ${visit.visitor_last_name}`;
      const visitorEmail = visit.visitor_email || '';
      const purpose = visit.purpose || '';
      
      // Get personnel name for search
      let completedByName = 'Unknown';
      if (visit.completed_by_info) {
        const personnel = visit.completed_by_info;
        completedByName = `${personnel.first_name || ''} ${personnel.last_name || ''}`.trim() || personnel.email || 'Unknown Personnel';
      } else if (visit.completed_by) {
        completedByName = `Personnel (${visit.completed_by.substring(0, 8)}...)`;
      }
      
      return visitorName.toLowerCase().includes(searchLower) ||
             visitorEmail.toLowerCase().includes(searchLower) ||
             purpose.toLowerCase().includes(searchLower) ||
             completedByName.toLowerCase().includes(searchLower);
    });
  }

  displayFinishedVisits(filteredVisits);
}

// Display filtered finished visits
function displayFinishedVisits(visits: any[]) {
  const visitsList = document.getElementById('finishedVisitsList');
  if (!visitsList) return;

  if (visits.length === 0) {
    visitsList.innerHTML = `
      <div class="text-center py-8">
        <div class="text-gray-500 dark:text-gray-400 text-lg">No finished schedules found</div>
        <div class="text-gray-400 dark:text-gray-500 text-sm mt-2">
          ${currentFinishedSearchTerm || currentFinishedRoleFilter !== 'all' 
            ? 'Try adjusting your search or filters' 
            : 'No visits have been completed yet'}
        </div>
      </div>
    `;
    return;
  }

  visitsList.innerHTML = visits.map(visit => {
    const visitorName = `${visit.visitor_first_name} ${visit.visitor_last_name}`;
    const visitorEmail = visit.visitor_email || 'No email';
    const visitorRole = visit.visitor_role || 'guest';
    const isLoggedIn = visit.visitor_user_id !== null;
    const visitorId = isLoggedIn ? visit.visitor_user_id : 'guest';
    const visitDate = new Date(visit.visit_date).toLocaleDateString();
    const completedDate = new Date(visit.completed_at).toLocaleDateString();
    const completedTime = new Date(visit.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Get personnel name who completed the visit
    let completedByName = 'Unknown';
    if (visit.completed_by_info) {
      const personnel = visit.completed_by_info;
      completedByName = `${personnel.first_name || ''} ${personnel.last_name || ''}`.trim() || personnel.email || 'Unknown Personnel';
    } else if (visit.completed_by) {
      completedByName = `Personnel (${visit.completed_by.substring(0, 8)}...)`;
    }
    
    const roleColors = {
      visitor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      guest: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };

    return `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white">${visitorName}</h4>
            <p class="text-gray-600 dark:text-gray-400">${visitorEmail}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              ${isLoggedIn ? 'Logged-in User' : 'Guest User'} • ID: ${visitorId}
            </p>
          </div>
          <div class="flex space-x-2">
            <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Completed
            </span>
            <span class="px-2 py-1 rounded-full text-xs font-medium ${roleColors[visitorRole] || roleColors.guest}">
              ${visitorRole}
            </span>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Visit Date</p>
            <p class="text-gray-900 dark:text-white font-medium">${visitDate}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Purpose</p>
            <p class="text-gray-900 dark:text-white">${visit.purpose || 'No purpose specified'}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Completed Date</p>
            <p class="text-gray-900 dark:text-white font-medium">${completedDate} at ${completedTime}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Completed By</p>
            <p class="text-gray-900 dark:text-white font-medium">${completedByName}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Update clear date button visibility
function updateClearDateButton() {
  const clearBtn = document.getElementById('clearSpecificDateBtn');
  if (clearBtn) {
    if (currentFinishedSpecificDate) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
    }
  }
}

// Function to check if current user can complete a visit
async function canCompleteVisit(visitPlaceId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  try {
    // Check if user has personnel role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role !== 'personnel') {
      return false;
    }

    // Check if personnel is assigned to this place
    const { data: assignmentData } = await supabase
      .from('place_personnel')
      .select('id')
      .eq('place_id', visitPlaceId)
      .eq('personnel_id', user.id)
      .single();

    return !!assignmentData;
  } catch (error) {
    console.error('Error checking visit completion permissions:', error);
    return false;
  }
}