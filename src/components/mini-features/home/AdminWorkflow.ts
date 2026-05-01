/**
 * Admin Workflow Component
 * Displays the "How GuestGo Works" workflow for admin role users
 */

export function AdminWorkflow() {
  return {
    steps: `
      <button class="rounded-lg px-3 py-2 text-sm bg-blue-600 text-white" data-workflow-step="1">1. Monitor</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="2">2. Manage</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="3">3. Configure</button>
      <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="4">4. Report</button>
    `,
    panels: `
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800" data-workflow-panel="1">
        <p class="font-semibold mb-1">Monitor System</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Track all appointments, visitor flows, and gate activity in real-time through the admin dashboard so you can see how GuestGo is being used.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="2">
        <p class="font-semibold mb-1">Manage Users & Roles</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Create and manage accounts for visitors, personnel, guards, and logs users, assigning the correct roles and permissions for each.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="3">
        <p class="font-semibold mb-1">Configure System Settings</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Set up places, gates, appointment limits, and other rules that control how appointments, entrances, and exits work across your organization.</p>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="4">
        <p class="font-semibold mb-1">Generate Insights & Reports</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Create reports on appointment volume, visitor trends, gate usage, and user activity to support decision-making and policy updates.</p>
      </div>
    `
  };
}


