export function setupDocumentationLauncher(): void {
  if (typeof window === 'undefined') return;

  (window as any).openDocumentationsPage = function openDocumentationsPage() {
    try {
      // Navigate within the current SPA instead of opening a new tab
      window.location.hash = '/documentations';
    } catch (error) {
      console.error('Failed to open documentations page:', error);
    }
  };
}


