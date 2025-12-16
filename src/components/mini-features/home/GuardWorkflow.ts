/**
 * Guard Workflow Component
 * Displays the "How GuestGo Works" workflow for guard role users
 * (focused on gate and entrance/exit operations)
 */

export function GuardWorkflow() {
  return {
    steps: `
      <button class="rounded-lg px-3 py-2 text-sm bg-blue-600 text-white" data-workflow-step="1">1. Open Guard Dashboard</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="2">2. Monitor Gates</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="3">3. Verify Entrances</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="4">4. Assist Exits</button>
    `,
    panels: `
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800" data-workflow-panel="1">
        <p class="font-semibold mb-1">Open Guard Dashboard</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Log in as a guard and open the Guard Dashboard to see active schedules, gate statuses, and incoming visitors for your assigned entrances.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="2">
        <p class="font-semibold mb-1">Monitor Gate Activity</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Watch real-time activity for entrance and exit gates, including face detection status and which visitors are currently at each gate.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="3">
        <p class="font-semibold mb-1">Verify Entrances</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Use QR codes and AI face detection to validate visitors against their schedules before granting access, coordinating with personnel if issues arise.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="4">
        <p class="font-semibold mb-1">Assist Exits</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Support exit gates by confirming visitors as they leave, ensuring exit scans and face verification are completed so visits are properly closed in the system.</p>
      </div>
    `
  };
}


