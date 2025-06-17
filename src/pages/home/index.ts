import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://srfcewglmzczveopbwsk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyZmNld2dsbXpjenZlb3Bid3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDI5ODEsImV4cCI6MjA2NTU3ODk4MX0.H6b6wbYOVytt2VOirSmJnjMkm-ba3H-i0LkCszxqYLY'
);

export function HomePage() {
  // Initialize the page
  setTimeout(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get user's role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      // Hide schedule button for admin users
      const scheduleButton = document.getElementById('scheduleButton');
      if (scheduleButton && roleData?.role === 'admin') {
        scheduleButton.classList.add('hidden');
      }
    }
  }, 0);

  return `
    <div class="relative isolate">
      <!-- Background -->
      <div class="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
        <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
      </div>

      <!-- Hero section -->
      <div class="relative isolate px-6 pt-14 lg:px-8">
        <div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div class="text-center">
            <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Welcome to GuestGo
            </h1>
            <p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Your one-stop solution for managing customer service center visits. Schedule your visit today and experience seamless service.
            </p>
            <div class="mt-10 flex items-center justify-center gap-x-6">
              <button
                id="scheduleButton"
                class="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Schedule Now
              </button>
              <a href="#about" class="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- About section -->
      <div id="about" class="py-24 sm:py-32">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="mx-auto max-w-2xl lg:text-center">
            <h2 class="text-base font-semibold leading-7 text-blue-600">About Us</h2>
            <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to know about GuestGo
            </p>
            <p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              GuestGo is a comprehensive platform designed to streamline the process of scheduling and managing visits to customer service centers.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
} 