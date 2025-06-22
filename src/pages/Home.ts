import { setupEventListeners } from '../components/ModalFunctions';
import supabase from '../config/supabase';

export function HomePage() {
  // Initialize the page
  setTimeout(async () => {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
    if (visitDateInput) {
      visitDateInput.min = today;
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
        // User is logged in, check their role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleData) {
          const userRole = roleData.role;
          // Hide button for admin, log, or personnel roles
          if (userRole === 'admin' || userRole === 'log' || userRole === 'personnel') {
            scheduleNowBtn.classList.add('hidden');
          } else {
            // Show button for visitor, guest, or any other roles
            scheduleNowBtn.classList.remove('hidden');
          }
        } else {
          // No role found, show button (default behavior)
          scheduleNowBtn.classList.remove('hidden');
        }
      } else {
        // User is not logged in, show button
        scheduleNowBtn.classList.remove('hidden');
      }
    }

    // Setup event listeners
    setupEventListeners();
  }, 0);

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
                >
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
                  <option value="reception">Reception</option>
                  <option value="meeting_room">Meeting Room</option>
                  <option value="office">Office</option>
                  <option value="conference_room">Conference Room</option>
                  <option value="lobby">Lobby</option>
                  <option value="multiple">Multiple Places</option>
                </select>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Multiple Places option requires at least 2 available places</p>
              </div>
              <div id="multiplePlacesContainer" class="hidden space-y-2">
                <div class="flex items-center">
                  <input type="checkbox" id="place_reception" name="places" value="reception" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                  <label for="place_reception" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Reception</label>
                </div>
                <div class="flex items-center">
                  <input type="checkbox" id="place_meeting_room" name="places" value="meeting_room" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                  <label for="place_meeting_room" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Meeting Room</label>
                </div>
                <div class="flex items-center">
                  <input type="checkbox" id="place_office" name="places" value="office" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                  <label for="place_office" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Office</label>
                </div>
                <div class="flex items-center">
                  <input type="checkbox" id="place_conference_room" name="places" value="conference_room" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                  <label for="place_conference_room" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Conference Room</label>
                </div>
                <div class="flex items-center">
                  <input type="checkbox" id="place_lobby" name="places" value="lobby" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                  <label for="place_lobby" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Lobby</label>
                </div>
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
