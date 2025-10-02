let overlayElement: HTMLElement | null = null;

export function showLoadingOverlay(message: string = 'Loading...') {
	if (overlayElement) {
		updateLoadingOverlay(message);
		return;
	}

	const overlay = document.createElement('div');
	overlay.id = 'globalLoadingOverlay';
	overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50';

	const container = document.createElement('div');
	container.className = 'flex flex-col items-center space-y-4 p-6 rounded-lg bg-white shadow-lg dark:bg-gray-800';

	const spinner = document.createElement('div');
	spinner.className = 'h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin';

	const text = document.createElement('div');
	text.id = 'globalLoadingOverlayText';
	text.className = 'text-gray-800 dark:text-gray-100 text-sm font-medium';
	text.textContent = message;

	container.appendChild(spinner);
	container.appendChild(text);
	overlay.appendChild(container);

	document.body.appendChild(overlay);
	overlayElement = overlay;
}

export function updateLoadingOverlay(message: string) {
	const text = document.getElementById('globalLoadingOverlayText');
	if (text) {
		text.textContent = message;
	}
}

export function hideLoadingOverlay() {
	if (overlayElement) {
		try {
			document.body.removeChild(overlayElement);
		} catch {}
		overlayElement = null;
	}
}


