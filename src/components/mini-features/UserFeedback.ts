export function UserFeedback() {
  return `
    <div class="mt-12 bg-gradient-to-br from-white to-yellow-50 dark:from-gray-800 dark:to-yellow-900/20 rounded-2xl shadow-xl p-8 sm:p-10 mx-4 sm:mx-6 lg:mx-8 border-2 border-yellow-100 dark:border-yellow-800">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">User Feedback</h2>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          See what our users are saying about GuestGo. Real feedback from real visitors who have used our system.
        </p>
      </div>
      
      <div id="feedback-container" class="space-y-8">
        <!-- Loading state -->
        <div id="feedback-loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-500 mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400 font-medium">Loading feedback...</p>
        </div>
        
        <!-- Empty state (hidden by default) -->
        <div id="feedback-empty" class="text-center py-12 hidden">
          <div class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <p class="text-gray-600 dark:text-gray-400 font-medium">No feedback available yet.</p>
          <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Check back soon for user testimonials!</p>
        </div>
      </div>
    </div>
  `;
}

