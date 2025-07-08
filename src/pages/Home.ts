import { setupEventListeners } from '../components/ModalFunctions';
import supabase from '../config/supabase';

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

// Helper function to convert any date to Philippine time
function toPhilippineTime(date: Date): Date {
  // Get the timezone offset between UTC and Asia/Manila (UTC+8)
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  const philippineTime = new Date(utcTime + (8 * 60 * 60 * 1000)); // Add 8 hours for UTC+8
  return philippineTime;
}

// Function to load and display weekly visit count for logged-in users
async function loadWeeklyVisitCount(userEmail: string) {
  try {
    const weeklyVisitCountDiv = document.getElementById('weeklyVisitCount');
    const weeklyVisitText = document.getElementById('weeklyVisitText');
    
    if (!weeklyVisitCountDiv || !weeklyVisitText) return;

    // Check if user has visitor role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      // Only show weekly visit count for visitor roles
      if (roleData?.role !== 'visitor') {
        weeklyVisitCountDiv.classList.add('hidden');
        return;
      }
    } catch (error) {
      console.error('Error checking user role for weekly visit count:', error);
      weeklyVisitCountDiv.classList.add('hidden');
      return;
    }

    // Show the weekly visit count section
    weeklyVisitCountDiv.classList.remove('hidden');
    weeklyVisitText.textContent = 'Loading...';

    // Get current Philippine date from database
    let philippineToday: Date;
    try {
      const { data: philippineDateData, error } = await supabase.rpc('get_philippine_date');
      if (error) {
        console.error('Error getting Philippine date from DB:', error);
        philippineToday = getPhilippineDate();
      } else {
        philippineToday = new Date(philippineDateData);
      }
    } catch (error) {
      console.error('Exception getting Philippine date from DB:', error);
      philippineToday = getPhilippineDate();
    }
    
    // Calculate the week boundaries (Sunday to Saturday)
    const weekStart = new Date(philippineToday);
    weekStart.setDate(philippineToday.getDate() - philippineToday.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Calculate previous week boundaries
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(weekStart.getDate() - 7);
    prevWeekStart.setHours(0, 0, 0, 0);
    const prevWeekEnd = new Date(prevWeekStart);
    prevWeekEnd.setDate(prevWeekStart.getDate() + 6);
    prevWeekEnd.setHours(23, 59, 59, 999);

    // Query the database for all pending and completed visits for the current week
    const { data: visits, error } = await supabase
      .from('scheduled_visits')
      .select('visit_date, status')
      .eq('visitor_user_id', user.id)
      .in('status', ['pending', 'completed'])
      .gte('visit_date', weekStart.toISOString())
      .lte('visit_date', weekEnd.toISOString());

    // Query the database for all pending and completed visits for the previous week
    const { data: prevWeekVisits, error: prevWeekError } = await supabase
      .from('scheduled_visits')
      .select('visit_date, status')
      .eq('visitor_user_id', user.id)
      .in('status', ['pending', 'completed'])
      .gte('visit_date', prevWeekStart.toISOString())
      .lte('visit_date', prevWeekEnd.toISOString());

    if (error) {
      console.error('Error loading weekly visit count:', error);
      weeklyVisitText.textContent = 'Error loading visit count';
      return;
    }
    if (prevWeekError) {
      console.error('Error loading previous week visits:', prevWeekError);
    }

    // Count the pending and completed visits for the current week
    const visitCount = visits?.length || 0;
    const pendingCount = visits?.filter(v => v.status === 'pending').length || 0;
    const completedCount = visits?.filter(v => v.status === 'completed').length || 0;

    // Count the pending and completed visits for the previous week
    const prevPendingCount = prevWeekVisits?.filter(v => v.status === 'pending').length || 0;
    const prevCompletedCount = prevWeekVisits?.filter(v => v.status === 'completed').length || 0;
    const prevTotalCount = prevWeekVisits?.length || 0;

    // Determine if the week should be refreshed
    // New logic:
    // - 2 pending = no refresh
    // - 1 pending, 1 completed/unsuccessful = 1 refresh
    // - 2 completed/unsuccessful = 2 refresh
    let refreshSlots = 2; // default: allow 2 visits
    if (prevTotalCount > 0) {
      if (prevPendingCount === 2) {
        refreshSlots = 0; // 2 pending = no refresh
      } else if (prevPendingCount === 1 && prevCompletedCount === 1) {
        refreshSlots = 1; // 1 pending, 1 completed = 1 refresh
      } else if (prevPendingCount === 0 && prevCompletedCount === 2) {
        refreshSlots = 2; // 2 completed = 2 refresh
      } else {
        // For any other combination (e.g., only 1 visit last week)
        refreshSlots = 2 - prevPendingCount; // e.g., 1 completed, 0 pending = 1 refresh
      }
    }

    // Calculate remaining visits for this week
    const remainingVisits = Math.max(0, refreshSlots - visitCount);

    // Format the week range for display (e.g., July 6-12, 2025)
    const weekStartMonth = weekStart.toLocaleString('en-US', { month: 'short' });
    const weekStartDay = weekStart.getDate();
    const weekEndMonth = weekEnd.toLocaleString('en-US', { month: 'short' });
    const weekEndDay = weekEnd.getDate();
    const weekYear = weekEnd.getFullYear();
    let weekRangeStr = '';
    if (weekStartMonth === weekEndMonth) {
      weekRangeStr = `${weekStartMonth} ${weekStartDay}-${weekEndDay}, ${weekYear}`;
    } else {
      weekRangeStr = `${weekStartMonth} ${weekStartDay} - ${weekEndMonth} ${weekEndDay}, ${weekYear}`;
    }

    // Update the display based on the count and week range
    let statusHtml = '';
    if (refreshSlots === 0) {
      statusHtml = `<span class="font-medium text-gray-600 dark:text-gray-400">No new visits allowed until previous week is cleared</span>`;
    } else if (remainingVisits === 2) {
      statusHtml = `<span class="font-medium text-green-600 dark:text-green-400">2 visits remaining</span> (no scheduled visits)`;
    } else if (remainingVisits === 1) {
      statusHtml = `<span class="font-medium text-yellow-600 dark:text-yellow-400">1 visit remaining</span> (${pendingCount} pending, ${completedCount} completed)`;
    } else {
      statusHtml = `<span class="font-medium text-red-600 dark:text-red-400">No visits remaining</span> (${pendingCount} pending, ${completedCount} completed)`;
    }

    weeklyVisitText.innerHTML = `<span class="block font-semibold">Week of ${weekRangeStr}</span>${statusHtml}`;

    // Add a small note about the limit
    const noteElement = document.createElement('div');
    noteElement.className = 'mt-1 text-xs text-blue-600 dark:text-blue-400';
    noteElement.textContent = 'Maximum 2 visits per week per user account';
    
    // Remove existing note if present
    const existingNote = weeklyVisitCountDiv.querySelector('.text-xs');
    if (existingNote) {
      existingNote.remove();
    }
    
    weeklyVisitCountDiv.querySelector('.ml-3')?.appendChild(noteElement);

  } catch (error) {
    console.error('Error in loadWeeklyVisitCount:', error);
    const weeklyVisitText = document.getElementById('weeklyVisitText');
    if (weeklyVisitText) {
      weeklyVisitText.textContent = 'Error loading visit count';
    }
  }
}

// Global function to refresh weekly visit count (can be called from other components)
(window as any).refreshWeeklyVisitCount = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return;

    // Check if user has visitor role
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      // Only refresh weekly visit count for visitor roles
      if (roleData?.role !== 'visitor') {
        return;
      }
    } catch (error) {
      console.error('Error checking user role for refresh:', error);
      return;
    }

    await loadWeeklyVisitCount(user.email);
  } catch (error) {
    console.error('Error refreshing weekly visit count:', error);
  }
};

// Test function to debug weekly visit count
(window as any).testWeeklyVisitCount = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found');
      return;
    }

    console.log('=== VISITS COUNT TEST ===');
    console.log('User ID:', user.id);
    console.log('User Email:', user.email);

    // Test 1: Get all visits for this user
    const { data: allVisits, error: allError } = await supabase
      .from('scheduled_visits')
      .select('*')
      .eq('visitor_user_id', user.id);

    console.log('All visits for user:', allVisits);
    console.log('All visits count:', allVisits?.length || 0);

    // Test 2: Get pending and completed visits for this user
    const { data: activeVisits, error: activeError } = await supabase
      .from('scheduled_visits')
      .select('*')
      .eq('visitor_user_id', user.id)
      .in('status', ['pending', 'completed']);

    console.log('Active visits (pending + completed):', activeVisits);
    console.log('Active visits count:', activeVisits?.length || 0);

    // Test 3: Get pending visits for this user
    const { data: pendingVisits, error: pendingError } = await supabase
      .from('scheduled_visits')
      .select('*')
      .eq('visitor_user_id', user.id)
      .eq('status', 'pending');

    console.log('Pending visits:', pendingVisits);
    console.log('Pending visits count:', pendingVisits?.length || 0);

    // Test 4: Get completed visits for this user
    const { data: completedVisits, error: completedError } = await supabase
      .from('scheduled_visits')
      .select('*')
      .eq('visitor_user_id', user.id)
      .eq('status', 'completed');

    console.log('Completed visits:', completedVisits);
    console.log('Completed visits count:', completedVisits?.length || 0);

    // Test 5: Check if there are any visits at all in the database
    const { data: anyVisits, error: anyError } = await supabase
      .from('scheduled_visits')
      .select('*')
      .limit(5);

    console.log('Any visits in database:', anyVisits);
    console.log('Any visits count:', anyVisits?.length || 0);

    // Test 6: Calculate remaining visits
    const activeCount = activeVisits?.length || 0;
    const pendingCount = pendingVisits?.length || 0;
    const completedCount = completedVisits?.length || 0;
    const remainingVisits = Math.max(0, 2 - activeCount);
    
    console.log('Active visits (pending + completed):', activeCount);
    console.log('Pending visits:', pendingCount);
    console.log('Completed visits:', completedCount);
    console.log('Remaining visits:', remainingVisits);
    console.log('Status:', activeCount === 0 ? '2 visits remaining' : 
                       activeCount === 1 ? '1 visit remaining' : 
                       'No visits remaining');

    console.log('=== END TEST ===');

  } catch (error) {
    console.error('Error in test:', error);
  }
};

export function HomePage() {
  // Initialize the page
  setTimeout(async () => {
    // Set minimum date to today and maximum date to one month from today (Philippine time from database)
    let philippineToday: Date;
    let philippineMaxDate: Date;
    
    try {
      const { data: philippineDateData, error } = await supabase.rpc('get_philippine_date');
      if (error) {
        console.error('Error getting Philippine date from DB:', error);
        // Fallback to local calculation
        philippineToday = getPhilippineDate();
      } else {
        philippineToday = new Date(philippineDateData);
      }
    } catch (error) {
      console.error('Exception getting Philippine date from DB:', error);
      // Fallback to local calculation
      philippineToday = getPhilippineDate();
    }
    
    philippineMaxDate = new Date(philippineToday);
    philippineMaxDate.setMonth(philippineMaxDate.getMonth() + 1);
    
    const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
    if (visitDateInput) {
      // Set minimum date to today (Philippine time)
      visitDateInput.min = philippineToday.toISOString().split('T')[0];
      // Set maximum date to one month from today
      visitDateInput.max = philippineMaxDate.toISOString().split('T')[0];
      
      // Set default value to today
      visitDateInput.value = philippineToday.toISOString().split('T')[0];
      
      // Single consolidated event listener for date validation
      visitDateInput.addEventListener('change', async () => {
        const selectedDate = new Date(visitDateInput.value);
        selectedDate.setHours(0, 0, 0, 0);
        const philippineSelectedDate = toPhilippineTime(selectedDate);
        philippineSelectedDate.setHours(0, 0, 0, 0);
        
        // Get current Philippine date from database for real-time validation
        let currentPhilippineDate: Date;
        try {
          const { data: currentDateData, error } = await supabase.rpc('get_philippine_date');
          if (error) {
            console.error('Error getting current Philippine date from DB:', error);
            currentPhilippineDate = getPhilippineDate();
          } else {
            currentPhilippineDate = new Date(currentDateData);
          }
        } catch (error) {
          console.error('Exception getting current Philippine date from DB:', error);
          currentPhilippineDate = getPhilippineDate();
        }
        
        // Normalize current date to start of day for comparison
        currentPhilippineDate.setHours(0, 0, 0, 0);
        
        // Check if date is in the past (excluding today)
        if (philippineSelectedDate.getTime() < currentPhilippineDate.getTime()) {
          alert('Cannot schedule visits for past dates. Please select today or a future date.');
          visitDateInput.value = currentPhilippineDate.toISOString().split('T')[0];
          return;
        }
        
        // Check if date is more than 1 month in the future
        const currentMaxDate = new Date(currentPhilippineDate);
        currentMaxDate.setMonth(currentMaxDate.getMonth() + 1);
        
        if (philippineSelectedDate.getTime() > currentMaxDate.getTime()) {
          alert('Cannot schedule visits more than 1 month in advance. Please select a date within the next month.');
          visitDateInput.value = currentMaxDate.toISOString().split('T')[0];
          return;
        }
        
        // If we reach here, the date is valid (today or future within 1 month)
        console.log('Date validation passed:', {
          selected: philippineSelectedDate.toISOString(),
          current: currentPhilippineDate.toISOString(),
          isToday: philippineSelectedDate.getTime() === currentPhilippineDate.getTime()
        });
      });
    }

    // Check if user is logged in and update email field
    const { data: { user } } = await supabase.auth.getUser();
    const scheduleEmail = document.getElementById('scheduleEmail') as HTMLInputElement;
    const emailVerificationSection = document.getElementById('emailVerificationSection');
    
    if (user && scheduleEmail && emailVerificationSection) {
      scheduleEmail.value = user.email || '';
      scheduleEmail.readOnly = true;
      emailVerificationSection.classList.add('hidden');
    }

    // Check user role and conditionally show/hide schedule button
    const scheduleNowBtn = document.getElementById('scheduleNowBtn');
    if (scheduleNowBtn) {
      if (user) {
        // Check if user has visitor role
        try {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();
          
          // Only show schedule button for visitor roles
          if (roleData?.role === 'visitor') {
            scheduleNowBtn.classList.remove('hidden');
            // Load and display weekly visit count for visitor users
            await loadWeeklyVisitCount(user.email || '');
          } else {
            // Hide schedule button for non-visitor roles (admin, personnel, etc.)
            scheduleNowBtn.classList.add('hidden');
            // Hide weekly visit count for non-visitor roles
            const weeklyVisitCountDiv = document.getElementById('weeklyVisitCount');
            if (weeklyVisitCountDiv) {
              weeklyVisitCountDiv.classList.add('hidden');
            }
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          // Hide schedule button if role check fails
          scheduleNowBtn.classList.add('hidden');
        }
      } else {
        // User is not logged in, show the button for guest scheduling
        scheduleNowBtn.classList.remove('hidden');
      }
    }

    // Load available places
    await loadPlaces();
  }, 100);

  // Setup event listeners (this will also load places from database)
  setupEventListeners();

  return `    <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
      <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0 mb-8">
        <img src="/guestgo-logo.png" alt="GuestGo Logo" class="h-14 w-14 sm:h-16 sm:w-16 mx-auto sm:mx-0" />
        <div class="text-center sm:text-left">
          <h1 class="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
            Welcome to GuestGo
          </h1>
          <p class="text-base sm:text-xl text-gray-600 dark:text-gray-300 transition-colors duration-200">
            Your one-stop solution for guest management and hospitality services.
          </p>
        </div>
      </div>

      <!-- Weekly Visit Count Display for Logged-in Users -->
      <div id="weeklyVisitCount" class="mb-6 hidden">
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
                Weekly Visit Status
              </h3>
              <div class="mt-1 text-sm text-blue-700 dark:text-blue-300">
                <span id="weeklyVisitText">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button 
        id="scheduleNowBtn"
        class="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 mb-4"
      >
        Schedule Now
      </button>

      <!-- Schedule Modal -->
      <div id="scheduleModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-3 sm:p-5 border w-full max-w-sm sm:max-w-md md:max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div class="mt-3">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Schedule a Visit</h3>
              <button 
                id="closeScheduleModalBtn"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form class="space-y-4" id="scheduleForm">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="scheduleFirstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                  <input 
                    type="text" 
                    id="scheduleFirstName" 
                    name="firstName"
                    class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                </div>
                <div>
                  <label for="scheduleLastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                  <input 
                    type="text" 
                    id="scheduleLastName" 
                    name="lastName"
                    class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                </div>
              </div>
              <div id="emailVerificationSection">
                <label for="scheduleEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <input 
                    type="email" 
                    id="scheduleEmail" 
                    name="email"
                    class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                  <button 
                    type="button"
                    id="sendVerificationCode"
                    class="mt-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Code
                  </button>
                </div>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Only Gmail addresses are currently supported</p>
                <!-- Real-time validation status - always visible -->
                <div id="emailValidationStatus" class="mt-1 text-sm"></div>
                <div id="verificationCodeContainer" class="hidden mt-2">
                  <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input 
                      type="text" 
                      id="verificationCode" 
                      placeholder="Enter verification code"
                      class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                    <button 
                      type="button"
                      id="verifyCode"
                      class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Verify
                    </button>
                  </div>
                  <p id="verificationStatus" class="mt-1 text-sm"></p>
                </div>
              </div>
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img src="/ph-flag.png" alt="Philippine Flag" class="h-5 w-7 object-cover rounded-sm" />
                    <span class="ml-2 text-gray-700 dark:text-gray-300">+63</span>
                  </div>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone"
                    maxlength="10"
                    pattern="[0-9]{10}"
                    class="mt-1 block w-full pl-20 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    placeholder="9XXXXXXXXX"
                  >
                </div>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Enter 10-digit mobile number (e.g., 9123456789)</p>
              </div>
              <div>
                <label for="visitDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Visit Date</label>
                <input 
                  type="date" 
                  id="visitDate" 
                  name="visitDate"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  min=""
                  max=""
                >
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Scheduling is available up to 1 month in advance. Maximum 2 visits per week per user account.</p>
              </div>
              <div>
                <label for="placeToVisit" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Place to Visit</label>
                <select 
                  id="placeToVisit" 
                  name="placeToVisit"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select a place</option>
                </select>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Multiple Places option requires at least 2 available places</p>
              </div>
              <div id="multiplePlacesContainer" class="hidden space-y-2">
                <!-- Dynamic place checkboxes will be loaded here -->
              </div>
              <div>
                <label for="purpose" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Purpose of Visit</label>
                <select 
                  id="purpose" 
                  name="purpose"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select a purpose</option>
                  <option value="meeting">Meeting</option>
                  <option value="interview">Interview</option>
                  <option value="delivery">Delivery</option>
                  <option value="consultation">Consultation</option>
                  <option value="other">Others</option>
                </select>
              </div>
              <div id="otherPurposeContainer" class="hidden">
                <label for="otherPurpose" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Please specify (max 10 words, 50 characters)</label>
                <textarea 
                  id="otherPurpose" 
                  name="otherPurpose"
                  rows="2"
                  maxlength="50"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                ></textarea>
                <div class="mt-1 flex flex-col sm:flex-row justify-between text-sm text-gray-500 dark:text-gray-400 space-y-1 sm:space-y-0">
                  <span>Word count: <span id="wordCount">0</span>/10</span>
                  <span>Character count: <span id="charCount">0</span>/50</span>
                </div>
              </div>
              <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <button 
                  type="submit"
                  id="scheduleSubmitBtn"
                  class="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled
                >
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Sign Up Modal -->
      <div id="signUpModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-3 sm:p-5 border w-full max-w-sm sm:max-w-md md:max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div class="mt-3">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Sign Up</h3>
              <button 
                id="closeSignUpModalBtn"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="signupFirstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                  <input 
                    type="text" 
                    id="signupFirstName" 
                    name="firstName"
                    class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                </div>
                <div>
                  <label for="signupLastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                  <input 
                    type="text" 
                    id="signupLastName" 
                    name="lastName"
                    class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                </div>
              </div>
              <div>
                <label for="signupEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input 
                  type="email" 
                  id="signupEmail" 
                  name="email"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
              </div>
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
              </div>
              <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <button 
                  type="submit"
                  class="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}
