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

// Place filter for scheduled visits (global scope)
let currentPlaceFilter = 'all';
let placeFilterOptions = [];

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
          
          // Hide visitor content
          const visitorContent = document.getElementById('visitorContent');
          if (visitorContent) visitorContent.classList.add('hidden');
          
          // Load logs immediately
          loadLogs();
        } else if (roleData.role === 'admin') {
          // Admin: show admin tabs, hide logs
          if (adminTabs) adminTabs.classList.remove('hidden');
          if (logsTab) logsTab.classList.add('hidden');
          if (placesTab) placesTab.classList.remove('bg-blue-600', 'text-white');
          if (accountsTab) accountsTab.classList.remove('bg-gray-100', 'text-gray-700');
          if (placesContent) placesContent.classList.remove('hidden');
          if (accountsContent) accountsContent.classList.add('hidden');
          if (logsContent) logsContent.classList.add('hidden');
          
          // Hide visitor content
          const visitorContent = document.getElementById('visitorContent');
          if (visitorContent) visitorContent.classList.add('hidden');
          
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
        } else if (roleData.role === 'visitor') {
          // Visitor: show visitor content, hide admin tabs
          if (adminTabs) adminTabs.classList.add('hidden');
          if (logsTab) logsTab.classList.add('hidden');
          if (placesTab) placesTab.classList.add('hidden');
          if (accountsTab) accountsTab.classList.add('hidden');
          if (placesContent) placesContent.classList.add('hidden');
          if (accountsContent) accountsContent.classList.add('hidden');
          if (logsContent) logsContent.classList.add('hidden');
          
          // Show visitor content
          const visitorContent = document.getElementById('visitorContent');
          if (visitorContent) visitorContent.classList.remove('hidden');
          
          loadVisitorDashboard();
        } else {
          // Other roles (guest): hide all admin/logs tabs
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

    visitsTab?.addEventListener('click', async () => {
      // Check if button is disabled
      if (visitsTab.disabled) {
        return;
      }
      
      visitsTab.classList.add('bg-blue-600', 'text-white');
      visitsTab.classList.remove('bg-gray-100', 'text-gray-700');
      assignmentTab?.classList.remove('bg-blue-600', 'text-white');
      assignmentTab?.classList.add('bg-gray-100', 'text-gray-700');
      finishedTab?.classList.remove('bg-blue-600', 'text-white');
      finishedTab?.classList.add('bg-gray-100', 'text-gray-700');
      visitsContent?.classList.remove('hidden');
      assignmentContent?.classList.add('hidden');
      finishedContent?.classList.add('hidden');
      
      // Stop auto-refresh for other tabs and start for visits
      stopVisitsAutoRefresh();
      await loadScheduledVisits();
    });

    finishedTab?.addEventListener('click', async () => {
      // Check if button is disabled
      if (finishedTab.disabled) {
        return;
      }
      
      finishedTab.classList.add('bg-blue-600', 'text-white');
      finishedTab.classList.remove('bg-gray-100', 'text-gray-700');
      assignmentTab?.classList.remove('bg-blue-600', 'text-white');
      assignmentTab?.classList.add('bg-gray-100', 'text-gray-700');
      visitsTab?.classList.remove('bg-blue-600', 'text-white');
      visitsTab?.classList.add('bg-gray-100', 'text-gray-700');
      finishedContent?.classList.remove('hidden');
      assignmentContent?.classList.add('hidden');
      visitsContent?.classList.add('hidden');
      
      // Stop auto-refresh for visits tab
      stopVisitsAutoRefresh();
      
      // Load finished schedules when switching to finished tab
      await loadFinishedSchedules();
      
      // Initialize finished schedule type tabs
      updateFinishedScheduleTypeTabs();
    });

    // Show profile settings button when logged in
    const profileSettingsBtn = document.getElementById('profileSettingsBtn');
    if (profileSettingsBtn) {
      profileSettingsBtn.classList.remove('hidden');
    }

    // Setup dashboard event listeners
    setupDashboardEventListeners();
  }, 0);

  return `
    <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-12">
      <div class="flex flex-col gap-4 mb-8">
        <!-- Header Row 1: Logo, Title, and Clock -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <img src="/guestgo-logo.png" alt="GuestGo Logo" class="h-14 w-14 sm:h-16 sm:w-16" />
            <div class="text-center sm:text-left">
              <h1 class="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                Dashboard
              </h1>
              <p class="text-base sm:text-xl text-gray-600 dark:text-gray-300 transition-colors duration-200">
                Your current role: <span id="userRole" class="font-semibold text-blue-600 dark:text-blue-500">Loading...</span>
              </p>
            </div>
          </div>

          <!-- Philippine Clock -->
          <div id="philippineClock" class="flex flex-col items-center sm:items-end justify-center bg-white dark:bg-gray-800 rounded-lg shadow-md px-4 py-3 sm:px-6 sm:py-4 border border-gray-200 dark:border-gray-700 w-full sm:w-auto">
            <div class="text-center">
              <div class="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white" id="philippineTime">
                Loading...
              </div>
              <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400" id="philippineDate">
                Loading...
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                🇵🇭 Philippine Time
              </div>
            </div>
          </div>
        </div>

        <!-- Header Row 2: Admin Tabs (when visible) -->
        <div id="adminTabs" class="hidden w-full">
          <div class="flex flex-col sm:flex-row gap-2 w-full">
            <button 
              id="placesTab"
              class="w-full sm:w-auto px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Places
            </button>
            <button 
              id="accountsTab"
              class="w-full sm:w-auto px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Accounts
            </button>
            <button 
              id="logsTab"
              class="w-full sm:w-auto px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Logs
            </button>
          </div>
        </div>
      </div>

      <!-- Admin Content -->
      <div id="placesContent" class="bg-white dark:bg-gray-800 shadow rounded-lg p-2 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Places Management</h2>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-4">
            <!-- Search and Filter Section -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3">
              <!-- Search Input -->
              <div class="relative">
                <input 
                  type="text" 
                  id="placesSearchInput"
                  placeholder="Search places..."
                  class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
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
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
              >
                <option value="all">All Places</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>
            </div>
            <button 
              id="addPlaceBtn"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
            >
              Add New Place
            </button>
          </div>
        </div>
        <div id="placesList" class="space-y-4"></div>
      </div>

      <div id="accountsContent" class="hidden bg-white dark:bg-gray-800 shadow rounded-lg p-2 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Accounts Management</h2>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-4">
            <!-- Search and Filter Section -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3">
              <!-- Search Input -->
              <div class="relative">
                <input 
                  type="text" 
                  id="accountsSearchInput"
                  placeholder="Search accounts..."
                  class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
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
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
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
        <div id="accountsList" class="overflow-x-auto"></div>
      </div>

      <div id="logsContent" class="hidden bg-white dark:bg-gray-800 shadow rounded-lg p-2 sm:p-6">
        <div class="flex flex-col gap-4 mb-6">
          <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">System Logs</h2>
          <div class="flex flex-col gap-4">
            <!-- Search and Filter Section -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <!-- Search Input -->
              <div class="relative flex-1">
                <input 
                  type="text" 
                  id="logsSearchInput"
                  placeholder="Search logs..."
                  class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
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
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
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
                <option value="visit_unsuccessful">Visit Unsuccessful</option>
              </select>
              <button 
                id="refreshLogsBtn"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
              >
                Refresh Logs
              </button>
              <button 
                id="cleanupVisitsBtn"
                class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full sm:w-auto"
              >
                Cleanup Past Visits
              </button>
            </div>
          </div>
        </div>
        <div id="logsList" class="overflow-x-auto space-y-4"></div>
      </div>

      <!-- Personnel Dashboard Content -->
      <div id="personnelContent" class="hidden bg-white dark:bg-gray-800 shadow rounded-lg p-2 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Personnel Dashboard</h2>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-4">
            <!-- Personnel Tabs -->
            <div class="flex flex-row flex-wrap gap-2 mb-2 sm:mb-6">
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
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
            >
              Refresh
            </button>
          </div>
        </div>
        <!-- Assignment Content -->
        <div id="assignmentContent" class="space-y-4">
          <div id="personnelAssignmentInfo" class="space-y-4"></div>
        </div>
        <!-- Scheduled Visits Content -->
        <div id="visitsContent" class="hidden space-y-4">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Scheduled Visits</h3>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-4">
              <!-- Manual Refresh Button -->
              <button 
                id="refreshVisitsBtn"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm w-full sm:w-auto"
                title="Refresh visits data"
              >
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh
              </button>
              <!-- Search and Filter Section -->
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3">
                <!-- Search Input -->
                <div class="relative">
                  <input 
                    type="text" 
                    id="visitsSearchInput"
                    placeholder="Search visits..."
                    class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
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
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <!-- Visitor Role Filter -->
                <select 
                  id="visitorRoleFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
                >
                  <option value="all">All Roles</option>
                  <option value="visitor">Visitor</option>
                  <option value="guest">Guest</option>
                </select>
              </div>
            </div>
          </div>
          <!-- Schedule Type Tabs -->
          <div class="flex flex-row flex-wrap gap-2 mb-4">
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
          <div id="scheduledVisitsList" class="space-y-4"></div>
        </div>
        <!-- Finished Schedules Content -->
        <div id="finishedContent" class="hidden space-y-4">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Finished Schedules</h3>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-4">
              <!-- Search and Filter Section -->
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3">
                <!-- Search Input -->
                <div class="relative">
                  <input 
                    type="text" 
                    id="finishedSearchInput"
                    placeholder="Search finished visits..."
                    class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
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
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
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
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
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
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
                >
                  <option value="all">All Roles</option>
                  <option value="visitor">Visitor</option>
                  <option value="guest">Guest</option>
                </select>
              </div>
            </div>
          </div>
          <!-- Finished Schedule Type Tabs -->
          <div class="flex flex-row flex-wrap gap-2 mb-4">
            <button 
              id="todayFinishedSchedulesTab"
              class="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
            >
              Today Finished
            </button>
            <button 
              id="pastFinishedSchedulesTab"
              class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
            >
              Past Finished
            </button>
          </div>
          <div id="finishedVisitsList" class="space-y-4"></div>
        </div>
      </div>

      <!-- Visitor Dashboard Content -->
      <div id="visitorContent" class="hidden bg-white dark:bg-gray-800 shadow rounded-lg p-2 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">My Scheduled Visits</h2>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-4">
            <button 
              id="refreshVisitorBtn"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
            >
              Refresh
            </button>
          </div>
        </div>
        <!-- Visitor Visits Content -->
        <div id="visitorVisitsContent" class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">My Visits</h3>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-4">
              <!-- Search and Filter Section -->
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3">
                <!-- Search Input -->
                <div class="relative">
                  <input 
                    type="text" 
                    id="visitorSearchInput"
                    placeholder="Search my visits..."
                    class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
                  >
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
                <!-- Status Filter -->
                <select 
                  id="visitorStatusFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="unsuccessful">Unsuccessful</option>
                </select>
                <!-- Date Filter -->
                <select 
                  id="visitorDateFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="future">Future</option>
                  <option value="past">Past</option>
                </select>
              </div>
            </div>
          </div>
          <div id="visitorVisitsList" class="space-y-4"></div>
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
function renderPlaces(): void {
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

    placesList.innerHTML = filteredPlaces.map((place: any) => `
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
                ${(place.assigned_personnel as any[]).map((personnel: any) => `
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
function renderAccounts(): void {
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
            ${(filteredAccounts as any[]).map((account: any) => `
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
async function renderLogs(): Promise<void> {
  const logsList = document.getElementById('logsList');
  if (logsList) {
    if (filteredLogs.length === 0) {
      logsList.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-600 dark:text-gray-300">No logs found matching your criteria.</p>
        </div>
      `;
      return;
    }

    // Format all log details asynchronously
    const formattedDetails = await Promise.all(
      (filteredLogs as any[]).map(async (log: any) => {
        const details = await formatLogDetails(log.details, log.action, log);
        // Determine action override for visit_scheduled logs
        let displayAction = log.action;
        if (log.action === 'visit_scheduled' && log.details) {
          let parsedDetails = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
          
          // Check current_status first
          if (parsedDetails.current_status === 'completed') {
            displayAction = 'visit_completed';
          } else if (parsedDetails.current_status === 'unsuccessful') {
            displayAction = 'visit_unsuccessful';
          }
          // If no current_status, check history events
          else if (Array.isArray(parsedDetails.history) && parsedDetails.history.length > 0) {
            const lastEvent = parsedDetails.history[parsedDetails.history.length - 1];
            if (lastEvent.event === 'completed') {
              displayAction = 'visit_completed';
            } else if (lastEvent.event === 'unsuccessful' || lastEvent.event === 'failed' || lastEvent.event === 'marked_unsuccessful') {
              displayAction = 'visit_unsuccessful';
            }
          }
        }
        return {
          ...log,
          formattedDetails: details,
          displayAction
        };
      })
    );

    logsList.innerHTML = `
      <!-- Desktop Table View (hidden on mobile) -->
      <div class="hidden lg:block overflow-x-auto">
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
            ${(formattedDetails as any[]).map((log: any) => `
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
                    log.displayAction === 'password_change' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    log.displayAction === 'place_update' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    log.displayAction === 'place_availability_toggle' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    log.displayAction === 'place_create' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    log.displayAction === 'personnel_assignment' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    log.displayAction === 'personnel_removal' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    log.displayAction === 'personnel_availability_change' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                    log.displayAction === 'visit_scheduled' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' :
                    log.displayAction === 'visit_completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                    log.displayAction === 'visit_unsuccessful' ? 'bg-gray-200 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }">
                    ${log.displayAction.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
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

      <!-- Mobile Card View (visible on mobile and tablet) -->
      <div class="lg:hidden space-y-4">
        ${(formattedDetails as any[]).map((log: any) => `
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4">
            <div class="flex flex-col space-y-3">
              <!-- Header with timestamp and action -->
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div class="flex-1">
                  <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    ${new Date(log.created_at).toLocaleString()}
                  </div>
                  <div class="text-sm text-gray-900 dark:text-white font-medium">
                    ${log.user_roles ? 
                      `${log.user_roles.first_name || ''} ${log.user_roles.last_name || ''}`.trim() || 
                      log.user_roles.email || 
                      'Unknown User' 
                      : 'Guest User'}
                  </div>
                  ${log.user_roles ? 
                    `<div class="text-xs text-gray-500 font-mono">${log.user_id.substring(0, 8)}...</div>` 
                    : ''}
                </div>
                <div class="flex-shrink-0">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    log.displayAction === 'password_change' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    log.displayAction === 'place_update' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    log.displayAction === 'place_availability_toggle' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    log.displayAction === 'place_create' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    log.displayAction === 'personnel_assignment' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    log.displayAction === 'personnel_removal' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    log.displayAction === 'personnel_availability_change' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                    log.displayAction === 'visit_scheduled' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' :
                    log.displayAction === 'visit_completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                    log.displayAction === 'visit_unsuccessful' ? 'bg-gray-200 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }">
                    ${log.displayAction.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                </div>
              </div>
              
              <!-- Details section -->
              <div class="border-t border-gray-200 dark:border-gray-600 pt-3">
                <div class="text-sm text-gray-900 dark:text-white">
                  ${log.formattedDetails}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // Set up history button event listeners after rendering
  setTimeout(() => {
    setupHistoryButtonListeners();
  }, 100);
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
      case 'visit_scheduled': {
        // Handle multi-place visits
        let placesHtml = '';
        let personnelHtml = '';
        
        // Check if this is a multi-place visit
        if (parsedDetails.place_ids && Array.isArray(parsedDetails.place_ids) && parsedDetails.place_ids.length > 1) {
          // Multi-place visit
          const placeNames = parsedDetails.place_names || [];
          placesHtml = `<div><span class="font-medium">Places (${parsedDetails.total_places || placeNames.length}):</span> ${placeNames.join(', ')}</div>`;
        } else if (parsedDetails.place_names && Array.isArray(parsedDetails.place_names) && parsedDetails.place_names.length === 1) {
          // Single place visit - use the place name from the log
          placesHtml = `<div><span class="font-medium">Place:</span> ${parsedDetails.place_names[0]}</div>`;
        } else if (parsedDetails.place_ids && Array.isArray(parsedDetails.place_ids) && parsedDetails.place_ids.length === 1) {
          // Single place visit - try to get place name from database
          const visitPlaceName = await getPlaceName(parsedDetails.place_ids[0]);
          placesHtml = `<div><span class="font-medium">Place:</span> ${visitPlaceName}</div>`;
        } else {
          // Fallback
          placesHtml = `<div><span class="font-medium">Place:</span> Unknown</div>`;
        }
        
        // Check if the visit has a current status (e.g., marked as unsuccessful or completed)
        let statusHtml = '';
        if (parsedDetails.current_status) {
          const statusClass = parsedDetails.current_status === 'unsuccessful' 
            ? 'text-red-600 dark:text-red-400 font-semibold' 
            : 'text-green-600 dark:text-green-400 font-semibold';
          const statusText = parsedDetails.current_status === 'unsuccessful' ? 'Unsuccessful' : 'Completed';
          statusHtml = `<div><span class="font-medium">Current Status:</span> <span class="${statusClass}">${statusText}</span></div>`;
        }
        
        // Show personnel who completed places for multi-visit schedules
        if (Array.isArray(parsedDetails.history) && parsedDetails.history.length > 0) {
          const completedEvents = parsedDetails.history.filter((event: any) => 
            event.event === 'place_completed' || event.event === 'completed'
          );
          
          if (completedEvents.length > 0) {
            const personnelIds = [...new Set(completedEvents.map((event: any) => event.details?.by).filter(id => id))];
            if (personnelIds.length > 0) {
              const personnelNames = await Promise.all(
                personnelIds.map(async (personnelId: string) => {
                  return await getUserName(personnelId);
                })
              );
              personnelHtml = `<div><span class="font-medium">Completed by:</span> ${personnelNames.join(', ')}</div>`;
            }
          }
        }
        
        let historyHtml = '';
        if (Array.isArray(parsedDetails.history) && parsedDetails.history.length > 0) {
          const historyId = `history-${log?.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const historyItems = parsedDetails.history.map((event: any) => {
            const eventType = event.event ? event.event.charAt(0).toUpperCase() + event.event.slice(1) : 'Event';
            const eventTime = event.timestamp ? new Date(event.timestamp).toLocaleString() : '';
            let details = '';
            if (event.details) {
              if (event.details.by) {
                details += `<span class='text-xs text-gray-500'>(By: ${event.details.by})</span> `;
              }
              if (event.details.purpose) {
                details += `<span class='text-xs text-gray-500'>Purpose: ${event.details.purpose}</span> `;
              }
              if (event.details.note) {
                details += `<span class='text-xs text-gray-500'>Note: ${event.details.note}</span> `;
              }
              if (event.details.reason) {
                details += `<span class='text-xs text-red-500'>Reason: ${event.details.reason}</span> `;
              }
              if (event.details.auto_marked) {
                details += `<span class='text-xs text-orange-500'>(Auto-marked by system)</span> `;
              }
              if (event.details.place_name) {
                details += `<span class='text-xs text-blue-500'>Place: ${event.details.place_name}</span> `;
              }
              if (event.details.completed_places) {
                details += `<span class='text-xs text-green-500'>Places: ${event.details.completed_places.join(', ')}</span> `;
              }
            }
            return `<li class="py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0"><span class='font-semibold'>${eventType}</span> <span class='text-xs text-gray-400'>${eventTime}</span> ${details}</li>`;
          }).join('');
          
          historyHtml = `
            <div class="mt-2">
              <button 
                class="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 text-sm font-medium flex items-center gap-1 w-full justify-between p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 touch-manipulation"
                id="btn-${historyId}"
                style="min-height: 44px; -webkit-tap-highlight-color: transparent;"
              >
                <span>See History (${parsedDetails.history.length} events)</span>
                <svg class="w-4 h-4 transition-transform duration-200 flex-shrink-0" id="icon-${historyId}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div class="hidden mt-2 bg-gray-50 dark:bg-gray-800 rounded-md p-3" id="${historyId}">
                <ul class="space-y-1 text-sm">
                  ${historyItems}
                </ul>
              </div>
            </div>`;
        }
        return `<div><span class="font-medium">Visitor:</span> ${parsedDetails.visitor_name || 'Unknown visitor'}</div><div><span class="font-medium">Date:</span> ${new Date(parsedDetails.visit_date).toLocaleDateString()}</div>${placesHtml}<div><span class="font-medium">Purpose:</span> ${parsedDetails.purpose || 'Not specified'}</div>${personnelHtml}${statusHtml}${historyHtml}`;
      }
      case 'visit_completed':
        const completedVisitPlaceName = await getPlaceName(parsedDetails.place_id);
        return `<div><span class="font-medium">Visit ID:</span> ${parsedDetails.visit_id ? parsedDetails.visit_id.substring(0, 8) + '...' : 'Unknown'}</div><div><span class="font-medium">Place:</span> ${completedVisitPlaceName}</div><div><span class="font-medium">Completed:</span> ${new Date(parsedDetails.completed_at).toLocaleString()}</div>`;
      case 'visit_unsuccessful': {
        // Show details for unsuccessful visits (system auto-mark or manual mark)
        let when = parsedDetails.marked_at || parsedDetails.executed_at || parsedDetails.completed_at;
        let whenStr = when ? new Date(when).toLocaleString() : 'Unknown';
        let reason = parsedDetails.reason || 'The visit was not completed on or before the scheduled date.';
        let placesHtml = '';
        
        // Handle place information - could be single place_id or array of places
        if (parsedDetails.places && Array.isArray(parsedDetails.places)) {
          // Multi-place visit from cleanup logs
          const placeNames = parsedDetails.places.map((place: any) => {
            const statusClass = place.status === 'completed' ? 'text-green-600' : 'text-red-600';
            return `<span class="${statusClass}">${place.place_name || 'Unknown Place'}</span>`;
          }).join(', ');
          placesHtml = `<div><span class="font-medium">Places:</span> ${placeNames}</div>`;
        } else if (parsedDetails.place_names && Array.isArray(parsedDetails.place_names)) {
          // Multi-place visit from original scheduling
          const placeNames = parsedDetails.place_names.map((name: string) => 
            `<span class="text-blue-600">${name}</span>`
          ).join(', ');
          placesHtml = `<div><span class="font-medium">Places:</span> ${placeNames}</div>`;
        } else if (parsedDetails.place_id) {
          // Single place visit - try to get place name from database
          const visitPlaceName = await getPlaceName(parsedDetails.place_id);
          if (visitPlaceName) {
            placesHtml = `<div><span class="font-medium">Place:</span> ${visitPlaceName}</div>`;
          }
        }
        
        let detailsHtml = `<div>This visit was <span class="font-semibold text-red-600">marked as unsuccessful</span> on <span class="font-medium">${whenStr}</span>.<br><span class="font-medium">Reason:</span> ${reason}</div>`;
        
        // Add place information if available
        if (placesHtml) {
          detailsHtml += placesHtml;
        }
        
        // Add visitor information if available
        if (parsedDetails.visitor_name) {
          detailsHtml += `<div><span class="font-medium">Visitor:</span> ${parsedDetails.visitor_name}</div>`;
        }
        
        // Add visit date if available
        if (parsedDetails.visit_date) {
          detailsHtml += `<div><span class="font-medium">Scheduled Date:</span> ${new Date(parsedDetails.visit_date).toLocaleDateString()}</div>`;
        }
        
        // Add additional details for auto-marked visits
        if (parsedDetails.action === 'auto_mark_past_visits') {
          detailsHtml += `<div><span class="font-medium">Action:</span> <span class="text-blue-600">Automatic system cleanup</span></div>`;
          if (parsedDetails.affected_visits) {
            detailsHtml += `<div><span class="font-medium">Total visits affected:</span> ${parsedDetails.affected_visits}</div>`;
          }
          if (parsedDetails.past_date_visits) {
            detailsHtml += `<div><span class="font-medium">Past date visits:</span> ${parsedDetails.past_date_visits}</div>`;
          }
          if (parsedDetails.end_of_day_visits) {
            detailsHtml += `<div><span class="font-medium">End of day visits:</span> ${parsedDetails.end_of_day_visits}</div>`;
          }
        }
        
        return detailsHtml;
      }
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
    // Use a submission flag to prevent duplicates while preserving form content
    let isSubmitting = false;
    const safeHandleSubmit = async (e: Event) => {
      if (isSubmitting) {
        e.preventDefault();
        return;
      }
      isSubmitting = true;
      await handleSubmit(e);
      isSubmitting = false;
    };
    
    // Remove existing listeners and add the safe one
    form.removeEventListener('submit', handleSubmit);
    form.removeEventListener('submit', safeHandleSubmit);
    form.addEventListener('submit', safeHandleSubmit);
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

  // Refresh personnel dashboard button
  const refreshPersonnelBtn = document.getElementById('refreshPersonnelBtn');
  if (refreshPersonnelBtn) {
    refreshPersonnelBtn.addEventListener('click', async () => {
      try {
        // Show loading state
        (refreshPersonnelBtn as HTMLButtonElement).disabled = true;
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
        (refreshPersonnelBtn as HTMLButtonElement).disabled = false;
        refreshPersonnelBtn.textContent = 'Refresh';
      }
    });
  }

  // Refresh visits button
  const refreshVisitsBtn = document.getElementById('refreshVisitsBtn');
  if (refreshVisitsBtn) {
    refreshVisitsBtn.addEventListener('click', async () => {
      try {
        // Show loading state
        (refreshVisitsBtn as HTMLButtonElement).disabled = true;
        refreshVisitsBtn.innerHTML = `
          <svg class="w-4 h-4 inline mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Refreshing...`;
        
        // Load scheduled visits with real-time data
        await loadScheduledVisits();
        
        // Show success notification
        showNotification('Visits refreshed successfully!', 'success');
      } catch (error) {
        console.error('Error refreshing visits:', error);
        showNotification('Error refreshing visits. Please try again.', 'error');
      } finally {
        // Reset button state
        (refreshVisitsBtn as HTMLButtonElement).disabled = false;
        refreshVisitsBtn.innerHTML = `
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Refresh`;
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

        // Create a unique handler function for this instance
        const handleSubmit = async (e: Event) => {
          e.preventDefault();
          
          // Prevent multiple submissions
          if (submitBtn && submitBtn.disabled) {
            return;
          }
          
          // Show loading state
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Adding...';
          }
          
          try {
            // Debug: Log the form values before sending to database
            console.log('Form values being sent to database:', {
              name: nameInput.value,
              description: descriptionInput.value,
              descriptionLength: descriptionInput.value.length,
              location: locationInput.value
            });
            
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
            
          } catch (error) {
            console.error('Error in place creation:', error);
            showNotification('Error adding place. Please try again.', 'error');
          } finally {
            // Reset button state
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Add Place';
            }
          }
        };

        // Remove any existing submit handlers and add the new one
        // Use a submission flag to prevent duplicates while preserving form content
        let isSubmitting = false;
        const safeHandleSubmit = async (e: Event) => {
          if (isSubmitting) {
            e.preventDefault();
            return;
          }
          isSubmitting = true;
          await handleSubmit(e);
          isSubmitting = false;
        };
        
        // Remove existing listeners and add the safe one
        form.removeEventListener('submit', handleSubmit);
        form.removeEventListener('submit', safeHandleSubmit);
        form.addEventListener('submit', safeHandleSubmit);
      }
    });
  }

  // Refresh logs button
  const refreshLogsBtn = document.getElementById('refreshLogsBtn');
  console.log('Refresh logs button found:', !!refreshLogsBtn);
  if (refreshLogsBtn) {
    refreshLogsBtn.addEventListener('click', async () => {
      console.log('Refresh logs button clicked');
      try {
        // Show loading state
        (refreshLogsBtn as HTMLButtonElement).disabled = true;
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
        (refreshLogsBtn as HTMLButtonElement).disabled = false;
        refreshLogsBtn.textContent = 'Refresh Logs';
      }
    });
  } else {
    console.warn('Refresh logs button not found');
  }

  // Cleanup visits button
  const cleanupVisitsBtn = document.getElementById('cleanupVisitsBtn');
  console.log('Cleanup visits button found:', !!cleanupVisitsBtn);
  if (cleanupVisitsBtn) {
    cleanupVisitsBtn.addEventListener('click', async () => {
      console.log('Cleanup visits button clicked');
      try {
        // Show confirmation dialog
        const confirmed = confirm('Are you sure you want to cleanup past visits? This will mark all pending visits from past dates as unsuccessful.');
        if (!confirmed) {
          return;
        }

        // Show loading state
        (cleanupVisitsBtn as HTMLButtonElement).disabled = true;
        cleanupVisitsBtn.textContent = 'Cleaning up...';
        
        // Call the cleanup function
        const { data, error } = await supabase.rpc('manual_cleanup_past_visits');
        
        if (error) {
          console.error('Error cleaning up past visits:', error);
          showNotification('Error cleaning up past visits: ' + error.message, 'error');
        } else {
          const result = JSON.parse(data);
          showNotification(`Cleanup completed! ${result.affected_visits} visits marked as unsuccessful.`, 'success');
          
          // Reload logs to show the cleanup action
          await loadLogs();
        }
      } catch (error) {
        console.error('Error in cleanup:', error);
        showNotification('Error cleaning up past visits', 'error');
      } finally {
        // Reset button state
        (cleanupVisitsBtn as HTMLButtonElement).disabled = false;
        cleanupVisitsBtn.textContent = 'Cleanup Past Visits';
      }
    });
  } else {
    console.warn('Cleanup visits button not found');
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

  // Finished schedule type tabs event listeners
  const todayFinishedSchedulesTab = document.getElementById('todayFinishedSchedulesTab');
  const pastFinishedSchedulesTab = document.getElementById('pastFinishedSchedulesTab');

  if (todayFinishedSchedulesTab) {
    todayFinishedSchedulesTab.addEventListener('click', async () => {
      currentFinishedScheduleType = 'today';
      updateFinishedScheduleTypeTabs();
      applyFinishedFilters();
    });
  }

  if (pastFinishedSchedulesTab) {
    pastFinishedSchedulesTab.addEventListener('click', async () => {
      currentFinishedScheduleType = 'past';
      updateFinishedScheduleTypeTabs();
      applyFinishedFilters();
    });
  }

  // Initialize tab visual states
  updateScheduleTypeTabs();
  updateFinishedScheduleTypeTabs();

  console.log('Dashboard event listeners setup complete');
}

// Function to update schedule type tab visual states
function updateScheduleTypeTabs() {
  const allSchedulesTab = document.getElementById('allSchedulesTab') as HTMLButtonElement;
  const todaySchedulesTab = document.getElementById('todaySchedulesTab') as HTMLButtonElement;
  const futureSchedulesTab = document.getElementById('futureSchedulesTab') as HTMLButtonElement;

  // Reset all tabs to inactive state
  if (allSchedulesTab) {
    allSchedulesTab.classList.remove('bg-blue-600', 'text-white');
    allSchedulesTab.classList.add('bg-gray-100', 'text-gray-700');
  }
  if (todaySchedulesTab) {
    todaySchedulesTab.classList.remove('bg-blue-600', 'text-white');
    todaySchedulesTab.classList.add('bg-gray-100', 'text-gray-700');
  }
  if (futureSchedulesTab) {
    futureSchedulesTab.classList.remove('bg-blue-600', 'text-white');
    futureSchedulesTab.classList.add('bg-gray-100', 'text-gray-700');
  }

  // Set active tab based on current schedule type
  switch (currentScheduleType) {
    case 'all':
      if (allSchedulesTab) {
        allSchedulesTab.classList.add('bg-blue-600', 'text-white');
        allSchedulesTab.classList.remove('bg-gray-100', 'text-gray-700');
      }
      break;
    case 'today':
      if (todaySchedulesTab) {
        todaySchedulesTab.classList.add('bg-blue-600', 'text-white');
        todaySchedulesTab.classList.remove('bg-gray-100', 'text-gray-700');
      }
      break;
    case 'future':
      if (futureSchedulesTab) {
        futureSchedulesTab.classList.add('bg-blue-600', 'text-white');
        futureSchedulesTab.classList.remove('bg-gray-100', 'text-gray-700');
      }
      break;
  }
}

// Function to update finished schedule type tab visual states
function updateFinishedScheduleTypeTabs() {
  const todayFinishedSchedulesTab = document.getElementById('todayFinishedSchedulesTab') as HTMLButtonElement;
  const pastFinishedSchedulesTab = document.getElementById('pastFinishedSchedulesTab') as HTMLButtonElement;

  // Reset all tabs to inactive state
  if (todayFinishedSchedulesTab) {
    todayFinishedSchedulesTab.classList.remove('bg-blue-600', 'text-white');
    todayFinishedSchedulesTab.classList.add('bg-gray-100', 'text-gray-700');
  }
  if (pastFinishedSchedulesTab) {
    pastFinishedSchedulesTab.classList.remove('bg-blue-600', 'text-white');
    pastFinishedSchedulesTab.classList.add('bg-gray-100', 'text-gray-700');
  }

  // Set active tab based on current finished schedule type
  switch (currentFinishedScheduleType) {
    case 'today':
      if (todayFinishedSchedulesTab) {
        todayFinishedSchedulesTab.classList.add('bg-blue-600', 'text-white');
        todayFinishedSchedulesTab.classList.remove('bg-gray-100', 'text-gray-700');
      }
      break;
    case 'past':
      if (pastFinishedSchedulesTab) {
        pastFinishedSchedulesTab.classList.add('bg-blue-600', 'text-white');
        pastFinishedSchedulesTab.classList.remove('bg-gray-100', 'text-gray-700');
      }
      break;
    default:
      // Default to 'today' if no valid state
      currentFinishedScheduleType = 'today';
      if (todayFinishedSchedulesTab) {
        todayFinishedSchedulesTab.classList.add('bg-blue-600', 'text-white');
        todayFinishedSchedulesTab.classList.remove('bg-gray-100', 'text-gray-700');
      }
      break;
  }
}

// Initialize dashboard event listeners
setTimeout(() => {
  setupDashboardEventListeners();
}, 100);

// Cleanup auto-refresh when page is unloaded
window.addEventListener('beforeunload', () => {
  stopVisitsAutoRefresh();
});

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

      // Check if this personnel is already assigned to another place
      let alreadyAssignedPlace = null;
      try {
        const { data: assignments, error: assignmentError } = await supabase
          .from('place_personnel')
          .select('place_id')
          .eq('personnel_id', selectedPersonnelId);
        if (assignmentError) throw assignmentError;
        if (assignments && assignments.length > 0) {
          // If assigned to a different place (not this one)
          if (!assignments.some(a => a.place_id === placeId)) {
            alreadyAssignedPlace = assignments[0].place_id;
          }
        }
      } catch (err) {
        if (errorDiv) {
          errorDiv.textContent = 'Error checking personnel assignment';
          errorDiv.classList.remove('hidden');
        }
        return;
      }

      // If already assigned elsewhere, show double confirmation modal
      if (alreadyAssignedPlace) {
        // Create or show a custom confirmation modal
        let doubleConfirmModal = document.getElementById('doubleConfirmModal');
        if (!doubleConfirmModal) {
          doubleConfirmModal = document.createElement('div');
          doubleConfirmModal.id = 'doubleConfirmModal';
          doubleConfirmModal.className = 'fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50';
          doubleConfirmModal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
              <h2 class="text-xl font-bold mb-4 text-red-600">Personnel Already Assigned</h2>
              <p class="mb-6 text-gray-700 dark:text-gray-200">This personnel is already assigned to another place. Are you sure you want to assign them to this place as well?</p>
              <div class="flex justify-end gap-2">
                <button id="doubleConfirmCancel" class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800">Cancel</button>
                <button id="doubleConfirmProceed" class="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white">Yes, Assign</button>
              </div>
            </div>
          `;
          document.body.appendChild(doubleConfirmModal);
        } else {
          doubleConfirmModal.classList.remove('hidden');
        }
        // Add event listeners
        document.getElementById('doubleConfirmCancel').onclick = () => {
          doubleConfirmModal.classList.add('hidden');
          assignBtn.disabled = false;
          assignBtn.textContent = 'Assign Personnel';
        };
        document.getElementById('doubleConfirmProceed').onclick = async () => {
          doubleConfirmModal.classList.add('hidden');
          await actuallyAssignPersonnel();
        };
        // Reset button state
        assignBtn.disabled = false;
        assignBtn.textContent = 'Assign Personnel';
        return;
      }

      // If not already assigned elsewhere, proceed as normal
      await actuallyAssignPersonnel();

      async function actuallyAssignPersonnel() {
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

        } catch (err) {
        if (errorDiv) {
          errorDiv.textContent = err.message || 'Error assigning personnel';
          errorDiv.classList.remove('hidden');
        }
      } finally {
        // Reset button state
        assignBtn.disabled = false;
        assignBtn.textContent = 'Assign Personnel';
        }
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
    // Get personnel's assigned places and availability
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

    // Check if personnel is assigned to any places
    const isAssigned = availabilityData && availabilityData.length > 0;
    updatePersonnelButtonStates(isAssigned);

    if (personnelAssignmentInfo) {
      if (isAssigned) {
        // Show all assignments
        personnelAssignmentInfo.innerHTML = availabilityData.map((assignment: any) => `
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6 mb-4">
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
        `).join('');
      } else {
        personnelAssignmentInfo.innerHTML = `
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <div class="text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Assignment</h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">You are not currently assigned to any place.</p>
              <p class="mt-2 text-xs text-gray-400 dark:text-gray-500">Contact an administrator to get assigned to a place.</p>
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

// Function to update personnel button states based on assignment
function updatePersonnelButtonStates(isAssigned: boolean) {
  const visitsTab = document.getElementById('visitsTab') as HTMLButtonElement;
  const finishedTab = document.getElementById('finishedTab') as HTMLButtonElement;
  const refreshVisitsBtn = document.getElementById('refreshVisitsBtn') as HTMLButtonElement;
  
  if (visitsTab) {
    if (isAssigned) {
      visitsTab.disabled = false;
      visitsTab.classList.remove('opacity-50', 'cursor-not-allowed');
      visitsTab.classList.add('hover:bg-gray-200');
      visitsTab.title = 'View scheduled visits';
    } else {
      visitsTab.disabled = true;
      visitsTab.classList.add('opacity-50', 'cursor-not-allowed');
      visitsTab.classList.remove('hover:bg-gray-200');
      visitsTab.title = 'You must be assigned to a place to view scheduled visits';
    }
  }
  
  if (finishedTab) {
    if (isAssigned) {
      finishedTab.disabled = false;
      finishedTab.classList.remove('opacity-50', 'cursor-not-allowed');
      finishedTab.classList.add('hover:bg-gray-200');
      finishedTab.title = 'View finished schedules';
    } else {
      finishedTab.disabled = true;
      finishedTab.classList.add('opacity-50', 'cursor-not-allowed');
      finishedTab.classList.remove('hover:bg-gray-200');
      finishedTab.title = 'You must be assigned to a place to view finished schedules';
    }
  }
  
  if (refreshVisitsBtn) {
    if (isAssigned) {
      refreshVisitsBtn.disabled = false;
      refreshVisitsBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      refreshVisitsBtn.classList.add('hover:bg-blue-700');
      refreshVisitsBtn.title = 'Refresh visits data';
    } else {
      refreshVisitsBtn.disabled = true;
      refreshVisitsBtn.classList.add('opacity-50', 'cursor-not-allowed');
      refreshVisitsBtn.classList.remove('hover:bg-blue-700');
      refreshVisitsBtn.title = 'You must be assigned to a place to refresh visits';
    }
  }
}

// Global variables for visits
let allScheduledVisits: any[] = [];
let allFinishedVisits: any[] = [];
let currentScheduleType = 'all'; // 'all', 'today', 'future'
let currentFinishedScheduleType = 'today'; // 'today', 'past'
let currentSearchTerm = '';
let currentStatusFilter = 'all';
let currentRoleFilter = 'all';
let currentFinishedSearchTerm = '';
let currentFinishedRoleFilter = 'all';
let currentFinishedDateFilter = 'all';
let currentFinishedSpecificDate = '';
let visitsRefreshInterval: NodeJS.Timeout | null = null; // For auto-refresh
let lastVisitsRefresh = 0; // Track last refresh time

// Function to load scheduled visits for personnel
async function loadScheduledVisits() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found');
      return;
    }

    console.log('Loading scheduled visits for user:', user.id);

    // First, check if the user has personnel role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError) {
      console.error('Error checking user role:', roleError);
      showNotification('Error checking user permissions', 'error');
      return;
    }

    if (roleData?.role !== 'personnel') {
      console.log('User does not have personnel role:', roleData?.role);
      showNotification('You do not have permission to view scheduled visits', 'error');
      return;
    }

    // Check if the user is assigned to any places
    const { data: assignments, error: assignmentError } = await supabase
      .from('place_personnel')
      .select('place_id, place:place_id(name)')
      .eq('personnel_id', user.id);
    if (assignmentError) {
      console.error('Error checking personnel assignments:', assignmentError);
      showNotification('Error checking personnel assignments', 'error');
      return;
    }
    if (!assignments || assignments.length === 0) {
      console.log('User is not assigned to any places');
      allScheduledVisits = [];
      await applyVisitsFilters();
      return;
    }
    // --- Place filter UI ---
    const visitsContent = document.getElementById('visitsContent');
    let placeFilterDiv = document.getElementById('placeFilterDiv');
    if (!placeFilterDiv && visitsContent) {
      placeFilterDiv = document.createElement('div');
      placeFilterDiv.id = 'placeFilterDiv';
      placeFilterDiv.className = 'mb-4';
      visitsContent.prepend(placeFilterDiv);
    }
    if (placeFilterDiv) {
      if (assignments.length > 1) {
        placeFilterOptions = assignments.map((a: any) => ({ id: a.place_id, name: a.place?.name || a.place_id }));
        placeFilterDiv.innerHTML = `<label for="placeFilterSelect" class="mr-2 font-medium">Filter by Place:</label>
          <select id="placeFilterSelect" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
            <option value="all">All</option>
            ${placeFilterOptions.map((opt: any) => `<option value="${opt.id}">${opt.name}</option>`).join('')}
          </select>`;
        const placeFilterSelect = document.getElementById('placeFilterSelect') as HTMLSelectElement;
        placeFilterSelect.value = currentPlaceFilter;
        placeFilterSelect.onchange = (e) => {
          currentPlaceFilter = (e.target as HTMLSelectElement).value;
          applyVisitsFilters();
        };
      } else {
        placeFilterDiv.innerHTML = '';
        currentPlaceFilter = 'all';
      }
    }
    
    // --- Call database function to mark past visits as unsuccessful ---
    try {
      const { data: markResult, error: markError } = await supabase.rpc('mark_past_visits_unsuccessful');
      if (markError) {
        console.error('Error marking past visits as unsuccessful:', markError);
      } else if (markResult && markResult > 0) {
        console.log(`Marked ${markResult} past visits as unsuccessful`);
      }
    } catch (markErr) {
      console.error('Error calling mark_past_visits_unsuccessful:', markErr);
    }
    
    // --- Get scheduled visits for this personnel ---
    let scheduledVisits;
    let error;
    try {
      const result = await supabase.rpc('get_personnel_scheduled_visits', {
        p_personnel_id: user.id
      });
      scheduledVisits = result.data;
      error = result.error;
    } catch (rpcError) {
      console.error('RPC call threw an exception:', rpcError);
      error = rpcError;
    }
    if (error) {
      console.error('Error loading scheduled visits:', error);
      showNotification('Error loading scheduled visits: ' + error.message, 'error');
      return;
    }
    
    // Store all visits for filtering
    allScheduledVisits = scheduledVisits || [];
    // Apply filters and display
    await applyVisitsFilters();
  } catch (error) {
    console.error('Error loading scheduled visits:', error);
    showNotification('Error loading scheduled visits', 'error');
  }
}

// Function to start auto-refresh for scheduled visits
function startVisitsAutoRefresh() {
  // Clear existing interval if any
  if (visitsRefreshInterval) {
    clearInterval(visitsRefreshInterval);
  }

  // Refresh every 30 seconds to ensure real-time updates
  visitsRefreshInterval = setInterval(async () => {
    // Only refresh if the visits tab is currently visible
    const visitsContent = document.getElementById('visitsContent');
    if (visitsContent && !visitsContent.classList.contains('hidden')) {
      console.log('Auto-refreshing scheduled visits...');
      await loadScheduledVisits();
    }
  }, 30000); // 30 seconds
}

// Function to stop auto-refresh
function stopVisitsAutoRefresh() {
  if (visitsRefreshInterval) {
    clearInterval(visitsRefreshInterval);
    visitsRefreshInterval = null;
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

    // Check if the user has personnel role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError) {
      console.error('Error checking user role:', roleError);
      return;
    }

    if (roleData?.role !== 'personnel') {
      console.log('User does not have personnel role:', roleData?.role);
      return;
    }

    // Check if the user is assigned to any places
    const { data: assignments, error: assignmentError } = await supabase
      .from('place_personnel')
      .select('place_id')
      .eq('personnel_id', user.id);

    if (assignmentError) {
      console.error('Error checking personnel assignments:', assignmentError);
      return;
    }

    if (!assignments || assignments.length === 0) {
      console.log('User is not assigned to any places');
      allFinishedVisits = [];
      applyFinishedFilters();
      return;
    }

    // Get all visits for places this personnel is assigned to
    const { data: visits, error: visitsError } = await supabase.rpc('get_personnel_scheduled_visits', {
      p_personnel_id: user.id
    });

    if (visitsError) throw visitsError;

    // Filter for completed and unsuccessful visits
    const finishedVisits = (visits || []).filter(visit => visit.status === 'completed' || visit.status === 'unsuccessful');

    // Get unique personnel IDs who completed or marked visits as unsuccessful
    const personnelIds = [...new Set(finishedVisits.map(visit => visit.completed_by).filter(id => id))];
    
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
    allFinishedVisits = finishedVisits.map(visit => ({
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

  // Filter out unsuccessful visits from scheduled visits view (personnel should not see unsuccessful visits)
  filteredVisits = filteredVisits.filter(visit => visit.status !== 'unsuccessful');

  // Apply schedule type filter using Philippine time
  const philippineToday = await getCurrentPhilippineDateFromDB();

  switch (currentScheduleType) {
    case 'today':
      // Show all pending visits scheduled for today or any past date (overdue)
      filteredVisits = filteredVisits.filter(visit => {
        const visitDate = parseDateAsPhilippine(visit.visit_date);
        visitDate.setHours(0, 0, 0, 0);
        const philippineVisitDate = toPhilippineTime(visitDate);
        philippineVisitDate.setHours(0, 0, 0, 0);
        // Show if visit date is today or before today (overdue), and still pending
        return philippineVisitDate.getTime() <= philippineToday.getTime() && visit.status === 'pending';
      });
      break;
    case 'future':
      filteredVisits = filteredVisits.filter(visit => {
        const visitDate = parseDateAsPhilippine(visit.visit_date);
        visitDate.setHours(0, 0, 0, 0);
        const philippineVisitDate = toPhilippineTime(visitDate);
        philippineVisitDate.setHours(0, 0, 0, 0);
        return philippineVisitDate.getTime() > philippineToday.getTime();
      });
      break;
    // 'all' case - no filtering needed
  }

  // Apply status filter (but still exclude unsuccessful visits)
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

  // Place filter for personnel
  if (currentPlaceFilter !== 'all') {
    filteredVisits = filteredVisits.filter(visit => visit.place_id === currentPlaceFilter);
  }

  await displayScheduledVisits(filteredVisits);
}

// Display filtered visits
async function displayScheduledVisits(visits: any[]): Promise<void> {
  const visitsList = document.getElementById('scheduledVisitsList');
  if (!visitsList) return;

  if (visits.length === 0) {
    visitsList.innerHTML = `
      <div class="text-center py-8">
        <div class="text-gray-500 dark:text-gray-400 text-lg">No scheduled visits found</div>
        <div class="text-gray-400 dark:text-gray-500 text-sm mt-2">
          ${currentSearchTerm || currentStatusFilter !== 'all' || currentRoleFilter !== 'all' || currentScheduleType !== 'all' 
            ? 'Try adjusting your search or filters' 
            : 'No visits are currently scheduled'}
        </div>
        <div class="text-xs text-gray-400 dark:text-gray-500 mt-4">
          Last updated: ${new Date().toLocaleTimeString()} (Auto-refreshing every 30 seconds)
        </div>
      </div>
    `;
    return;
  }

  // Get real-time Philippine date for accurate comparison
  const philippineToday = await getCurrentPhilippineDateFromDB();

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
        
        userAssignments = (assignments as any[])?.map((a: any) => a.place_id) || [];
      }
    } catch (error) {
      console.error('Error checking user permissions:', error);
    }
  }

  visitsList.innerHTML = (visits as any[]).map((visit: any) => {
    const visitorName = `${visit.visitor_first_name} ${visit.visitor_last_name}`;
    const visitorEmail = visit.visitor_email || 'No email';
    const visitorRole = visit.visitor_role || 'guest';
    const isLoggedIn = visit.visitor_user_id !== null;
    const visitorId = isLoggedIn ? visit.visitor_user_id : 'guest';
    const scheduledDate = new Date(visit.visit_date).toLocaleDateString();
    const scheduledTime = new Date(visit.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const statusColors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      unsuccessful: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    const roleColors: { [key: string]: string } = {
      visitor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      guest: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };

    // Use strict YYYY-MM-DD string comparison for visit date and Philippine date
    const visitDateStr = (visit.visit_date || '').split('T')[0];
    // Debug log
    console.log('[DATE DEBUG] visitDateStr:', visitDateStr, 'currentDateStr:', philippineToday.toISOString().split('T')[0]);

    const canComplete = userRole === 'personnel' && 
                       userAssignments.includes(visit.place_id) && 
                       visit.place_status === 'pending' &&
                       visitDateStr === philippineToday.toISOString().split('T')[0];

    // Check if user meets basic requirements but visit is in the future
    const meetsBasicRequirements = userRole === 'personnel' && 
                                  userAssignments.includes(visit.place_id) && 
                                  visit.place_status === 'pending';
    const isFutureVisit = visitDateStr > philippineToday.toISOString().split('T')[0];

    // Show multi-place visit indicator
    const multiPlaceIndicator = visit.total_places > 1 ? `
      <div class="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-blue-800 dark:text-blue-200">Multi-Place Visit</span>
          <span class="text-sm text-blue-600 dark:text-blue-400">${visit.completed_places}/${visit.total_places} places completed</span>
        </div>
        <div class="mt-1 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
          <div class="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style="width: ${visit.total_places > 0 ? (visit.completed_places / visit.total_places) * 100 : 0}%"></div>
        </div>
      </div>
    ` : '';

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
            <span class="px-2 py-1 rounded-full text-xs font-medium ${(statusColors as any)[visit.status] || statusColors.pending}">
              ${visit.status}
            </span>
            <span class="px-2 py-1 rounded-full text-xs font-medium ${(roleColors as any)[visitorRole] || roleColors.guest}">
              ${visitorRole}
            </span>
          </div>
        </div>
        
        ${multiPlaceIndicator}
        
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
        
        <div class="mb-4">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Your Assignment</p>
          <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 ${visit.place_status === 'completed' ? 'border-green-400' : visit.place_status === 'unsuccessful' || visit.place_status === 'failed' ? 'border-red-400' : 'border-yellow-400'}">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">${visit.place_name || 'Unknown Place'}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">${visit.place_location || 'No location specified'}</p>
              </div>
              <span class="px-2 py-1 rounded-full text-xs font-medium ${(statusColors as any)[visit.place_status] || statusColors.pending}">
                ${visit.place_status === 'completed' ? 'Completed' : visit.place_status === 'unsuccessful' || visit.place_status === 'failed' ? 'Failed' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
        
        ${canComplete ? `
          <div class="flex justify-end">
            <button 
              onclick="completeVisitPlace('${visit.visit_id}', '${visit.place_id}')"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium"
            >
              Mark Place Complete
            </button>
          </div>
        ` : meetsBasicRequirements && isFutureVisit ? `
          <div class="flex justify-end">
            <div class="px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-sm font-medium">
              Cannot complete - scheduled for future date (${scheduledDate})
            </div>
          </div>
        ` : visit.place_status === 'completed' ? `
          <div class="flex justify-end">
            <div class="px-4 py-2 bg-green-100 text-green-700 rounded-md text-sm font-medium">
              ✓ Place completed
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Setup visitor dashboard event listeners
function setupVisitorDashboardEventListeners() {
  // Refresh button event listener
  const refreshVisitorBtn = document.getElementById('refreshVisitorBtn');
  if (refreshVisitorBtn) {
    refreshVisitorBtn.addEventListener('click', async () => {
      try {
        // Show loading state
        refreshVisitorBtn.disabled = true;
        refreshVisitorBtn.textContent = 'Refreshing...';
        
        // Reload visitor visits
        await loadVisitorVisits();
        
        // Show success notification
        showNotification('Visits refreshed successfully', 'success');
      } catch (error) {
        console.error('Error refreshing visits:', error);
        showNotification('Error refreshing visits', 'error');
      } finally {
        // Reset button state
        refreshVisitorBtn.disabled = false;
        refreshVisitorBtn.textContent = 'Refresh';
      }
    });
    console.log('Refresh button event listener added');
  } else {
    console.error('Refresh button not found');
  }

  // Search input event listener
  const visitorSearchInput = document.getElementById('visitorSearchInput') as HTMLInputElement;
  if (visitorSearchInput) {
    visitorSearchInput.addEventListener('input', debounce(() => {
      currentVisitorSearchTerm = visitorSearchInput.value;
      applyVisitorFilters();
    }, 300));
  }

  // Status filter event listener
  const visitorStatusFilter = document.getElementById('visitorStatusFilter') as HTMLSelectElement;
  if (visitorStatusFilter) {
    visitorStatusFilter.addEventListener('change', async () => {
      currentVisitorStatusFilter = visitorStatusFilter.value;
      await applyVisitorFilters();
    });
  }

  // Date filter event listener
  const visitorDateFilter = document.getElementById('visitorDateFilter') as HTMLSelectElement;
  if (visitorDateFilter) {
    visitorDateFilter.addEventListener('change', async () => {
      currentVisitorDateFilter = visitorDateFilter.value;
      await applyVisitorFilters();
    });
  }

  console.log('Visitor dashboard event listeners setup complete');
}

// Helper function to get current Philippine time
function getPhilippineTime(): Date {
  const now = new Date();
  // Get the timezone offset between UTC and Asia/Manila (UTC+8)
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const philippineTime = new Date(utcTime + (8 * 60 * 60 * 1000)); // Add 8 hours for UTC+8
  return philippineTime;
}

// Helper function to get Philippine date (date only)
function getPhilippineDate(): Date {
  const philippineTime = getPhilippineTime();
  philippineTime.setHours(0, 0, 0, 0);
  return philippineTime;
}

// Helper function to convert a date to Philippine time
function toPhilippineTime(date: Date): Date {
  // Get the timezone offset between UTC and Asia/Manila (UTC+8)
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  const philippineTime = new Date(utcTime + (8 * 60 * 60 * 1000)); // Add 8 hours for UTC+8
  return philippineTime;
}

// Helper function to get current Philippine time from database (real-time)
async function getCurrentPhilippineTimeFromDB(): Promise<Date> {
  try {
    const { data, error } = await supabase.rpc('get_philippine_timestamp');
    if (error) {
      console.error('Error getting Philippine time from DB:', error);
      // Fallback to local calculation
      return getPhilippineTime();
    }
    return new Date(data);
  } catch (error) {
    console.error('Exception getting Philippine time from DB:', error);
    // Fallback to local calculation
    return getPhilippineTime();
  }
}

// Helper function to get current Philippine date from database (real-time)
async function getCurrentPhilippineDateFromDB(): Promise<Date> {
  try {
    const { data, error } = await supabase.rpc('get_philippine_date');
    if (error) {
      console.error('Error getting Philippine date from DB:', error);
      // Fallback to local calculation
      return getPhilippineDate();
    }
    return new Date(data);
  } catch (error) {
    console.error('Exception getting Philippine date from DB:', error);
    // Fallback to local calculation
    return getPhilippineDate();
  }
}

// Function to update the Philippine clock display
function updatePhilippineClock() {
  const timeElement = document.getElementById('philippineTime');
  const dateElement = document.getElementById('philippineDate');
  
  if (!timeElement || !dateElement) return;
  
  // Get current Philippine time
  const philippineTime = getPhilippineTime();
  
  // Format time (HH:MM:SS) using the corrected Philippine time
  const timeString = philippineTime.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Format date (Day, Month DD, YYYY) using the corrected Philippine time
  const dateString = philippineTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Update the display
  timeElement.textContent = timeString;
  dateElement.textContent = dateString;
}

// Function to start the Philippine clock
function startPhilippineClock() {
  // Update immediately
  updatePhilippineClock();
  
  // Update every second
  setInterval(updatePhilippineClock, 1000);
}

// Initialize the Philippine clock when the dashboard loads
setTimeout(() => {
  startPhilippineClock();
}, 100);

// Helper to parse YYYY-MM-DD as Asia/Manila midnight
function parseDateAsPhilippine(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Create date in Philippine timezone (UTC+8)
  const utcTime = Date.UTC(year, month - 1, day, 0, 0, 0);
  const philippineTime = new Date(utcTime + (8 * 60 * 60 * 1000)); // Add 8 hours for UTC+8
  return philippineTime;
}

// Add a real-time auto-refresh for schedule lists and Mark Complete button
let scheduleAutoRefreshInterval: any = null;

function startScheduleAutoRefresh() {
  if (scheduleAutoRefreshInterval) {
    clearInterval(scheduleAutoRefreshInterval);
  }
  scheduleAutoRefreshInterval = setInterval(async () => {
    // Re-apply filters to update today/future schedules and button states
    await applyVisitsFilters();
  }, 10000); // 10 seconds
}

function stopScheduleAutoRefresh() {
  if (scheduleAutoRefreshInterval) {
    clearInterval(scheduleAutoRefreshInterval);
    scheduleAutoRefreshInterval = null;
  }
}

// Start auto-refresh when dashboard loads
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    startScheduleAutoRefresh();
  });
}

// Function to toggle history dropdown
function toggleHistory(historyId: string) {
  console.log('toggleHistory called with historyId:', historyId);
  const historyDiv = document.getElementById(historyId);
  const button = document.getElementById(`btn-${historyId}`);
  const icon = document.getElementById(`icon-${historyId}`);

  // Mobile: show modal popup
  if (window.innerWidth <= 768) {
    ensureHistoryModalExists();
    if (historyDiv) {
      const modal = document.getElementById('historyModal');
      const modalContent = document.getElementById('historyModalContent');
      if (modal && modalContent) {
        // Copy the history list HTML only
        const ul = historyDiv.querySelector('ul');
        modalContent.innerHTML = ul ? ul.outerHTML : '<div class="text-gray-500">No history events.</div>';
        modal.classList.remove('hidden');
      }
    }
    return;
  }

  // Desktop: toggle dropdown
  if (historyDiv && button && icon) {
    const isHidden = historyDiv.classList.contains('hidden');
    console.log('Current state - isHidden:', isHidden);
    if (isHidden) {
      historyDiv.classList.remove('hidden');
      icon.style.transform = 'rotate(180deg)';
      const span = button.querySelector('span');
      if (span) {
        span.textContent = span.textContent?.replace('See History', 'Hide History');
      }
      console.log('History shown');
    } else {
      historyDiv.classList.add('hidden');
      icon.style.transform = 'rotate(0deg)';
      const span = button.querySelector('span');
      if (span) {
        span.textContent = span.textContent?.replace('Hide History', 'See History');
      }
      console.log('History hidden');
    }
  } else {
    console.error('Could not find required elements for history toggle');
  }
}

// Make toggleHistory function available globally
(window as any).toggleHistory = toggleHistory;

// Function to calculate visit progress
function calculateVisitProgress(visit: any): { percentage: number; status: string; color: string } {
  const now = new Date();
  const visitDate = new Date(visit.visit_date);
  const scheduledAt = new Date(visit.scheduled_at);
  
  // If visit is already completed or unsuccessful, show 100%
  if (visit.status === 'completed') {
    return { percentage: 100, status: 'Completed', color: 'bg-green-500' };
  }
  
  if (visit.status === 'unsuccessful' || visit.status === 'failed') {
    return { percentage: 100, status: visit.status === 'failed' ? 'Failed' : 'Unsuccessful', color: 'bg-red-500' };
  }
  
  if (visit.status === 'cancelled') {
    return { percentage: 100, status: 'Cancelled', color: 'bg-gray-500' };
  }
  
  // For pending visits, calculate progress based on time
  const totalDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const timeSinceScheduled = now.getTime() - scheduledAt.getTime();
  
  // If it's a future visit, show 0% progress
  if (timeSinceScheduled < 0) {
    return { percentage: 0, status: 'Scheduled', color: 'bg-blue-500' };
  }
  
  // If it's past the visit date, show 100% (should be marked as unsuccessful)
  if (now.getTime() > visitDate.getTime() + totalDuration) {
    return { percentage: 100, status: 'Overdue', color: 'bg-red-500' };
  }
  
  // Calculate percentage based on time elapsed
  const percentage = Math.min(100, Math.max(0, (timeSinceScheduled / totalDuration) * 100));
  
  let status = 'In Progress';
  let color = 'bg-blue-500';
  
  if (percentage < 25) {
    status = 'Scheduled';
    color = 'bg-blue-500';
  } else if (percentage < 50) {
    status = 'Approaching';
    color = 'bg-yellow-500';
  } else if (percentage < 75) {
    status = 'Due Soon';
    color = 'bg-orange-500';
  } else {
    status = 'Overdue';
    color = 'bg-red-500';
  }
  
  return { percentage, status, color };
}

// Function to complete a specific place in a visit
async function completeVisitPlace(visitId: string, placeId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showNotification('You must be logged in to complete visits', 'error');
      return;
    }

    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to mark this place as completed?');
    if (!confirmed) {
      return;
    }

    // Call the database function to complete the specific place
    const { data, error } = await supabase.rpc('complete_visit_place', {
      p_visit_id: visitId,
      p_place_id: placeId,
      p_completed_by: user.id
    });

    if (error) {
      console.error('Error completing visit place:', error);
      showNotification('Error completing visit place: ' + error.message, 'error');
      return;
    }

    showNotification('Place marked as completed successfully!', 'success');
    
    // Reload the visits to reflect the changes
    await loadScheduledVisits();
    await loadFinishedSchedules();
  } catch (error) {
    console.error('Error in completeVisitPlace:', error);
    showNotification('Error completing visit place', 'error');
  }
}

// Make function available globally
(window as any).completeVisitPlace = completeVisitPlace;

// Function to complete an entire visit (all places)
async function completeVisit(visitId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showNotification('You must be logged in to complete visits', 'error');
      return;
    }

    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to mark this entire visit as completed? This will complete all places in the visit.');
    if (!confirmed) {
      return;
    }

    // Call the database function to complete the entire visit
    const { data, error } = await supabase.rpc('complete_visit', {
      p_visit_id: visitId,
      p_completed_by: user.id
    });

    if (error) {
      console.error('Error completing visit:', error);
      showNotification('Error completing visit: ' + error.message, 'error');
      return;
    }

    showNotification('Visit completed successfully!', 'success');
    
    // Reload the visits to reflect the changes
    await loadScheduledVisits();
    await loadFinishedSchedules();
  } catch (error) {
    console.error('Error in completeVisit:', error);
    showNotification('Error completing visit', 'error');
  }
}

// Function to toggle personnel availability
async function togglePersonnelAvailability(placeId: string, currentAvailability: boolean) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showNotification('You must be logged in to update availability', 'error');
      return;
    }

    // Show modal for availability update
    const modal = document.getElementById('personnelAvailabilityModal');
    const errorDiv = document.getElementById('availabilityError');
    const successDiv = document.getElementById('availabilitySuccess');
    const reasonTextarea = document.getElementById('unavailabilityReason') as HTMLTextAreaElement;
    const submitBtn = document.getElementById('availabilitySubmitBtn') as HTMLButtonElement;
    
    if (modal && errorDiv && successDiv && reasonTextarea && submitBtn) {
      // Clear previous messages
      errorDiv.classList.add('hidden');
      errorDiv.textContent = '';
      successDiv.classList.add('hidden');
      successDiv.textContent = '';
      reasonTextarea.value = '';
      
      // Set up the form submission
      const handleSubmit = async (e: Event) => {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (submitBtn.disabled) {
          return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';
        
        try {
          const newAvailability = !currentAvailability;
          const unavailabilityReason = reasonTextarea.value.trim();
          
          // Validate reason if marking as unavailable
          if (!newAvailability && !unavailabilityReason) {
            errorDiv.textContent = 'Please provide a reason for unavailability.';
            errorDiv.classList.remove('hidden');
            return;
          }
          
          // Call the database function to update availability
          const { data, error } = await supabase.rpc('update_personnel_availability', {
            p_personnel_id: user.id,
            p_place_id: placeId,
            p_is_available: newAvailability,
            p_unavailability_reason: unavailabilityReason || null,
            p_updated_by: user.id
          });
          
          if (error) {
            console.error('Error updating availability:', error);
            errorDiv.textContent = 'Error updating availability: ' + error.message;
            errorDiv.classList.remove('hidden');
            return;
          }
          
          // Show success message
          successDiv.textContent = `Successfully marked as ${newAvailability ? 'available' : 'unavailable'}.`;
          successDiv.classList.remove('hidden');
          
          // Close modal after a short delay
          setTimeout(() => {
            modal.classList.add('hidden');
            // Reload personnel dashboard to reflect changes
            loadPersonnelDashboard();
          }, 1500);
          
        } catch (error) {
          console.error('Error in availability update:', error);
          errorDiv.textContent = 'Error updating availability. Please try again.';
          errorDiv.classList.remove('hidden');
        } finally {
          // Reset button state
          submitBtn.disabled = false;
          submitBtn.textContent = 'Update Availability';
        }
      };
      
      // Remove any existing event listeners and add new one
      const form = modal.querySelector('form');
      if (form) {
        form.removeEventListener('submit', handleSubmit);
        form.addEventListener('submit', handleSubmit);
      }
      
      // Show the modal
      modal.classList.remove('hidden');
    } else {
      showNotification('Error: Availability modal not found', 'error');
    }
  } catch (error) {
    console.error('Error in togglePersonnelAvailability:', error);
    showNotification('Error updating availability', 'error');
  }
}

// Make function available globally
(window as any).togglePersonnelAvailability = togglePersonnelAvailability;

// Debounce function for search inputs
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

// Function to load visitor dashboard
async function loadVisitorDashboard() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found');
      return;
    }

    // Load visitor's scheduled visits
    await loadVisitorVisits();

    // Setup visitor dashboard event listeners with a small delay to ensure DOM is ready
    setTimeout(() => {
      setupVisitorDashboardEventListeners();
    }, 100);
    
    console.log('Visitor dashboard loaded successfully');
  } catch (error) {
    console.error('Error in loadVisitorDashboard:', error);
  }
}

// Function to load visitor's scheduled visits
async function loadVisitorVisits() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found');
      return;
    }

    // Get visitor's scheduled visits
    const { data: visits, error } = await supabase.rpc('get_visitor_scheduled_visits', {
      p_visitor_user_id: user.id
    });

    if (error) {
      console.error('Error loading visitor visits:', error);
      showNotification('Error loading visits: ' + error.message, 'error');
      return;
    }

    // Display the visits
    await displayVisitorVisits(visits || []);
    
    console.log('Visitor visits loaded successfully:', visits?.length || 0);
  } catch (error) {
    console.error('Error in loadVisitorVisits:', error);
    showNotification('Error loading visits', 'error');
  }
}

// Function to display visitor's scheduled visits
async function displayVisitorVisits(visits: any[]): Promise<void> {
  const visitorVisitsList = document.getElementById('visitorVisitsList');
  if (!visitorVisitsList) {
    console.error('Visitor visits list container not found');
    return;
  }

  if (visits.length === 0) {
    visitorVisitsList.innerHTML = `
      <div class="text-center py-8">
        <div class="text-gray-500 dark:text-gray-400">
          <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-lg font-medium">No scheduled visits found</p>
          <p class="text-sm">You haven't scheduled any visits yet.</p>
        </div>
      </div>
    `;
    return;
  }

  let visitsHtml = '';
  
  for (const visit of visits) {
    const visitDate = new Date(visit.visit_date);
    const isToday = visitDate.toDateString() === new Date().toDateString();
    const isPast = visitDate < new Date();
    
    // Calculate progress for the visit
    const progress = calculateVisitProgress(visit);
    
    // Parse places data
    const places = Array.isArray(visit.places) ? visit.places : [];
    const completedPlaces = places.filter((place: any) => place.status === 'completed').length;
    const totalPlaces = places.length;
    
    visitsHtml += `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="p-4 sm:p-6">
          <!-- Visit Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Visit on ${visitDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Purpose: ${visit.purpose}${visit.other_purpose ? ` - ${visit.other_purpose}` : ''}
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <span class="px-3 py-1 rounded-full text-xs font-medium ${
                visit.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                visit.status === 'unsuccessful' || visit.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                visit.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }">
                ${visit.status === 'failed' ? 'Failed' : visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
              </span>
              ${isToday ? '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs font-medium">Today</span>' : ''}
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">${completedPlaces}/${totalPlaces} places completed</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div class="h-2 rounded-full ${progress.color}" style="width: ${progress.percentage}%"></div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${progress.status}</p>
          </div>

          <!-- Places List -->
          ${places.length > 0 ? `
            <div class="space-y-3">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Places to visit:</h4>
              ${places.map((place: any) => `
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div class="flex-1">
                    <h5 class="text-sm font-medium text-gray-900 dark:text-white">${place.place_name}</h5>
                    ${place.place_location ? `<p class="text-xs text-gray-600 dark:text-gray-400">${place.place_location}</p>` : ''}
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${
                      place.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      place.status === 'unsuccessful' || place.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      place.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }">
                      ${place.status === 'failed' ? 'Failed' : place.status.charAt(0).toUpperCase() + place.status.slice(1)}
                    </span>
                    ${place.completed_at ? `
                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        ${new Date(place.completed_at).toLocaleDateString()}
                      </span>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="text-center py-4">
              <p class="text-sm text-gray-500 dark:text-gray-400">No places assigned to this visit</p>
            </div>
          `}

          <!-- Visit Details -->
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-700 dark:text-gray-300">Scheduled:</span>
                <span class="text-gray-600 dark:text-gray-400 ml-2">
                  ${new Date(visit.scheduled_at).toLocaleDateString()} at ${new Date(visit.scheduled_at).toLocaleTimeString()}
                </span>
              </div>
              ${visit.completed_at ? `
                <div>
                  <span class="font-medium text-gray-700 dark:text-gray-300">Completed:</span>
                  <span class="text-gray-600 dark:text-gray-400 ml-2">
                    ${new Date(visit.completed_at).toLocaleDateString()} at ${new Date(visit.completed_at).toLocaleTimeString()}
                  </span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  visitorVisitsList.innerHTML = visitsHtml;
}

// Apply filters and search to finished visits
function applyFinishedFilters() {
  let filteredVisits = [...allFinishedVisits];

  // Apply finished schedule type filter using Philippine time
  const philippineToday = new Date();
  // Convert to Philippine time (UTC+8)
  philippineToday.setHours(philippineToday.getHours() + 8);

  switch (currentFinishedScheduleType) {
    case 'today':
      // Show finished visits that were completed today
      filteredVisits = filteredVisits.filter(visit => {
        const completedDate = visit.completed_at ? new Date(visit.completed_at) : new Date(visit.visit_date);
        const visitDate = new Date(visit.visit_date);
        const today = new Date(philippineToday);
        today.setHours(0, 0, 0, 0);
        
        // Check if the visit was completed today or if it was scheduled for today and is finished
        const completedToday = completedDate.toDateString() === today.toDateString();
        const scheduledToday = visitDate.toDateString() === today.toDateString();
        
        return completedToday || scheduledToday;
      });
      break;
    case 'past':
      // Show finished visits from past dates
      filteredVisits = filteredVisits.filter(visit => {
        const visitDate = new Date(visit.visit_date);
        const today = new Date(philippineToday);
        today.setHours(0, 0, 0, 0);
        visitDate.setHours(0, 0, 0, 0);
        
        return visitDate.getTime() < today.getTime();
      });
      break;
    default:
      // Default to 'today' if no valid state
      currentFinishedScheduleType = 'today';
      filteredVisits = filteredVisits.filter(visit => {
        const completedDate = visit.completed_at ? new Date(visit.completed_at) : new Date(visit.visit_date);
        const visitDate = new Date(visit.visit_date);
        const today = new Date(philippineToday);
        today.setHours(0, 0, 0, 0);
        
        const completedToday = completedDate.toDateString() === today.toDateString();
        const scheduledToday = visitDate.toDateString() === today.toDateString();
        
        return completedToday || scheduledToday;
      });
      break;
  }

  // Apply role filter
  if (currentFinishedRoleFilter !== 'all') {
    filteredVisits = filteredVisits.filter(visit => {
      const visitorRole = visit.visitor_role || 'guest';
      return visitorRole === currentFinishedRoleFilter;
    });
  }

  // Apply date filter
  if (currentFinishedDateFilter !== 'all') {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);
    
    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    filteredVisits = filteredVisits.filter(visit => {
      const visitDate = new Date(visit.visit_date);
      
      switch (currentFinishedDateFilter) {
        case 'today':
          return visitDate.toDateString() === today.toDateString();
        case 'yesterday':
          return visitDate.toDateString() === yesterday.toDateString();
        case 'this_week':
          return visitDate >= startOfWeek && visitDate <= endOfWeek;
        case 'last_week':
          return visitDate >= startOfLastWeek && visitDate <= endOfLastWeek;
        case 'this_month':
          return visitDate >= startOfMonth && visitDate <= endOfMonth;
        case 'last_month':
          return visitDate >= startOfLastMonth && visitDate <= endOfLastMonth;
        default:
          return true;
      }
    });
  }

  // Apply specific date filter
  if (currentFinishedSpecificDate) {
    const specificDate = new Date(currentFinishedSpecificDate);
    filteredVisits = filteredVisits.filter(visit => {
      const visitDate = new Date(visit.visit_date);
      return visitDate.toDateString() === specificDate.toDateString();
    });
  }

  // Apply search filter
  if (currentFinishedSearchTerm.trim()) {
    const searchLower = currentFinishedSearchTerm.toLowerCase();
    filteredVisits = filteredVisits.filter(visit => {
      const visitorName = `${visit.visitor_first_name} ${visit.visitor_last_name}`;
      const visitorEmail = visit.visitor_email || '';
      const purpose = visit.purpose || '';
      const status = visit.status || '';
      const placeName = visit.place_name || '';
      
      return visitorName.toLowerCase().includes(searchLower) ||
             visitorEmail.toLowerCase().includes(searchLower) ||
             purpose.toLowerCase().includes(searchLower) ||
             status.toLowerCase().includes(searchLower) ||
             placeName.toLowerCase().includes(searchLower);
    });
  }

  displayFinishedVisits(filteredVisits);
}

// Display filtered finished visits
function displayFinishedVisits(visits: any[]): void {
  const finishedVisitsList = document.getElementById('finishedVisitsList');
  if (!finishedVisitsList) return;

  if (visits.length === 0) {
    finishedVisitsList.innerHTML = `
      <div class="text-center py-8">
        <div class="text-gray-500 dark:text-gray-400 text-lg">No finished visits found</div>
        <div class="text-gray-400 dark:text-gray-500 text-sm mt-2">
          ${currentFinishedSearchTerm || currentFinishedRoleFilter !== 'all' || currentFinishedDateFilter !== 'all' || currentFinishedSpecificDate || currentFinishedScheduleType !== 'today'
            ? 'Try adjusting your search or filters' 
            : 'No visits have been completed or marked as unsuccessful'}
        </div>
      </div>
    `;
    return;
  }

  finishedVisitsList.innerHTML = visits.map(visit => {
    const visitorName = `${visit.visitor_first_name} ${visit.visitor_last_name}`;
    const visitorEmail = visit.visitor_email || 'No email';
    const visitorRole = visit.visitor_role || 'guest';
    const isLoggedIn = visit.visitor_user_id !== null;
    const visitorId = isLoggedIn ? visit.visitor_user_id : 'guest';
    const visitDate = new Date(visit.visit_date).toLocaleDateString();
    const completedDate = visit.completed_at ? new Date(visit.completed_at).toLocaleDateString() : 'N/A';
    const completedTime = visit.completed_at ? new Date(visit.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    
    const statusColors: { [key: string]: string } = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      unsuccessful: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    const roleColors: { [key: string]: string } = {
      visitor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      guest: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };

    const completedByInfo = visit.completed_by_info ? 
      `${visit.completed_by_info.first_name} ${visit.completed_by_info.last_name}` : 
      'Unknown';

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
            <span class="px-2 py-1 rounded-full text-xs font-medium ${(statusColors as any)[visit.status] || statusColors.completed}">
              ${visit.status}
            </span>
            <span class="px-2 py-1 rounded-full text-xs font-medium ${(roleColors as any)[visitorRole] || roleColors.guest}">
              ${visitorRole}
            </span>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400"><strong>Visit Date:</strong> ${visitDate}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400"><strong>Purpose:</strong> ${visit.purpose}</p>
            ${visit.other_purpose ? `<p class="text-sm text-gray-600 dark:text-gray-400"><strong>Additional Details:</strong> ${visit.other_purpose}</p>` : ''}
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400"><strong>Place:</strong> ${visit.place_name}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400"><strong>Completed:</strong> ${completedDate} at ${completedTime}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400"><strong>Completed By:</strong> ${completedByInfo}</p>
          </div>
        </div>
        
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Scheduled: ${new Date(visit.scheduled_at).toLocaleDateString()} at ${new Date(visit.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    `;
  }).join('');
}

// Make toggleHistory function available globally
(window as any).toggleHistory = toggleHistory;

// Function to set up history button event listeners (more reliable on mobile)
function setupHistoryButtonListeners() {
  // Find all history buttons and add event listeners
  const historyButtons = document.querySelectorAll('[id^="btn-"]');
  
  historyButtons.forEach(button => {
    // Remove any existing listeners to prevent duplicates
    button.removeEventListener('click', handleHistoryButtonClick);
    
    // Add click listener (works on both desktop and mobile)
    button.addEventListener('click', handleHistoryButtonClick);
  });
}

// Handle history button click
function handleHistoryButtonClick(event: Event) {
  event.preventDefault();
  event.stopPropagation();
  
  const button = event.currentTarget as HTMLElement;
  const historyId = button.id.replace('btn-', '');
  
  console.log('History button clicked via event listener:', historyId);
  toggleHistory(historyId);
}

// Handle history button touch (for mobile)
function handleHistoryButtonTouch(event: TouchEvent) {
  event.preventDefault();
  event.stopPropagation();
  
  const button = event.currentTarget as HTMLElement;
  const historyId = button.id.replace('btn-', '');
  
  console.log('History button touched via event listener:', historyId);
  toggleHistory(historyId);
}

// Add this function to inject the modal HTML if it doesn't exist
function ensureHistoryModalExists() {
  if (!document.getElementById('historyModal')) {
    const modal = document.createElement('div');
    modal.id = 'historyModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full mx-4 p-4 relative">
        <button id="closeHistoryModal" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-bold">&times;</button>
        <div id="historyModalContent" class="max-h-[60vh] overflow-y-auto"></div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('closeHistoryModal')?.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
    // Also close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }
}