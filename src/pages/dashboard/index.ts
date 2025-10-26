import supabase from '../../config/supabase';
import { logAction, getLogs } from '../../utils/logging';
import { generateVisitQRCode, openPrintableVisitCard, type VisitQRData } from '../../utils/qrCode';
import { generateSimpleVisitQRCode } from '../../utils/qrCode';
import jsQR from 'jsqr';
import { addNotificationToActionBadge, addNotificationToLogContainer, shouldShowNotification, getNotificationConfig } from '../../utils/notification.js';
import { createFlaggedVisitModal, setupFlaggedVisitModalListeners, displayFlaggedVisitDetails } from '../../components/FlaggedVisitModal';

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

// Visitor dashboard filters (global scope)
let currentVisitorSearchTerm = '';
let currentVisitorStatusFilter = 'all';
let allVisitorVisits: any[] = [];
let filteredVisitorVisits: any[] = [];

// Visitor past calendar filter state
let currentVisitorPastStartDate = '';
let currentVisitorPastEndDate = '';

// Logs dashboard filters (global scope)
let currentLogsTabFilter = 'all';
let currentLogsStartDate = '';
let currentLogsEndDate = '';

// Logs pagination variables
let currentLogsPage = 1;
const logsPageSize = 10;

// Mapping of available actions for each logs tab
const LOGS_TAB_ACTIONS = {
  all: [
    { value: 'all', label: 'All Actions' },
    { value: 'password_change', label: 'Password Change' },
    { value: 'place_update', label: 'Place Update' },
    { value: 'place_availability_toggle', label: 'Place Availability Toggle' },
    { value: 'place_create', label: 'Place Create' },
    { value: 'personnel_assignment', label: 'Personnel Assignment' },
    { value: 'personnel_removal', label: 'Personnel Removal' },
    { value: 'personnel_availability_change', label: 'Personnel Availability Change' },
    { value: 'visit_scheduled', label: 'Visit Scheduled' },
    { value: 'visit_completed', label: 'Visit Completed' },
    { value: 'visit_completed_flagged', label: 'Visit Completed (Flagged)' },
    { value: 'visit_unsuccessful', label: 'Visit Unsuccessful' },
    { value: 'gate_create', label: 'Gate Create' },
    { value: 'gate_update', label: 'Gate Update' },
    { value: 'gate_status_change', label: 'Gate Status Change' },
    { value: 'gate_entrance_scan', label: 'Gate Entrance Scan' },
    { value: 'gate_exit_scan', label: 'Gate Exit Scan' },
    { value: 'visit_flagged_no_exit', label: 'Visit Flagged (No Exit)' },
    { value: 'visit_temporary_exit', label: 'Visit Temporary Exit' },
    { value: 'visit_feedback_submitted', label: 'Visit Feedback Submitted' },
    { value: 'role_change', label: 'Role Change' },
  ],
  gate: [
    { value: 'all', label: 'All Actions' },
    { value: 'gate_create', label: 'Gate Create' },
    { value: 'gate_update', label: 'Gate Update' },
    { value: 'gate_status_change', label: 'Gate Status Change' },
    { value: 'gate_entrance_scan', label: 'Gate Entrance Scan' },
    { value: 'gate_exit_scan', label: 'Gate Exit Scan' },
    { value: 'visit_temporary_exit', label: 'Visit Temporary Exit' },
  ],
  place: [
    { value: 'all', label: 'All Actions' },
    { value: 'place_update', label: 'Place Update' },
    { value: 'place_availability_toggle', label: 'Place Availability Toggle' },
    { value: 'place_create', label: 'Place Create' },
    { value: 'personnel_assignment', label: 'Personnel Assignment' },
    { value: 'personnel_removal', label: 'Personnel Removal' },
    { value: 'personnel_availability_change', label: 'Personnel Availability Change' },
  ],
  account: [
    { value: 'all', label: 'All Actions' },
    { value: 'password_change', label: 'Password Change' },
    { value: 'role_change', label: 'Role Change' },
  ],
  schedules: [
    { value: 'all', label: 'All Actions' },
    { value: 'visit_scheduled', label: 'Visit Scheduled' },
    { value: 'visit_completed', label: 'Visit Completed' },
    { value: 'visit_completed_flagged', label: 'Visit Completed (Flagged)' },
    { value: 'visit_unsuccessful', label: 'Visit Unsuccessful' },
    { value: 'gate_entrance_scan', label: 'Gate Entrance Scan' },
    { value: 'gate_exit_scan', label: 'Gate Exit Scan' },
    { value: 'visit_flagged_no_exit', label: 'Visit Flagged (No Exit)' },
    { value: 'visit_temporary_exit', label: 'Visit Temporary Exit' },
    { value: 'visit_feedback_submitted', label: 'Visit Feedback Submitted' },
  ],
  personnel: [
    { value: 'all', label: 'All Actions' },
    { value: 'personnel_assignment', label: 'Personnel Assignment' },
    { value: 'personnel_removal', label: 'Personnel Removal' },
    { value: 'personnel_availability_change', label: 'Personnel Availability Change' },
  ],
  feedback: [
    { value: 'all', label: 'All Actions' },
    { value: 'visit_feedback_submitted', label: 'Visit Feedback Submitted' },
  ],
};

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
        const gatesTab = document.getElementById('gatesTab');
    const placesContent = document.getElementById('placesContent');
    const accountsContent = document.getElementById('accountsContent');
    const logsContent = document.getElementById('logsContent');
    const gatesContent = document.getElementById('gatesContent');
    const feedbackContent = document.getElementById('feedbackContent');

        if (roleData.role === 'log') {
          // Only show logs tab and content
          if (adminTabs) adminTabs.classList.remove('hidden');
          if (logsTab) logsTab.classList.remove('hidden');
          if (placesTab) placesTab.classList.add('hidden');
          if (accountsTab) accountsTab.classList.add('hidden');
          if (gatesTab) gatesTab.classList.add('hidden');
          if (feedbackTab) feedbackTab.classList.add('hidden');
          if (placesContent) placesContent.classList.add('hidden');
          if (accountsContent) accountsContent.classList.add('hidden');
          if (logsContent) logsContent.classList.remove('hidden');
          if (gatesContent) gatesContent.classList.add('hidden');
          if (feedbackContent) feedbackContent.classList.add('hidden');
          
          // Hide visitor content
          const visitorContent = document.getElementById('visitorContent');
          if (visitorContent) visitorContent.classList.add('hidden');
          
          // Load logs immediately
          loadLogs();
        } else if (roleData.role === 'admin') {
          // Admin: show admin tabs including gates, hide logs
          if (adminTabs) adminTabs.classList.remove('hidden');
          if (logsTab) logsTab.classList.add('hidden');
          if (placesTab) placesTab.classList.remove('bg-blue-600', 'text-white');
          if (accountsTab) accountsTab.classList.remove('bg-gray-100', 'text-gray-700');
          if (gatesTab) gatesTab.classList.remove('hidden');
          if (placesContent) placesContent.classList.remove('hidden');
          if (accountsContent) accountsContent.classList.add('hidden');
          if (logsContent) logsContent.classList.add('hidden');
          if (gatesContent) gatesContent.classList.add('hidden');
          if (feedbackContent) feedbackContent.classList.add('hidden');
          
          // Hide visitor content
          const visitorContent = document.getElementById('visitorContent');
          if (visitorContent) visitorContent.classList.add('hidden');
          
          loadPlaces();
          // Setup admin tab event listeners
          setupAdminTabEventListeners();
          // Do NOT call loadLogs() here; logs will load when logs tab is clicked
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
        } else if (roleData.role === 'guard') {
          // Guard: show guard content, hide admin tabs
          if (adminTabs) adminTabs.classList.add('hidden');
          if (logsTab) logsTab.classList.add('hidden');
          if (placesTab) placesTab.classList.add('hidden');
          if (accountsTab) accountsTab.classList.add('hidden');
          if (placesContent) placesContent.classList.add('hidden');
          if (accountsContent) accountsContent.classList.add('hidden');
          if (logsContent) logsContent.classList.add('hidden');
          
          // Show guard content
          const guardContent = document.getElementById('guardContent');
          if (guardContent) guardContent.classList.remove('hidden');
          
          loadGuardDashboard();
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
      
      // Set max dates for finished schedule date filters
      setMaxDateForFinishedFilters();
      
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
          <div class="flex flex-col sm:flex-row gap-2 w-full sm:justify-between sm:items-center">
            <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
              <button 
                id="gatesTab"
                class="w-full sm:w-auto px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Gates
              </button>
              <button 
                id="feedbackTab"
                class="w-full sm:w-auto px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Feedback
              </button>
            </div>
            <button 
              id="adminRefreshBtn"
              class="w-full sm:w-auto px-4 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              title="Refresh all admin data"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh All
            </button>

          </div>
        </div>
      </div>

      <!-- Admin Content -->
      <div id="placesContent" class="bg-white dark:bg-gray-800 shadow rounded-lg p-2 sm:p-6">
        <div class="flex flex-col gap-6 mb-6">
          <!-- Header Section -->
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Places Management</h2>
            <button 
              id="addPlaceBtn"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add New Place
            </button>
          </div>

          <!-- Filters Section -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div class="flex flex-col lg:flex-row gap-4">
              <!-- Search Input -->
              <div class="relative flex-1">
                <label for="placesSearchInput" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Places</label>
                <div class="relative">
                  <input 
                    type="text" 
                    id="placesSearchInput"
                    placeholder="Search by name, location, or description..."
                    class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                  >
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <!-- Availability Filter -->
              <div class="flex-1 lg:max-w-xs">
                <label for="availabilityFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Availability Status</label>
                <select 
                  id="availabilityFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                >
                  <option value="all">All Places</option>
                  <option value="available">Available Only</option>
                  <option value="unavailable">Unavailable Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div id="placesList" class="space-y-4"></div>
      </div>

      <div id="accountsContent" class="hidden bg-white dark:bg-gray-800 shadow rounded-lg p-2 sm:p-6">
        <div class="flex flex-col gap-6 mb-6">
          <!-- Header Section -->
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Accounts Management</h2>
          </div>

          <!-- Filters Section -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div class="flex flex-col lg:flex-row gap-4">
              <!-- Search Input -->
              <div class="relative flex-1">
                <label for="accountsSearchInput" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Accounts</label>
                <div class="relative">
                  <input 
                    type="text" 
                    id="accountsSearchInput"
                    placeholder="Search by name, email, or role..."
                    class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                  >
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <!-- Role Filter -->
              <div class="flex-1 lg:max-w-xs">
                <label for="roleFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User Role</label>
                <select 
                  id="roleFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                >
                  <option value="all">All Roles</option>
                  <option value="log">Log</option>
                  <option value="personnel">Personnel</option>
                  <option value="guard">Guard</option>
                  <option value="visitor">Visitor</option>
                  <option value="guest">Guest</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div id="accountsList" class="overflow-x-auto"></div>
      </div>

      <div id="logsContent" class="hidden bg-white dark:bg-gray-800 shadow rounded-lg p-2 sm:p-6">
        <div class="flex flex-col gap-6 mb-6">
          <!-- Header Section -->
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">System Logs</h2>
            <button 
              id="refreshLogsBtn"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh Logs
            </button>
          </div>

          <!-- Category Tabs -->
          <div class="flex flex-row flex-wrap gap-2">
            <button id="logsTabAll" class="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm">All</button>
            <button id="logsTabGate" class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm">Gate</button>
            <button id="logsTabPlace" class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm">Place</button>
            <button id="logsTabPersonnel" class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm">Personnel</button>
            <button id="logsTabAccount" class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm">Account</button>
            <button id="logsTabSchedules" class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm">Schedules</button>
            <button id="logsTabFeedback" class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm">Feedback</button>
          </div>

          <!-- Filters Section -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
            <!-- Search Row with Filters Toggle -->
            <div class="flex flex-col gap-2">
              <!-- Search Input and Filters Button Row -->
              <div class="flex gap-3 items-end">
                <!-- Search Input -->
                <div class="relative flex-1">
                  <label for="logsSearchInput" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Logs</label>
                  <div class="relative">
                    <input 
                      type="text" 
                      id="logsSearchInput"
                      placeholder="Search by user, action, or details..."
                      class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                    >
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <!-- Filters dropdown toggle button -->
                <div class="flex-shrink-0">
                  <button 
                    id="logsFiltersDropdownBtn"
                    class="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    More Filters
                    <svg class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Dropdown content -->
            <div id="logsFiltersDropdown" class="hidden relative">
              <div class="absolute z-20 right-0 w-full sm:w-auto min-w-[280px] max-w-full sm:max-w-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg p-4 space-y-4">
                <!-- Action Filter -->
                <div class="flex-1">
                  <label for="actionFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Action Type</label>
                  <select 
                    id="actionFilter"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
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
                    <option value="visit_completed_flagged">Visit Completed (Flagged)</option>
                    <option value="visit_unsuccessful">Visit Unsuccessful</option>
                    <option value="gate_create">Gate Create</option>
                    <option value="gate_update">Gate Update</option>
                    <option value="gate_status_change">Gate Status Change</option>
                    <option value="gate_entrance_scan">Gate Entrance Scan</option>
                    <option value="gate_exit_scan">Gate Exit Scan</option>
                    <option value="visit_flagged_no_exit">Visit Flagged (No Exit)</option>
                    <option value="role_change">Role Change</option>
                  </select>
                </div>

                <!-- Date Filter Row -->
                <div class="flex flex-col sm:flex-row gap-4">
                  <!-- Start Date -->
                  <div class="flex-1">
                    <label for="logsStartDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                    <input 
                      type="date" 
                      id="logsStartDate"
                      class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                    >
                  </div>
                  <!-- End Date -->
                  <div class="flex-1">
                    <label for="logsEndDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                    <input 
                      type="date" 
                      id="logsEndDate"
                      class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                    >
                  </div>
                </div>

                <!-- Filter Actions -->
                <div class="flex flex-col sm:flex-row gap-2 sm:items-end">
                  <button 
                    id="clearLogsDateFilterBtn"
                    class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm flex items-center justify-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Clear Dates
                  </button>
                  <button 
                    id="cleanupVisitsBtn"
                    class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm flex items-center justify-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Cleanup Past Visits
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="logsList" class="overflow-x-auto space-y-4"></div>
        
        <!-- Logs Pagination Controls -->
        <div id="logsPagination" class="flex items-center justify-between mt-6 px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <span id="logsPageInfo">Page 1 of 1</span>
          </div>
          <div class="flex items-center space-x-2">
            <button 
              id="logsPrevBtn"
              class="px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Previous
            </button>
            <button 
              id="logsNextBtn"
              class="px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div id="gatesContent" class="hidden bg-white dark:bg-gray-800 shadow rounded-lg p-2 sm:p-6">
        <!-- Gates Management Content will be loaded here -->
      </div>

      <!-- Feedback Content -->
      <div id="feedbackContent" class="hidden bg-white dark:bg-gray-800 shadow rounded-lg p-2 sm:p-6">
        <!-- Feedback Management Content will be loaded here -->
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
            <!-- Status Actions Dropdown -->
            <div class="relative inline-block text-left">
              <button 
                id="statusActionsDropdownBtn"
                class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 w-full sm:w-auto flex items-center"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
                Status Actions
              </button>
              <div 
                id="statusActionsDropdown"
                class="hidden absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
              >
                <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="statusActionsDropdownBtn">
                  <button 
                    id="manualStatusUpdateBtn"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    role="menuitem"
                    title="Manually trigger status updates for past visits"
                  >
                    <svg class="w-4 h-4 inline mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    Update Statuses
                  </button>
                  <button 
                    id="debugVisitBtn"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    role="menuitem"
                    title="Debug specific visit (geko_041702@yahoo.com)"
                  >
                    <svg class="w-4 h-4 inline mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    Debug Visit
                  </button>
                  <button 
                    id="checkStatusesBtn"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    role="menuitem"
                    title="Check current visit statuses for debugging"
                  >
                    <svg class="w-4 h-4 inline mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    Check Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Assignment Content -->
        <div id="assignmentContent" class="space-y-4">
          <div id="personnelAssignmentInfo" class="space-y-4"></div>
        </div>
        <!-- Scheduled Visits Content -->
        <div id="visitsContent" class="hidden space-y-4">
          <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
            <div class="flex items-center gap-4">
              <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Scheduled Visits</h3>
              <!-- Refresh Button positioned next to title -->
              <button 
                id="refreshVisitsBtn"
                class="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm transition-all duration-200 hover:scale-105"
                title="Refresh visits data"
              >
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh
              </button>
            </div>
            <!-- Search and Filter Section -->
            <div class="flex flex-col gap-3 w-full lg:w-auto">
              <!-- Search and Filter Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <!-- Search Input -->
                <div class="relative">
                  <input 
                    type="text" 
                    id="visitsSearchInput"
                    placeholder="Search visits..."
                    class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
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
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="completed_flagged">Completed (Flagged)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <!-- Visitor Role Filter -->
                <select 
                  id="visitorRoleFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                >
                  <option value="all">All Roles</option>
                  <option value="visitor">Visitor</option>
                  <option value="guest">Guest</option>
                </select>
                <!-- Future Specific Date Filter (visible only on Future tab) -->
                <div id="futureDateFilterContainer" class="relative hidden">
                  <input 
                    type="date" 
                    id="futureSpecificDateFilter"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                    placeholder="Select future date"
                  >
                  <button 
                    id="clearFutureSpecificDateBtn"
                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm hidden"
                    title="Clear date"
                  >
                    ×
                  </button>
                </div>
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
          <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Finished Schedules</h3>
            <!-- Search and Filter Section -->
            <div class="flex flex-col gap-3 w-full lg:w-auto">
              <!-- Search Input Row -->
              <div class="flex flex-col sm:flex-row gap-2">
                <div class="relative flex-1 sm:flex-none sm:w-64">
                  <input 
                    type="text" 
                    id="finishedSearchInput"
                    placeholder="Search finished visits..."
                    class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                  >
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <!-- Filter Row 1 -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
                <!-- Date Filter -->
                <select 
                  id="finishedDateFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="this_week">This Week</option>
                  <option value="last_week">Last Week</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                </select>
                <!-- Status Filter -->
                <select 
                  id="finishedStatusFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="completed_flagged">Completed (Flagged)</option>
                  <option value="unsuccessful">Unsuccessful</option>
                </select>
                <!-- Visitor Role Filter -->
                <select 
                  id="finishedRoleFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                >
                  <option value="all">All Roles</option>
                  <option value="visitor">Visitor</option>
                  <option value="guest">Guest</option>
                </select>
                <!-- Place Filter -->
                <select 
                  id="finishedPlaceFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                >
                  <option value="all">All Places</option>
                </select>
                <!-- Specific Date Filter -->
                <div class="relative">
                  <input 
                    type="date" 
                    id="finishedSpecificDateFilter"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
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
          
          <!-- Calendar Filter for Past Finished Tab -->
          <div id="pastFinishedCalendarFilter" class="hidden mb-4">
            <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filter by Date Range</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <!-- Start Date -->
                <div>
                  <label for="pastFinishedStartDate" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Start Date
                  </label>
                  <input 
                    type="date" 
                    id="pastFinishedStartDate"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                  >
                </div>
                <!-- End Date -->
                <div>
                  <label for="pastFinishedEndDate" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    End Date
                  </label>
                  <input 
                    type="date" 
                    id="pastFinishedEndDate"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                  >
                </div>
                <!-- Quick Date Buttons -->
                <div class="flex flex-col gap-1">
                  <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Quick Select
                  </label>
                  <div class="flex gap-1">
                    <button 
                      id="pastFinishedLastWeekBtn"
                      class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      Last Week
                    </button>
                    <button 
                      id="pastFinishedLastMonthBtn"
                      class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      Last Month
                    </button>
                  </div>
                </div>
                <!-- Clear Button -->
                <div class="flex items-end">
                  <button 
                    id="clearPastFinishedCalendarBtn"
                    class="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 w-full"
                  >
                    Clear Filter
                  </button>
                </div>
              </div>
            </div>
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

        <!-- Visitor Dashboard Tabs -->
        <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav class="-mb-px flex space-x-8">
            <button 
              id="visitorCurrentTab"
              class="border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 px-1 py-2 text-sm font-medium"
            >
              Current Visits
            </button>
            <button 
              id="visitorPastTab"
              class="border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 px-1 py-2 text-sm font-medium"
            >
              Past Schedules
            </button>
          </nav>
        </div>

        <!-- Current Visits Content -->
        <div id="visitorCurrentContent" class="space-y-4">
          <!-- Current Visits Sub-tabs -->
          <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav class="-mb-px flex space-x-8">
              <button 
                id="visitorTodayTab"
                class="border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 px-1 py-2 text-sm font-medium"
              >
                Today
              </button>
              <button 
                id="visitorFutureTab"
                class="border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 px-1 py-2 text-sm font-medium"
              >
                Future
              </button>
            </nav>
          </div>

          <!-- Today Visits Content -->
          <div id="visitorTodayContent" class="space-y-4">
            <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
              <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Today's Visits</h3>
              <!-- Search and Filter Section -->
              <div class="flex flex-col gap-3 w-full lg:w-auto">
                <!-- Search and Filter Row -->
                <div class="grid grid-cols-1 sm:grid-cols-1 gap-2">
                  <!-- Status Filter -->
                  <select 
                    id="visitorTodayStatusFilter"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="unsuccessful">Unsuccessful</option>
                  </select>
                </div>
              </div>
            </div>
            <div id="visitorTodayVisitsList" class="space-y-4"></div>
          </div>

          <!-- Future Visits Content -->
          <div id="visitorFutureContent" class="hidden space-y-4">
            <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
              <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Future Visits</h3>
              <!-- Search and Filter Section -->
              <div class="flex flex-col gap-3 w-full lg:w-auto">
                <!-- Search and Filter Row -->
                <div class="grid grid-cols-1 sm:grid-cols-1 gap-2">
                  <!-- Date Picker -->
                  <input 
                    type="date" 
                    id="visitorFutureDatePicker"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                    min=""
                    max=""
                  >
                </div>
              </div>
            </div>
            <div id="visitorFutureVisitsList" class="space-y-4"></div>
          </div>
        </div>

        <!-- Past Schedules Content -->
        <div id="visitorPastContent" class="hidden space-y-4">
          <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Past Schedules</h3>
            <!-- Search and Filter Section -->
            <div class="flex flex-col gap-3 w-full lg:w-auto">
              <!-- Search and Filter Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <!-- Search Input -->
                <div class="relative">
                  <input 
                    type="text" 
                    id="visitorPastSearchInput"
                    placeholder="Search past schedules..."
                    class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                  >
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
                <!-- Status Filter -->
                <select 
                  id="visitorPastStatusFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="unsuccessful">Unsuccessful</option>
                </select>
                <!-- Place Filter -->
                <select 
                  id="visitorPastPlaceFilter"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                >
                  <option value="all">All Places</option>
                </select>
                <!-- Calendar Filter Toggle -->
                <button 
                  id="visitorPastCalendarToggle"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Date Filter
                </button>
              </div>
            </div>
          </div>
          
          <!-- Calendar Filter for Past Schedules -->
          <div id="visitorPastCalendarFilter" class="hidden mb-4">
            <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filter by Date Range</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <!-- Start Date -->
                <div>
                  <label for="visitorPastStartDate" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Start Date
                  </label>
                  <input 
                    type="date" 
                    id="visitorPastStartDate"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                  >
                </div>
                <!-- End Date -->
                <div>
                  <label for="visitorPastEndDate" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    End Date
                  </label>
                  <input 
                    type="date" 
                    id="visitorPastEndDate"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full"
                  >
                </div>
                <!-- Quick Date Buttons -->
                <div class="flex flex-col gap-1">
                  <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Quick Select
                  </label>
                  <div class="flex gap-1">
                    <button 
                      id="visitorPastLastWeekBtn"
                      class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      Last Week
                    </button>
                    <button 
                      id="visitorPastLastMonthBtn"
                      class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      Last Month
                    </button>
                  </div>
                </div>
                <!-- Clear Button -->
                <div class="flex items-end">
                  <button 
                    id="clearVisitorPastCalendarBtn"
                    class="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 w-full"
                  >
                    Clear Dates
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div id="visitorPastVisitsList" class="space-y-4"></div>
        </div>
      </div>

      <!-- Guard Dashboard Content -->
      <div id="guardContent" class="hidden bg-white dark:bg-gray-800 shadow rounded-lg p-2 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Guard Dashboard</h2>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-4">
            <button 
              id="refreshGuardBtn"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
            >
              Refresh
            </button>
          </div>
        </div>

        <!-- Guard Scan History Section -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Scan History</h3>
            <div class="flex flex-col sm:flex-row gap-2">
              <!-- Search Input -->
              <div class="relative">
                <input 
                  type="text" 
                  id="guardSearchInput"
                  placeholder="Search scan history..."
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
                id="guardActionFilter"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Actions</option>
                <option value="entrance">Entrance</option>
                <option value="exit">Exit</option>
                <option value="temporary_exit">Temporary Exit</option>
              </select>
            </div>
          </div>
          
          <!-- Scan History List -->
          <div id="guardScanHistoryList" class="space-y-4">
            <!-- Scan history will be loaded here -->
          </div>
        <!-- Pagination -->
        <div id="guardScanHistoryPagination" class="flex items-center justify-between mt-4">
          <button id="guardPrevPageBtn" class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded disabled:opacity-50">Previous</button>
          <span id="guardPageInfo" class="text-sm text-gray-700 dark:text-gray-300">Page 1</span>
          <button id="guardNextPageBtn" class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded disabled:opacity-50">Next</button>
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
      <div id="personnelAssignmentModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
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
      <div id="personnelAvailabilityModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
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

export async function loadPlaces() {
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
      <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-lg hover:scale-[1.02] cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-500">
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
                  <div class="flex items-center justify-between bg-white dark:bg-gray-600 rounded px-2 py-1 transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-500 hover:shadow-sm">
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      ${personnel.first_name || personnel.last_name ? 
                        `${personnel.first_name || ''} ${personnel.last_name || ''}` : 
                        `Personnel (${personnel.user_id.substring(0, 8)}...)`
                      }
                      <br><span class="text-xs text-gray-500 font-mono">${personnel.user_id.substring(0, 8)}...</span>
                    </span>
                    <button 
                      onclick="window.removePersonnelFromPlace('${place.id}', '${personnel.user_id}')"
                      class="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 text-sm transition-colors duration-200 ease-in-out hover:scale-110 transform"
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
            class="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200 ease-in-out hover:scale-110 transform"
            title="Assign personnel"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button 
            onclick="window.editPlace('${place.id}')"
            class="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200 ease-in-out hover:scale-110 transform"
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
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out transform hover:scale-[1.01] hover:shadow-sm cursor-pointer">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    <div class="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">
                      ${account.first_name || account.last_name ? 
                        `${account.first_name || ''} ${account.last_name || ''}` : 
                        'Unknown User'
                      }
                    </div>
                    <div class="text-xs text-gray-400 dark:text-gray-500 font-mono transition-colors duration-200">
                      ${account.user_id.substring(0, 8)}...
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md ${
                    account.role === 'log' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    account.role === 'personnel' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    account.role === 'guard' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    account.role === 'visitor' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }">
                    ${account.role.charAt(0).toUpperCase() + account.role.slice(1)}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  ${new Date(account.created_at).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <select 
                    onchange="window.changeUserRole('${account.user_id}', this.value)"
                    class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-all duration-200 hover:border-blue-400 hover:shadow-md"
                    style="min-width: 120px;"
                  >
                    <option value="log" ${account.role === 'log' ? 'selected' : ''}>Log</option>
                    <option value="personnel" ${account.role === 'personnel' ? 'selected' : ''}>Personnel</option>
                    <option value="guard" ${account.role === 'guard' ? 'selected' : ''}>Guard</option>
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
  const logsPageInfo = document.getElementById('logsPageInfo');
  const logsPrevBtn = document.getElementById('logsPrevBtn') as HTMLButtonElement;
  const logsNextBtn = document.getElementById('logsNextBtn') as HTMLButtonElement;
  
  if (logsList) {
    if (filteredLogs.length === 0) {
      logsList.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-600 dark:text-gray-300">No logs found matching your criteria.</p>
        </div>
      `;
      // Update pagination controls for empty state
      if (logsPageInfo) logsPageInfo.textContent = 'Page 1 of 1';
      if (logsPrevBtn) logsPrevBtn.disabled = true;
      if (logsNextBtn) logsNextBtn.disabled = true;
      return;
    }

    // Calculate pagination
    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / logsPageSize));
    
    // Ensure current page is within bounds
    if (currentLogsPage > totalPages) currentLogsPage = totalPages;
    if (currentLogsPage < 1) currentLogsPage = 1;
    
    // Get logs for current page
    const startIndex = (currentLogsPage - 1) * logsPageSize;
    const endIndex = startIndex + logsPageSize;
    const pageLogs = filteredLogs.slice(startIndex, endIndex);

    // Format log details asynchronously for current page only
    const formattedDetails = await Promise.all(
      (pageLogs as any[]).map(async (log: any) => {
        // Determine action override for visit_scheduled logs
        let displayAction = log.action;
        let parsedDetails: any = null;
        let overrideDetails: any = null;

        if (log.details) {
          parsedDetails = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
        }

        if (log.action === 'visit_scheduled' && parsedDetails) {
          // Check current_status first
          if (parsedDetails.current_status === 'completed') {
            displayAction = 'visit_completed';
          } else if (parsedDetails.current_status === 'completed_flagged') {
            displayAction = 'visit_completed_flagged';
          } else if (parsedDetails.current_status === 'temporary_exit') {
            // Reflect temporary exit state as its own action
            displayAction = 'visit_temporary_exit';
          } else if (parsedDetails.current_status === 'pending') {
            // Check if all places are completed but exit scan is pending
            if (Array.isArray(parsedDetails.history) && parsedDetails.history.length > 0) {
              const lastEvent = parsedDetails.history[parsedDetails.history.length - 1];
              if (lastEvent.event === 'completed' || lastEvent.event === 'place_completed') {
                if (lastEvent.details && lastEvent.details.all_places_completed) {
                  displayAction = 'visit_completed';
                }
              }
            }
          } else if (parsedDetails.current_status === 'unsuccessful') {
            displayAction = 'visit_unsuccessful';
          } else if (Array.isArray(parsedDetails.history) && parsedDetails.history.length > 0) {
            // If no current_status, check history events
            const lastEvent = parsedDetails.history[parsedDetails.history.length - 1];
            if (lastEvent.event === 'completed') {
              displayAction = 'visit_completed';
            } else if (lastEvent.event === 'completed_flagged') {
              displayAction = 'visit_completed_flagged';
            } else if (lastEvent.event === 'temporary_exit') {
              displayAction = 'visit_temporary_exit';
            } else if (lastEvent.event === 'unsuccessful' || lastEvent.event === 'failed' || lastEvent.event === 'marked_unsuccessful') {
              displayAction = 'visit_unsuccessful';
            }
          }

          // Fallback: If still visit_scheduled but the visit itself is now completed or completed_flagged, override
          if (displayAction === 'visit_scheduled' && parsedDetails.visit_id) {
            try {
              const { data: visitRow } = await supabase
                .from('scheduled_visits')
                .select('status, completed_at, completed_by')
                .eq('id', parsedDetails.visit_id)
                .single();
              if (visitRow && visitRow.status === 'completed') {
                displayAction = 'visit_completed';
                const syntheticEvent = {
                  event: 'completed',
                  timestamp: visitRow.completed_at || new Date().toISOString(),
                  details: {
                    by: 'system',
                    auto_marked: true,
                    note: 'Visit completed - auto-marked by system'
                  }
                };
                overrideDetails = {
                  ...parsedDetails,
                  current_status: 'completed',
                  completed_at: visitRow.completed_at,
                  completed_by: visitRow.completed_by,
                  history: Array.isArray(parsedDetails.history)
                    ? [...parsedDetails.history, syntheticEvent]
                    : [syntheticEvent]
                };
              } else if (visitRow && visitRow.status === 'completed_flagged') {
                displayAction = 'visit_completed_flagged';
                const syntheticEvent = {
                  event: 'completed_flagged',
                  timestamp: visitRow.completed_at || new Date().toISOString(),
                  details: {
                    by: 'system',
                    auto_marked: true,
                    note: 'Visit completed (flagged) - auto-marked by system'
                  }
                };
                overrideDetails = {
                  ...parsedDetails,
                  current_status: 'completed_flagged',
                  completed_at: visitRow.completed_at,
                  completed_by: visitRow.completed_by,
                  history: Array.isArray(parsedDetails.history)
                    ? [...parsedDetails.history, syntheticEvent]
                    : [syntheticEvent]
                };
              } else if (visitRow && visitRow.status === 'temporary_exit') {
                displayAction = 'visit_temporary_exit';
                const syntheticEvent = {
                  event: 'temporary_exit',
                  timestamp: new Date().toISOString(),
                  details: {
                    by: 'system',
                    note: 'Visit temporarily exited - current state'
                  }
                };
                overrideDetails = {
                  ...parsedDetails,
                  current_status: 'temporary_exit',
                  history: Array.isArray(parsedDetails.history)
                    ? [...parsedDetails.history, syntheticEvent]
                    : [syntheticEvent]
                };
              }
            } catch (e) {
              // ignore
            }
          }
        }

        const details = await formatLogDetails(overrideDetails ?? log.details, log.action, log);

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
              <th class="w-6"></th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            ${(formattedDetails as any[]).map((log: any) => `
              <tr class="relative hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out transform hover:scale-[1.01] hover:shadow-sm cursor-pointer group">
                <td class="px-2 py-4 align-middle">
                  ${shouldShowNotification(log.displayAction) ? `
                    <div class="w-3 h-3 ${(getNotificationConfig(log.displayAction)?.className) || 'bg-red-500'} rounded-full animate-pulse group-hover:scale-110 transition-transform duration-200" title="Important notification"></div>
                  ` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200">
                  ${new Date(log.created_at).toLocaleString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200">
                  ${log.user_roles ? 
                    `${log.user_roles.first_name || ''} ${log.user_roles.last_name || ''}`.trim() || 
                    log.user_roles.email || 
                    'Unknown User' 
                    : 'Guest User'}
                  ${log.user_roles ? 
                    `<br><span class="text-xs text-gray-500 font-mono group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors duration-200">${log.user_id.substring(0, 8)}...</span>` 
                    : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-2">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-all duration-200 group-hover:scale-105 ${
                      log.displayAction === 'password_change' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      log.displayAction === 'place_update' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      log.displayAction === 'place_availability_toggle' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      log.displayAction === 'place_create' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      log.displayAction === 'personnel_assignment' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      log.displayAction === 'personnel_removal' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      log.displayAction === 'personnel_availability_change' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                      log.displayAction === 'visit_scheduled' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' :
                      log.displayAction === 'visit_temporary_exit' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      log.displayAction === 'visit_completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                      log.displayAction === 'visit_completed_flagged' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      log.displayAction === 'visit_unsuccessful' ? 'bg-gray-200 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                      log.displayAction === 'gate_create' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' :
                      log.displayAction === 'gate_update' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                      log.displayAction === 'gate_status_change' ? 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200' :
                      log.displayAction === 'gate_entrance_scan' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      log.displayAction === 'gate_exit_scan' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      log.displayAction === 'visit_flagged_no_exit' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      log.displayAction === 'role_change' ? 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }">
                      ${log.displayAction === 'visit_completed_flagged' ? 'Completed (Flagged)' : log.displayAction.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                    ${log.displayAction === 'visit_completed_flagged' ? `
                      <button 
                        onclick="displayFlaggedVisitDetails('${log.details?.visit_id || log.details?.id || 'unknown'}')"
                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 group-hover:scale-110"
                        title="View full visit details"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                        </svg>
                      </button>
                    ` : ''}
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200">
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
          <div class="relative bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 pl-8 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer group">
            ${shouldShowNotification(log.displayAction) ? `
              <div class="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 ${(getNotificationConfig(log.displayAction)?.className) || 'bg-red-500'} rounded-full animate-pulse group-hover:scale-110 transition-transform duration-200" title="Important notification"></div>
            ` : ''}
            <div class="flex flex-col space-y-3">
              <!-- Header with timestamp and action -->
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div class="flex-1">
                  <div class="text-sm text-gray-500 dark:text-gray-400 mb-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200">
                    ${new Date(log.created_at).toLocaleString()}
                  </div>
                  <div class="text-sm text-gray-900 dark:text-white font-medium group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200">
                    ${log.user_roles ? 
                      `${log.user_roles.first_name || ''} ${log.user_roles.last_name || ''}`.trim() || 
                      log.user_roles.email || 
                      'Unknown User' 
                      : 'Guest User'}
                  </div>
                  ${log.user_roles ? 
                    `<div class="text-xs text-gray-500 font-mono group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors duration-200">${log.user_id.substring(0, 8)}...</div>` 
                    : ''}
                </div>
                <div class="flex-shrink-0">
                  <div class="flex items-center space-x-2">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-all duration-200 group-hover:scale-105 ${
                      log.displayAction === 'password_change' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      log.displayAction === 'place_update' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      log.displayAction === 'place_availability_toggle' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      log.displayAction === 'place_create' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      log.displayAction === 'personnel_assignment' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      log.displayAction === 'personnel_removal' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      log.displayAction === 'personnel_availability_change' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                      log.displayAction === 'visit_scheduled' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' :
                      log.displayAction === 'visit_temporary_exit' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      log.displayAction === 'visit_completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                      log.displayAction === 'visit_completed_flagged' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      log.displayAction === 'visit_unsuccessful' ? 'bg-gray-200 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                      log.displayAction === 'gate_create' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' :
                      log.displayAction === 'gate_update' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-cyan-200' :
                      log.displayAction === 'gate_status_change' ? 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200' :
                      log.displayAction === 'gate_entrance_scan' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      log.displayAction === 'gate_exit_scan' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      log.displayAction === 'visit_flagged_no_exit' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      log.displayAction === 'role_change' ? 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }">
                      ${log.displayAction === 'visit_completed_flagged' ? 'Completed (Flagged)' : log.displayAction.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                    ${log.displayAction === 'visit_completed_flagged' ? `
                      <button 
                        onclick="displayFlaggedVisitDetails('${log.details?.visit_id || log.details?.id || 'unknown'}')"
                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 group-hover:scale-110"
                        title="View full visit details"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                        </svg>
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
              
              <!-- Details section -->
              <div class="border-t border-gray-200 dark:border-gray-600 pt-3 group-hover:border-gray-300 dark:group-hover:border-gray-500 transition-colors duration-200">
                <div class="text-sm text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200">
                  ${log.formattedDetails}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    // Update pagination controls
    if (logsPageInfo) logsPageInfo.textContent = `Page ${currentLogsPage} of ${totalPages}`;
    if (logsPrevBtn) logsPrevBtn.disabled = currentLogsPage <= 1;
    if (logsNextBtn) logsNextBtn.disabled = currentLogsPage >= totalPages;
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
    let parsedDetails;
    
    // Handle different types of details data
    if (typeof details === 'string') {
      try {
        parsedDetails = JSON.parse(details);
      } catch (parseError) {
        console.error('Failed to parse details string:', details, parseError);
        return `<div class="text-red-600 dark:text-red-400">Invalid JSON format in details</div>`;
      }
    } else if (typeof details === 'object' && details !== null) {
      parsedDetails = details;
    } else {
      console.error('Unexpected details type:', typeof details, details);
      return `<div class="text-red-600 dark:text-red-400">Unexpected details format</div>`;
    }
    
    // Ensure parsedDetails is valid
    if (!parsedDetails || typeof parsedDetails !== 'object') {
      console.error('Parsed details is invalid:', parsedDetails);
      return `<div class="text-red-600 dark:text-red-400">Invalid details structure</div>`;
    }
    
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

    // Simple caches to avoid repeated network calls while rendering a page of logs
    const userNameCache: Record<string, string> = {};
    const placeNameCache: Record<string, string> = {};

    // Helper: validate UUID v4-ish (36 chars with hyphens). We skip DB calls for non-UUIDs like 'system'
    const isLikelyUuid = (id: string) => typeof id === 'string' && /^[0-9a-fA-F-]{36}$/.test(id);

    // Helper function to get place name
    const getPlaceName = async (placeId: string) => {
      if (!placeId) return 'Unknown place';
      if (placeNameCache[placeId]) return placeNameCache[placeId];
      
      try {
        const { data: place, error } = await supabase
          .from('places_to_visit')
          .select('name')
          .eq('id', placeId)
          .single();
        
        if (error || !place) {
          const fallback = `Place (${placeId.substring(0, 8)}...)`;
          placeNameCache[placeId] = fallback;
          return fallback;
        }
        
        placeNameCache[placeId] = place.name;
        return place.name;
      } catch (error) {
        const fallback = `Place (${placeId.substring(0, 8)}...)`;
        placeNameCache[placeId] = fallback;
        return fallback;
      }
    };

    // Helper function to get user name from user_roles
    const getUserName = async (userId: string) => {
      if (!userId) return 'Unknown user';
      if (userNameCache[userId]) return userNameCache[userId];
      if (!isLikelyUuid(userId)) {
        const label = userId.toLowerCase() === 'system' ? 'System' : `User (${userId.substring(0, 8)}...)`;
        userNameCache[userId] = label;
        return label;
      }
      
      try {
        const { data: user, error } = await supabase
          .from('user_roles')
          .select('first_name, last_name, email')
          .eq('user_id', userId)
          .single();
        
        if (error || !user) {
          const fallback = `User (${userId.substring(0, 8)}...)`;
          userNameCache[userId] = fallback;
          return fallback;
        }
        
        const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        const label = name || user.email || `User (${userId.substring(0, 8)}...)`;
        userNameCache[userId] = label;
        return label;
      } catch (error) {
        const fallback = `User (${userId.substring(0, 8)}...)`;
        userNameCache[userId] = fallback;
        return fallback;
      }
    };
    
    switch (action) {
      case 'password_change':
        return `Password changed for user`;
      case 'visit_scheduled': {
        // Handle multi-place visits
        let placesHtml = '';
        let personnelHtml = '';
        
        // Validate required fields
        if (!parsedDetails.visitor_name && !parsedDetails.visitor_first_name) {
          return `<div class="text-red-600 dark:text-red-400">Missing visitor information</div>`;
        }
        
        const visitorName = parsedDetails.visitor_name || 
          `${parsedDetails.visitor_first_name || ''} ${parsedDetails.visitor_last_name || ''}`.trim();
        
        // Check if this is a multi-place visit
        if (parsedDetails.place_ids && Array.isArray(parsedDetails.place_ids) && parsedDetails.place_ids.length > 1) {
          // Multi-place visit
          const placeNames = Array.isArray(parsedDetails.place_names) ? parsedDetails.place_names : [];
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
          const status = parsedDetails.current_status;
          let statusClass = 'text-blue-600 dark:text-blue-400 font-semibold';
          let statusText = status.charAt(0).toUpperCase() + status.slice(1).replace('_',' ');
          if (status === 'unsuccessful' || status === 'failed') {
            statusClass = 'text-red-600 dark:text-red-400 font-semibold';
            statusText = 'Unsuccessful';
          } else if (status === 'completed') {
            statusClass = 'text-green-600 dark:text-green-400 font-semibold';
            statusText = 'Completed';
          } else if (status === 'completed_flagged') {
            statusClass = 'text-yellow-600 dark:text-yellow-400 font-semibold';
            statusText = 'Completed (Flagged)';
          } else if (status === 'temporary_exit') {
            statusClass = 'text-blue-600 dark:text-blue-400 font-semibold';
            statusText = 'Temporary Exit';
          }
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
              const validPersonnelNames = Array.isArray(personnelNames) ? personnelNames.filter(name => name) : [];
              if (validPersonnelNames.length > 0) {
                personnelHtml = `<div><span class="font-medium">Completed by:</span> ${validPersonnelNames.join(', ')}</div>`;
              }
            }
          }
        }
        
        let historyHtml = '';
        {
          const historyId = `history-${log?.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Get gate scan information for this visit
          let gateScanInfo = '';
          if (parsedDetails.visit_id) {
            try {
              const { data: gateScans, error: gateError } = await supabase.rpc('get_visit_gate_scans', {
                p_visit_id: parsedDetails.visit_id
              });
              
              // Also get visit data from scheduled_visits table as fallback
              const { data: visitData, error: visitError } = await supabase
                .from('scheduled_visits')
                .select('gate_entrance_scanned, gate_entrance_scanned_at, gate_entrance_scanned_by, gate_exit_scanned, gate_exit_scanned_at, gate_exit_scanned_by')
                .eq('id', parsedDetails.visit_id)
                .single();
              
              if (!gateError && gateScans && gateScans.length > 0) {
                const entranceScan = gateScans.find((scan: any) => scan.scan_type === 'entrance');
                const exitScan = gateScans.find((scan: any) => scan.scan_type === 'exit');
                
                gateScanInfo = '<div class="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">';
                gateScanInfo += '<div class="font-medium text-blue-800 dark:text-blue-200 mb-1">Gate Scans:</div>';
                
                if (entranceScan) {
                  const entranceTime = new Date(entranceScan.scanned_at).toLocaleString();
                  gateScanInfo += `<div class="text-xs text-green-600 dark:text-green-400">✅ Entrance: ${entranceScan.gate_name} at ${entranceTime}</div>`;
                } else if (visitData && visitData.gate_entrance_scanned) {
                  // Fallback to scheduled_visits table data
                  const entranceTime = visitData.gate_entrance_scanned_at ? new Date(visitData.gate_entrance_scanned_at).toLocaleString() : 'Unknown time';
                  gateScanInfo += `<div class="text-xs text-green-600 dark:text-green-400">✅ Entrance: Scanned at ${entranceTime}</div>`;
                } else {
                  gateScanInfo += `<div class="text-xs text-gray-500">⏳ Entrance: Not scanned</div>`;
                }
                
                if (exitScan) {
                  const exitTime = new Date(exitScan.scanned_at).toLocaleString();
                  gateScanInfo += `<div class="text-xs text-green-600 dark:text-green-400">✅ Exit: ${exitScan.gate_name} at ${exitTime}</div>`;
                  
                  // Calculate visit duration if both scans exist
                  if (entranceScan) {
                    const entranceDate = new Date(entranceScan.scanned_at);
                    const exitDate = new Date(exitScan.scanned_at);
                    const durationMs = exitDate.getTime() - entranceDate.getTime();
                    const durationMinutes = Math.round(durationMs / (1000 * 60));
                    const durationHours = Math.floor(durationMinutes / 60);
                    const remainingMinutes = durationMinutes % 60;
                    
                    let durationText = '';
                    if (durationHours > 0) {
                      durationText = `${durationHours}h ${remainingMinutes}m`;
                    } else {
                      durationText = `${durationMinutes}m`;
                    }
                    
                    gateScanInfo += `<div class="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">⏱️ Total Visit Time: ${durationText}</div>`;
                  }
                } else if (visitData && visitData.gate_exit_scanned) {
                  // Fallback to scheduled_visits table data for exit
                  const exitTime = visitData.gate_exit_scanned_at ? new Date(visitData.gate_exit_scanned_at).toLocaleString() : 'Unknown time';
                  gateScanInfo += `<div class="text-xs text-green-600 dark:text-green-400">✅ Exit: Scanned at ${exitTime}</div>`;
                } else {
                  gateScanInfo += `<div class="text-xs text-gray-500">⏳ Exit: Not scanned</div>`;
                }
                
                // Add entrance/exit buttons for face data if scans exist
                if ((entranceScan || (visitData && visitData.gate_entrance_scanned)) || (exitScan || (visitData && visitData.gate_exit_scanned))) {
                  gateScanInfo += '<div class="mt-2 flex items-center space-x-2">';
                  
                  if (entranceScan || (visitData && visitData.gate_entrance_scanned)) {
                    gateScanInfo += `
                      <button 
                        onclick="showFaceDataModal('${parsedDetails.visit_id}', '${visitorName}', 'entrance')"
                        class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 flex items-center space-x-1"
                        title="View entrance face data"
                      >
                        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Entrance</span>
                      </button>
                    `;
                  }
                  
                  if (exitScan || (visitData && visitData.gate_exit_scanned)) {
                    gateScanInfo += `
                      <button 
                        onclick="showFaceDataModal('${parsedDetails.visit_id}', '${visitorName}', 'exit')"
                        class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200 flex items-center space-x-1"
                        title="View exit face data"
                      >
                        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Exit</span>
                      </button>
                    `;
                  }
                  
                  gateScanInfo += '</div>';
                }
                
                gateScanInfo += '</div>';
              } else if (visitData && (visitData.gate_entrance_scanned || visitData.gate_exit_scanned)) {
                // Fallback: use scheduled_visits table data when gate_scans table is empty
                gateScanInfo = '<div class="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">';
                gateScanInfo += '<div class="font-medium text-blue-800 dark:text-blue-200 mb-1">Gate Scans:</div>';
                
                if (visitData.gate_entrance_scanned) {
                  const entranceTime = visitData.gate_entrance_scanned_at ? new Date(visitData.gate_entrance_scanned_at).toLocaleString() : 'Unknown time';
                  gateScanInfo += `<div class="text-xs text-green-600 dark:text-green-400">✅ Entrance: Scanned at ${entranceTime}</div>`;
                } else {
                  gateScanInfo += `<div class="text-xs text-gray-500">⏳ Entrance: Not scanned</div>`;
                }
                
                if (visitData.gate_exit_scanned) {
                  const exitTime = visitData.gate_exit_scanned_at ? new Date(visitData.gate_exit_scanned_at).toLocaleString() : 'Unknown time';
                  gateScanInfo += `<div class="text-xs text-green-600 dark:text-green-400">✅ Exit: Scanned at ${exitTime}</div>`;
                } else {
                  gateScanInfo += `<div class="text-xs text-gray-500">⏳ Exit: Not scanned</div>`;
                }
                
                // Add entrance/exit buttons for face data if scans exist
                if (visitData.gate_entrance_scanned || visitData.gate_exit_scanned) {
                  gateScanInfo += '<div class="mt-2 flex items-center space-x-2">';
                  
                  if (visitData.gate_entrance_scanned) {
                    gateScanInfo += `
                      <button 
                        onclick="showFaceDataModal('${parsedDetails.visit_id}', '${visitorName}', 'entrance')"
                        class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 flex items-center space-x-1"
                        title="View entrance face data"
                      >
                        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Entrance</span>
                      </button>
                    `;
                  }
                  
                  if (visitData.gate_exit_scanned) {
                    gateScanInfo += `
                      <button 
                        onclick="showFaceDataModal('${parsedDetails.visit_id}', '${visitorName}', 'exit')"
                        class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200 flex items-center space-x-1"
                        title="View exit face data"
                      >
                        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Exit</span>
                      </button>
                    `;
                  }
                  
                  gateScanInfo += '</div>';
                }
                
                gateScanInfo += '</div>';
              }
            } catch (error) {
              console.error('Error fetching gate scans:', error);
            }
          }
          
          // Build existing history items (may be empty)
          const baseHistory = Array.isArray(parsedDetails.history) ? parsedDetails.history : [];
          const historyItemsFromLog = baseHistory.map((event: any) => {
            try {
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
                  const completedPlaces = Array.isArray(event.details.completed_places) 
                    ? event.details.completed_places.join(', ')
                    : String(event.details.completed_places);
                  details += `<span class='text-xs text-green-500'>Places: ${completedPlaces}</span> `;
                }
                if (event.event === 'temporary_exit') {
                  details += `<span class='text-xs text-blue-500'>Temporary exit recorded</span> `;
                }
              }
              return `<li class="py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0"><span class='font-semibold'>${eventType}</span> <span class='text-xs text-gray-400'>${eventTime}</span> ${details}</li>`;
            } catch (error) {
              console.error('Error processing history event:', error, event);
              return `<li class="py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0"><span class='font-semibold text-red-600'>Error processing event</span></li>`;
            }
          }).filter(item => item);

          // Fetch temporary-exit logs for this visit and append as history items with time
          let tempExitItems: string[] = [];
          if (parsedDetails.visit_id) {
            try {
              const { data: tempExitLogs, error: tempErr } = await supabase
                .from('logs')
                .select('created_at, details')
                .eq('action', 'visit_temporary_exit')
                .contains('details', { visit_id: parsedDetails.visit_id });
              if (!tempErr && Array.isArray(tempExitLogs)) {
                tempExitItems = await Promise.all(tempExitLogs.map(async (row: any) => {
                  const when = row?.details?.timestamp || row?.created_at;
                  const guardId = row?.details?.guard_id;
                  const guardName = guardId ? await getUserName(guardId) : 'Guard';
                  const timeText = when ? new Date(when).toLocaleString() : 'Unknown time';
                  return `<li class="py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0"><span class='font-semibold'>Temporary Exit</span> <span class='text-xs text-gray-400'>${timeText}</span> <span class='text-xs text-blue-500'>(By: ${guardName})</span></li>`;
                }));
              }
            } catch (e) {
              console.error('Error fetching temporary-exit logs:', e);
            }
          }

          const combinedHistoryItems = [...historyItemsFromLog, ...tempExitItems].join('');
          
          if (combinedHistoryItems.length > 0) {
            const totalCount = (Array.isArray(parsedDetails.history) ? parsedDetails.history.length : 0) + tempExitItems.length;
            historyHtml = `
              <div class="mt-2">
                <button 
                  class="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 text-sm font-medium flex items-center gap-1 w-full justify-between p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 touch-manipulation"
                  id="btn-${historyId}"
                  style="min-height: 44px; -webkit-tap-highlight-color: transparent;"
                >
                  <span>See History (${totalCount} events)</span>
                  <svg class="w-4 h-4 transition-transform duration-200 flex-shrink-0" id="icon-${historyId}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div class="hidden mt-2 bg-gray-50 dark:bg-gray-800 rounded-md p-3" id="${historyId}">
                  ${gateScanInfo}
                  <ul class="space-y-1 text-sm">
                    ${combinedHistoryItems}
                  </ul>
                </div>
              </div>`;
          }
        }
        return `<div><span class="font-medium">Visitor:</span> ${visitorName || 'Unknown visitor'}</div><div><span class="font-medium">Date:</span> ${parsedDetails.visit_date ? new Date(parsedDetails.visit_date).toLocaleDateString() : 'Unknown date'}</div>${placesHtml}<div><span class="font-medium">Purpose:</span> ${parsedDetails.purpose || 'Not specified'}</div>${personnelHtml}${statusHtml}${historyHtml}`;
      }
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
        return `<div><span class="font-medium">Personnel:</span> ${await getUserName(parsedDetails.personnel_id)}</div><div><span class="font-medium">Place:</span> ${availabilityPlaceName}</div><div><span class="font-medium">Status:</span> <span class="${statusColor}">${status}</span></div>${reason}`;
      case 'gate_entrance_scan':
        const entranceGateName = parsedDetails.gate_name || 'Unknown Gate';
        const entranceVisitorName = parsedDetails.visitor_name || 'Unknown Visitor';
        const entranceTime = parsedDetails.scanned_at ? new Date(parsedDetails.scanned_at).toLocaleString() : 'Unknown time';
        return `<div><span class="font-medium">Gate:</span> ${entranceGateName}</div><div><span class="font-medium">Visitor:</span> ${entranceVisitorName}</div><div><span class="font-medium">Time:</span> ${entranceTime}</div>`;
      case 'gate_exit_scan':
        const exitGateName = parsedDetails.gate_name || 'Unknown Gate';
        const exitVisitorName = parsedDetails.visitor_name || 'Unknown Visitor';
        const exitTime = parsedDetails.scanned_at ? new Date(parsedDetails.scanned_at).toLocaleString() : 'Unknown time';
        return `<div><span class="font-medium">Gate:</span> ${exitGateName}</div><div><span class="font-medium">Visitor:</span> ${exitVisitorName}</div><div><span class="font-medium">Time:</span> ${exitTime}</div>`;
      case 'visit_flagged_no_exit':
        const flaggedVisitorName = parsedDetails.visitor_name || 'Unknown Visitor';
        const flaggedTime = parsedDetails.flagged_at ? new Date(parsedDetails.flagged_at).toLocaleString() : 'Unknown time';
        const flaggedReason = parsedDetails.reason || 'No exit scan recorded';
        return `<div><span class="font-medium">Visitor:</span> ${flaggedVisitorName}</div><div><span class="font-medium">Flagged at:</span> ${flaggedTime}</div><div><span class="font-medium">Reason:</span> <span class="text-red-600 dark:text-red-400">${flaggedReason}</span></div>`;

      case 'guard_action': {
        const guardAction = (parsedDetails.action || '').toLowerCase();
        const actionLabel = guardAction === 'entrance' ? 'Entrance Logged' : guardAction === 'exit' ? 'Exit Logged' : 'Action Logged';
        const actionClass = guardAction === 'entrance'
          ? 'text-green-600 dark:text-green-400'
          : guardAction === 'exit'
          ? 'text-red-600 dark:text-red-400'
          : 'text-gray-700 dark:text-gray-300';

        const visitShort = parsedDetails.visit_id ? `${String(parsedDetails.visit_id).substring(0, 8)}...` : 'Unknown';
        const when = parsedDetails.timestamp ? new Date(parsedDetails.timestamp).toLocaleString() : 'Unknown time';
        const guardName = parsedDetails.guard_id ? await getUserName(parsedDetails.guard_id) : getUserDisplayName(log?.user_id || '');

        return `
          <div>
            <span class="font-medium">Action:</span>
            <span class="${actionClass} font-semibold">${actionLabel}</span>
          </div>
          <div><span class="font-medium">Guard:</span> ${guardName}</div>
          <div><span class="font-medium">Visit:</span> ${visitShort}</div>
          <div><span class="font-medium">Time:</span> ${when}</div>
        `;
      }


      case 'visit_completed':
        const completedVisitPlaceName = await getPlaceName(parsedDetails.place_id);
        return `<div><span class="font-medium">Visit ID:</span> ${parsedDetails.visit_id ? parsedDetails.visit_id.substring(0, 8) + '...' : 'Unknown'}</div><div><span class="font-medium">Place:</span> ${completedVisitPlaceName}</div><div><span class="font-medium">Completed:</span> ${new Date(parsedDetails.completed_at).toLocaleString()}</div>`;
      case 'visit_completed_flagged': {
        const completedBy = parsedDetails.completed_by ? await getUserName(parsedDetails.completed_by) : 'System';
        const completedDate = parsedDetails.completed_at ? new Date(parsedDetails.completed_at).toLocaleString() : 'Unknown';

        // If history exists in details, render it similarly to visit_scheduled
        let historyHtml = '';
        if (Array.isArray(parsedDetails.history) && parsedDetails.history.length > 0) {
          const historyId = `history-${log?.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          const historyItems = parsedDetails.history.map((event: any) => {
            try {
              const eventType = event.event ? event.event.charAt(0).toUpperCase() + event.event.slice(1) : 'Event';
              const eventTime = event.timestamp ? new Date(event.timestamp).toLocaleString() : '';
              let details = '';
              if (event.details) {
                if (event.details.by) {
                  details += `<span class='text-xs text-gray-500'>(By: ${event.details.by})</span> `;
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
              }
              return `<li class="py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0"><span class='font-semibold'>${eventType}</span> <span class='text-xs text-gray-400'>${eventTime}</span> ${details}</li>`;
            } catch (error) {
              console.error('Error processing history event:', error, event);
              return `<li class="py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0"><span class='font-semibold text-red-600'>Error processing event</span></li>`;
            }
          }).filter(item => item).join('');

          historyHtml = `
            <div class="mt-2">
              <button 
                class="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 text-sm font-medium flex items-center gap-1 w-full justify-between p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                id="btn-${historyId}"
              >
                <span>See History (${parsedDetails.history.length} events)</span>
                <svg class="w-4 h-4 transition-transform duration-200" id="icon-${historyId}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        return `<div><span class="font-medium">Visit ID:</span> ${parsedDetails.visit_id ? parsedDetails.visit_id.substring(0, 8) + '...' : 'Unknown'}</div><div><span class="font-medium">Completed by:</span> ${completedBy}</div><div><span class="font-medium">Completed at:</span> ${completedDate}</div><div><span class="font-medium text-orange-600 dark:text-orange-400">Status:</span> <span class="text-orange-600 dark:text-orange-400 font-semibold">Visit completed (flagged) - No exit scan</span></div>${historyHtml}`;
      }
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
            try {
              const statusClass = place.status === 'completed' ? 'text-green-600' : 'text-red-600';
              return `<span class="${statusClass}">${place.place_name || 'Unknown Place'}</span>`;
            } catch (error) {
              console.error('Error processing place in visit_unsuccessful:', error, place);
              return `<span class="text-red-600">Unknown Place</span>`;
            }
          }).filter(name => name).join(', ');
          placesHtml = `<div><span class="font-medium">Places:</span> ${placeNames}</div>`;
        } else if (parsedDetails.place_names && Array.isArray(parsedDetails.place_names)) {
          // Multi-place visit from original scheduling
          const placeNames = parsedDetails.place_names.map((name: string) => {
            try {
              return `<span class="text-blue-600">${name || 'Unknown Place'}</span>`;
            } catch (error) {
              console.error('Error processing place name in visit_unsuccessful:', error, name);
              return `<span class="text-red-600">Unknown Place</span>`;
            }
          }).filter(name => name).join(', ');
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
      case 'gate_create': {
        const gateTypeClass = parsedDetails.gate_type === 'entrance' ? 'text-blue-600 dark:text-blue-400' : 
                             parsedDetails.gate_type === 'exit' ? 'text-red-600 dark:text-red-400' : 
                             'text-purple-600 dark:text-purple-400';
        const gateTypeText = parsedDetails.gate_type === 'entrance' ? 'Entrance Gate' : 
                           parsedDetails.gate_type === 'exit' ? 'Exit Gate' : 
                           'Entrance/Exit Gate';
        
        let detailsHtml = `<div><span class="font-medium">Gate Name:</span> <span class="font-semibold">${parsedDetails.gate_name || 'Unknown Gate'}</span></div>`;
        
        if (parsedDetails.gate_description) {
          detailsHtml += `<div><span class="font-medium">Description:</span> ${parsedDetails.gate_description}</div>`;
        }
        
        if (parsedDetails.gate_location) {
          detailsHtml += `<div><span class="font-medium">Location:</span> 📍 ${parsedDetails.gate_location}</div>`;
        }
        
        detailsHtml += `<div><span class="font-medium">Type:</span> <span class="${gateTypeClass} font-semibold">${gateTypeText}</span></div>`;
        detailsHtml += `<div><span class="font-medium">Initial Status:</span> <span class="text-gray-600 dark:text-gray-400">Closed</span></div>`;
        
        if (parsedDetails.created_at) {
          detailsHtml += `<div><span class="font-medium">Created:</span> ${new Date(parsedDetails.created_at).toLocaleString()}</div>`;
        }
        
        return detailsHtml;
      }
      case 'gate_update': {
        // Handle both regular updates and deletions
        if (parsedDetails.action === 'deleted') {
          return `<div><span class="font-medium">Gate Deleted:</span> <span class="font-semibold text-red-600">${parsedDetails.gate_name || 'Unknown Gate'}</span></div>
                  <div><span class="font-medium">Deleted:</span> ${parsedDetails.deleted_at ? new Date(parsedDetails.deleted_at).toLocaleString() : 'Unknown time'}</div>`;
        }
        
        // Regular gate update
        const changes = [];
        
        if (parsedDetails.old_name !== parsedDetails.new_name) {
          changes.push(`<div class="mb-1"><span class="font-medium">Name:</span> <span class="text-red-600 dark:text-red-400">"${parsedDetails.old_name}"</span> <span class="text-gray-500">→</span> <span class="text-green-600 dark:text-green-400">"${parsedDetails.new_name}"</span></div>`);
        }
        
        if (parsedDetails.old_description !== parsedDetails.new_description) {
          changes.push(`<div class="mb-1"><span class="font-medium">Description:</span> <span class="text-red-600 dark:text-red-400">"${parsedDetails.old_description || 'None'}"</span> <span class="text-gray-500">→</span> <span class="text-green-600 dark:text-green-400">"${parsedDetails.new_description || 'None'}"</span></div>`);
        }
        
        if (parsedDetails.old_location !== parsedDetails.new_location) {
          changes.push(`<div class="mb-1"><span class="font-medium">Location:</span> <span class="text-red-600 dark:text-red-400">"${parsedDetails.old_location || 'None'}"</span> <span class="text-gray-500">→</span> <span class="text-green-600 dark:text-green-400">"${parsedDetails.new_location || 'None'}"</span></div>`);
        }
        
        if (parsedDetails.old_gate_type !== parsedDetails.new_gate_type) {
          const oldTypeClass = parsedDetails.old_gate_type === 'entrance' ? 'text-blue-600' : 
                              parsedDetails.old_gate_type === 'exit' ? 'text-red-600' : 'text-purple-600';
          const newTypeClass = parsedDetails.new_gate_type === 'entrance' ? 'text-blue-600' : 
                              parsedDetails.new_gate_type === 'exit' ? 'text-red-600' : 'text-purple-600';
          changes.push(`<div class="mb-1"><span class="font-medium">Type:</span> <span class="${oldTypeClass}">"${parsedDetails.old_gate_type}"</span> <span class="text-gray-500">→</span> <span class="${newTypeClass}">"${parsedDetails.new_gate_type}"</span></div>`);
        }
        
        if (parsedDetails.updated_at) {
          changes.push(`<div class="mb-1"><span class="font-medium">Updated:</span> ${new Date(parsedDetails.updated_at).toLocaleString()}</div>`);
        }
        
        return changes.length > 0 ? `<div class="space-y-1">${changes.join('')}</div>` : 'Gate details updated';
      }
      case 'gate_status_change': {
        const statusClass = parsedDetails.new_status === 'open' ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold';
        const statusText = parsedDetails.new_status === 'open' ? 'Opened' : 'Closed';
        const oldStatusClass = parsedDetails.old_status === 'open' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
        
        let detailsHtml = `<div><span class="font-medium">Gate:</span> <span class="font-semibold">${parsedDetails.gate_name || 'Unknown Gate'}</span></div>`;
        detailsHtml += `<div><span class="font-medium">Status Change:</span> <span class="${oldStatusClass}">${parsedDetails.old_status}</span> <span class="text-gray-500">→</span> <span class="${statusClass}">${statusText}</span></div>`;
        
        if (parsedDetails.updated_at) {
          detailsHtml += `<div><span class="font-medium">Changed:</span> ${new Date(parsedDetails.updated_at).toLocaleString()}</div>`;
        }
        
        return detailsHtml;
      }
      case 'role_change': {
        const roleColors: { [key: string]: string } = {
          'admin': 'text-red-600 dark:text-red-400',
          'log': 'text-blue-600 dark:text-blue-400',
          'personnel': 'text-green-600 dark:text-green-400',
          'visitor': 'text-yellow-600 dark:text-yellow-400',
          'guest': 'text-gray-600 dark:text-gray-400'
        };
        
        const oldRoleClass = roleColors[parsedDetails.old_role] || 'text-gray-600 dark:text-gray-400';
        const newRoleClass = roleColors[parsedDetails.new_role] || 'text-gray-600 dark:text-gray-400';
        
        let detailsHtml = `<div><span class="font-medium">Target User:</span> <span class="font-semibold">${parsedDetails.target_user_name || 'Unknown User'}</span></div>`;
        detailsHtml += `<div><span class="font-medium">Email:</span> <span class="text-sm text-gray-600 dark:text-gray-400">${parsedDetails.target_user_email || 'Unknown'}</span></div>`;
        detailsHtml += `<div><span class="font-medium">Role Change:</span> <span class="${oldRoleClass} font-semibold">${parsedDetails.old_role}</span> <span class="text-gray-500">→</span> <span class="${newRoleClass} font-semibold">${parsedDetails.new_role}</span></div>`;
        detailsHtml += `<div><span class="font-medium">Changed By:</span> <span class="font-semibold">${parsedDetails.admin_user_name || 'Unknown Admin'}</span></div>`;
        
        if (parsedDetails.changed_at) {
          detailsHtml += `<div><span class="font-medium">Changed:</span> ${new Date(parsedDetails.changed_at).toLocaleString()}</div>`;
        }
        
        return detailsHtml;
      }
      case 'visit_temporary_exit': {
        const visitorName = parsedDetails.visitor_name || 'Unknown Visitor';
        const visitId = parsedDetails.visit_id ? parsedDetails.visit_id.substring(0, 8) + '...' : 'Unknown';
        const timestamp = parsedDetails.timestamp ? new Date(parsedDetails.timestamp).toLocaleString() : 'Unknown time';
        const guardId = parsedDetails.guard_id ? parsedDetails.guard_id.substring(0, 8) + '...' : 'Unknown';
        
        return `<div><span class="font-medium">Visitor:</span> ${visitorName}</div><div><span class="font-medium">Visit ID:</span> ${visitId}</div><div><span class="font-medium">Temporary Exit Time:</span> <span class="text-blue-600 dark:text-blue-400 font-semibold">${timestamp}</span></div><div><span class="font-medium">Processed by Guard:</span> ${guardId}</div>`;
      }
      case 'visit_feedback_submitted': {
        const visitorName = parsedDetails.visitor_name || 'Unknown Visitor';
        const visitorEmail = parsedDetails.visitor_email || 'Unknown Email';
        const visitId = parsedDetails.visit_id ? parsedDetails.visit_id.substring(0, 8) + '...' : 'Unknown';
        const feedbackId = parsedDetails.feedback_id ? parsedDetails.feedback_id.substring(0, 8) + '...' : 'Unknown';
        const overallSatisfaction = parsedDetails.overall_satisfaction || 'Not rated';
        const hasComments = parsedDetails.has_comments ? 'Yes' : 'No';
        
        // Create satisfaction rating display
        let satisfactionDisplay = '';
        if (typeof overallSatisfaction === 'number' && overallSatisfaction >= 1 && overallSatisfaction <= 5) {
          const stars = '★'.repeat(overallSatisfaction) + '☆'.repeat(5 - overallSatisfaction);
          const satisfactionClass = overallSatisfaction >= 4 ? 'text-green-600 dark:text-green-400' : 
                                   overallSatisfaction >= 3 ? 'text-yellow-600 dark:text-yellow-400' : 
                                   'text-red-600 dark:text-red-400';
          satisfactionDisplay = `<span class="${satisfactionClass} font-semibold">${stars} (${overallSatisfaction}/5)</span>`;
        } else {
          satisfactionDisplay = `<span class="text-gray-600 dark:text-gray-400">${overallSatisfaction}</span>`;
        }
        
        return `<div><span class="font-medium">Visitor:</span> <span class="font-semibold">${visitorName}</span></div>
                <div><span class="font-medium">Email:</span> <span class="text-sm text-gray-600 dark:text-gray-400">${visitorEmail}</span></div>
                <div><span class="font-medium">Visit ID:</span> ${visitId}</div>
                <div><span class="font-medium">Feedback ID:</span> ${feedbackId}</div>
                <div><span class="font-medium">Overall Satisfaction:</span> ${satisfactionDisplay}</div>
                <div><span class="font-medium">Has Comments:</span> <span class="${hasComments === 'Yes' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}">${hasComments}</span></div>`;
      }
      default:
        return `<pre class="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">${JSON.stringify(parsedDetails, null, 2)}</pre>`;
    }
  } catch (error) {
    console.error('Error in formatLogDetails:', error, 'Action:', action, 'Details:', details);
    return `<div class="text-red-600 dark:text-red-400">Error formatting details: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
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

  try {
    // Import the logging function
    const { changeUserRoleWithLogging } = await import('../../utils/logging');
    
    // Use the new function that includes logging
    const result = await changeUserRoleWithLogging(userId, newRole);
    
    if (!result.success) {
      console.error('Error updating user role:', result.error);
      showNotification(`Error updating user role: ${result.error}`, 'error');
    return;
  }

  showNotification(`User role changed to ${newRole.charAt(0).toUpperCase() + newRole.slice(1)} successfully!`, 'success');
  loadAccounts(); // Reload the accounts list
  } catch (error) {
    console.error('Error in changeUserRole:', error);
    showNotification('Error updating user role. Please try again.', 'error');
  }
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

// Function to set max date for finished schedule date filters to prevent selecting future dates
function setMaxDateForFinishedFilters() {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  // Set max date for finished specific date filter
  const finishedSpecificDateFilter = document.getElementById('finishedSpecificDateFilter') as HTMLInputElement;
  if (finishedSpecificDateFilter) {
    finishedSpecificDateFilter.setAttribute('max', todayString);
  }
  
  // Set max date for past finished start date filter
  const pastFinishedStartDate = document.getElementById('pastFinishedStartDate') as HTMLInputElement;
  if (pastFinishedStartDate) {
    pastFinishedStartDate.setAttribute('max', todayString);
  }
  
  // Set max date for past finished end date filter
  const pastFinishedEndDate = document.getElementById('pastFinishedEndDate') as HTMLInputElement;
  if (pastFinishedEndDate) {
    pastFinishedEndDate.setAttribute('max', todayString);
  }
}

// Function to update the clear date button visibility
function updateClearDateButton() {
  const clearSpecificDateBtn = document.getElementById('clearSpecificDateBtn');
  if (clearSpecificDateBtn) {
    if (currentFinishedSpecificDate) {
      clearSpecificDateBtn.classList.remove('hidden');
    } else {
      clearSpecificDateBtn.classList.add('hidden');
    }
  }
}

// Setup dashboard-specific event listeners
function setupDashboardEventListeners() {
  
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


  // Manual status update button
  const manualStatusUpdateBtn = document.getElementById('manualStatusUpdateBtn');
  if (manualStatusUpdateBtn) {
    manualStatusUpdateBtn.addEventListener('click', async () => {
      try {
        // Show loading state
        (manualStatusUpdateBtn as HTMLButtonElement).disabled = true;
        manualStatusUpdateBtn.innerHTML = `
          <svg class="w-4 h-4 inline mr-2 text-yellow-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Updating...`;
        
        // Force update visit statuses
        await forceUpdateVisitStatuses();
        
        // Show success notification
        showNotification('Visit statuses updated successfully!', 'success');
      } catch (error) {
        console.error('Error updating visit statuses:', error);
        showNotification('Error updating visit statuses. Please try again.', 'error');
      } finally {
        // Reset button state
        (manualStatusUpdateBtn as HTMLButtonElement).disabled = false;
        manualStatusUpdateBtn.innerHTML = `
          <svg class="w-4 h-4 inline mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          Update Statuses`;
      }
    });
  }

  // Debug visit button
  const debugVisitBtn = document.getElementById('debugVisitBtn');
  if (debugVisitBtn) {
    debugVisitBtn.addEventListener('click', async () => {
      try {
        // Show loading state
        (debugVisitBtn as HTMLButtonElement).disabled = true;
        debugVisitBtn.innerHTML = `
          <svg class="w-4 h-4 inline mr-2 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Debugging...`;
        
        // Debug specific visit
        await debugSpecificVisit();
        
      } catch (error) {
        console.error('Error debugging visit:', error);
        showNotification('Error debugging visit. Please try again.', 'error');
      } finally {
        // Reset button state
        (debugVisitBtn as HTMLButtonElement).disabled = false;
        debugVisitBtn.innerHTML = `
          <svg class="w-4 h-4 inline mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          Debug Visit`;
      }
    });
  }

  // Check visit statuses button
  const checkStatusesBtn = document.getElementById('checkStatusesBtn');
  if (checkStatusesBtn) {
    checkStatusesBtn.addEventListener('click', async () => {
      try {
        // Show loading state
        (checkStatusesBtn as HTMLButtonElement).disabled = true;
        checkStatusesBtn.innerHTML = `
          <svg class="w-4 h-4 inline mr-2 text-gray-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Checking...`;
        
        // Check visit statuses
        await checkVisitStatuses();
        
      } catch (error) {
        console.error('Error checking visit statuses:', error);
        showNotification('Error checking visit statuses. Please try again.', 'error');
      } finally {
        // Reset button state
        (checkStatusesBtn as HTMLButtonElement).disabled = false;
        checkStatusesBtn.innerHTML = `
          <svg class="w-4 h-4 inline mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          Check Status`;
      }
    });
  }

  // Status Actions Dropdown functionality
  const statusActionsDropdownBtn = document.getElementById('statusActionsDropdownBtn');
  const statusActionsDropdown = document.getElementById('statusActionsDropdown');
  
  if (statusActionsDropdownBtn && statusActionsDropdown) {
    // Toggle dropdown on button click
    statusActionsDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = statusActionsDropdownBtn.getAttribute('aria-expanded') === 'true';
      statusActionsDropdownBtn.setAttribute('aria-expanded', (!isExpanded).toString());
      statusActionsDropdown.classList.toggle('hidden');
      
      // Update dropdown arrow
      const arrow = statusActionsDropdownBtn.querySelector('svg');
      if (arrow) {
        if (isExpanded) {
          arrow.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>';
        } else {
          arrow.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>';
        }
      }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!statusActionsDropdownBtn.contains(e.target as Node) && !statusActionsDropdown.contains(e.target as Node)) {
        statusActionsDropdownBtn.setAttribute('aria-expanded', 'false');
        statusActionsDropdown.classList.add('hidden');
        
        // Reset dropdown arrow
        const arrow = statusActionsDropdownBtn.querySelector('svg');
        if (arrow) {
          arrow.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>';
        }
      }
    });
    
    // Close dropdown when pressing Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        statusActionsDropdownBtn.setAttribute('aria-expanded', 'false');
        statusActionsDropdown.classList.add('hidden');
        
        // Reset dropdown arrow
        const arrow = statusActionsDropdownBtn.querySelector('svg');
        if (arrow) {
          arrow.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>';
        }
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
  }
  // Cleanup visits button
  const cleanupVisitsBtn = document.getElementById('cleanupVisitsBtn');
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
  const logsFiltersDropdownBtn = document.getElementById('logsFiltersDropdownBtn');
  const logsFiltersDropdown = document.getElementById('logsFiltersDropdown');

  // Logs search input event listener
  logsSearchInput?.addEventListener('input', async () => {
    await applySearchAndFilterForLogs();
  });

  // Action filter event listener
  actionFilter?.addEventListener('change', async () => {
    await applySearchAndFilterForLogs();
  });

  // Logs pagination event listeners
  const logsPrevBtn = document.getElementById('logsPrevBtn') as HTMLButtonElement;
  const logsNextBtn = document.getElementById('logsNextBtn') as HTMLButtonElement;

  if (logsPrevBtn) {
    logsPrevBtn.addEventListener('click', () => {
      if (currentLogsPage > 1) {
        currentLogsPage--;
        renderLogs();
      }
    });
  }

  if (logsNextBtn) {
    logsNextBtn.addEventListener('click', () => {
      const totalPages = Math.max(1, Math.ceil(filteredLogs.length / logsPageSize));
      if (currentLogsPage < totalPages) {
        currentLogsPage++;
        renderLogs();
      }
    });
  }

  // Logs filters dropdown toggle
  if (logsFiltersDropdownBtn && logsFiltersDropdown) {
    logsFiltersDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = logsFiltersDropdownBtn.getAttribute('aria-expanded') === 'true';
      logsFiltersDropdownBtn.setAttribute('aria-expanded', (!isExpanded).toString());
      logsFiltersDropdown.classList.toggle('hidden');
      const arrow = logsFiltersDropdownBtn.querySelector('svg');
      if (arrow) {
        if (isExpanded) {
          arrow.classList.remove('rotate-180');
        } else {
          arrow.classList.add('rotate-180');
        }
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!logsFiltersDropdownBtn.contains(e.target as Node) && !logsFiltersDropdown.contains(e.target as Node)) {
        logsFiltersDropdownBtn.setAttribute('aria-expanded', 'false');
        logsFiltersDropdown.classList.add('hidden');
        const arrow = logsFiltersDropdownBtn.querySelector('svg');
        if (arrow) arrow.classList.remove('rotate-180');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Escape') {
        logsFiltersDropdownBtn.setAttribute('aria-expanded', 'false');
        logsFiltersDropdown.classList.add('hidden');
        const arrow = logsFiltersDropdownBtn.querySelector('svg');
        if (arrow) arrow.classList.remove('rotate-180');
      }
    });
  }

  // Date filter event listeners
  const logsStartDate = document.getElementById('logsStartDate') as HTMLInputElement;
  const logsEndDate = document.getElementById('logsEndDate') as HTMLInputElement;
  const clearLogsDateFilterBtn = document.getElementById('clearLogsDateFilterBtn') as HTMLButtonElement;

  // Start date filter event listener
  logsStartDate?.addEventListener('change', async () => {
    await applySearchAndFilterForLogs();
  });

  // End date filter event listener
  logsEndDate?.addEventListener('change', async () => {
    await applySearchAndFilterForLogs();
  });

  // Clear date filter button event listener
  clearLogsDateFilterBtn?.addEventListener('click', async () => {
    if (logsStartDate) logsStartDate.value = '';
    if (logsEndDate) logsEndDate.value = '';
    currentLogsStartDate = '';
    currentLogsEndDate = '';
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

  // Future specific date filter
  const futureSpecificDateFilter = document.getElementById('futureSpecificDateFilter') as HTMLInputElement;
  const clearFutureSpecificDateBtn = document.getElementById('clearFutureSpecificDateBtn') as HTMLButtonElement;
  if (futureSpecificDateFilter) {
    // Ensure no past date can be picked
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    futureSpecificDateFilter.min = today.toISOString().split('T')[0];

    futureSpecificDateFilter.addEventListener('change', async () => {
      currentFutureSpecificDate = futureSpecificDateFilter.value;
      if (clearFutureSpecificDateBtn) {
        if (currentFutureSpecificDate) {
          clearFutureSpecificDateBtn.classList.remove('hidden');
        } else {
          clearFutureSpecificDateBtn.classList.add('hidden');
        }
      }
      await applyVisitsFilters();
    });
  }
  if (clearFutureSpecificDateBtn) {
    clearFutureSpecificDateBtn.addEventListener('click', async () => {
      currentFutureSpecificDate = '';
      const input = document.getElementById('futureSpecificDateFilter') as HTMLInputElement;
      if (input) input.value = '';
      clearFutureSpecificDateBtn.classList.add('hidden');
      await applyVisitsFilters();
    });
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

  // Finished place filter event listener
  const finishedPlaceFilter = document.getElementById('finishedPlaceFilter') as HTMLSelectElement;
  if (finishedPlaceFilter) {
    finishedPlaceFilter.addEventListener('change', () => {
      currentFinishedPlaceFilter = finishedPlaceFilter.value;
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
      // Hide future date input when not on future tab
      const futureContainer = document.getElementById('futureDateFilterContainer');
      if (futureContainer) futureContainer.classList.add('hidden');
      await applyVisitsFilters();
    });
  }

  if (todaySchedulesTab) {
    todaySchedulesTab.addEventListener('click', async () => {
      currentScheduleType = 'today';
      updateScheduleTypeTabs();
      // Hide future date input when not on future tab
      const futureContainer = document.getElementById('futureDateFilterContainer');
      if (futureContainer) futureContainer.classList.add('hidden');
      await applyVisitsFilters();
    });
  }

  if (futureSchedulesTab) {
    futureSchedulesTab.addEventListener('click', async () => {
      currentScheduleType = 'future';
      updateScheduleTypeTabs();
      // Show future date input only on future tab
      const futureContainer = document.getElementById('futureDateFilterContainer');
      if (futureContainer) futureContainer.classList.remove('hidden');
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
      // Set max dates for finished schedule date filters when past tab is selected
      setMaxDateForFinishedFilters();
      applyFinishedFilters();
    });
  }

  // Set max date for all date inputs to today (to prevent selecting future dates)
  setMaxDateForFinishedFilters();

  // Calendar filter event listeners for past finished tab
  const pastFinishedStartDate = document.getElementById('pastFinishedStartDate') as HTMLInputElement;
  const pastFinishedEndDate = document.getElementById('pastFinishedEndDate') as HTMLInputElement;
  const pastFinishedLastWeekBtn = document.getElementById('pastFinishedLastWeekBtn') as HTMLButtonElement;
  const pastFinishedLastMonthBtn = document.getElementById('pastFinishedLastMonthBtn') as HTMLButtonElement;
  const clearPastFinishedCalendarBtn = document.getElementById('clearPastFinishedCalendarBtn') as HTMLButtonElement;

  if (pastFinishedStartDate) {
    pastFinishedStartDate.addEventListener('change', () => {
      currentPastFinishedStartDate = pastFinishedStartDate.value;
      applyFinishedFilters();
    });
  }

  if (pastFinishedEndDate) {
    pastFinishedEndDate.addEventListener('change', () => {
      currentPastFinishedEndDate = pastFinishedEndDate.value;
      applyFinishedFilters();
    });
  }

  if (pastFinishedLastWeekBtn) {
    pastFinishedLastWeekBtn.addEventListener('click', () => {
      const today = new Date();
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - 7);
      const lastWeekEnd = new Date(today);
      lastWeekEnd.setDate(today.getDate() - 1);
      
      currentPastFinishedStartDate = lastWeekStart.toISOString().split('T')[0];
      currentPastFinishedEndDate = lastWeekEnd.toISOString().split('T')[0];
      
      if (pastFinishedStartDate) pastFinishedStartDate.value = currentPastFinishedStartDate;
      if (pastFinishedEndDate) pastFinishedEndDate.value = currentPastFinishedEndDate;
      
      applyFinishedFilters();
    });
  }

  if (pastFinishedLastMonthBtn) {
    pastFinishedLastMonthBtn.addEventListener('click', () => {
      const today = new Date();
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      
      currentPastFinishedStartDate = lastMonthStart.toISOString().split('T')[0];
      currentPastFinishedEndDate = lastMonthEnd.toISOString().split('T')[0];
      
      if (pastFinishedStartDate) pastFinishedStartDate.value = currentPastFinishedStartDate;
      if (pastFinishedEndDate) pastFinishedEndDate.value = currentPastFinishedEndDate;
      
      applyFinishedFilters();
    });
  }

  if (clearPastFinishedCalendarBtn) {
    clearPastFinishedCalendarBtn.addEventListener('click', () => {
      currentPastFinishedStartDate = '';
      currentPastFinishedEndDate = '';
      
      if (pastFinishedStartDate) pastFinishedStartDate.value = '';
      if (pastFinishedEndDate) pastFinishedEndDate.value = '';
      
      applyFinishedFilters();
    });
  }

  // Initialize tab visual states
  updateScheduleTypeTabs();
  updateFinishedScheduleTypeTabs();

  
  
  // Ensure flagged visit modal exists at document.body level (outside dashboard)
  if (!document.getElementById('flaggedVisitModal')) {
    document.body.insertAdjacentHTML('beforeend', createFlaggedVisitModal());
  }

  // Setup flagged visit modal event listeners
  setupFlaggedVisitModalListeners();

  // Logs tab filter event listeners
  const logsTabAll = document.getElementById('logsTabAll');
  const logsTabGate = document.getElementById('logsTabGate');
  const logsTabPlace = document.getElementById('logsTabPlace');
  const logsTabPersonnel = document.getElementById('logsTabPersonnel');
  const logsTabAccount = document.getElementById('logsTabAccount');
  const logsTabSchedules = document.getElementById('logsTabSchedules');
  const logsTabFeedback = document.getElementById('logsTabFeedback');
  const logsTabButtons = [logsTabAll, logsTabGate, logsTabPlace, logsTabPersonnel, logsTabAccount, logsTabSchedules, logsTabFeedback];

  function setLogsTabActive(tab) {
    logsTabButtons.forEach(btn => {
      if (!btn) return;
      if (btn === tab) {
        btn.classList.remove('bg-gray-100', 'text-gray-700');
        btn.classList.add('bg-blue-600', 'text-white');
      } else {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-700');
      }
    });
  }

  // Function to clear date filter
  function clearLogsDateFilter() {
    const logsStartDate = document.getElementById('logsStartDate') as HTMLInputElement;
    const logsEndDate = document.getElementById('logsEndDate') as HTMLInputElement;
    
    if (logsStartDate) logsStartDate.value = '';
    if (logsEndDate) logsEndDate.value = '';
    currentLogsStartDate = '';
    currentLogsEndDate = '';
  }

  if (logsTabAll) logsTabAll.addEventListener('click', () => {
    currentLogsTabFilter = 'all';
    setLogsTabActive(logsTabAll);
    clearLogsDateFilter();
    updateLogsActionFilterOptions();
    applySearchAndFilterForLogs();
  });
  if (logsTabGate) logsTabGate.addEventListener('click', () => {
    currentLogsTabFilter = 'gate';
    setLogsTabActive(logsTabGate);
    clearLogsDateFilter();
    updateLogsActionFilterOptions();
    applySearchAndFilterForLogs();
  });
  if (logsTabPlace) logsTabPlace.addEventListener('click', () => {
    currentLogsTabFilter = 'place';
    setLogsTabActive(logsTabPlace);
    clearLogsDateFilter();
    updateLogsActionFilterOptions();
    applySearchAndFilterForLogs();
  });
  if (logsTabPersonnel) logsTabPersonnel.addEventListener('click', () => {
    currentLogsTabFilter = 'personnel';
    setLogsTabActive(logsTabPersonnel);
    clearLogsDateFilter();
    updateLogsActionFilterOptions();
    applySearchAndFilterForLogs();
  });
  if (logsTabAccount) logsTabAccount.addEventListener('click', () => {
    currentLogsTabFilter = 'account';
    setLogsTabActive(logsTabAccount);
    clearLogsDateFilter();
    updateLogsActionFilterOptions();
    applySearchAndFilterForLogs();
  });
  if (logsTabSchedules) logsTabSchedules.addEventListener('click', () => {
    currentLogsTabFilter = 'schedules';
    setLogsTabActive(logsTabSchedules);
    clearLogsDateFilter();
    updateLogsActionFilterOptions();
    applySearchAndFilterForLogs();
  });
  if (logsTabFeedback) logsTabFeedback.addEventListener('click', () => {
    currentLogsTabFilter = 'feedback';
    setLogsTabActive(logsTabFeedback);
    clearLogsDateFilter();
    updateLogsActionFilterOptions();
    applySearchAndFilterForLogs();
  });

  // When logs tab is shown, update the action filter options
  const logsTab = document.getElementById('logsTab');
  if (logsTab) {
    logsTab.addEventListener('click', () => {
      updateLogsActionFilterOptions();
    });
  }

  // Admin refresh button event listener
  const adminRefreshBtn = document.getElementById('adminRefreshBtn');
  if (adminRefreshBtn) {
    adminRefreshBtn.addEventListener('click', refreshAllAdminData);
  }
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

  // Helper: toggle visibility of finished date filters depending on active tab
  function updateFinishedDateFilterVisibility() {
    const finishedDateFilter = document.getElementById('finishedDateFilter') as HTMLSelectElement | null;
    const finishedSpecificDateInput = document.getElementById('finishedSpecificDateFilter') as HTMLInputElement | null;
    const clearSpecificDateBtn = document.getElementById('clearSpecificDateBtn') as HTMLButtonElement | null;
    const pastFinishedCalendarFilter = document.getElementById('pastFinishedCalendarFilter') as HTMLDivElement | null;

    // The specific date input sits inside a wrapper div; hide the wrapper for better layout
    const specificDateWrapper = finishedSpecificDateInput ? finishedSpecificDateInput.parentElement : null;

    const isTodayTab = currentFinishedScheduleType === 'today';
    const isPastTab = currentFinishedScheduleType === 'past';

    if (finishedDateFilter) {
      if (isTodayTab || isPastTab) {
        finishedDateFilter.classList.add('hidden');
        // Clear any selected range to avoid unintended filtering
        currentFinishedDateFilter = 'all';
        finishedDateFilter.value = 'all';
      } else {
        finishedDateFilter.classList.remove('hidden');
      }
    }

    if (specificDateWrapper) {
      if (isTodayTab || isPastTab) {
        specificDateWrapper.classList.add('hidden');
        // Clear specific date when hiding
        currentFinishedSpecificDate = '';
        if (finishedSpecificDateInput) finishedSpecificDateInput.value = '';
        if (clearSpecificDateBtn) clearSpecificDateBtn.classList.add('hidden');
      } else {
        specificDateWrapper.classList.remove('hidden');
      }
    }

    // Show/hide calendar filter based on tab
    if (pastFinishedCalendarFilter) {
      if (isPastTab) {
        pastFinishedCalendarFilter.classList.remove('hidden');
      } else {
        pastFinishedCalendarFilter.classList.add('hidden');
        // Clear calendar filter when hiding
        currentPastFinishedStartDate = '';
        currentPastFinishedEndDate = '';
        const startDateInput = document.getElementById('pastFinishedStartDate') as HTMLInputElement;
        const endDateInput = document.getElementById('pastFinishedEndDate') as HTMLInputElement;
        if (startDateInput) startDateInput.value = '';
        if (endDateInput) endDateInput.value = '';
      }
    }
  }

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
      updateFinishedDateFilterVisibility();
      break;
    case 'past':
      if (pastFinishedSchedulesTab) {
        pastFinishedSchedulesTab.classList.add('bg-blue-600', 'text-white');
        pastFinishedSchedulesTab.classList.remove('bg-gray-100', 'text-gray-700');
      }
      updateFinishedDateFilterVisibility();
      break;
    default:
      // Default to 'today' if no valid state
      currentFinishedScheduleType = 'today';
      if (todayFinishedSchedulesTab) {
        todayFinishedSchedulesTab.classList.add('bg-blue-600', 'text-white');
        todayFinishedSchedulesTab.classList.remove('bg-gray-100', 'text-gray-700');
      }
      updateFinishedDateFilterVisibility();
      break;
  }
}

// Initialize dashboard event listeners
setTimeout(() => {
  setupDashboardEventListeners();
}, 100);

// Make functions available globally
(window as any).forceUpdateVisitStatuses = forceUpdateVisitStatuses;
(window as any).debugSpecificVisit = debugSpecificVisit;

// Cleanup auto-refresh when page is unloaded
window.addEventListener('beforeunload', () => {
  stopVisitsAutoRefresh();
  stopAutomaticStatusUpdates();
});

// Add admin tab switching event listeners
function setupAdminTabEventListeners() {
  const placesTab = document.getElementById('placesTab');
  const accountsTab = document.getElementById('accountsTab');
  const gatesTab = document.getElementById('gatesTab');
  const feedbackTab = document.getElementById('feedbackTab');
  const placesContent = document.getElementById('placesContent');
  const accountsContent = document.getElementById('accountsContent');
  const gatesContent = document.getElementById('gatesContent');
  const feedbackContent = document.getElementById('feedbackContent');

  // Places tab event listener
  placesTab?.addEventListener('click', () => {
    placesTab.classList.add('bg-blue-600', 'text-white');
    placesTab.classList.remove('bg-gray-100', 'text-gray-700');
    accountsTab?.classList.remove('bg-blue-600', 'text-white');
    accountsTab?.classList.add('bg-gray-100', 'text-gray-700');
    gatesTab?.classList.remove('bg-blue-600', 'text-white');
    gatesTab?.classList.add('bg-gray-100', 'text-gray-700');
    feedbackTab?.classList.remove('bg-blue-600', 'text-white');
    feedbackTab?.classList.add('bg-gray-100', 'text-gray-700');
    placesContent?.classList.remove('hidden');
    accountsContent?.classList.add('hidden');
    gatesContent?.classList.add('hidden');
    feedbackContent?.classList.add('hidden');
    // Clear gates content when switching away
    if (gatesContent) {
      gatesContent.innerHTML = '';
    }
    // Clear feedback content when switching away
    if (feedbackContent) {
      feedbackContent.innerHTML = '';
    }
    loadPlaces();
  });

  // Accounts tab event listener
  accountsTab?.addEventListener('click', () => {
    accountsTab.classList.add('bg-blue-600', 'text-white');
    accountsTab.classList.remove('bg-gray-100', 'text-gray-700');
    placesTab?.classList.remove('bg-blue-600', 'text-white');
    placesTab?.classList.add('bg-gray-100', 'text-gray-700');
    gatesTab?.classList.remove('bg-blue-600', 'text-white');
    gatesTab?.classList.add('bg-gray-100', 'text-gray-700');
    feedbackTab?.classList.remove('bg-blue-600', 'text-white');
    feedbackTab?.classList.add('bg-gray-100', 'text-gray-700');
    accountsContent?.classList.remove('hidden');
    placesContent?.classList.add('hidden');
    gatesContent?.classList.add('hidden');
    feedbackContent?.classList.add('hidden');
    // Clear gates content when switching away
    if (gatesContent) {
      gatesContent.innerHTML = '';
    }
    // Clear feedback content when switching away
    if (feedbackContent) {
      feedbackContent.innerHTML = '';
    }
    loadAccounts();
  });

  // Gates tab event listener
  gatesTab?.addEventListener('click', () => {
    gatesTab.classList.add('bg-blue-600', 'text-white');
    gatesTab.classList.remove('bg-gray-100', 'text-gray-700');
    placesTab?.classList.remove('bg-blue-600', 'text-white');
    placesTab?.classList.add('bg-gray-100', 'text-gray-700');
    accountsTab?.classList.remove('bg-blue-600', 'text-white');
    accountsTab?.classList.add('bg-gray-100', 'text-gray-700');
    feedbackTab?.classList.remove('bg-blue-600', 'text-white');
    feedbackTab?.classList.add('bg-gray-100', 'text-gray-700');
    gatesContent?.classList.remove('hidden');
    placesContent?.classList.add('hidden');
    accountsContent?.classList.add('hidden');
    feedbackContent?.classList.add('hidden');
    // Clear feedback content when switching away
    if (feedbackContent) {
      feedbackContent.innerHTML = '';
    }
    // Dynamically import and render the Gates tab content
    import('./Gates').then(module => {
      gatesContent.innerHTML = module.renderGates();
      // Setup event listeners after rendering
      module.setupGatesEventListeners();
    });
  });

  // Feedback tab event listener
  feedbackTab?.addEventListener('click', () => {
    feedbackTab.classList.add('bg-blue-600', 'text-white');
    feedbackTab.classList.remove('bg-gray-100', 'text-gray-700');
    placesTab?.classList.remove('bg-blue-600', 'text-white');
    placesTab?.classList.add('bg-gray-100', 'text-gray-700');
    accountsTab?.classList.remove('bg-blue-600', 'text-white');
    accountsTab?.classList.add('bg-gray-100', 'text-gray-700');
    gatesTab?.classList.remove('bg-blue-600', 'text-white');
    gatesTab?.classList.add('bg-gray-100', 'text-gray-700');
    feedbackContent?.classList.remove('hidden');
    placesContent?.classList.add('hidden');
    accountsContent?.classList.add('hidden');
    gatesContent?.classList.add('hidden');
    // Clear gates content when switching away
    if (gatesContent) {
      gatesContent.innerHTML = '';
    }
    // Dynamically import and render the Feedback tab content
    import('./Feedback').then(module => {
      feedbackContent.innerHTML = module.renderFeedback();
      // Setup event listeners after rendering
      module.setupFeedbackEventListeners();
    });
  });

}
// Make function available globally
(window as any).setupAdminTabEventListeners = setupAdminTabEventListeners;

// Helper to compute effective display action for a log (used in filtering and rendering)
function getEffectiveLogAction(log: any): string {
  try {
    if (!log) return '';
    let action = log.action;
    if (action !== 'visit_scheduled') return action;

    const parsedDetails = log.details
      ? (typeof log.details === 'string' ? JSON.parse(log.details) : log.details)
      : null;

    if (!parsedDetails) return action;

    // Derive effective action from current_status
    if (parsedDetails.current_status === 'completed') return 'visit_completed';
    if (parsedDetails.current_status === 'completed_flagged') return 'visit_completed_flagged';
    if (
      parsedDetails.current_status === 'unsuccessful' ||
      parsedDetails.current_status === 'failed' ||
      parsedDetails.current_status === 'marked_unsuccessful'
    ) {
      return 'visit_unsuccessful';
    }

    // If pending, inspect history to infer completion/flagged/unsuccessful
    if (Array.isArray(parsedDetails.history) && parsedDetails.history.length > 0) {
      const lastEvent = parsedDetails.history[parsedDetails.history.length - 1];
      if (lastEvent?.event === 'completed') return 'visit_completed';
      if (lastEvent?.event === 'completed_flagged') return 'visit_completed_flagged';
      if (
        lastEvent?.event === 'unsuccessful' ||
        lastEvent?.event === 'failed' ||
        lastEvent?.event === 'marked_unsuccessful'
      ) {
        return 'visit_unsuccessful';
      }

      // Special case: all places completed but exit scan pending still treated as completed in UI
      if (
        (lastEvent?.event === 'completed' || lastEvent?.event === 'place_completed') &&
        lastEvent?.details?.all_places_completed
      ) {
        return 'visit_completed';
      }
    }

    // Default to original action
    return action;
  } catch (_) {
    return log?.action || '';
  }
}

// Function to apply search and filter for logs
async function applySearchAndFilterForLogs() {
  const searchInput = document.getElementById('logsSearchInput') as HTMLInputElement;
  const actionFilter = document.getElementById('actionFilter') as HTMLSelectElement;
  const startDateInput = document.getElementById('logsStartDate') as HTMLInputElement;
  const endDateInput = document.getElementById('logsEndDate') as HTMLInputElement;
  
  const searchTerm = searchInput?.value.toLowerCase() || '';
  const actionValue = actionFilter?.value || 'all';
  const startDate = startDateInput?.value || '';
  const endDate = endDateInput?.value || '';

  // Reset pagination to first page when filters change
  currentLogsPage = 1;

  // Update global date filter state
  currentLogsStartDate = startDate;
  currentLogsEndDate = endDate;

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

  // Apply action filter (use effective action to capture derived states)
  if (actionValue !== 'all') {
    filtered = filtered.filter(log => {
      const effective = getEffectiveLogAction(log);
      return log.action === actionValue || effective === actionValue;
    });
  }

  // Apply date filter
  if (startDate || endDate) {
    filtered = filtered.filter(log => {
      const logDate = new Date(log.created_at);
      const logDateOnly = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return logDateOnly >= start && logDateOnly <= end;
      } else if (startDate) {
        const start = new Date(startDate);
        return logDateOnly >= start;
      } else if (endDate) {
        const end = new Date(endDate);
        return logDateOnly <= end;
      }
      return true;
    });
  }

  // Apply tab filter
  if (currentLogsTabFilter !== 'all') {
    filtered = filtered.filter(log => {
      if (currentLogsTabFilter === 'gate') {
        return log.action && log.action.startsWith('gate_');
      } else if (currentLogsTabFilter === 'place') {
        return log.action && log.action.startsWith('place_');
      } else if (currentLogsTabFilter === 'personnel') {
        return log.action && log.action.startsWith('personnel_');
      } else if (currentLogsTabFilter === 'account') {
        return log.action && log.action === 'password_change';
      } else if (currentLogsTabFilter === 'schedules') {
        return log.action && (log.action.startsWith('visit_'));
      } else if (currentLogsTabFilter === 'feedback') {
        return log.action && log.action === 'visit_feedback_submitted';
      }
      return true;
    });
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
    // Ensure modal overlays the entire page by appending to body
    if (modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }
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
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6 mb-4 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-500">
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
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg"
              >
                ${assignment.is_available ? 'Mark as Unavailable' : 'Mark as Available'}
              </button>
            </div>
          </div>
        `).join('');
      } else {
        personnelAssignmentInfo.innerHTML = `
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-500">
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
    
    // Start automatic status updates for personnel
    startAutomaticStatusUpdates();
    
    // Set max dates for finished schedule date filters
    setMaxDateForFinishedFilters();
  } catch (error) {
    console.error('Error in loadPersonnelDashboard:', error);
  }
}

// Function to load guard dashboard
async function loadGuardDashboard() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user found');
    return;
  }

  try {
    const guardContent = document.getElementById('guardContent');
    if (guardContent) {
      guardContent.classList.remove('hidden');
    }

    // Load guard scan history
    await loadGuardScanHistory();

    // Setup event listeners
    const refreshGuardBtn = document.getElementById('refreshGuardBtn');
    const guardSearchInput = document.getElementById('guardSearchInput');
    const guardActionFilter = document.getElementById('guardActionFilter');

    refreshGuardBtn?.addEventListener('click', async () => {
      await loadGuardScanHistory();
    });

    guardSearchInput?.addEventListener('input', () => {
      applyGuardSearchAndFilter();
    });

    guardActionFilter?.addEventListener('change', () => {
      applyGuardSearchAndFilter();
    });

  } catch (error) {
    console.error('Error in loadGuardDashboard:', error);
  }
}

// Function to load guard scan history
async function loadGuardScanHistory() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user found');
    return;
  }

  try {
    // Get guard scan history from logs (include temporary exit events)
    const { data: scanHistory, error } = await supabase
      .from('logs')
      .select(`
        id,
        action,
        details,
        created_at
      `)
      .eq('user_id', user.id)
      .in('action', ['guard_action', 'visit_temporary_exit'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading guard scan history:', error);
      return;
    }

    // Store scan history globally for filtering and pagination
    (window as any).guardScanHistory = scanHistory || [];
    (window as any).guardFilteredScanHistory = scanHistory || [];
    (window as any).guardCurrentPage = (window as any).guardCurrentPage || 1;
    
    // Render scan history (pagination handled inside)
    renderGuardScanHistory((window as any).guardFilteredScanHistory);

  } catch (error) {
    console.error('Error in loadGuardScanHistory:', error);
  }
}

// Function to render guard scan history
function renderGuardScanHistory(scanHistory: any[]) {
  const guardScanHistoryList = document.getElementById('guardScanHistoryList');
  const pageInfo = document.getElementById('guardPageInfo');
  const prevBtn = document.getElementById('guardPrevPageBtn') as HTMLButtonElement | null;
  const nextBtn = document.getElementById('guardNextPageBtn') as HTMLButtonElement | null;
  if (!guardScanHistoryList) return;

  // Pagination state
  const itemsPerPage = 10;
  const totalItems = scanHistory.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  let currentPage = (window as any).guardCurrentPage || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  (window as any).guardCurrentPage = currentPage;

  if (scanHistory.length === 0) {
    guardScanHistoryList.innerHTML = `
      <div class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No scan history</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Your scan history will appear here after you log entrance, exit, or temporary exit actions.</p>
      </div>
    `;
    if (pageInfo) pageInfo.textContent = 'Page 1';
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const pageItems = scanHistory.slice(startIndex, endIndex);

  const scanHistoryHtml = pageItems.map(scan => {
    const details = scan.details || {};
    const normalizedAction = (details.action || '').toLowerCase() || (scan.action === 'visit_temporary_exit' ? 'temporary_exit' : 'unknown');
    const visitId = details.visit_id || 'Unknown';
    const timestamp = new Date(scan.created_at);
    
    return `
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full flex items-center justify-center ${
                normalizedAction === 'entrance' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200' :
                normalizedAction === 'exit' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200' :
                normalizedAction === 'temporary_exit' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-200'
              }">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  ${normalizedAction === 'entrance' ? 
                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>' :
                    normalizedAction === 'exit' ?
                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>' :
                    normalizedAction === 'temporary_exit' ?
                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3"></path>' :
                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
                  }
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                  ${normalizedAction === 'entrance' ? 'Entrance Logged' : normalizedAction === 'exit' ? 'Exit Logged' : normalizedAction === 'temporary_exit' ? 'Temporary Exit Logged' : 'Action Logged'}
                </h4>
                <span class="px-2 py-1 text-xs font-medium rounded-full ${
                  normalizedAction === 'entrance' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  normalizedAction === 'exit' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  normalizedAction === 'temporary_exit' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }">
                  ${normalizedAction.charAt(0).toUpperCase() + normalizedAction.slice(1)}
                </span>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Visit ID: ${visitId.substring(0, 8)}...
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500">
                ${timestamp.toLocaleDateString()} at ${timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div class="flex-shrink-0">
            <button 
              onclick="viewGuardScanDetails('${scan.id}')"
              class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  guardScanHistoryList.innerHTML = scanHistoryHtml;

  // Update pagination controls
  if (pageInfo) pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  if (prevBtn) prevBtn.disabled = currentPage <= 1;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

  // Attach handlers once (idempotent)
  if (prevBtn && !(prevBtn as any)._bound) {
    (prevBtn as any)._bound = true;
    prevBtn.addEventListener('click', () => {
      const state = (window as any);
      state.guardCurrentPage = Math.max(1, (state.guardCurrentPage || 1) - 1);
      renderGuardScanHistory(state.guardFilteredScanHistory || state.guardScanHistory || []);
    });
  }
  if (nextBtn && !(nextBtn as any)._bound) {
    (nextBtn as any)._bound = true;
    nextBtn.addEventListener('click', () => {
      const state = (window as any);
      const list = state.guardFilteredScanHistory || state.guardScanHistory || [];
      const pages = Math.max(1, Math.ceil(list.length / itemsPerPage));
      state.guardCurrentPage = Math.min(pages, (state.guardCurrentPage || 1) + 1);
      renderGuardScanHistory(list);
    });
  }
}

// Function to apply search and filter for guard scan history
function applyGuardSearchAndFilter() {
  const searchInput = document.getElementById('guardSearchInput') as HTMLInputElement;
  const actionFilter = document.getElementById('guardActionFilter') as HTMLSelectElement;
  
  const searchTerm = searchInput?.value.toLowerCase() || '';
  const actionValue = actionFilter?.value || 'all';

  // Get stored scan history
  const allScans = (window as any).guardScanHistory || [];
  let filtered = [...allScans];

  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter(scan => {
      const details = scan.details || {};
      const action = (details.action || '').toLowerCase() || (scan.action === 'visit_temporary_exit' ? 'temporary_exit' : '');
      const visitId = details.visit_id || '';
      const timestamp = new Date(scan.created_at).toLocaleString().toLowerCase();
      
      return action.toLowerCase().includes(searchTerm) ||
             visitId.toLowerCase().includes(searchTerm) ||
             timestamp.includes(searchTerm);
    });
  }

  // Apply action filter
  if (actionValue !== 'all') {
    filtered = filtered.filter(scan => {
      const details = scan.details || {};
      const normalizedAction = (details.action || '').toLowerCase() || (scan.action === 'visit_temporary_exit' ? 'temporary_exit' : '');
      return normalizedAction === actionValue;
    });
  }

  // Save filtered list and reset to first page on filter/search change
  (window as any).guardFilteredScanHistory = filtered;
  (window as any).guardCurrentPage = 1;
  renderGuardScanHistory(filtered);
}

// Function to view guard scan details
(window as any).viewGuardScanDetails = function(scanId: string) {
  const allScans = (window as any).guardScanHistory || [];
  const scan = allScans.find((s: any) => s.id === scanId);
  
  if (!scan) {
    console.error('Scan not found');
    return;
  }

  const details = scan.details || {};
  const normalizedAction = ((details.action || '') as string).toLowerCase() ||
    (scan.action === 'visit_temporary_exit' ? 'temporary_exit' :
     scan.action === 'visit_entrance' ? 'entrance' :
     scan.action === 'visit_exit' ? 'exit' : 'unknown');
  const visitId = details.visit_id || 'Unknown';
  const timestamp = new Date(scan.created_at);

  // Create modal
  const modalHtml = `
    <div id="guardScanDetailsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Scan Details</h3>
            <button 
              id="closeGuardScanDetailsModal"
              class="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="flex items-center space-x-3 mb-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center ${
                  normalizedAction === 'entrance' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200' :
                  normalizedAction === 'exit' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200' :
                  normalizedAction === 'temporary_exit' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-200'
                }">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${normalizedAction === 'entrance' ? 
                      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>' :
                      normalizedAction === 'exit' ?
                      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>' :
                      normalizedAction === 'temporary_exit' ?
                      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3"></path>' :
                      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
                    }
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                    ${normalizedAction === 'entrance' ? 'Entrance Logged' : normalizedAction === 'exit' ? 'Exit Logged' : normalizedAction === 'temporary_exit' ? 'Temporary Exit Logged' : 'Action Logged'}
                  </h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400">${timestamp.toLocaleString()}</p>
                </div>
              </div>
              
              <div class="space-y-2 text-sm">
                <div>
                  <span class="font-medium text-gray-700 dark:text-gray-300">Action:</span>
                  <span class="ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                    normalizedAction === 'entrance' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    normalizedAction === 'exit' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    normalizedAction === 'temporary_exit' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }">
                    ${normalizedAction === 'temporary_exit' ? 'Temporary Exit' : (normalizedAction.charAt(0).toUpperCase() + normalizedAction.slice(1))}
                  </span>
                </div>
                <div>
                  <span class="font-medium text-gray-700 dark:text-gray-300">Visit ID:</span>
                  <span class="ml-2 font-mono text-gray-600 dark:text-gray-400">${visitId}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-700 dark:text-gray-300">Timestamp:</span>
                  <span class="ml-2 text-gray-600 dark:text-gray-400">${timestamp.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end mt-6">
            <button 
              id="closeGuardScanDetailsModalBtn"
              class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Add event listeners
  const modal = document.getElementById('guardScanDetailsModal');
  const closeBtn1 = document.getElementById('closeGuardScanDetailsModal');
  const closeBtn2 = document.getElementById('closeGuardScanDetailsModalBtn');

  const closeModal = () => {
    if (modal) {
      modal.remove();
    }
  };

  closeBtn1?.addEventListener('click', closeModal);
  closeBtn2?.addEventListener('click', closeModal);

  // Close on background click
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
};

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
let currentFutureSpecificDate = '';
let currentFinishedSearchTerm = '';
let currentFinishedRoleFilter = 'all';
let currentFinishedDateFilter = 'all';
let currentFinishedSpecificDate = '';
let currentFinishedPlaceFilter = 'all';
let currentPastFinishedStartDate = '';
let currentPastFinishedEndDate = '';
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
    
    // --- Call database function to update visit statuses (mark past visits as unsuccessful) ---
    try {
      const { data: markResult, error: markError } = await supabase.rpc('update_visit_statuses');
      if (markError) {
        console.error('Error updating visit statuses:', markError);
      } else if (markResult && markResult > 0) {
        console.log(`Updated ${markResult} visit statuses (marked past visits as unsuccessful)`);
      }
    } catch (markErr) {
      console.error('Error calling update_visit_statuses:', markErr);
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

// Global variable to track the status update interval
let statusUpdateInterval: any = null;

// Function to start automatic status updates
function startAutomaticStatusUpdates() {
  // Clear existing interval if any
  if (statusUpdateInterval) {
    clearInterval(statusUpdateInterval);
  }
  
  console.log('Starting automatic status updates...');
  
  // Update statuses every 1 minute for more responsive updates
  statusUpdateInterval = setInterval(async () => {
    try {
      console.log('Running automatic status update...');
      const result = await updateVisitStatuses();
      console.log('Automatic status update completed:', result);
    } catch (error) {
      console.error('Error in automatic status update:', error);
    }
  }, 60000); // 1 minute
  
  // Also run an immediate update when starting
  setTimeout(async () => {
    try {
      console.log('Running initial status update...');
      await updateVisitStatuses();
    } catch (error) {
      console.error('Error in initial status update:', error);
    }
  }, 2000); // 2 seconds after starting
}

// Function to stop automatic status updates
function stopAutomaticStatusUpdates() {
  if (statusUpdateInterval) {
    clearInterval(statusUpdateInterval);
    statusUpdateInterval = null;
    console.log('Stopped automatic status updates');
  }
}


// Function to automatically update visit statuses (runs the consolidated status system)
async function updateVisitStatuses() {
  try {
    console.log('Calling status update function...');
    
    // Try the simple fix function first
    const { data: fixData, error: fixError } = await supabase.rpc('fix_pending_past_visits');
    
    if (fixError) {
      console.error('Error with fix_pending_past_visits:', fixError);
      
      // Fallback to the public status update function
      const { data: publicData, error: publicError } = await supabase.rpc('update_visit_statuses_public');
      
      if (publicError) {
        console.error('Error with update_visit_statuses_public:', publicError);
        return;
      }
      
      console.log('Visit statuses updated successfully (fallback):', publicData);
    } else {
      console.log('Visit statuses updated successfully (fix):', fixData);
    }
    
    // Reload the visits to reflect the changes
    console.log('Reloading scheduled visits...');
    await loadScheduledVisits();
    
    console.log('Reloading finished schedules...');
    await loadFinishedSchedules();
    
    // Also refresh the current view if we're on the visits tab
    const visitsContent = document.getElementById('visitsContent');
    if (visitsContent && !visitsContent.classList.contains('hidden')) {
      console.log('Refreshing visits view...');
      await applyVisitsFilters();
    }
    
  } catch (error) {
    console.error('Error in updateVisitStatuses:', error);
  }
}

// Function to force update all visit statuses immediately (for testing and immediate updates)
async function forceUpdateVisitStatuses() {
  try {
    console.log('Force updating visit statuses...');
    
    // Use the simple fix function
    const { data, error } = await supabase.rpc('fix_pending_past_visits');
    
    if (error) {
      console.error('Error force updating visit statuses:', error);
      return;
    }

    console.log('Visit statuses force updated successfully:', data);
    
    // Reload the visits to reflect the changes
    await loadScheduledVisits();
    await loadFinishedSchedules();
    
    // Also refresh the current view if we're on the visits tab
    const visitsContent = document.getElementById('visitsContent');
    if (visitsContent && !visitsContent.classList.contains('hidden')) {
      await applyVisitsFilters();
    }
    
  } catch (error) {
    console.error('Error in forceUpdateVisitStatuses:', error);
  }
}

// Function to debug a specific visit
async function debugSpecificVisit() {
  try {
    console.log('Debugging specific visit...');
    
    // Use the debug function from the migration
    const { data, error } = await supabase.rpc('debug_visit', {
      visit_email: 'geko_041702@yahoo.com'
    });
    
    if (error) {
      console.error('Error debugging visit:', error);
      showNotification('Error debugging visit: ' + error.message, 'error');
      return;
    }

    console.log('Visit debug info:', data);
    
    // Show the debug info in a modal or alert
    alert('Visit Debug Info:\n\n' + data);
    
  } catch (error) {
    console.error('Error in debugSpecificVisit:', error);
    showNotification('Error debugging visit', 'error');
  }
}

// Function to check current visit statuses for debugging
async function checkVisitStatuses() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found');
      return;
    }

    // Check if the user has admin or personnel role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError) {
      console.error('Error checking user role:', roleError);
      return;
    }

    if (roleData?.role !== 'admin' && roleData?.role !== 'personnel') {
      console.log('User does not have admin or personnel role:', roleData?.role);
      return;
    }

    // Get current visit statuses
    const { data: visits, error } = await supabase
      .from('scheduled_visits')
      .select(`
        id,
        status,
        visit_date,
        gate_entrance_scanned,
        gate_exit_scanned,
        completed_at,
        completed_by
      `)
      .in('status', ['pending', 'completed', 'completed_flagged', 'unsuccessful'])
      .order('visit_date', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching visit statuses:', error);
      return;
    }

    console.log('Current visit statuses:', visits);
    
    // Show notification with summary
    const pendingCount = visits.filter(v => v.status === 'pending').length;
    const completedCount = visits.filter(v => v.status === 'completed').length;
    const flaggedCount = visits.filter(v => v.status === 'completed_flagged').length;
    const unsuccessfulCount = visits.filter(v => v.status === 'unsuccessful').length;
    
    showNotification(`Status Check: ${pendingCount} pending, ${completedCount} completed, ${flaggedCount} flagged, ${unsuccessfulCount} unsuccessful`, 'info');
    
  } catch (error) {
    console.error('Error in checkVisitStatuses:', error);
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

    // Direct query: join scheduled_visit_places with scheduled_visits and places_to_visit for assigned places
    const assignedPlaceIds = (assignments as any[]).map((a: any) => a.place_id);
    const { data: rows, error } = await supabase
      .from('scheduled_visit_places')
      .select(`
        place_id,
        place_status:status,
        place_completed_at:completed_at,
        place_completed_by:completed_by,
        place:places_to_visit(name, description, location),
        visit:scheduled_visits(
          id,
          visitor_first_name,
          visitor_last_name,
          visitor_email,
          visitor_phone,
          visitor_user_id,
          visitor_role,
          visit_date,
          purpose,
          other_purpose,
          status,
          scheduled_at,
          completed_at,
          completed_by
        )
      `)
      .in('place_id', assignedPlaceIds);

    if (error) throw error;

    // Normalize shape to match display expectations
    const visits = (rows || []).map((r: any) => ({
      visit_id: r.visit?.id,
      visitor_first_name: r.visit?.visitor_first_name,
      visitor_last_name: r.visit?.visitor_last_name,
      visitor_email: r.visit?.visitor_email,
      visitor_phone: r.visit?.visitor_phone,
      visitor_user_id: r.visit?.visitor_user_id,
      visitor_role: r.visit?.visitor_role,
      visit_date: r.visit?.visit_date,
      purpose: r.visit?.purpose,
      other_purpose: r.visit?.other_purpose,
      status: r.visit?.status,
      scheduled_at: r.visit?.scheduled_at,
      completed_at: r.visit?.completed_at,
      completed_by: r.visit?.completed_by,
      place_id: r.place_id,
      place_name: r.place?.name,
      place_description: r.place?.description,
      place_location: r.place?.location,
      place_status: r.place_status,
      place_completed_at: r.place_completed_at,
      place_completed_by: r.place_completed_by
    }));

    // Filter for completed, completed_flagged, and unsuccessful visits
    const finishedVisits = (visits || []).filter(visit => 
      visit.status === 'completed' || 
      visit.status === 'completed_flagged' || 
      visit.status === 'unsuccessful'
    );

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

    // Populate place filter options
    populateFinishedPlaceFilterOptions(allFinishedVisits);

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
        // If a specific future date is selected, match that date exactly
        if (currentFutureSpecificDate) {
          const selected = new Date(currentFutureSpecificDate);
          selected.setHours(0, 0, 0, 0);
          const selectedPh = toPhilippineTime(selected);
          selectedPh.setHours(0, 0, 0, 0);
          return philippineVisitDate.getTime() === selectedPh.getTime();
        }
        // Otherwise, any date strictly after today
        return philippineVisitDate.getTime() > philippineToday.getTime();
      });
      break;
    case 'all':
      // For 'all' schedules, filter out completed places to only show pending places
      filteredVisits = filteredVisits.filter(visit => visit.place_status !== 'completed');
      break;
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
      completed_flagged: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      temporary_exit: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      unsuccessful: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    const roleColors: { [key: string]: string } = {
      visitor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      guest: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };

    // Use strict YYYY-MM-DD string comparison for visit date and Philippine date
    const visitDateStr = (visit.visit_date || '').split('T')[0];
    const todayStr = philippineToday.toISOString().split('T')[0];
    // Debug log
    console.log('[DATE DEBUG] visitDateStr:', visitDateStr, 'currentDateStr:', todayStr);

    // Check gate entrance scan requirements for today's visits
    const gateEntranceScanned = visit.gate_entrance_scanned || false;
    const gateScanRequired = visitDateStr === todayStr;
    
    const canComplete = userRole === 'personnel' && 
                       userAssignments.includes(visit.place_id) && 
                       visit.place_status === 'pending' &&
                       visitDateStr === todayStr &&
                       (!gateScanRequired || gateEntranceScanned);

    // Check if user meets basic requirements but visit is in the future
    const meetsBasicRequirements = userRole === 'personnel' && 
                                  userAssignments.includes(visit.place_id) && 
                                  visit.place_status === 'pending';
    const isFutureVisit = visitDateStr > todayStr;
    
    // Gate scanning is only for visitors, not personnel
    const needsGateScan = false; // Personnel cannot scan gates

    // Show multi-place visit indicator
    const multiPlaceIndicator = visit.total_places > 1 ? `
      <div class="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400 transition-all duration-200 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-blue-800 dark:text-blue-200">Multi-Place Visit</span>
          <span class="text-sm text-blue-600 dark:text-blue-400">${visit.completed_places}/${visit.total_places} places completed</span>
        </div>
        <div class="mt-1 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
          <div class="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style="width: ${visit.total_places > 0 ? (visit.completed_places / visit.total_places) * 100 : 0}%"></div>
        </div>
      </div>
    ` : '';

    // Status label logic
    let statusLabel = '';
    if (visit.status === 'completed_flagged') {
      if (visitDateStr < todayStr) {
        statusLabel = 'Completed (Flagged)';
      } else {
        statusLabel = 'In Progress';
      }
    } else if (visit.status === 'completed') {
      statusLabel = 'Completed';
    } else if (visit.status === 'pending') {
      statusLabel = 'Pending';
    } else if (visit.status === 'temporary_exit') {
      statusLabel = 'Temporary Exit';
    } else if (visit.status === 'unsuccessful' || visit.status === 'failed') {
      statusLabel = 'Unsuccessful';
    } else if (visit.status === 'cancelled') {
      statusLabel = 'Cancelled';
    } else {
      statusLabel = visit.status.charAt(0).toUpperCase() + visit.status.slice(1);
    }

    return `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20 hover:scale-[1.02] hover:border-blue-200 dark:hover:border-blue-600 cursor-pointer transform">
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
              ${statusLabel}
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
          <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 ${visit.place_status === 'completed' ? 'border-green-400' : visit.place_status === 'unsuccessful' || visit.place_status === 'failed' ? 'border-red-400' : 'border-yellow-400'} transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-sm">
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
        
        ${gateScanRequired && !gateEntranceScanned ? `
          <div class="flex justify-end">
            <div class="px-4 py-2 bg-orange-100 text-orange-700 rounded-md text-sm font-medium">
              ⚠️ Gate entrance scan required by visitor before completion
            </div>
          </div>
        ` : canComplete ? `
          <div class="flex justify-end">
            <button 
              onclick="showCompletePlaceConfirmModal('${visit.visit_id}', '${visit.place_id}')"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
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
        ` : visit.status === 'completed_flagged' && visitDateStr < todayStr ? `
          <div class="flex justify-end space-x-2">
                          <div class="px-4 py-2 bg-orange-100 text-orange-700 rounded-md text-sm font-medium">
                ⚠️ Completed (Flagged) - Process started but not fully completed
              </div>
            <button 
              onclick="showFlaggedVisitDetails('${visit.visit_id}')"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              Details
            </button>
          </div>
        ` : visit.status === 'pending' && visitDateStr === todayStr && visit.total_places > 0 && visit.completed_places === visit.total_places && !visit.gate_exit_scanned ? `
          <div class="flex justify-end">
            <div class="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md text-sm font-medium">
              ⏳ All places completed - waiting for exit scan or end of day
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
        
        // Re-apply current filters
        await applyVisitorTodayFilters();
        await applyVisitorFutureFilters();
        await applyVisitorPastFilters();
        
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
  } else {
    console.error('Refresh button not found');
  }

  // Tab switching event listeners
  const visitorCurrentTab = document.getElementById('visitorCurrentTab');
  const visitorPastTab = document.getElementById('visitorPastTab');
  const visitorCurrentContent = document.getElementById('visitorCurrentContent');
  const visitorPastContent = document.getElementById('visitorPastContent');

  visitorCurrentTab?.addEventListener('click', () => {
    visitorCurrentTab.classList.add('border-blue-500', 'text-blue-600', 'dark:text-blue-400');
    visitorCurrentTab.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
    visitorPastTab?.classList.remove('border-blue-500', 'text-blue-600', 'dark:text-blue-400');
    visitorPastTab?.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
    visitorCurrentContent?.classList.remove('hidden');
    visitorPastContent?.classList.add('hidden');
    
    // Hide and clear visitor past calendar filter when switching away from past tab
    const visitorPastCalendarFilter = document.getElementById('visitorPastCalendarFilter');
    if (visitorPastCalendarFilter) {
      visitorPastCalendarFilter.classList.add('hidden');
    }
    clearVisitorPastCalendarFilter();
  });

  visitorPastTab?.addEventListener('click', () => {
    visitorPastTab.classList.add('border-blue-500', 'text-blue-600', 'dark:text-blue-400');
    visitorPastTab.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
    visitorCurrentTab?.classList.remove('border-blue-500', 'text-blue-600', 'dark:text-blue-400');
    visitorCurrentTab?.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
    visitorPastContent?.classList.remove('hidden');
    visitorCurrentContent?.classList.add('hidden');
    
    // Set max dates for visitor past calendar filters when past tab is selected
    setMaxDateForVisitorPastFilters();
  });

  // Current visits sub-tab switching event listeners
  const visitorTodayTab = document.getElementById('visitorTodayTab');
  const visitorFutureTab = document.getElementById('visitorFutureTab');
  const visitorTodayContent = document.getElementById('visitorTodayContent');
  const visitorFutureContent = document.getElementById('visitorFutureContent');

  visitorTodayTab?.addEventListener('click', () => {
    visitorTodayTab.classList.add('border-blue-500', 'text-blue-600', 'dark:text-blue-400');
    visitorTodayTab.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
    visitorFutureTab?.classList.remove('border-blue-500', 'text-blue-600', 'dark:text-blue-400');
    visitorFutureTab?.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
    visitorTodayContent?.classList.remove('hidden');
    visitorFutureContent?.classList.add('hidden');
    applyVisitorTodayFilters();
  });

  visitorFutureTab?.addEventListener('click', () => {
    visitorFutureTab.classList.add('border-blue-500', 'text-blue-600', 'dark:text-blue-400');
    visitorFutureTab.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
    visitorTodayTab?.classList.remove('border-blue-500', 'text-blue-600', 'dark:text-blue-400');
    visitorTodayTab?.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
    visitorFutureContent?.classList.remove('hidden');
    visitorTodayContent?.classList.add('hidden');
    applyVisitorFutureFilters();
  });

  // Today visits filter event listeners
  const visitorTodayStatusFilter = document.getElementById('visitorTodayStatusFilter') as HTMLSelectElement;
  if (visitorTodayStatusFilter) {
    visitorTodayStatusFilter.addEventListener('change', async () => {
      currentVisitorStatusFilter = visitorTodayStatusFilter.value;
      await applyVisitorTodayFilters();
    });
  }

  // Future visits filter event listeners

  const visitorFutureDatePicker = document.getElementById('visitorFutureDatePicker') as HTMLInputElement;
  if (visitorFutureDatePicker) {
    // Allow only strictly future dates within the current month
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const minDate = tomorrow;
    const maxDate = lastDayOfMonth;

    visitorFutureDatePicker.min = minDate.toISOString().split('T')[0];
    visitorFutureDatePicker.max = maxDate.toISOString().split('T')[0];

    // If current value is not in the allowed range, clear it
    if (visitorFutureDatePicker.value) {
      const picked = new Date(visitorFutureDatePicker.value);
      picked.setHours(0, 0, 0, 0);
      if (picked.getTime() < minDate.getTime() || picked.getTime() > maxDate.getTime()) {
        visitorFutureDatePicker.value = '';
      }
    }

    visitorFutureDatePicker.addEventListener('change', async () => {
      await applyVisitorFutureFilters();
    });
  }

  // Past visits search and filter event listeners
  const visitorPastSearchInput = document.getElementById('visitorPastSearchInput') as HTMLInputElement;
  if (visitorPastSearchInput) {
    visitorPastSearchInput.addEventListener('input', debounce(() => {
      currentVisitorSearchTerm = visitorPastSearchInput.value;
      applyVisitorPastFilters();
    }, 300));
  }

  const visitorPastStatusFilter = document.getElementById('visitorPastStatusFilter') as HTMLSelectElement;
  if (visitorPastStatusFilter) {
    visitorPastStatusFilter.addEventListener('change', async () => {
      currentVisitorStatusFilter = visitorPastStatusFilter.value;
      await applyVisitorPastFilters();
    });
  }


  const visitorPastPlaceFilter = document.getElementById('visitorPastPlaceFilter') as HTMLSelectElement;
  if (visitorPastPlaceFilter) {
    visitorPastPlaceFilter.addEventListener('change', async () => {
      await applyVisitorPastFilters();
    });
  }

  // Calendar filter event listeners for visitor past schedules
  const visitorPastCalendarToggle = document.getElementById('visitorPastCalendarToggle');
  const visitorPastCalendarFilter = document.getElementById('visitorPastCalendarFilter');
  const visitorPastStartDate = document.getElementById('visitorPastStartDate') as HTMLInputElement;
  const visitorPastEndDate = document.getElementById('visitorPastEndDate') as HTMLInputElement;
  const visitorPastLastWeekBtn = document.getElementById('visitorPastLastWeekBtn') as HTMLButtonElement;
  const visitorPastLastMonthBtn = document.getElementById('visitorPastLastMonthBtn') as HTMLButtonElement;
  const clearVisitorPastCalendarBtn = document.getElementById('clearVisitorPastCalendarBtn') as HTMLButtonElement;

  // Calendar toggle button
  if (visitorPastCalendarToggle && visitorPastCalendarFilter) {
    visitorPastCalendarToggle.addEventListener('click', () => {
      visitorPastCalendarFilter.classList.toggle('hidden');
    });
  }

  // Date input event listeners
  if (visitorPastStartDate) {
    visitorPastStartDate.addEventListener('change', () => {
      currentVisitorPastStartDate = visitorPastStartDate.value;
      applyVisitorPastFilters();
    });
  }

  if (visitorPastEndDate) {
    visitorPastEndDate.addEventListener('change', () => {
      currentVisitorPastEndDate = visitorPastEndDate.value;
      applyVisitorPastFilters();
    });
  }

  // Quick date buttons
  if (visitorPastLastWeekBtn) {
    visitorPastLastWeekBtn.addEventListener('click', () => {
      const today = new Date();
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - 7);
      const lastWeekEnd = new Date(today);
      lastWeekEnd.setDate(today.getDate() - 1);
      
      currentVisitorPastStartDate = lastWeekStart.toISOString().split('T')[0];
      currentVisitorPastEndDate = lastWeekEnd.toISOString().split('T')[0];
      
      if (visitorPastStartDate) visitorPastStartDate.value = currentVisitorPastStartDate;
      if (visitorPastEndDate) visitorPastEndDate.value = currentVisitorPastEndDate;
      
      applyVisitorPastFilters();
    });
  }

  if (visitorPastLastMonthBtn) {
    visitorPastLastMonthBtn.addEventListener('click', () => {
      const today = new Date();
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      
      currentVisitorPastStartDate = lastMonthStart.toISOString().split('T')[0];
      currentVisitorPastEndDate = lastMonthEnd.toISOString().split('T')[0];
      
      if (visitorPastStartDate) visitorPastStartDate.value = currentVisitorPastStartDate;
      if (visitorPastEndDate) visitorPastEndDate.value = currentVisitorPastEndDate;
      
      applyVisitorPastFilters();
    });
  }

  // Clear calendar button
  if (clearVisitorPastCalendarBtn) {
    clearVisitorPastCalendarBtn.addEventListener('click', () => {
      currentVisitorPastStartDate = '';
      currentVisitorPastEndDate = '';
      
      if (visitorPastStartDate) visitorPastStartDate.value = '';
      if (visitorPastEndDate) visitorPastEndDate.value = '';
      
      applyVisitorPastFilters();
    });
  }

}

// Function to apply filters for today visits
async function applyVisitorTodayFilters() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let filteredVisits = allVisitorVisits.filter(visit => {
    const visitDate = new Date(visit.visit_date);
    visitDate.setHours(0, 0, 0, 0);
    return visitDate.getTime() === today.getTime();
  });

  // Apply status filter
  if (currentVisitorStatusFilter !== 'all') {
    filteredVisits = filteredVisits.filter(visit => visit.status === currentVisitorStatusFilter);
  }

  await displayVisitorTodayVisits(filteredVisits);
}

// Function to apply filters for future visits
async function applyVisitorFutureFilters() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let filteredVisits = allVisitorVisits.filter(visit => {
    const visitDate = new Date(visit.visit_date);
    visitDate.setHours(0, 0, 0, 0);
    return visitDate.getTime() > today.getTime();
  });

  // Apply date picker filter
  const visitorFutureDatePicker = document.getElementById('visitorFutureDatePicker') as HTMLInputElement;
  if (visitorFutureDatePicker && visitorFutureDatePicker.value) {
    const selectedDate = new Date(visitorFutureDatePicker.value);
    selectedDate.setHours(0, 0, 0, 0);
    
    filteredVisits = filteredVisits.filter(visit => {
      const visitDate = new Date(visit.visit_date);
      visitDate.setHours(0, 0, 0, 0);
      return visitDate.getTime() === selectedDate.getTime();
    });
  }

  await displayVisitorFutureVisits(filteredVisits);
}

// Function to apply filters for past visits
async function applyVisitorPastFilters() {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  let filteredVisits = allVisitorVisits.filter(visit => {
    const visitDate = new Date(visit.visit_date);
    return visitDate < currentDate && visit.status !== 'pending';
  });

  // Apply search filter
  if (currentVisitorSearchTerm.trim()) {
    const searchTerm = currentVisitorSearchTerm.toLowerCase();
    filteredVisits = filteredVisits.filter(visit => {
      const purpose = (visit.purpose || '').toLowerCase();
      const otherPurpose = (visit.other_purpose || '').toLowerCase();
      const places = Array.isArray(visit.places) ? visit.places : [];
      const placeNames = places.map((place: any) => (place.place_name || '').toLowerCase()).join(' ');
      
      return purpose.includes(searchTerm) || 
             otherPurpose.includes(searchTerm) || 
             placeNames.includes(searchTerm);
    });
  }

  // Apply status filter
  if (currentVisitorStatusFilter !== 'all') {
    filteredVisits = filteredVisits.filter(visit => visit.status === currentVisitorStatusFilter);
  }

  // Apply place filter
  const visitorPastPlaceFilter = document.getElementById('visitorPastPlaceFilter') as HTMLSelectElement;
  if (visitorPastPlaceFilter && visitorPastPlaceFilter.value !== 'all') {
    const selectedPlace = visitorPastPlaceFilter.value;
    filteredVisits = filteredVisits.filter(visit => {
      const places = Array.isArray(visit.places) ? visit.places : [];
      return places.some((place: any) => place.place_name === selectedPlace);
    });
  }

  // Apply date range filter
  if (currentVisitorPastStartDate || currentVisitorPastEndDate) {
    filteredVisits = filteredVisits.filter(visit => {
      const visitDate = new Date(visit.visit_date);
      const visitDateString = visitDate.toISOString().split('T')[0];
      
      let matchesStartDate = true;
      let matchesEndDate = true;
      
      if (currentVisitorPastStartDate) {
        matchesStartDate = visitDateString >= currentVisitorPastStartDate;
      }
      
      if (currentVisitorPastEndDate) {
        matchesEndDate = visitDateString <= currentVisitorPastEndDate;
      }
      
      return matchesStartDate && matchesEndDate;
    });
  }

  await displayVisitorPastVisits(filteredVisits);
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

// Helper function to set max date for visitor past calendar filters
function setMaxDateForVisitorPastFilters() {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  // Set max date for visitor past start date filter
  const visitorPastStartDate = document.getElementById('visitorPastStartDate') as HTMLInputElement;
  if (visitorPastStartDate) {
    visitorPastStartDate.setAttribute('max', todayString);
  }
  
  // Set max date for visitor past end date filter
  const visitorPastEndDate = document.getElementById('visitorPastEndDate') as HTMLInputElement;
  if (visitorPastEndDate) {
    visitorPastEndDate.setAttribute('max', todayString);
  }
}

// Helper function to clear visitor past calendar filter
function clearVisitorPastCalendarFilter() {
  currentVisitorPastStartDate = '';
  currentVisitorPastEndDate = '';
  
  const visitorPastStartDate = document.getElementById('visitorPastStartDate') as HTMLInputElement;
  const visitorPastEndDate = document.getElementById('visitorPastEndDate') as HTMLInputElement;
  
  if (visitorPastStartDate) visitorPastStartDate.value = '';
  if (visitorPastEndDate) visitorPastEndDate.value = '';
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
function calculateVisitProgress(visit: any): { percentage: number; status: string; color: string; gateProgress?: { entrance: boolean; exit: boolean } } {
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
  
  // For completed_flagged visits, show gate progress if available
  if (visit.status === 'completed_flagged') {
    const entranceScanned = visit.gate_entrance_scanned || false;
    const exitScanned = visit.gate_exit_scanned || false;
    
    return { 
      percentage: 100, 
      status: 'Completed (Flagged)', 
      color: 'bg-orange-500',
      gateProgress: { entrance: entranceScanned, exit: exitScanned }
    };
  }
  
  // Handle temporary exit explicitly
  if (visit.status === 'temporary_exit') {
    const entranceScanned = visit.gate_entrance_scanned || false;
    const exitScanned = visit.gate_exit_scanned || false;
    return {
      percentage: 50,
      status: 'Temporary Exit',
      color: 'bg-orange-500',
      gateProgress: { entrance: entranceScanned, exit: exitScanned }
    };
  }
  
  // For pending visits, calculate progress based on places completed and gate scans
  if (visit.status === 'pending') {
    const places = Array.isArray(visit.places) ? visit.places : [];
    const completedPlaces = places.filter((place: any) => place.status === 'completed').length;
    const totalPlaces = places.length;
    
    // Check gate scan status
    const entranceScanned = visit.gate_entrance_scanned || false;
    const exitScanned = visit.gate_exit_scanned || false;
    
    // Check if this is today's visit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const visitDate = new Date(visit.visit_date);
    visitDate.setHours(0, 0, 0, 0);
    const isToday = visitDate.getTime() === today.getTime();
    
    if (totalPlaces === 0) {
      return { 
        percentage: 0, 
        status: 'No Places Assigned', 
        color: 'bg-gray-500',
        gateProgress: { entrance: entranceScanned, exit: exitScanned }
      };
    }
    
    // If it's today's visit and gate entrance is not scanned, block progress
    if (isToday && !entranceScanned) {
      return { 
        percentage: 0, 
        status: 'Waiting for Gate Entrance Scan', 
        color: 'bg-orange-500',
        gateProgress: { entrance: entranceScanned, exit: exitScanned }
      };
    }
    
    // Calculate places progress (70% weight) - only if gate entrance is scanned for today's visits
    const placesPercentage = (isToday && !entranceScanned) ? 0 : Math.round((completedPlaces / totalPlaces) * 70);
    
    // Calculate gate progress (30% weight)
    let gatePercentage = 0;
    if (entranceScanned) gatePercentage += 15; // 15% for entrance
    if (exitScanned) gatePercentage += 15; // 15% for exit
    
    const totalPercentage = placesPercentage + gatePercentage;
    
    let status = 'Pending';
    let color = 'bg-blue-500';
    
    if (isToday && !entranceScanned) {
      status = 'Waiting for Gate Entrance Scan';
      color = 'bg-orange-500';
    } else if (totalPercentage === 0) {
      status = 'Not Started';
      color = 'bg-gray-500';
    } else if (totalPercentage < 25) {
      status = 'Just Started';
      color = 'bg-blue-500';
    } else if (totalPercentage < 50) {
      status = 'In Progress';
      color = 'bg-yellow-500';
    } else if (totalPercentage < 75) {
      status = 'Almost Done';
      color = 'bg-orange-500';
    } else if (totalPercentage < 100) {
      status = 'Nearly Complete';
      color = 'bg-green-500';
    } else {
      status = 'All Places Completed';
      color = 'bg-green-500';
    }
    
    return { 
      percentage: totalPercentage, 
      status, 
      color,
      gateProgress: { entrance: entranceScanned, exit: exitScanned }
    };
  }
  
  // Check if this is a future visit (visit date is in the future)
  if (visitDate > now) {
    return { percentage: 0, status: 'Scheduled', color: 'bg-blue-500' };
  }
  
  // For current/past visits, calculate progress based on time
  const totalDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const timeSinceScheduled = now.getTime() - scheduledAt.getTime();
  
  // If it's past the visit date by more than 24 hours, show as overdue
  if (now.getTime() > visitDate.getTime() + totalDuration) {
    return { percentage: 100, status: 'Overdue', color: 'bg-red-500' };
  }
  
  // Calculate percentage based on time elapsed since scheduled time
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

    // Check if gate entrance scan is required and completed
    const { data: visitData, error: visitError } = await supabase
      .from('scheduled_visits')
      .select('gate_entrance_scanned, visit_date')
      .eq('id', visitId)
      .single();

    if (visitError) {
      console.error('Error fetching visit data:', visitError);
      showNotification('Error fetching visit data', 'error');
      return;
    }

    // Check if this is today's visit and gate entrance scan is required
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const visitDate = new Date(visitData.visit_date);
    visitDate.setHours(0, 0, 0, 0);
    const isToday = visitDate.getTime() === today.getTime();

    if (isToday && !visitData.gate_entrance_scanned) {
      showNotification('Gate entrance must be scanned by the visitor before places can be completed', 'error');
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
      // Show detailed error message if available
      if (error.message) {
        showNotification('Error: ' + error.message, 'error');
      } else {
        showNotification('An unknown error occurred while completing the place.', 'error');
      }
      return;
    }

    showNotification('Place marked as completed successfully!', 'success');
    
    // Reload the visits to reflect the changes
    await loadScheduledVisits();
    await loadFinishedSchedules();
  } catch (error: any) {
    console.error('Error in completeVisitPlace:', error);
    // Show error message if available
    if (error && error.message) {
      showNotification('Error: ' + error.message, 'error');
    } else {
      showNotification('Error completing visit place', 'error');
    }
  }
}

// Make function available globally
(window as any).completeVisitPlace = completeVisitPlace;
(window as any).showCompletePlaceConfirmModal = showCompletePlaceConfirmModal;
(window as any).completeVisit = completeVisit;
(window as any).scanGateEntrance = scanGateEntrance;
(window as any).scanGateExit = scanGateExit;
(window as any).manualFlagVisitsWithoutExitScans = manualFlagVisitsWithoutExitScans;

// Show confirmation modal for completing a specific place
async function showCompletePlaceConfirmModal(visitId: string, placeId: string) {
  try {
    // Fetch visit and place details for confirmation
    const { data: visit, error } = await supabase
      .from('scheduled_visits')
      .select(`
        id,
        visitor_first_name,
        visitor_last_name,
        visitor_email,
        visit_date,
        purpose,
        status,
        gate_entrance_scanned,
        scheduled_visit_places!inner(
          place_id,
          status,
          places_to_visit(
            name,
            location
          )
        )
      `)
      .eq('id', visitId)
      .single();

    if (error || !visit) {
      showNotification('Unable to load visit details for confirmation', 'error');
      return;
    }

    const place = (visit.scheduled_visit_places || []).find((p: any) => p.place_id === placeId);
    if (!place) {
      showNotification('Place not found for this visit', 'error');
      return;
    }

    // Build modal HTML
    const modalHtml = `
      <div id="completePlaceConfirmModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-5">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Confirm Place Completion</h3>
            <button id="closeCompletePlaceConfirmBtn" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="space-y-3">
            <div class="bg-gray-50 dark:bg-gray-700 rounded p-3">
              <p class="text-sm text-gray-600 dark:text-gray-300"><strong>Visitor:</strong> ${visit.visitor_first_name} ${visit.visitor_last_name} (${visit.visitor_email || 'N/A'})</p>
              <p class="text-sm text-gray-600 dark:text-gray-300"><strong>Visit Date:</strong> ${new Date(visit.visit_date).toLocaleDateString()}</p>
              <p class="text-sm text-gray-600 dark:text-gray-300"><strong>Purpose:</strong> ${visit.purpose || 'N/A'}</p>
              <p class="text-sm text-gray-600 dark:text-gray-300"><strong>Visit Status:</strong> ${visit.status}</p>
              <p class="text-sm ${visit.gate_entrance_scanned ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}"><strong>Entrance Scan:</strong> ${visit.gate_entrance_scanned ? 'Scanned' : 'Not Scanned'}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded p-3">
              <p class="text-sm text-gray-600 dark:text-gray-300"><strong>Place:</strong> ${place.places_to_visit?.name || 'Unknown'}</p>
              <p class="text-sm text-gray-600 dark:text-gray-300"><strong>Location:</strong> ${place.places_to_visit?.location || 'N/A'}</p>
              <p class="text-sm text-gray-600 dark:text-gray-300"><strong>Current Place Status:</strong> ${place.status}</p>
            </div>
            ${!visit.gate_entrance_scanned ? `
              <div class="p-3 rounded bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 text-sm">
                ⚠️ Gate entrance must be scanned by the visitor before places can be completed.
              </div>
            ` : ''}
            <p class="text-sm text-gray-700 dark:text-gray-300">Are you sure you want to mark this place as completed?</p>
          </div>
          <div class="mt-5 flex justify-end gap-2">
            <button id="cancelCompletePlaceBtn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200">Cancel</button>
            <button id="confirmCompletePlaceBtn" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${!visit.gate_entrance_scanned ? 'opacity-50 cursor-not-allowed' : ''}" ${!visit.gate_entrance_scanned ? 'disabled' : ''}>Confirm</button>
          </div>
        </div>
      </div>
    `;

    // Insert modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const closeModal = () => {
      const modal = document.getElementById('completePlaceConfirmModal');
      modal?.remove();
    };

    document.getElementById('closeCompletePlaceConfirmBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelCompletePlaceBtn')?.addEventListener('click', closeModal);
    document.getElementById('completePlaceConfirmModal')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('completePlaceConfirmModal')) closeModal();
    });

    document.getElementById('confirmCompletePlaceBtn')?.addEventListener('click', async () => {
      // Run the original completion function (which handles auth and guards)
      await completeVisitPlace(visitId, placeId);
      closeModal();
    });
  } catch (e) {
    console.error('Error showing completion confirmation modal:', e);
    showNotification('Failed to show confirmation modal', 'error');
  }
}
// Function to complete an entire visit (all places)
async function completeVisit(visitId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showNotification('You must be logged in to complete visits', 'error');
      return;
    }

    // Check if gate entrance scan is required and completed
    const { data: visitData, error: visitError } = await supabase
      .from('scheduled_visits')
      .select('gate_entrance_scanned, visit_date')
      .eq('id', visitId)
      .single();

    if (visitError) {
      console.error('Error fetching visit data:', visitError);
      showNotification('Error fetching visit data', 'error');
      return;
    }

    // Check if this is today's visit and gate entrance scan is required
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const visitDate = new Date(visitData.visit_date);
    visitDate.setHours(0, 0, 0, 0);
    const isToday = visitDate.getTime() === today.getTime();

    if (isToday && !visitData.gate_entrance_scanned) {
      showNotification('Gate entrance must be scanned by the visitor before places can be completed', 'error');
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

// Function to scan gate entrance
async function scanGateEntrance(visitId: string) {
  try {
    // Show gate scanning modal
    showGateScanningModal(visitId);
  } catch (error) {
    console.error('Error in scanGateEntrance:', error);
    showNotification('Error opening gate scanner', 'error');
  }
}

// Function to scan gate exit for a visit
async function scanGateExit(visitId: string) {
  try {
    // Show gate exit scanning modal
    showGateExitScanningModal(visitId);
  } catch (error) {
    console.error('Error in scanGateExit:', error);
    showNotification('Error opening gate exit scanner', 'error');
  }
}
// Function to show gate scanning modal
function showGateScanningModal(visitId: string) {
  // Create modal HTML
  const modalHTML = `
    <div id="gateScanModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Scan Gate Entrance</h3>
            <button 
              id="closeGateScanModalBtn"
              class="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="text-center">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Scan a gate QR code to log your entrance for visit ID: ${visitId.substring(0, 8)}...
              </p>
              
              <!-- Camera Scanner Section -->
              <div id="cameraScannerSection" class="mb-4">
                <div class="relative">
                  <video 
                    id="gateScannerVideo" 
                    class="w-full h-64 bg-gray-900 rounded-lg"
                    autoplay 
                    playsinline
                  ></video>
                  <div id="gateScannerOverlay" class="absolute inset-0 flex items-center justify-center">
                    <div class="border-2 border-white rounded-lg p-2">
                      <div class="w-48 h-48 border-2 border-white rounded-lg"></div>
                    </div>
                  </div>
                  <div id="gateScannerStatus" class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Initializing camera...
                  </div>
                </div>
                
                <div class="mt-2 flex space-x-2">
                  <button 
                    id="startCameraBtn"
                    class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
                  >
                    Start Camera
                  </button>
                  <button 
                    id="stopCameraBtn"
                    class="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
                    style="display: none;"
                  >
                    Stop Camera
                  </button>
                </div>
              </div>
              
              <!-- Manual Input Section -->
              <div class="mb-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Or manually enter gate ID:</p>
                <div class="flex space-x-2">
                  <input 
                    type="text" 
                    id="manualGateIdInput"
                    placeholder="Enter gate ID..."
                    class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                  <button 
                    id="submitManualGateBtn"
                    class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
            
            <div id="gateScanError" class="hidden text-red-600 text-sm text-center"></div>
            <div id="gateScanSuccess" class="hidden text-green-600 text-sm text-center"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Setup event listeners
  const modal = document.getElementById('gateScanModal');
  const closeBtn = document.getElementById('closeGateScanModalBtn');
  const startCameraBtn = document.getElementById('startCameraBtn');
  const stopCameraBtn = document.getElementById('stopCameraBtn');
  const submitManualBtn = document.getElementById('submitManualGateBtn');
  const manualInput = document.getElementById('manualGateIdInput') as HTMLInputElement;
  const video = document.getElementById('gateScannerVideo') as HTMLVideoElement;
  const statusDiv = document.getElementById('gateScannerStatus');

  let stream: MediaStream | null = null;
  let animationFrameId: number | null = null;
  let isScanning = false;

  // Close modal
  closeBtn?.addEventListener('click', () => {
    stopCamera();
    modal?.remove();
  });

  // Close modal when clicking outside
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      stopCamera();
      modal.remove();
    }
  });

  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal) {
      stopCamera();
      modal.remove();
    }
  });

  // Start camera
  startCameraBtn?.addEventListener('click', async () => {
    await startCamera();
  });

  // Stop camera
  stopCameraBtn?.addEventListener('click', () => {
    stopCamera();
  });

  // Function to start camera
  async function startCamera() {
    try {
      if (statusDiv) statusDiv.textContent = 'Starting camera...';
      
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not available');
      }
      
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      
      if (startCameraBtn) startCameraBtn.style.display = 'none';
      if (stopCameraBtn) stopCameraBtn.style.display = 'block';
      if (statusDiv) statusDiv.textContent = 'Camera ready - scanning for QR codes...';
      
      isScanning = true;
      scanFrame();
    } catch (error) {
      console.error('Error starting camera:', error);
      if (statusDiv) statusDiv.textContent = 'Camera access denied';
      showGateScanError('Camera access denied. Please allow camera permissions or use manual input.');
    }
  }

  // Function to stop camera
  function stopCamera() {
    isScanning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    if (video) {
      video.srcObject = null;
    }
    if (startCameraBtn) startCameraBtn.style.display = 'block';
    if (stopCameraBtn) stopCameraBtn.style.display = 'none';
    if (statusDiv) statusDiv.textContent = 'Camera stopped';
  }

  // Function to scan video frames for QR codes
  function scanFrame() {
    if (!isScanning || !video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      if (isScanning) {
        animationFrameId = requestAnimationFrame(scanFrame);
      }
      return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      animationFrameId = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      console.log('QR Code detected:', code.data);
      if (statusDiv) statusDiv.textContent = 'QR Code detected! Processing...';
      
      // Process the QR code
      processGateQRCode(code.data);
      return;
    }
    
    animationFrameId = requestAnimationFrame(scanFrame);
  }

  // Function to process gate QR code
  async function processGateQRCode(qrData: string) {
    try {
      if (statusDiv) statusDiv.textContent = 'Processing QR code...';
      
      const parsed = JSON.parse(qrData);
      
      // Check if it's a gate QR code
      if (parsed.type === 'gate' && parsed.id) {
        stopCamera();
        await processGateScan(visitId, parsed.id);
      } else {
        if (statusDiv) statusDiv.textContent = 'Invalid gate QR code. Please try again.';
        showGateScanError('Invalid Gate QR Code', 'This QR code is not a valid gate code. Please scan a gate QR code.');
      }
    } catch (error) {
      console.error('Error processing gate QR code:', error);
      if (statusDiv) statusDiv.textContent = 'Invalid QR code. Please try again.';
      showGateScanError('Invalid Gate QR Code', 'The gate QR code data could not be processed.');
    }
  }

  // Submit manual gate ID
  submitManualBtn?.addEventListener('click', async () => {
    const gateId = manualInput?.value.trim();
    if (!gateId) {
      showGateScanError('Please enter a gate ID');
      return;
    }

    try {
      await processGateScan(visitId, gateId);
    } catch (error) {
      console.error('Error processing manual gate scan:', error);
      showGateScanError('Error processing gate scan');
    }
  });

  // Handle Enter key in manual input
  manualInput?.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      const gateId = manualInput.value.trim();
      if (!gateId) {
        showGateScanError('Please enter a gate ID');
        return;
      }

      try {
        await processGateScan(visitId, gateId);
      } catch (error) {
        console.error('Error processing manual gate scan:', error);
        showGateScanError('Error processing gate scan');
      }
    }
  });
}

// Function to process gate scan
async function processGateScan(visitId: string, gateId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showGateScanError('You must be logged in to scan gates');
      return;
    }

    // Show face detection modal before processing gate scan
    await showFaceDetectionForGateScan(visitId, gateId);
  } catch (error) {
    console.error('Error in processGateScan:', error);
    showGateScanError('Error processing gate scan');
  }
}

// Function to show face detection modal for gate scanning
async function showFaceDetectionForGateScan(visitId: string, gateId: string) {
  try {
    // Show loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'faceDetectionLoading';
    loadingOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    loadingOverlay.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Preparing face detection...</p>
      </div>
    `;
    document.body.appendChild(loadingOverlay);

    // Open face detection modal
    const { openFaceDetectionModal } = await import('../../utils/AI-Face-Detection/blazefaceModal');
    const faceResult = await openFaceDetectionModal();
    
    // Remove loading overlay
    loadingOverlay.remove();

    if (faceResult.success && faceResult.imageDataUrl) {
      // Process the gate scan with face data
      await processGateScanWithFaceData(visitId, gateId, faceResult);
    } else {
      // Face detection failed or was cancelled
      showGateScanError('Face detection is required to scan the gate entrance. Please try again.');
    }
  } catch (error) {
    console.error('Error in face detection for gate scan:', error);
    showGateScanError('Error during face detection. Please try again.');
  }
}

// Function to process gate scan with face data
async function processGateScanWithFaceData(visitId: string, gateId: string, faceResult: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showGateScanError('You must be logged in to scan gates');
      return;
    }

    // Prepare face image data for storage
    let faceImageData = null;
    let faceDetectionMetadata = null;

    if (faceResult.imageDataUrl) {
      // Compress the face image for storage
      const { compressImageDataUrl } = await import('../../utils/imageCompression');
      const compressedImage = await compressImageDataUrl(faceResult.imageDataUrl, 0.8, 400, 400);
      faceImageData = compressedImage;
      
      // Prepare metadata
      faceDetectionMetadata = {
        timestamp: new Date().toISOString(),
        confidence: faceResult.confidence || 0,
        boundingBox: faceResult.detections?.[0] || null,
        originalSize: faceResult.imageDataUrl.length,
        compressedSize: compressedImage.length
      };
    }

    // Call the gate scanning function with face data
    const { error } = await supabase.rpc('scan_gate_entrance_with_face', {
      p_visit_id: visitId,
      p_gate_id: gateId,
      p_scanned_by: user.id,
      p_face_image_data: faceImageData,
      p_face_detection_confidence: faceResult.confidence || 0,
      p_face_detection_metadata: faceDetectionMetadata,
      p_ip_address: null,
      p_user_agent: navigator.userAgent,
      p_location_data: null
    });

    if (error) {
      console.error('Error scanning gate with face data:', error);
      showGateScanError(`Error scanning gate: ${error.message}`);
      return;
    }

    showGateScanSuccess('Gate entrance scanned successfully! You can now complete your visit.');
    
    // Close modal after a short delay
    setTimeout(() => {
      const modal = document.getElementById('gateScanModal');
      modal?.remove();
      
      // Refresh the visits list
      loadScheduledVisits();
      loadVisitorVisits();
    }, 3000);
  } catch (error) {
    console.error('Error in processGateScanWithFaceData:', error);
    showGateScanError('Error processing gate scan with face data.');
  }
}
// Function to show gate exit scanning modal
function showGateExitScanningModal(visitId: string) {
  // Create modal HTML
  const modalHTML = `
    <div id="gateExitScanModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Scan Gate Exit</h3>
            <button 
              id="closeGateExitScanModalBtn"
              class="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="text-center">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Scan a gate QR code to log the visitor's exit for visit ID: ${visitId.substring(0, 8)}...
              </p>
              
              <!-- Camera Scanner Section -->
              <div id="cameraExitScannerSection" class="mb-4">
                <div class="relative">
                  <video 
                    id="gateExitScannerVideo" 
                    class="w-full h-64 bg-gray-900 rounded-lg"
                    autoplay 
                    playsinline
                  ></video>
                  <div id="gateExitScannerOverlay" class="absolute inset-0 flex items-center justify-center">
                    <div class="border-2 border-white rounded-lg p-2">
                      <div class="w-48 h-48 border-2 border-white rounded-lg"></div>
                    </div>
                  </div>
                  <div id="gateExitScannerStatus" class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Initializing camera...
                  </div>
                </div>
                
                <div class="mt-2 flex space-x-2">
                  <button 
                    id="startExitCameraBtn"
                    class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
                  >
                    Start Camera
                  </button>
                  <button 
                    id="stopExitCameraBtn"
                    class="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
                    style="display: none;"
                  >
                    Stop Camera
                  </button>
                </div>
              </div>
              
              <!-- Manual Input Section -->
              <div class="mb-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Or manually enter gate ID:</p>
                <div class="flex space-x-2">
                  <input 
                    type="text" 
                    id="manualExitGateIdInput"
                    placeholder="Enter gate ID..."
                    class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                  <button 
                    id="submitManualExitGateBtn"
                    class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
            
            <div id="gateExitScanError" class="hidden text-red-600 text-sm text-center"></div>
            <div id="gateExitScanSuccess" class="hidden text-green-600 text-sm text-center"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Setup event listeners
  const modal = document.getElementById('gateExitScanModal');
  const closeBtn = document.getElementById('closeGateExitScanModalBtn');
  const startCameraBtn = document.getElementById('startExitCameraBtn');
  const stopCameraBtn = document.getElementById('stopExitCameraBtn');
  const submitManualBtn = document.getElementById('submitManualExitGateBtn');
  const manualInput = document.getElementById('manualExitGateIdInput') as HTMLInputElement;
  const video = document.getElementById('gateExitScannerVideo') as HTMLVideoElement;
  const statusDiv = document.getElementById('gateExitScannerStatus');

  let stream: MediaStream | null = null;
  let animationFrameId: number | null = null;
  let isScanning = false;

  // Close modal
  closeBtn?.addEventListener('click', () => {
    stopCamera();
    modal?.remove();
  });

  // Close modal when clicking outside
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      stopCamera();
      modal.remove();
    }
  });

  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal) {
      stopCamera();
      modal.remove();
    }
  });

  // Start camera
  startCameraBtn?.addEventListener('click', async () => {
    await startCamera();
  });

  // Stop camera
  stopCameraBtn?.addEventListener('click', () => {
    stopCamera();
  });

  // Function to start camera
  async function startCamera() {
    try {
      if (statusDiv) statusDiv.textContent = 'Starting camera...';
      
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not available');
      }
      
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      
      if (startCameraBtn) startCameraBtn.style.display = 'none';
      if (stopCameraBtn) stopCameraBtn.style.display = 'block';
      if (statusDiv) statusDiv.textContent = 'Camera ready - scanning for QR codes...';
      
      isScanning = true;
      scanFrame();
    } catch (error) {
      console.error('Error starting camera:', error);
      if (statusDiv) statusDiv.textContent = 'Camera access denied';
      showGateExitScanError('Camera access denied. Please allow camera permissions or use manual input.');
    }
  }

  // Function to stop camera
  function stopCamera() {
    isScanning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    if (video) {
      video.srcObject = null;
    }
    if (startCameraBtn) startCameraBtn.style.display = 'block';
    if (stopCameraBtn) stopCameraBtn.style.display = 'none';
    if (statusDiv) statusDiv.textContent = 'Camera stopped';
  }

  // Function to scan video frames for QR codes
  function scanFrame() {
    if (!isScanning || !video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      if (isScanning) {
        animationFrameId = requestAnimationFrame(scanFrame);
      }
      return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      animationFrameId = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      console.log('QR Code detected:', code.data);
      if (statusDiv) statusDiv.textContent = 'QR Code detected! Processing...';
      
      // Process the QR code
      processGateExitQRCode(code.data);
      return;
    }
    
    animationFrameId = requestAnimationFrame(scanFrame);
  }

  // Function to process gate exit QR code
  async function processGateExitQRCode(qrData: string) {
    try {
      if (statusDiv) statusDiv.textContent = 'Processing QR code...';
      
      const parsed = JSON.parse(qrData);
      
      // Check if it's a gate QR code
      if (parsed.type === 'gate' && parsed.id) {
        stopCamera();
        await processGateExitScan(visitId, parsed.id);
      } else {
        if (statusDiv) statusDiv.textContent = 'Invalid gate QR code. Please try again.';
        showGateExitScanError('Invalid Gate QR Code', 'This QR code is not a valid gate code. Please scan a gate QR code.');
      }
    } catch (error) {
      console.error('Error processing gate exit QR code:', error);
      if (statusDiv) statusDiv.textContent = 'Invalid QR code. Please try again.';
      showGateExitScanError('Invalid Gate QR Code', 'The gate QR code data could not be processed.');
    }
  }

  // Submit manual gate ID
  submitManualBtn?.addEventListener('click', async () => {
    const gateId = manualInput?.value.trim();
    if (!gateId) {
      showGateExitScanError('Please enter a gate ID');
      return;
    }

    try {
      await processGateExitScan(visitId, gateId);
    } catch (error) {
      console.error('Error processing manual gate exit scan:', error);
      showGateExitScanError('Error processing gate exit scan');
    }
  });

  // Handle Enter key in manual input
  manualInput?.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      const gateId = manualInput.value.trim();
      if (!gateId) {
        showGateExitScanError('Please enter a gate ID');
        return;
      }

      try {
        await processGateExitScan(visitId, gateId);
      } catch (error) {
        console.error('Error processing manual gate exit scan:', error);
        showGateExitScanError('Error processing gate exit scan');
      }
    }
  });
}

// Function to process gate exit scan
async function processGateExitScan(visitId: string, gateId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showGateExitScanError('You must be logged in to scan gates');
      return;
    }

    // Call the gate exit scanning function
    const { error } = await supabase.rpc('scan_gate_exit', {
      p_visit_id: visitId,
      p_gate_id: gateId,
      p_scanned_by: user.id
    });

    if (error) {
      console.error('Error scanning gate exit:', error);
      showGateExitScanError(`Error scanning gate exit: ${error.message}`);
      return;
    }

    showGateExitScanSuccess('Gate exit scanned successfully!');
    
    // Close modal after a short delay
    setTimeout(() => {
      const modal = document.getElementById('gateExitScanModal');
      modal?.remove();
      
      // Refresh the visits list
      loadScheduledVisits();
      loadVisitorVisits();
    }, 3000);
  } catch (error) {
    console.error('Error in processGateExitScan:', error);
    showGateExitScanError('Error processing gate exit scan');
  }
}

// Function to show gate exit scan error
function showGateExitScanError(message: string, title?: string) {
  const errorDiv = document.getElementById('gateExitScanError');
  const successDiv = document.getElementById('gateExitScanSuccess');
  
  if (errorDiv) {
    errorDiv.innerHTML = title ? `<strong>${title}</strong><br>${message}` : message;
    errorDiv.classList.remove('hidden');
  }
  
  if (successDiv) {
    successDiv.classList.add('hidden');
  }
}

// Function to show gate exit scan success
function showGateExitScanSuccess(message: string) {
  const errorDiv = document.getElementById('gateExitScanError');
  const successDiv = document.getElementById('gateExitScanSuccess');
  
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.classList.remove('hidden');
  }
  
  if (errorDiv) {
    errorDiv.classList.add('hidden');
  }
}

// Function to show gate scan error
function showGateScanError(message: string, title?: string) {
  const errorDiv = document.getElementById('gateScanError');
  const successDiv = document.getElementById('gateScanSuccess');
  
  if (errorDiv) {
    errorDiv.innerHTML = title ? `<strong>${title}</strong><br>${message}` : message;
    errorDiv.classList.remove('hidden');
  }
  
  if (successDiv) {
    successDiv.classList.add('hidden');
  }
}

// Function to show gate scan success
function showGateScanSuccess(message: string) {
  const errorDiv = document.getElementById('gateScanError');
  const successDiv = document.getElementById('gateScanSuccess');
  
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.classList.remove('hidden');
  }
  
  if (errorDiv) {
    errorDiv.classList.add('hidden');
  }
}

// Function to manually flag visits without exit scans (admin only)
async function manualFlagVisitsWithoutExitScans() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showNotification('You must be logged in to perform this action', 'error');
      return;
    }

    // Call the manual flagging function
    const { data, error } = await supabase.rpc('manual_flag_visits_without_exit_scans', {
      p_admin_user_id: user.id
    });

    if (error) {
      console.error('Error flagging visits:', error);
      showNotification(`Error flagging visits: ${error.message}`, 'error');
      return;
    }

    const flaggedCount = data || 0;
    showNotification(`Successfully flagged ${flaggedCount} visits without exit scans`, 'success');
    
    // Refresh the data
    loadScheduledVisits();
    loadVisitorVisits();
  } catch (error) {
    console.error('Error in manualFlagVisitsWithoutExitScans:', error);
    showNotification('Error flagging visits without exit scans', 'error');
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
    const availableRadio = document.getElementById('availableRadio') as HTMLInputElement;
    const unavailableRadio = document.getElementById('unavailableRadio') as HTMLInputElement;
    const reasonField = document.getElementById('reasonField');
    const submitBtn = document.getElementById('updateAvailabilityBtn') as HTMLButtonElement;
    const form = document.getElementById('availabilityForm') as HTMLFormElement;

    if (modal && errorDiv && successDiv && reasonTextarea && submitBtn && availableRadio && unavailableRadio && reasonField && form) {
      // Ensure modal overlays the entire page by appending to body
      if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }
      // Clear previous messages and reset form
      errorDiv.classList.add('hidden');
      errorDiv.textContent = '';
      successDiv.classList.add('hidden');
      successDiv.textContent = '';
      reasonTextarea.value = '';
      availableRadio.checked = currentAvailability;
      unavailableRadio.checked = !currentAvailability;
      reasonField.classList.toggle('hidden', currentAvailability);

      // Show/hide reason field based on radio selection
      const handleRadioChange = () => {
        if (unavailableRadio.checked) {
          reasonField.classList.remove('hidden');
          reasonTextarea.required = true;
        } else {
          reasonField.classList.add('hidden');
          reasonTextarea.required = false;
          reasonTextarea.value = '';
        }
      };
      availableRadio.removeEventListener('change', handleRadioChange);
      unavailableRadio.removeEventListener('change', handleRadioChange);
      availableRadio.addEventListener('change', handleRadioChange);
      unavailableRadio.addEventListener('change', handleRadioChange);

      // Set up the form submission
      const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (submitBtn.disabled) return;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';
        try {
          const newAvailability = availableRadio.checked;
          const unavailabilityReason = reasonTextarea.value.trim();
          if (!newAvailability && !unavailabilityReason) {
            errorDiv.textContent = 'Please provide a reason for unavailability.';
            errorDiv.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Availability';
            return;
          }
          const { data, error } = await supabase.rpc('update_personnel_availability', {
            p_personnel_id: user.id,
            p_place_id: placeId,
            p_is_available: newAvailability,
            p_unavailability_reason: newAvailability ? null : unavailabilityReason,
            p_updated_by: user.id
          });
          if (error) {
            console.error('Error updating availability:', error);
            errorDiv.textContent = 'Error updating availability: ' + error.message;
            errorDiv.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Availability';
            return;
          }
          successDiv.textContent = `Successfully marked as ${newAvailability ? 'available' : 'unavailable'}.`;
          successDiv.classList.remove('hidden');
          setTimeout(() => {
            modal.classList.add('hidden');
            loadPersonnelDashboard();
          }, 1500);
        } catch (error) {
          console.error('Error in availability update:', error);
          errorDiv.textContent = 'Error updating availability. Please try again.';
          errorDiv.classList.remove('hidden');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Update Availability';
        }
      };
      form.onsubmit = null;
      form.removeEventListener('submit', handleSubmit);
      form.addEventListener('submit', handleSubmit);
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

    // Load visitor's scheduled visits (both current and past)
    await loadVisitorVisits();

    // Set max dates for visitor past calendar filters
    setMaxDateForVisitorPastFilters();

    // Setup visitor dashboard event listeners with a small delay to ensure DOM is ready
    setTimeout(() => {
      setupVisitorDashboardEventListeners();
    }, 100);
    
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

    // Store all visits globally
    allVisitorVisits = visits || [];
    
    // Separate current and past visits
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    const currentVisits = allVisitorVisits.filter(visit => {
      const visitDate = new Date(visit.visit_date);
      return visitDate >= currentDate || visit.status === 'pending';
    });
    
    const pastVisits = allVisitorVisits.filter(visit => {
      const visitDate = new Date(visit.visit_date);
      return visitDate < currentDate && visit.status !== 'pending';
    });

    // Display today and future visits
    await applyVisitorTodayFilters();
    await applyVisitorFutureFilters();
    
    // Display past visits
    await displayVisitorPastVisits(pastVisits);
    
    // Populate place filter options for past visits
    populatePastPlaceFilterOptions(pastVisits);
    
  } catch (error) {
    console.error('Error in loadVisitorVisits:', error);
    showNotification('Error loading visits', 'error');
  }
}

// Function to display visitor's current visits
async function displayVisitorCurrentVisits(visits: any[]): Promise<void> {
  const visitorCurrentVisitsList = document.getElementById('visitorCurrentVisitsList');
  if (!visitorCurrentVisitsList) {
    console.error('Visitor current visits list container not found');
    return;
  }

  // Get user role to check if they can scan gates
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = null;
  
  if (user) {
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      userRole = roleData?.role;
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  }

  if (visits.length === 0) {
    visitorCurrentVisitsList.innerHTML = `
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
    
    let statusLabel = '';
    if (visit.status === 'completed_flagged') {
      if (!isToday && isPast) {
        statusLabel = 'Completed (Flagged)';
      } else {
        statusLabel = (completedPlaces === totalPlaces && totalPlaces > 0) ? 'In Progress' : 'Pending';
      }
    } else if (visit.status === 'completed') {
      statusLabel = 'Completed';
    } else if (visit.status === 'pending' && completedPlaces === totalPlaces && totalPlaces > 0) {
      statusLabel = 'In Progress';
    } else if (visit.status === 'pending') {
      statusLabel = 'Pending';
    } else if (visit.status === 'temporary_exit') {
      statusLabel = 'Temporary Exit';
    } else if (visit.status === 'unsuccessful' || visit.status === 'failed') {
      statusLabel = 'Unsuccessful';
    } else if (visit.status === 'cancelled') {
      statusLabel = 'Cancelled';
    } else {
      statusLabel = visit.status.charAt(0).toUpperCase() + visit.status.slice(1);
    }
    
    visitsHtml += `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transform">
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
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono flex items-center space-x-2">
                <span>Visit ID: ${visit.id}</span>
                <button 
                  class="px-2 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Copy Visit ID"
                  onclick="copyVisitId('${visit.id}')"
                >Copy</button>
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <span class="px-3 py-1 rounded-full text-xs font-medium ${
                visit.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                visit.status === 'completed_flagged' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                (visit.status === 'pending' && completedPlaces === totalPlaces && totalPlaces > 0) ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                visit.status === 'unsuccessful' || visit.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                visit.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }">
                ${statusLabel}
              </span>
              ${isToday ? '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs font-medium">Today</span>' : ''}
              ${visit.status !== 'unsuccessful' && visit.status !== 'failed' && visit.status !== 'completed' && visit.status !== 'completed_flagged' ? `
                <button 
                  onclick="printVisitCard('${visit.id}')"
                  class="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200 flex items-center space-x-1"
                  title="Print Visit Card with QR Code"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                  </svg>
                  <span>Print</span>
                </button>
              ` : ''}
              ${visit.status === 'completed_flagged' && !isToday && isPast ? `
                <button 
                  onclick="showFlaggedVisitDetails('${visit.id}')"
                  class="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 flex items-center space-x-1"
                  title="View Visit Details"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <span>Details</span>
                </button>
              ` : ''}
              ${isToday && userRole === 'visitor' && ((visit.status === 'pending' && !visit.gate_entrance_scanned) || visit.status === 'temporary_exit') ? `
                <button 
                  onclick="scanGateEntrance('${visit.id}')"
                  class="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-xs font-medium hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors duration-200 flex items-center space-x-1"
                  title="Scan Gate Entrance"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>Scan Gate</span>
                </button>
              ` : ''}
              ${isToday && visit.status === 'pending' && visit.gate_entrance_scanned && !visit.gate_exit_scanned && userRole === 'visitor' && completedPlaces === totalPlaces && totalPlaces > 0 ? `
                <button 
                  onclick="scanGateExit('${visit.id}')"
                  class="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200 flex items-center space-x-1"
                  title="Scan Gate Exit"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  <span>Scan Exit</span>
                </button>
              ` : ''}
              ${isToday && visit.status === 'pending' && visit.gate_entrance_scanned && !visit.gate_exit_scanned && userRole === 'visitor' && (completedPlaces < totalPlaces || totalPlaces === 0) ? `
                <div class="flex flex-col items-end space-y-1">
                  <button 
                    disabled
                    class="px-3 py-1 bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 rounded-full text-xs font-medium cursor-not-allowed flex items-center space-x-1"
                    title="All places must be completed by personnel before scanning exit gate"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    <span>Scan Exit</span>
                  </button>
                  <span class="text-xs text-gray-500 dark:text-gray-400 text-right">
                    Waiting for personnel to complete all places
                  </span>
                </div>
              ` : ''}
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
            
            <!-- Gate Progress Indicators -->
            ${progress.gateProgress ? `
              <div class="mt-3 flex items-center justify-between text-xs">
                <div class="flex items-center space-x-4">
                  <div class="flex items-center space-x-2">
                    <span class="text-gray-600 dark:text-gray-400">Entrance:</span>
                    <span class="w-3 h-3 rounded-full ${progress.gateProgress.entrance ? 'bg-green-500' : 'bg-gray-400'}"></span>
                    <span class="text-gray-500 dark:text-gray-400">${progress.gateProgress.entrance ? 'Scanned' : 'Pending'}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-gray-600 dark:text-gray-400">Exit:</span>
                    <span class="w-3 h-3 rounded-full ${progress.gateProgress.exit ? 'bg-green-500' : 'bg-gray-400'}"></span>
                    <span class="text-gray-500 dark:text-gray-400">${progress.gateProgress.exit ? 'Scanned' : 'Pending'}</span>
                  </div>
                </div>
                <div class="text-gray-500 dark:text-gray-400">
                  ${progress.gateProgress.entrance ? '15%' : '0%'} + ${progress.gateProgress.exit ? '15%' : '0%'} gate progress
                </div>
              </div>
            ` : ''}
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

          <!-- Gate Scan Status -->
          ${isToday ? `
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gate Scan Status:</h4>
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Entrance:</span>
                  ${visit.gate_entrance_scanned ? `
                    <span class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
                      ✓ Scanned
                    </span>
                  ` : `
                    <span class="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full text-xs font-medium">
                      ⏳ Pending
                    </span>
                  `}
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Exit:</span>
                  ${visit.gate_exit_scanned ? `
                    <span class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
                      ✓ Scanned
                    </span>
                  ` : `
                    <span class="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full text-xs font-medium">
                      ⏳ Pending
                    </span>
                  `}
                </div>
                ${visit.flagged_for_no_exit ? `
                  <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs font-medium">
                      ⚠️ Flagged - No exit scan
                    </span>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  visitorCurrentVisitsList.innerHTML = visitsHtml;
}

// Function to display visitor's today visits
async function displayVisitorTodayVisits(visits: any[]): Promise<void> {
  const visitorTodayVisitsList = document.getElementById('visitorTodayVisitsList');
  if (!visitorTodayVisitsList) {
    console.error('Visitor today visits list container not found');
    return;
  }

  // Get user role to check if they can scan gates
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = null;
  
  if (user) {
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      userRole = roleData?.role;
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  }

  if (visits.length === 0) {
    visitorTodayVisitsList.innerHTML = `
      <div class="text-center py-8">
        <div class="text-gray-500 dark:text-gray-400">
          <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-lg font-medium">No visits scheduled for today</p>
          <p class="text-sm">You don't have any visits scheduled for today.</p>
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
    
    let statusLabel = '';
    if (visit.status === 'completed_flagged') {
      if (!isToday && isPast) {
        statusLabel = 'Completed (Flagged)';
      } else {
        statusLabel = (completedPlaces === totalPlaces && totalPlaces > 0) ? 'In Progress' : 'Pending';
      }
    } else if (visit.status === 'completed') {
      statusLabel = 'Completed';
    } else if (visit.status === 'pending' && completedPlaces === totalPlaces && totalPlaces > 0) {
      statusLabel = 'In Progress';
    } else if (visit.status === 'pending') {
      statusLabel = 'Pending';
    } else if (visit.status === 'temporary_exit') {
      statusLabel = 'Temporary Exit';
    } else if (visit.status === 'unsuccessful' || visit.status === 'failed') {
      statusLabel = 'Unsuccessful';
    } else if (visit.status === 'cancelled') {
      statusLabel = 'Cancelled';
    } else {
      statusLabel = visit.status.charAt(0).toUpperCase() + visit.status.slice(1);
    }
    
    visitsHtml += `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transform">
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
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono flex items-center space-x-2">
                <span>Visit ID: ${visit.id}</span>
                <button 
                  class="px-2 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Copy Visit ID"
                  onclick="copyVisitId('${visit.id}')"
                >Copy</button>
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <span class="px-3 py-1 rounded-full text-xs font-medium ${
                visit.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                visit.status === 'completed_flagged' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                (visit.status === 'pending' && completedPlaces === totalPlaces && totalPlaces > 0) ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                visit.status === 'unsuccessful' || visit.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                visit.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }">
                ${statusLabel}
              </span>
              ${isToday ?
                `<span class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                  Today
                </span>` : ''
              }
              ${visit.status !== 'unsuccessful' && visit.status !== 'failed' && visit.status !== 'completed' && visit.status !== 'completed_flagged' ? `
                <button 
                  onclick="printVisitCard('${visit.id}')"
                  class="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200 flex items-center space-x-1"
                  title="Print Visit Card with QR Code"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                  </svg>
                  <span>Print</span>
                </button>
              ` : ''}
              ${isToday && userRole === 'visitor' && ((visit.status === 'pending' && !visit.gate_entrance_scanned) || visit.status === 'temporary_exit') ? `
                <button 
                  onclick="scanGateEntrance('${visit.id}')"
                  class="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 flex items-center space-x-1"
                  title="Scan Gate Entrance to Start Visit"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z"></path>
                  </svg>
                  <span>Scan Entrance</span>
                </button>
              ` : ''}
              ${isToday && visit.status === 'pending' && visit.gate_entrance_scanned && !visit.gate_exit_scanned && userRole === 'visitor' && completedPlaces === totalPlaces && totalPlaces > 0 ? `
                <button 
                  onclick="scanGateExit('${visit.id}')"
                  class="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200 flex items-center space-x-1"
                  title="Scan Gate Exit to Complete Visit"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  <span>Scan Exit</span>
                </button>
              ` : ''}
              ${isToday && visit.status === 'pending' && visit.gate_entrance_scanned && !visit.gate_exit_scanned && userRole === 'visitor' && (completedPlaces < totalPlaces || totalPlaces === 0) ? `
                <div class="flex flex-col items-end space-y-1">
                  <button 
                    disabled
                    class="px-3 py-1 bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 rounded-full text-xs font-medium cursor-not-allowed flex items-center space-x-1"
                    title="All places must be completed by personnel before scanning exit gate"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    <span>Scan Exit</span>
                  </button>
                  <span class="text-xs text-gray-500 dark:text-gray-400 text-right">
                    Waiting for personnel to complete all places
                  </span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mb-4">
            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Overall Progress</span>
              <span>${progress.percentage}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: ${progress.percentage}%"></div>
            </div>
          </div>

          <!-- Places Progress -->
          ${places.length > 0 ? `
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Places Progress</span>
                <span>${completedPlaces}/${totalPlaces} completed</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div class="bg-green-600 h-2 rounded-full transition-all duration-300" style="width: ${totalPlaces > 0 ? (completedPlaces / totalPlaces) * 100 : 0}%"></div>
              </div>
            </div>
          ` : ''}

          <!-- Gate Progress (if user has gate access) -->
          ${userRole === 'admin' || userRole === 'security' ? `
            <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Gate Progress</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">30% total</span>
              </div>
              <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                  <span class="text-gray-600 dark:text-gray-400">Entrance:</span>
                  <span class="w-3 h-3 rounded-full ${progress.gateProgress.entrance ? 'bg-green-500' : 'bg-gray-400'}"></span>
                  <span class="text-gray-500 dark:text-gray-400">${progress.gateProgress.entrance ? 'Scanned' : 'Pending'}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-gray-600 dark:text-gray-400">Exit:</span>
                  <span class="w-3 h-3 rounded-full ${progress.gateProgress.exit ? 'bg-green-500' : 'bg-gray-400'}"></span>
                  <span class="text-gray-500 dark:text-gray-400">${progress.gateProgress.exit ? 'Scanned' : 'Pending'}</span>
                </div>
              </div>
              <div class="text-gray-500 dark:text-gray-400">
                ${progress.gateProgress.entrance ? '15%' : '0%'} + ${progress.gateProgress.exit ? '15%' : '0%'} gate progress
              </div>
            </div>
          ` : ''}

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
                        ${new Date(place.completed_at).toLocaleTimeString()}
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
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
                  <span class="text-gray-600 dark:text-gray-400 ml-2">
                    ${visit.estimated_duration || 'Not specified'}
                  </span>
                </div>
                <div class="flex items-center space-x-2">
                  ${visit.gate_entrance_scanned ? `
                    <button 
                      onclick="showFaceDataModal('${visit.id}', '${visit.visitor_first_name} ${visit.visitor_last_name}', 'entrance')"
                      class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 flex items-center space-x-1"
                      title="View entrance face data"
                    >
                      <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Entrance</span>
                    </button>
                  ` : ''}
                  ${visit.gate_exit_scanned ? `
                    <button 
                      onclick="showFaceDataModal('${visit.id}', '${visit.visitor_first_name} ${visit.visitor_last_name}', 'exit')"
                      class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200 flex items-center space-x-1"
                      title="View exit face data"
                    >
                      <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Exit</span>
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  visitorTodayVisitsList.innerHTML = visitsHtml;
}

// Function to display visitor's future visits
async function displayVisitorFutureVisits(visits: any[]): Promise<void> {
  const visitorFutureVisitsList = document.getElementById('visitorFutureVisitsList');
  if (!visitorFutureVisitsList) {
    console.error('Visitor future visits list container not found');
    return;
  }

  // Get user role to check if they can scan gates
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = null;
  
  if (user) {
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      userRole = roleData?.role;
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  }

  if (visits.length === 0) {
    visitorFutureVisitsList.innerHTML = `
      <div class="text-center py-8">
        <div class="text-gray-500 dark:text-gray-400">
          <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-lg font-medium">No future visits scheduled</p>
          <p class="text-sm">You don't have any visits scheduled for the future.</p>
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
    
    let statusLabel = '';
    if (visit.status === 'completed_flagged') {
      if (!isToday && isPast) {
        statusLabel = 'Completed (Flagged)';
      } else {
        statusLabel = (completedPlaces === totalPlaces && totalPlaces > 0) ? 'In Progress' : 'Pending';
      }
    } else if (visit.status === 'completed') {
      statusLabel = 'Completed';
    } else if (visit.status === 'pending' && completedPlaces === totalPlaces && totalPlaces > 0) {
      statusLabel = 'In Progress';
    } else if (visit.status === 'pending') {
      statusLabel = 'Pending';
    } else if (visit.status === 'temporary_exit') {
      statusLabel = 'Temporary Exit';
    } else if (visit.status === 'unsuccessful' || visit.status === 'failed') {
      statusLabel = 'Unsuccessful';
    } else if (visit.status === 'cancelled') {
      statusLabel = 'Cancelled';
    } else {
      statusLabel = visit.status.charAt(0).toUpperCase() + visit.status.slice(1);
    }
    
    visitsHtml += `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transform">
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
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono flex items-center space-x-2">
                <span>Visit ID: ${visit.id}</span>
                <button 
                  class="px-2 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Copy Visit ID"
                  onclick="copyVisitId('${visit.id}')"
                >Copy</button>
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <span class="px-3 py-1 rounded-full text-xs font-medium ${
                visit.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                visit.status === 'completed_flagged' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                (visit.status === 'pending' && completedPlaces === totalPlaces && totalPlaces > 0) ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                visit.status === 'unsuccessful' || visit.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                visit.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }">
                ${statusLabel}
              </span>
              <span class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
                Future
              </span>
              ${visit.status !== 'unsuccessful' && visit.status !== 'failed' && visit.status !== 'completed' && visit.status !== 'completed_flagged' ? `
                <button 
                  onclick="printVisitCard('${visit.id}')"
                  class="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200 flex items-center space-x-1"
                  title="Print Visit Card with QR Code"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                  </svg>
                  <span>Print</span>
                </button>
              ` : ''}
              ${isToday && visit.status === 'pending' && !visit.gate_entrance_scanned && userRole === 'visitor' ? `
                <button 
                  onclick="scanGateEntrance('${visit.id}')"
                  class="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 flex items-center space-x-1"
                  title="Scan Gate Entrance to Start Visit"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z"></path>
                  </svg>
                  <span>Scan Entrance</span>
                </button>
              ` : ''}
              ${isToday && visit.status === 'pending' && visit.gate_entrance_scanned && !visit.gate_exit_scanned && userRole === 'visitor' && completedPlaces === totalPlaces && totalPlaces > 0 ? `
                <button 
                  onclick="scanGateExit('${visit.id}')"
                  class="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200 flex items-center space-x-1"
                  title="Scan Gate Exit to Complete Visit"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  <span>Scan Exit</span>
                </button>
              ` : ''}
              ${isToday && visit.status === 'pending' && visit.gate_entrance_scanned && !visit.gate_exit_scanned && userRole === 'visitor' && (completedPlaces < totalPlaces || totalPlaces === 0) ? `
                <div class="flex flex-col items-end space-y-1">
                  <button 
                    disabled
                    class="px-3 py-1 bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 rounded-full text-xs font-medium cursor-not-allowed flex items-center space-x-1"
                    title="All places must be completed by personnel before scanning exit gate"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    <span>Scan Exit</span>
                  </button>
                  <span class="text-xs text-gray-500 dark:text-gray-400 text-right">
                    Waiting for personnel to complete all places
                  </span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mb-4">
            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Overall Progress</span>
              <span>${progress.percentage}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: ${progress.percentage}%"></div>
            </div>
          </div>

          <!-- Places Progress -->
          ${places.length > 0 ? `
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Places Progress</span>
                <span>${completedPlaces}/${totalPlaces} completed</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div class="bg-green-600 h-2 rounded-full transition-all duration-300" style="width: ${totalPlaces > 0 ? (completedPlaces / totalPlaces) * 100 : 0}%"></div>
              </div>
            </div>
          ` : ''}

          <!-- Gate Progress (if user has gate access) -->
          ${userRole === 'admin' || userRole === 'security' ? `
            <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Gate Progress</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">30% total</span>
              </div>
              <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                  <span class="text-gray-600 dark:text-gray-400">Entrance:</span>
                  <span class="w-3 h-3 rounded-full ${progress.gateProgress.entrance ? 'bg-green-500' : 'bg-gray-400'}"></span>
                  <span class="text-gray-500 dark:text-gray-400">${progress.gateProgress.entrance ? 'Scanned' : 'Pending'}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-gray-600 dark:text-gray-400">Exit:</span>
                  <span class="w-3 h-3 rounded-full ${progress.gateProgress.exit ? 'bg-green-500' : 'bg-gray-400'}"></span>
                  <span class="text-gray-500 dark:text-gray-400">${progress.gateProgress.exit ? 'Scanned' : 'Pending'}</span>
                </div>
              </div>
              <div class="text-gray-500 dark:text-gray-400">
                ${progress.gateProgress.entrance ? '15%' : '0%'} + ${progress.gateProgress.exit ? '15%' : '0%'} gate progress
              </div>
            </div>
          ` : ''}

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
                        ${new Date(place.completed_at).toLocaleTimeString()}
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
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
                  <span class="text-gray-600 dark:text-gray-400 ml-2">
                    ${visit.estimated_duration || 'Not specified'}
                  </span>
                </div>
                <div class="flex items-center space-x-2">
                  ${visit.gate_entrance_scanned ? `
                    <button 
                      onclick="showFaceDataModal('${visit.id}', '${visit.visitor_first_name} ${visit.visitor_last_name}', 'entrance')"
                      class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 flex items-center space-x-1"
                      title="View entrance face data"
                    >
                      <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Entrance</span>
                    </button>
                  ` : ''}
                  ${visit.gate_exit_scanned ? `
                    <button 
                      onclick="showFaceDataModal('${visit.id}', '${visit.visitor_first_name} ${visit.visitor_last_name}', 'exit')"
                      class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200 flex items-center space-x-1"
                      title="View exit face data"
                    >
                      <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Exit</span>
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  visitorFutureVisitsList.innerHTML = visitsHtml;
}

// Function to display visitor's past visits
async function displayVisitorPastVisits(visits: any[]): Promise<void> {
  const visitorPastVisitsList = document.getElementById('visitorPastVisitsList');
  if (!visitorPastVisitsList) {
    console.error('Visitor past visits list container not found');
    return;
  }

  if (visits.length === 0) {
    visitorPastVisitsList.innerHTML = `
      <div class="text-center py-8">
        <div class="text-gray-500 dark:text-gray-400">
          <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-lg font-medium">No past schedules found</p>
          <p class="text-sm">You haven't completed any visits yet.</p>
        </div>
      </div>
    `;
    return;
  }

  let visitsHtml = '';
  
  for (const visit of visits) {
    const visitDate = new Date(visit.visit_date);
    
    // Calculate progress for the visit
    const progress = calculateVisitProgress(visit);
    
    // Parse places data
    const places = Array.isArray(visit.places) ? visit.places : [];
    const completedPlaces = places.filter((place: any) => place.status === 'completed').length;
    const totalPlaces = places.length;
    
    visitsHtml += `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transform">
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
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                Visit ID: ${visit.id}
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <span class="px-3 py-1 rounded-full text-xs font-medium ${
                visit.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                visit.status === 'completed_flagged' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                visit.status === 'unsuccessful' || visit.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                visit.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }">
                ${visit.status === 'failed' ? 'Failed' : 
                  visit.status === 'completed_flagged' ? 'Completed (Flagged) - Process started but not fully completed' : 
                  visit.status === 'pending' && isToday && completedPlaces === totalPlaces && totalPlaces > 0 && !visit.gate_exit_scanned ? 'Pending - All places completed, waiting for exit scan' :
                  visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
              </span>
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
            
            <!-- Gate Progress Indicators -->
            ${progress.gateProgress ? `
              <div class="mt-3 flex items-center justify-between text-xs">
                <div class="flex items-center space-x-4">
                  <div class="flex items-center space-x-2">
                    <span class="text-gray-600 dark:text-gray-400">Entrance:</span>
                    <span class="w-3 h-3 rounded-full ${progress.gateProgress.entrance ? 'bg-green-500' : 'bg-gray-400'}"></span>
                    <span class="text-gray-500 dark:text-gray-400">${progress.gateProgress.entrance ? 'Scanned' : 'Pending'}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-gray-600 dark:text-gray-400">Exit:</span>
                    <span class="w-3 h-3 rounded-full ${progress.gateProgress.exit ? 'bg-green-500' : 'bg-gray-400'}"></span>
                    <span class="text-gray-500 dark:text-gray-400">${progress.gateProgress.exit ? 'Scanned' : 'Pending'}</span>
                  </div>
                </div>
                <div class="text-gray-500 dark:text-gray-400">
                  ${progress.gateProgress.entrance ? '15%' : '0%'} + ${progress.gateProgress.exit ? '15%' : '0%'} gate progress
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Places List -->
          ${places.length > 0 ? `
            <div class="space-y-3">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Places visited:</h4>
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
                <div class="flex items-center justify-between">
                  <div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Completed:</span>
                    <span class="text-gray-600 dark:text-gray-400 ml-2">
                      ${new Date(visit.completed_at).toLocaleDateString()} at ${new Date(visit.completed_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div class="flex items-center space-x-2">
                    ${visit.gate_entrance_scanned ? `
                      <button 
                        onclick="showFaceDataModal('${visit.id}', '${visit.visitor_first_name} ${visit.visitor_last_name}', 'entrance')"
                        class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 flex items-center space-x-1"
                        title="View entrance face data"
                      >
                        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Entrance</span>
                      </button>
                    ` : ''}
                    ${visit.gate_exit_scanned ? `
                      <button 
                        onclick="showFaceDataModal('${visit.id}', '${visit.visitor_first_name} ${visit.visitor_last_name}', 'exit')"
                        class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200 flex items-center space-x-1"
                        title="View exit face data"
                      >
                        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Exit</span>
                      </button>
                    ` : ''}
                  </div>
                </div>
              ` : ''}
            </div>
            
            <!-- Feedback Button for Completed Visits -->
            ${visit.status === 'completed' ? `
              <div class="mt-4 flex justify-end">
                <button 
                  id="feedbackBtn_${visit.id}"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onclick="openFeedbackSurvey('${visit.id}', '${visit.visitor_first_name} ${visit.visitor_last_name}', '${visit.visit_date}', ${JSON.stringify(places.map((p: any) => p.place_name)).replace(/"/g, '&quot;')})"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Feedback Survey
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  visitorPastVisitsList.innerHTML = visitsHtml;
  
  // Update feedback button states for completed visits
  const completedVisits = visits.filter(visit => visit.status === 'completed');
  for (const visit of completedVisits) {
    updateFeedbackButtonState(visit.id);
  }
}

// Function to populate place filter options for past visits
function populatePastPlaceFilterOptions(pastVisits: any[]): void {
  const pastPlaceFilter = document.getElementById('visitorPastPlaceFilter') as HTMLSelectElement;
  if (!pastPlaceFilter) return;

  // Clear existing options except the first one
  pastPlaceFilter.innerHTML = '<option value="all">All Places</option>';

  // Get unique places from past visits
  const uniquePlaces = new Map();
  pastVisits.forEach(visit => {
    if (visit.place_id && visit.place_name) {
      uniquePlaces.set(visit.place_id, visit.place_name);
    }
  });

  // Add place options
  uniquePlaces.forEach((placeName, placeId) => {
    const option = document.createElement('option');
    option.value = placeId;
    option.textContent = placeName;
    pastPlaceFilter.appendChild(option);
  });
}

// Function to populate finished place filter options
function populateFinishedPlaceFilterOptions(finishedVisits: any[]): void {
  const finishedPlaceFilter = document.getElementById('finishedPlaceFilter') as HTMLSelectElement;
  if (!finishedPlaceFilter) return;

  // Clear existing options except the first one
  finishedPlaceFilter.innerHTML = '<option value="all">All Places</option>';

  // Get unique places from finished visits
  const uniquePlaces = new Map();
  finishedVisits.forEach(visit => {
    if (visit.place_id && visit.place_name) {
      uniquePlaces.set(visit.place_id, visit.place_name);
    }
  });

  // Add place options
  uniquePlaces.forEach((placeName, placeId) => {
    const option = document.createElement('option');
    option.value = placeId;
    option.textContent = placeName;
    finishedPlaceFilter.appendChild(option);
  });
}

// Apply filters and search to finished visits
function applyFinishedFilters() {
  let filteredVisits = [...allFinishedVisits];

  // Apply finished schedule type filter using real-time Philippine date
  const todayPh = getPhilippineDate();

  switch (currentFinishedScheduleType) {
    case 'today':
      // Show finished visits that were completed today (Philippine date)
      filteredVisits = filteredVisits.filter(visit => {
        if (!visit.completed_at) return false;
        const completedAtPh = toPhilippineTime(new Date(visit.completed_at));
        completedAtPh.setHours(0, 0, 0, 0);
        const todayStart = new Date(todayPh);
        // Date-only equality in PH timezone
        return completedAtPh.getTime() === todayStart.getTime();
      });
      break;
    case 'past':
      // Show finished visits from past dates (based on visit date in PH)
      filteredVisits = filteredVisits.filter(visit => {
        const visitDatePh = toPhilippineTime(new Date(visit.visit_date));
        visitDatePh.setHours(0, 0, 0, 0);
        const todayStart = new Date(todayPh);
        return visitDatePh.getTime() < todayStart.getTime();
      });
      break;
    default:
      // Default to 'today' if no valid state
      currentFinishedScheduleType = 'today';
      filteredVisits = filteredVisits.filter(visit => {
        if (!visit.completed_at) return false;
        const completedAtPh = toPhilippineTime(new Date(visit.completed_at));
        completedAtPh.setHours(0, 0, 0, 0);
        const todayStart = new Date(todayPh);
        return completedAtPh.getTime() === todayStart.getTime();
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

  // Apply calendar date range filter for past finished tab
  if (currentFinishedScheduleType === 'past' && (currentPastFinishedStartDate || currentPastFinishedEndDate)) {
    filteredVisits = filteredVisits.filter(visit => {
      const visitDate = new Date(visit.visit_date);
      visitDate.setHours(0, 0, 0, 0);
      
      let matchesStartDate = true;
      let matchesEndDate = true;
      
      if (currentPastFinishedStartDate) {
        const startDate = new Date(currentPastFinishedStartDate);
        startDate.setHours(0, 0, 0, 0);
        matchesStartDate = visitDate >= startDate;
      }
      
      if (currentPastFinishedEndDate) {
        const endDate = new Date(currentPastFinishedEndDate);
        endDate.setHours(23, 59, 59, 999);
        matchesEndDate = visitDate <= endDate;
      }
      
      return matchesStartDate && matchesEndDate;
    });
  }

  // Apply place filter
  if (currentFinishedPlaceFilter !== 'all') {
    filteredVisits = filteredVisits.filter(visit => visit.place_id === currentFinishedPlaceFilter);
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
          ${currentFinishedSearchTerm || currentFinishedRoleFilter !== 'all' || currentFinishedPlaceFilter !== 'all' || currentFinishedDateFilter !== 'all' || currentFinishedSpecificDate || currentFinishedScheduleType !== 'today' || currentPastFinishedStartDate || currentPastFinishedEndDate
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
    const visitDate = toPhilippineTime(new Date(visit.visit_date)).toLocaleDateString();
    const completedDate = visit.completed_at ? toPhilippineTime(new Date(visit.completed_at)).toLocaleDateString() : 'N/A';
    const completedTime = visit.completed_at ? toPhilippineTime(new Date(visit.completed_at)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    
    const statusColors: { [key: string]: string } = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      completed_flagged: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      unsuccessful: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    const roleColors: { [key: string]: string } = {
      visitor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      guest: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };

    const completedByInfo = visit.completed_by_info && (visit.completed_by || visit.status === 'unsuccessful') ? 
      `${visit.completed_by_info.first_name} ${visit.completed_by_info.last_name}` : 
      (visit.completed_by ? 'Unknown' : 'N/A');

    return `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer group">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">${visitorName}</h4>
            <p class="text-gray-600 dark:text-gray-400 transition-colors duration-200 group-hover:text-gray-700 dark:group-hover:text-gray-300">${visitorEmail}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              ${isLoggedIn ? 'Logged-in User' : 'Guest User'} • ID: ${visitorId}
            </p>
          </div>
          <div class="flex space-x-2">
            <span class="px-2 py-1 rounded-full text-xs font-medium ${(statusColors as any)[visit.status] || statusColors.completed} transition-all duration-200 group-hover:scale-105">
              ${visit.status === 'completed_flagged' ? 'Completed (Flagged)' : visit.status === 'unsuccessful' ? 'Unsuccessful' : visit.status}
            </span>
            <span class="px-2 py-1 rounded-full text-xs font-medium ${(roleColors as any)[visitorRole] || roleColors.guest} transition-all duration-200 group-hover:scale-105">
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
        
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 transition-colors duration-200 group-hover:border-blue-300 dark:group-hover:border-blue-600">
          <p class="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200 group-hover:text-gray-600 dark:group-hover:text-gray-300">
            Scheduled: ${toPhilippineTime(new Date(visit.scheduled_at)).toLocaleDateString()} at ${toPhilippineTime(new Date(visit.scheduled_at)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    `;
  }).join('');
}

// Make toggleHistory function available globally
(window as any).toggleHistory = toggleHistory;

// Make showFlaggedVisitDetails function available globally
(window as any).showFlaggedVisitDetails = showFlaggedVisitDetails;

// Function to show flagged visit details
async function showFlaggedVisitDetails(visitId: string) {
  try {
    const { data: visitDetails, error } = await supabase
      .rpc('get_flagged_completed_visit_details', { p_visit_id: visitId });
    
    if (error) {
      console.error('Error fetching flagged visit details:', error);
      showNotification('Error fetching visit details', 'error');
      return;
    }
    
    if (!visitDetails || visitDetails.length === 0) {
      showNotification('Visit details not found', 'error');
      return;
    }
    
    const visit = visitDetails[0];
    const visitorName = `${visit.visitor_first_name} ${visit.visitor_last_name}`;
    const completedByInfo = visit.completed_by_info ? 
      `${visit.completed_by_info.first_name} ${visit.completed_by_info.last_name}` : 
      'System (End of day)';
    
    const modalHtml = `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" id="flaggedVisitModal">
        <div class="relative mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-y-auto shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Flagged Visit Details</h3>
              <button onclick="closeFlaggedVisitModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div class="space-y-4">
              <div>
                <h4 class="text-md font-semibold text-gray-900 dark:text-white">${visitorName}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">${visit.visitor_email}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">${visit.visitor_role}</p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400"><strong>Visit Date:</strong> ${new Date(visit.visit_date).toLocaleDateString()}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400"><strong>Purpose:</strong> ${visit.purpose}</p>
                  ${visit.other_purpose ? `<p class="text-sm text-gray-600 dark:text-gray-400"><strong>Additional Details:</strong> ${visit.other_purpose}</p>` : ''}
                </div>
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400"><strong>Completed:</strong> ${visit.completed_at ? new Date(visit.completed_at).toLocaleDateString() + ' at ' + new Date(visit.completed_at).toLocaleTimeString() : 'N/A'}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400"><strong>Completed By:</strong> ${completedByInfo}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400"><strong>Gate Exit Scanned:</strong> ${visit.gate_exit_scanned ? 'Yes' : 'No'}</p>
                </div>
              </div>
              
              <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Places Visited:</h5>
                ${visit.places && visit.places.length > 0 ? `
                  <div class="space-y-2">
                    ${visit.places.map((place: any) => `
                      <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                          <p class="text-sm font-medium text-gray-900 dark:text-white">${place.place_name}</p>
                          ${place.place_location ? `<p class="text-xs text-gray-600 dark:text-gray-400">${place.place_location}</p>` : ''}
                        </div>
                        <span class="px-2 py-1 rounded text-xs font-medium ${
                          place.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }">
                          ${place.status}
                        </span>
                      </div>
                    `).join('')}
                  </div>
                ` : '<p class="text-sm text-gray-500 dark:text-gray-400">No places assigned</p>'}
              </div>
              
              <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-orange-800 dark:text-orange-200">Visit Flagged</h3>
                    <div class="mt-2 text-sm text-orange-700 dark:text-orange-300">
                      <p>This visit was marked as completed (flagged) because:</p>
                      <ul class="list-disc list-inside mt-1 space-y-1">
                        <li>All places were completed by personnel</li>
                        <li>Visitor did not scan the exit gate by the end of the day</li>
                        <li>Visit was automatically flagged at 23:59:59 Philippine time</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-6 flex justify-end">
              <button onclick="closeFlaggedVisitModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('flaggedVisitModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    // Lock body scroll while modal is open
    document.body.classList.add('overflow-hidden');
    
    // Make close function available globally
    (window as any).closeFlaggedVisitModal = closeFlaggedVisitModal;
    
  } catch (error) {
    console.error('Error showing flagged visit details:', error);
    showNotification('Error showing visit details', 'error');
  }
}

// Function to close flagged visit modal
function closeFlaggedVisitModal() {
  const modal = document.getElementById('flaggedVisitModal');
  if (modal) {
    modal.remove();
  }
  // Restore body scroll
  document.body.classList.remove('overflow-hidden');
}

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
// Global function to show flagged visit details (accessible from onclick)
(window as any).showFlaggedVisitDetails = async function(visitId: string) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Fetch flagged visit details from the database
    const { data: visitDetails, error } = await supabase.rpc('get_flagged_completed_visit_details', {
      p_visit_id: visitId
    });

    if (error) {
      console.error('Error fetching flagged visit details:', error);
      alert('Error fetching visit details: ' + error.message);
      return;
    }

    if (!visitDetails || visitDetails.length === 0) {
      alert('Visit details not found');
      return;
    }

    const visit = visitDetails[0];
    const places = Array.isArray(visit.places) ? visit.places : [];
    const completedByInfo = visit.completed_by_info || {};
    const completedByName = completedByInfo.first_name && completedByInfo.last_name ? 
      `${completedByInfo.first_name} ${completedByInfo.last_name}` : 
      'Unknown Personnel';

    // Create modal content
    const modalContent = `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" id="flaggedVisitModal">
        <div class="relative mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-y-auto shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Visit Details - Completed (Flagged)
              </h3>
              <button onclick="closeFlaggedVisitModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div class="space-y-4">
              <!-- Visit Status Alert -->
              <div class="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-orange-800 dark:text-orange-200">
                      Visit Completed (Flagged)
                    </h3>
                    <div class="mt-2 text-sm text-orange-700 dark:text-orange-300">
                      <p>This visit was completed by personnel but the visitor did not scan the exit gate. The visit is marked as completed (flagged) to indicate that personnel finished their part of the process.</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Visitor Information -->
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Visitor Information</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Name:</span>
                    <span class="text-gray-600 dark:text-gray-400 ml-2">${visit.visitor_first_name} ${visit.visitor_last_name}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                    <span class="text-gray-600 dark:text-gray-400 ml-2">${visit.visitor_email}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                    <span class="text-gray-600 dark:text-gray-400 ml-2">${visit.visitor_phone}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Role:</span>
                    <span class="text-gray-600 dark:text-gray-400 ml-2">${visit.visitor_role}</span>
                  </div>
                </div>
              </div>

              <!-- Visit Details -->
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Visit Details</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Visit Date:</span>
                    <span class="text-gray-600 dark:text-gray-400 ml-2">${new Date(visit.visit_date).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Purpose:</span>
                    <span class="text-gray-600 dark:text-gray-400 ml-2">${visit.purpose}</span>
                  </div>
                  ${visit.other_purpose ? `
                    <div class="md:col-span-2">
                      <span class="font-medium text-gray-700 dark:text-gray-300">Additional Details:</span>
                      <span class="text-gray-600 dark:text-gray-400 ml-2">${visit.other_purpose}</span>
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- Completion Information -->
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Completion Information</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Completed By:</span>
                    <span class="text-gray-600 dark:text-gray-400 ml-2">${completedByName}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Completed At:</span>
                    <span class="text-gray-600 dark:text-gray-400 ml-2">${new Date(visit.completed_at).toLocaleString()}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Places Completed:</span>
                    <span class="text-gray-600 dark:text-gray-400 ml-2">${visit.completed_places}/${visit.total_places}</span>
                  </div>
                </div>
              </div>

              <!-- Gate Scan Status -->
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Gate Scan Status</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-gray-700 dark:text-gray-300">Entrance Gate:</span>
                    <div class="flex items-center space-x-2">
                      <span class="px-2 py-1 rounded-full text-xs font-medium ${
                        visit.gate_entrance_scanned ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }">
                        ${visit.gate_entrance_scanned ? '✓ Scanned' : '⏳ Pending'}
                      </span>
                      ${visit.gate_entrance_scanned ? `
                        <button 
                          onclick="showFaceDataModal('${visit.id}', '${visit.visitor_first_name} ${visit.visitor_last_name}', 'entrance')"
                          class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 flex items-center space-x-1"
                          title="View face data from entrance scan"
                        >
                          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Face Data</span>
                        </button>
                      ` : ''}
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-gray-700 dark:text-gray-300">Exit Gate:</span>
                    <div class="flex items-center space-x-2">
                      <span class="px-2 py-1 rounded-full text-xs font-medium ${
                        visit.gate_exit_scanned ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }">
                        ${visit.gate_exit_scanned ? '✓ Scanned' : '❌ Not Scanned'}
                      </span>
                      ${visit.gate_exit_scanned ? `
                        <button 
                          onclick="showFaceDataModal('${visit.id}', '${visit.visitor_first_name} ${visit.visitor_last_name}', 'exit')"
                          class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 flex items-center space-x-1"
                          title="View face data from exit scan"
                        >
                          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Face Data</span>
                        </button>
                      ` : ''}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Places List -->
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Places Visited</h4>
                ${places.length > 0 ? `
                  <div class="space-y-2">
                    ${places.map((place: any) => `
                      <div class="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                        <div class="flex-1">
                          <h5 class="text-sm font-medium text-gray-900 dark:text-white">${place.place_name}</h5>
                          ${place.place_location ? `<p class="text-xs text-gray-600 dark:text-gray-400">${place.place_location}</p>` : ''}
                        </div>
                        <div class="flex items-center space-x-2">
                          <span class="px-2 py-1 rounded-full text-xs font-medium ${
                            place.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            place.status === 'unsuccessful' || place.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
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
                  <p class="text-sm text-gray-500 dark:text-gray-400">No places assigned to this visit</p>
                `}
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <button 
                onclick="closeFlaggedVisitModal()"
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalContent);
    // Lock body scroll while modal is open
    document.body.classList.add('overflow-hidden');

  } catch (error) {
    console.error('Error in showFlaggedVisitDetails:', error);
    alert('Error showing visit details: ' + error.message);
  }
};

// Global function to close flagged visit modal
(window as any).closeFlaggedVisitModal = function() {
  const modal = document.getElementById('flaggedVisitModal');
  if (modal) {
    modal.remove();
  }
  // Restore body scroll
  document.body.classList.remove('overflow-hidden');
};

// Global function to scan gate entrance (accessible from onclick)
(window as any).scanGateEntrance = function(visitId: string) {
  showGateScanningModal(visitId);
};

// Global function to scan gate exit (accessible from onclick)
(window as any).scanGateExit = function(visitId: string) {
  showGateExitScanningModal(visitId);
};

// Global function to print visit card (accessible from onclick)
(window as any).printVisitCard = async function(visitId: string) {
  try {
    // Show loading state
    const button = event?.target as HTMLElement;
    const originalContent = button?.innerHTML;
    if (button) {
      button.innerHTML = `
        <svg class="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <span>Generating...</span>
      `;
      button.setAttribute('disabled', 'true');
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Fetch visit data from the database
    const { data: visitsData, error } = await supabase
      .rpc('get_visitor_scheduled_visits', { p_visitor_user_id: user.id });

    if (error) {
      throw new Error('Failed to fetch visit data');
    }

    // Find the specific visit
    const visit = visitsData.find((v: any) => v.id === visitId);
    if (!visit) {
      throw new Error('Visit not found');
    }

    // Debug: Log the visit data to see the structure
    console.log('Visit data for QR code:', visit);
    console.log('Places data:', visit.places);

    // Prepare visit data for QR code
    // Ensure places data is properly formatted
    let places = [];
    try {
      if (visit.places && Array.isArray(visit.places)) {
        places = visit.places;
      } else if (visit.places && typeof visit.places === 'object') {
        // If places is a JSONB object, convert it to array
        places = Array.isArray(visit.places) ? visit.places : [visit.places];
      } else if (visit.places && typeof visit.places === 'string') {
        // If places is a JSON string, parse it
        try {
          const parsedPlaces = JSON.parse(visit.places);
          places = Array.isArray(parsedPlaces) ? parsedPlaces : [parsedPlaces];
        } catch (parseError) {
          console.error('Error parsing places JSON:', parseError);
          places = [];
        }
      }
    } catch (error) {
      console.error('Error processing places data:', error);
      places = [];
    }
    
    console.log('Processed places array:', places);
    
    // Ensure each place has the required properties
    places = places.map((place: any) => {
      const processedPlace = {
        placeId: place.place_id || place.placeId || '',
        placeName: place.place_name || place.placeName || 'Unknown Place',
        placeLocation: place.place_location || place.placeLocation || '',
        status: place.status || 'pending'
      };
      console.log('Processed place:', processedPlace);
      return processedPlace;
    });

    const qrVisitData: VisitQRData = {
      visitId: visit.id,
      visitorName: `${visit.visitor_first_name} ${visit.visitor_last_name}`,
      visitorEmail: visit.visitor_email,
      visitDate: visit.visit_date,
      purpose: visit.purpose,
      places: places,
      status: visit.status,
      scheduledAt: visit.scheduled_at
    };

    console.log('Final QR visit data:', qrVisitData);

    // Generate QR code - use simple QR code for better scanning reliability
    const qrCodeDataUrl = await generateSimpleVisitQRCode(visit.id);

    // Open printable card
    openPrintableVisitCard(qrVisitData, qrCodeDataUrl);

    // Show success notification
    showNotification('Visit card generated successfully!', 'success');

  } catch (error) {
    console.error('Error printing visit card:', error);
    showNotification('Failed to generate visit card. Please try again.', 'error');
  } finally {
    // Restore button state
    const button = event?.target as HTMLElement;
    if (button) {
      button.removeAttribute('disabled');
      button.innerHTML = `
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
        </svg>
        <span>Print</span>
      `;
    }
  }
};

// Global function to copy visit ID to clipboard
(window as any).copyVisitId = async function(visitId: string) {
  try {
    await navigator.clipboard.writeText(visitId);
    const target = (event?.target as HTMLElement) || null;
    const originalText = target?.textContent;
    if (target) {
      target.textContent = 'Copied!';
      setTimeout(() => {
        target.textContent = originalText || 'Copy';
      }, 1200);
    }
  } catch (err) {
    console.error('Failed to copy Visit ID:', err);
    alert('Could not copy Visit ID.');
  }
};

// Update the action filter dropdown based on the current tab
function updateLogsActionFilterOptions() {
  const actionFilter = document.getElementById('actionFilter') as HTMLSelectElement;
  if (!actionFilter) return;
  const actions = LOGS_TAB_ACTIONS[currentLogsTabFilter] || LOGS_TAB_ACTIONS.all;
  const currentValue = actionFilter.value;
  actionFilter.innerHTML = actions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
  // If the current value is not in the new options, reset to 'all'
  if (!actions.some(opt => opt.value === currentValue)) {
    actionFilter.value = 'all';
  } else {
    actionFilter.value = currentValue;
  }
}

// Function to refresh all admin data
async function refreshAllAdminData() {
  try {
    // Show loading state
    const refreshBtn = document.getElementById('adminRefreshBtn') as HTMLButtonElement;
    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = `
        <svg class="w-4 h-4 inline mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        Refreshing...
      `;
    }

    // Load all admin data
    await Promise.all([
      loadPlaces(),
      loadAccounts(),
      loadLogs()
    ]);

    showNotification('All admin data refreshed successfully!', 'success');
  } catch (error) {
    console.error('Error refreshing admin data:', error);
    showNotification('Error refreshing admin data. Please try again.', 'error');
  } finally {
    // Reset button state
    const refreshBtn = document.getElementById('adminRefreshBtn') as HTMLButtonElement;
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = `
        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        Refresh All
      `;
    }
  }
}

// Add this function near other global window.* assignments (after editPlace, etc.)
async function togglePlaceAvailability(placeId, currentAvailability) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showNotification('You must be logged in to update place availability', 'error');
      return;
    }
    // Confirm action
    const newAvailability = !currentAvailability;
    const confirmed = confirm(`Are you sure you want to mark this place as ${newAvailability ? 'available' : 'unavailable'}?`);
    if (!confirmed) return;
    // Update the place's availability
    const { error } = await supabase
      .from('places_to_visit')
      .update({ is_available: newAvailability })
      .eq('id', placeId);
    if (error) {
      showNotification('Error updating place availability: ' + error.message, 'error');
      return;
    }
    await logAction('place_availability_toggle', {
      place_id: placeId,
      is_available: newAvailability
    });
    showNotification(`Place marked as ${newAvailability ? 'available' : 'unavailable'} successfully!`, 'success');
    await loadPlaces(); // Refresh dashboard
  } catch (err) {
    console.error('Error toggling place availability:', err);
    showNotification('Error toggling place availability', 'error');
  }
}
(window as any).togglePlaceAvailability = togglePlaceAvailability;
(window as any).displayFlaggedVisitDetails = displayFlaggedVisitDetails;

// Global function to open feedback survey modal
(window as any).openFeedbackSurvey = async function(visitId: string, visitorName: string, visitDate: string, places: string[]) {
  try {
    // Import the feedback survey modal
    const { showFeedbackSurveyModal, hasFeedbackForVisit } = await import('../../components/FeedbackSurveyModal');
    
    // Check if feedback already exists for this visit
    const feedbackExists = await hasFeedbackForVisit(visitId);
    
    if (feedbackExists) {
      showNotification('Feedback has already been submitted for this visit.', 'info');
      return;
    }
    
    // Show the feedback survey modal
    showFeedbackSurveyModal({
      visitId,
      visitorName,
      visitDate,
      places
    });
    
  } catch (error) {
    console.error('Error opening feedback survey:', error);
    showNotification('Error opening feedback survey. Please try again.', 'error');
  }
};

// Function to refresh visitor past visits (for after feedback submission)
(window as any).refreshVisitorPastVisits = async function() {
  try {
    await loadVisitorVisits();
  } catch (error) {
    console.error('Error refreshing visitor past visits:', error);
  }
};

// Function to update feedback button state
async function updateFeedbackButtonState(visitId: string) {
  try {
    const { hasFeedbackForVisit } = await import('../../components/FeedbackSurveyModal');
    const feedbackExists = await hasFeedbackForVisit(visitId);
    const button = document.getElementById(`feedbackBtn_${visitId}`) as HTMLButtonElement;
    
    if (button) {
      if (feedbackExists) {
        button.disabled = true;
        button.innerHTML = `
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Feedback Submitted
        `;
        button.className = button.className.replace('bg-blue-600 hover:bg-blue-700', 'bg-green-600');
      } else {
        button.disabled = false;
        button.innerHTML = `
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          Feedback Survey
        `;
        button.className = button.className.replace('bg-green-600', 'bg-blue-600 hover:bg-blue-700');
      }
    }
  } catch (error) {
    console.error('Error updating feedback button state:', error);
  }
}

// Function to show face data modal
(window as any).showFaceDataModal = async function(visitId: string, visitorName: string, scanType: 'entrance' | 'exit') {
  try {
    // Import the face data modal component
    const { createFaceDataModal } = await import('../../components/FaceDataModal');
    
    // Create and show the modal
    const modal = createFaceDataModal({
      visitId,
      visitorName,
      scanType,
      onClose: () => {
      }
    });
    
    // Add modal to the page
    document.body.appendChild(modal);
    
  } catch (error) {
    console.error('Error opening face data modal:', error);
    showNotification('Error opening face data. Please try again.', 'error');
  }
};

export { showNotification };