/**
 * Logs Workflow Component
 * Displays the "How GuestGo Works" workflow for logs (audit) role users
 */

export function LogsWorkflow() {
  return {
    steps: `
      <button class="rounded-lg px-3 py-2 text-sm bg-blue-600 text-white" data-workflow-step="1">1. View Logs</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="2">2. Filter</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="3">3. Analyze</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="4">4. Export</button>
    `,
    panels: `
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800" data-workflow-panel="1">
        <p class="font-semibold mb-1">View System Logs</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Access detailed system logs that capture appointments, gate activity, user actions, and status changes for every visit.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="2">
        <p class="font-semibold mb-1">Filter & Search Records</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Use filters by date, user, role, gate, or action type to quickly locate specific events and investigate issues.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="3">
        <p class="font-semibold mb-1">Analyze Patterns</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Review activity trends to detect unusual behavior, repeated errors, or bottlenecks in the visit and gate workflows.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="4">
        <p class="font-semibold mb-1">Export Audit Reports</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Export logs as reports for compliance, audits, and long-term record keeping separate from what visitors and guests see.</p>
      </div>
    `
  };
}


