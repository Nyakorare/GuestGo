/**
 * Toast notification utility for displaying temporary messages in the top right corner
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  duration?: number; // Duration in milliseconds (default: 3000)
  type?: ToastType; // Type of toast (default: 'info')
}

/**
 * Show a toast notification in the top right corner
 * @param message - The message to display
 * @param options - Optional configuration for the toast
 */
export function showToastNotification(message: string, options: ToastOptions = {}): void {
  const { duration = 3000, type = 'info' } = options;

  // Remove any existing toasts to prevent stacking
  const existingToasts = document.querySelectorAll('.toast-notification');
  existingToasts.forEach(toast => {
    const element = toast as HTMLElement;
    element.style.opacity = '0';
    element.style.transform = 'translateX(100%)';
    setTimeout(() => element.remove(), 300);
  });

  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  
  // Base styles
  const baseStyles = 'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl transition-all duration-300 transform translate-x-0 opacity-100 max-w-md';
  
  // Type-specific styles
  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  toast.className = `toast-notification ${baseStyles} ${typeStyles[type]}`;
  toast.textContent = message;

  // Add to document
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });

  // Remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, duration);
}

/**
 * Convenience function for showing error toasts
 */
export function showErrorToast(message: string, duration?: number): void {
  showToastNotification(message, { type: 'error', duration });
}

/**
 * Convenience function for showing success toasts
 */
export function showSuccessToast(message: string, duration?: number): void {
  showToastNotification(message, { type: 'success', duration });
}

/**
 * Convenience function for showing warning toasts
 */
export function showWarningToast(message: string, duration?: number): void {
  showToastNotification(message, { type: 'warning', duration });
}

/**
 * Convenience function for showing info toasts
 */
export function showInfoToast(message: string, duration?: number): void {
  showToastNotification(message, { type: 'info', duration });
}
