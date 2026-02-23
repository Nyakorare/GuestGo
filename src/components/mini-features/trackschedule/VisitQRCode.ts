export function VisitQRCode() {
  return `
    <div class="text-center track-fade-in track-fade-in-delay-4">
      <div class="flex items-center justify-center gap-3 mb-5">
        <div class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center track-icon-float">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Visit QR Code</h3>
      </div>
      <div id="qrCodeContainer" class="track-card inline-block p-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-600">
        <!-- QR code will be generated here -->
      </div>
      <p class="mt-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Show this QR code at the gate for scanning
      </p>
    </div>
  `;
}

