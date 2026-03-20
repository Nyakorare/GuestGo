export function showLogsMiniLoading(containerId: string = 'logsList'): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-center py-4">
      <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 dark:border-gray-100"></div>
      <p class="ml-3 text-sm text-gray-600 dark:text-gray-300">Loading page...</p>
    </div>
  `;
}

