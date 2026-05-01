/**
 * Personnel Workflow Component
 * Displays the "How GuestGo Works" workflow for personnel role users
 */

export function PersonnelWorkflow() {
  return {
    steps: `
      <button class="rounded-lg px-3 py-2 text-sm bg-blue-600 text-white" data-workflow-step="1">1. Scan QR</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="2">2. Verify</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="3">3. Check-in</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="4">4. Log Visit</button>
    `,
    panels: `
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800" data-workflow-panel="1">
        <p class="font-semibold mb-1">Scan QR Code</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Use the QR scanner to scan the visitor's QR code from their appointment confirmation email or mobile device when they arrive at your area.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="2">
        <p class="font-semibold mb-1">Verify Appointment Details</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Review the visitor's information, appointment date and time, and approval status to ensure the appointment is valid before allowing them to proceed.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="3">
        <p class="font-semibold mb-1">Check-in Visitor</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Confirm the visitor's arrival for their appointment, update their visit status, and coordinate with guards if needed for access control.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="4">
        <p class="font-semibold mb-1">Log Appointment Visit</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Record visit details such as arrival time, purpose, and any important notes so that admins and logs users can track the visit history.</p>
      </div>
    `
  };
}


