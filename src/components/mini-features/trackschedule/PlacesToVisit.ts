export function PlacesToVisit() {
  return `
    <div class="mb-8 track-fade-in track-fade-in-delay-2">
      <div class="flex flex-wrap items-center gap-3 mb-5">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center track-icon-float">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Places to Visit</h3>
      </div>
      <div id="visitPlacesList" class="space-y-3">
        <!-- Places will be populated here -->
      </div>
    </div>
  `;
}

