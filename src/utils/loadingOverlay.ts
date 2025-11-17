let overlayElement: HTMLElement | null = null;
let overlayFailsafeTimeout: number | null = null;
const OVERLAY_FAILSAFE_MS = 12000;

function scheduleOverlayFailsafe() {
	if (typeof window === 'undefined') return;
	if (overlayFailsafeTimeout) {
		clearTimeout(overlayFailsafeTimeout);
	}
	overlayFailsafeTimeout = window.setTimeout(() => {
		console.warn('[LoadingOverlay] Failsafe triggered after timeout. Forcing overlay hide.');
		hideLoadingOverlay();
	}, OVERLAY_FAILSAFE_MS);
}

export function showLoadingOverlay(message: string = 'Loading...') {
	if (overlayElement) {
		updateLoadingOverlay(message);
		scheduleOverlayFailsafe();
		return;
	}

	const overlay = document.createElement('div');
	overlay.id = 'globalLoadingOverlay';
	overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm';

	const container = document.createElement('div');
	container.className = 'flex flex-col items-center space-y-6 p-8 rounded-xl bg-white shadow-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700';

	const spinner = document.createElement('div');
	spinner.className = 'h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin';

	const text = document.createElement('div');
	text.id = 'globalLoadingOverlayText';
	text.className = 'text-gray-800 dark:text-gray-100 text-base font-medium text-center';
	text.textContent = message;

	// Add a subtle pulse animation to the container
	container.style.animation = 'pulse 2s ease-in-out infinite';

	container.appendChild(spinner);
	container.appendChild(text);
	overlay.appendChild(container);

	// Add fade-in animation
	overlay.style.opacity = '0';
	overlay.style.transition = 'opacity 0.3s ease-out';

	document.body.appendChild(overlay);
	overlayElement = overlay;
	scheduleOverlayFailsafe();

	// Trigger fade-in
	setTimeout(() => {
		overlay.style.opacity = '1';
	}, 10);
}

export function updateLoadingOverlay(message: string) {
	const text = document.getElementById('globalLoadingOverlayText');
	if (text) {
		text.textContent = message;
	}
}

export function hideLoadingOverlay() {
	if (overlayElement) {
		if (overlayFailsafeTimeout) {
			clearTimeout(overlayFailsafeTimeout);
			overlayFailsafeTimeout = null;
		}
		// Add fade-out animation
		overlayElement.style.transition = 'opacity 0.3s ease-out';
		overlayElement.style.opacity = '0';
		
		// Remove from DOM after animation
		setTimeout(() => {
			try {
				document.body.removeChild(overlayElement!);
			} catch {}
			overlayElement = null;
		}, 300);
	}
}


