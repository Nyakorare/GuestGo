/**
 * Visitor Workflow Component
 * Displays the "How GuestGo Works" workflow for visitor role users
 */

export function VisitorWorkflow() {
  return {
    steps: `
      <button class="rounded-lg px-3 py-2 text-sm bg-blue-600 text-white" data-workflow-step="1">1. Schedule</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="2">2. Entrance</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="3">3. Face Data</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="4">4. QR Scan</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="5">5. Exit</button>
    `,
    panels: `
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800" data-workflow-panel="1">
        <p class="font-semibold mb-1">Schedule a Date</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Fill out the appointment form with your details, select your preferred date and time (PH timezone), and choose the place you'd like to visit. The system enforces a maximum of 2 appointments per week per user.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="2">
        <p class="font-semibold mb-1">Go to Your Scheduled Date</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">On your scheduled date, you can enter through the guard for entrance verification, or access the dashboard and scan an entrance gate to proceed with your visit.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="3">
        <p class="font-semibold mb-1">Enter Your Face Data</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">At the entrance gate, you'll be prompted to enter your face data. This biometric information will be securely stored and used for verification throughout your visit.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="4">
        <p class="font-semibold mb-1">Go to Your Scheduled Place</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Proceed to your scheduled place and have your QR code scanned by the personnel. This confirms your arrival at your intended destination.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="5">
        <p class="font-semibold mb-1">Exit and Verify Face</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">When leaving, go to an exit gate that has an exit scan. Verify your face using the face data saved from your entrance. Once verified, your schedule will be completed.</p>
      </div>
    `
  };
}

/**
 * Guest Workflow Component (for non-logged in users)
 * Displays the "How GuestGo Works" workflow with email verification requirement
 */
export function GuestWorkflow() {
  return {
    steps: `
      <button class="rounded-lg px-3 py-2 text-sm bg-blue-600 text-white" data-workflow-step="1">1. Schedule</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="2">2. Entrance</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="3">3. Face Data</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="4">4. QR Scan</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="5">5. Exit</button>
    `,
    panels: `
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800" data-workflow-panel="1">
        <p class="font-semibold mb-1">Schedule a Date</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Fill out the appointment form with your details, select your preferred date and time (PH timezone), and choose the place you'd like to visit. The system enforces a maximum of 2 appointments per week per user. <strong class="text-blue-600 dark:text-blue-400">Please note: You must verify your email first before you can proceed with scheduling an appointment.</strong></p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="2">
        <p class="font-semibold mb-1">Go to Your Scheduled Date</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">On your scheduled date, you can enter through the guard for entrance verification, or access the dashboard and scan an entrance gate to proceed with your visit.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="3">
        <p class="font-semibold mb-1">Enter Your Face Data</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">At the entrance gate, you'll be prompted to enter your face data. This biometric information will be securely stored and used for verification throughout your visit.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="4">
        <p class="font-semibold mb-1">Go to Your Scheduled Place</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Proceed to your scheduled place and have your QR code scanned by the personnel. This confirms your arrival at your intended destination.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="5">
        <p class="font-semibold mb-1">Exit and Verify Face</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">When leaving, go to an exit gate that has an exit scan. Verify your face using the face data saved from your entrance. Once verified, your schedule will be completed.</p>
      </div>
    `
  };
}
