export function FollowUs() {
  return `
    <div class="mt-12 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-2xl shadow-xl p-8 sm:p-10 mx-4 sm:mx-6 lg:mx-8 border-2 border-purple-100 dark:border-purple-800">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">Follow Us</h2>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Stay connected with us on social media for updates, announcements, and insights about GuestGo.
        </p>
      </div>
      <div class="flex flex-wrap justify-center gap-6">
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="social-link group flex flex-col items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-2xl hover:from-blue-500 hover:to-blue-700 transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl">
          <svg class="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
          </svg>
          <span class="text-xs font-semibold">Twitter</span>
        </a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="social-link group flex flex-col items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl hover:from-blue-700 hover:to-blue-900 transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl">
          <svg class="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span class="text-xs font-semibold">Facebook</span>
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="social-link group flex flex-col items-center justify-center w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-2xl hover:from-pink-600 hover:to-rose-700 transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl">
          <svg class="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
          </svg>
          <span class="text-xs font-semibold">Instagram</span>
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="social-link group flex flex-col items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-2xl hover:from-gray-800 hover:to-black transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl">
          <svg class="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          <span class="text-xs font-semibold">LinkedIn</span>
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="social-link group flex flex-col items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-800 to-black text-white rounded-2xl hover:from-gray-900 hover:to-gray-950 transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl">
          <svg class="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
          </svg>
          <span class="text-xs font-semibold">GitHub</span>
        </a>
      </div>
      <div class="mt-8 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Follow us for project updates, feature announcements, and behind-the-scenes content from our thesis development journey.
        </p>
      </div>
    </div>
  `;
}

