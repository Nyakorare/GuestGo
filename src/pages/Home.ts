import { setupEventListeners } from '../components/ModalFunctions';
import supabase from '../config/supabase';

// Helper function to get current Philippine time
function getPhilippineTime(): Date {
  const now = new Date();
  const philippineTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Manila"}));
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
  const philippineTime = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Manila"}));
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

    // Get current Philippine date
    const philippineToday = getPhilippineDate();
    
    // Calculate the week boundaries (Sunday to Saturday)
    const weekStart = new Date(philippineToday);
    weekStart.setDate(philippineToday.getDate() - philippineToday.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Query the database for visits in the current week
    const { data: visits, error } = await supabase
      .from('scheduled_visits')
      .select('visit_date, status')
      .eq('visitor_email', userEmail)
      .gte('visit_date', weekStart.toISOString().split('T')[0])
      .lte('visit_date', weekEnd.toISOString().split('T')[0])
      .in('status', ['pending', 'completed']);

    if (error) {
      console.error('Error loading weekly visit count:', error);
      weeklyVisitText.textContent = 'Error loading visit count';
      return;
    }

    // Count the visits
    const visitCount = visits?.length || 0;
    const remainingVisits = Math.max(0, 2 - visitCount);

    // Format the week range for display
    const weekStartFormatted = weekStart.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const weekEndFormatted = weekEnd.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });

    // Update the display based on the count
    if (visitCount === 0) {
      weeklyVisitText.innerHTML = `
        <span class="font-medium text-green-600 dark:text-green-400">2 visits remaining</span> 
        for the week of ${weekStartFormatted} - ${weekEndFormatted}
      `;
    } else if (visitCount === 1) {
      weeklyVisitText.innerHTML = `
        <span class="font-medium text-yellow-600 dark:text-yellow-400">1 visit remaining</span> 
        for the week of ${weekStartFormatted} - ${weekEndFormatted}
      `;
    } else {
      weeklyVisitText.innerHTML = `
        <span class="font-medium text-red-600 dark:text-red-400">No visits remaining</span> 
        for the week of ${weekStartFormatted} - ${weekEndFormatted}
      `;
    }

    // Add a small note about the limit
    const noteElement = document.createElement('div');
    noteElement.className = 'mt-1 text-xs text-blue-600 dark:text-blue-400';
    noteElement.textContent = 'Maximum 2 visits per week per email address';
    
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

export function HomePage() {
  // Initialize the page
  setTimeout(async () => {
    // Set minimum date to today and maximum date to one month from today (Philippine time)
    const philippineToday = getPhilippineDate();
    const philippineMaxDate = new Date(philippineToday);
    philippineMaxDate.setMonth(philippineMaxDate.getMonth() + 1);
    
    const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
    if (visitDateInput) {
      // Set minimum date to today (Philippine time)
      visitDateInput.min = philippineToday.toISOString().split('T')[0];
      // Set maximum date to one month from today
      visitDateInput.max = philippineMaxDate.toISOString().split('T')[0];
      
      // Set default value to today
      visitDateInput.value = philippineToday.toISOString().split('T')[0];
      
      // Add event listener to prevent selecting past dates
      visitDateInput.addEventListener('change', () => {
        const selectedDate = new Date(visitDateInput.value);
        selectedDate.setHours(0, 0, 0, 0);
        const philippineSelectedDate = toPhilippineTime(selectedDate);
        philippineSelectedDate.setHours(0, 0, 0, 0);
        
        if (philippineSelectedDate.getTime() < philippineToday.getTime()) {
          alert('Cannot schedule visits for past dates. Please select today or a future date.');
          visitDateInput.value = philippineToday.toISOString().split('T')[0];
        }
      });
      
      // Add event listener to prevent selecting dates more than 1 month in the future
      visitDateInput.addEventListener('change', () => {
        const selectedDate = new Date(visitDateInput.value);
        selectedDate.setHours(0, 0, 0, 0);
        const philippineSelectedDate = toPhilippineTime(selectedDate);
        philippineSelectedDate.setHours(0, 0, 0, 0);
        
        if (philippineSelectedDate.getTime() > philippineMaxDate.getTime()) {
          alert('Cannot schedule visits more than 1 month in advance. Please select a date within the next month.');
          visitDateInput.value = philippineMaxDate.toISOString().split('T')[0];
        }
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

  return `    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-center space-x-4 mb-8">
        <img src="/guestgo-logo.png" alt="GuestGo Logo" class="h-16 w-16" />
        <div>
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
            Welcome to GuestGo
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-200">
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
        class="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
      >
        Schedule Now
      </button>

      <!-- Schedule Modal -->
      <div id="scheduleModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
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
              <div class="grid grid-cols-2 gap-4">
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
                <div class="flex space-x-2">
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
                  <div class="flex space-x-2">
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
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Scheduling is available up to 1 month in advance. Maximum 2 visits per week per email address.</p>
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
                <div class="mt-1 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Word count: <span id="wordCount">0</span>/10</span>
                  <span>Character count: <span id="charCount">0</span>/50</span>
                </div>
              </div>
              <div class="flex justify-end">
                <button 
                  type="submit"
                  id="scheduleSubmitBtn"
                  class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div id="signUpModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
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
              <div class="grid grid-cols-2 gap-4">
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
              <div class="flex justify-end">
                <button 
                  type="submit"
                  class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
