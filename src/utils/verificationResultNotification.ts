import { showErrorToast, showSuccessToast, showWarningToast } from './toastNotification';

export function showVerificationSuccess(message: string, duration = 4500): void {
  showSuccessToast(message, duration);
}

export function showVerificationWarning(message: string, duration = 5000): void {
  showWarningToast(message, duration);
}

export function showVerificationError(message: string, duration = 5500): void {
  showErrorToast(message, duration);
}
