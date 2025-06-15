export default function setupApp() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  
  app.innerHTML = `
    <nav class="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and brand name -->
          <div class="flex items-center">
            <div class="flex-shrink-0 text-2xl font-bold text-blue-600">
              GuestGo
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-8">
            <a href="#" class="text-gray-700 hover:text-blue-600">Home</a>
            <a href="#" class="text-gray-700 hover:text-blue-600">About</a>
            <a href="#" class="text-gray-700 hover:text-blue-600">Contact Us</a>
          </div>

          <!-- Right side menu -->
          <div class="flex items-center">
            <div class="hidden md:flex items-center space-x-4">
              <a href="#" class="text-gray-700 hover:text-blue-600">Login</a>
              <a href="#" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Sign Up</a>
            </div>

            <!-- Mobile menu button -->
            <div class="md:hidden flex items-center">
              <button id="mobile-menu-button" class="text-gray-700 hover:text-blue-600">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile menu -->
        <div id="mobile-menu" class="hidden md:hidden">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#" class="block px-3 py-2 text-gray-700 hover:text-blue-600">Home</a>
            <a href="#" class="block px-3 py-2 text-gray-700 hover:text-blue-600">About</a>
            <a href="#" class="block px-3 py-2 text-gray-700 hover:text-blue-600">Contact Us</a>
            <a href="#" class="block px-3 py-2 text-gray-700 hover:text-blue-600">Login</a>
            <a href="#" class="block px-3 py-2 text-blue-600 font-medium">Sign Up</a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content with padding to account for fixed navbar -->
    <main class="pt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-4xl font-bold text-gray-900">
          Welcome to GuestGo
        </h1>
      </div>
    </main>
  `

  // Mobile menu toggle functionality
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  mobileMenuButton?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('hidden');
  });
}