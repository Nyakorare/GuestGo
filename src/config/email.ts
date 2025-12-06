// Email service for GuestGo (using SendGrid)
import { generateSimpleVisitQRCode } from '../utils/qrCode';

// Backend API endpoint (to avoid CORS issues)
// Automatically detects production vs development
const getEmailApiUrl = (): string => {
  // If explicitly set, use that (highest priority)
  if (import.meta.env.VITE_EMAIL_API_URL) {
    return import.meta.env.VITE_EMAIL_API_URL;
  }
  
  // Auto-detect: if we're on localhost, use local server
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3000/api/send-visit-email';
  }
  
  // Production: default to Vercel serverless function (relative path)
  // This works automatically on Vercel deployments
  return '/api/send-visit-email';
};

const EMAIL_API_URL = getEmailApiUrl();

export interface VisitEmailData {
  visitId: string;
  visitorFirstName: string;
  visitorLastName: string;
  visitorEmail: string;
  visitorPhone: string;
  visitDate: string;
  purpose: string;
  places: Array<{
    placeId: string;
    placeName: string;
    placeLocation: string | null;
    status: string;
  }>;
  status: string;
  scheduledAt: string;
}

/**
 * Send visit confirmation email with QR code and visit details
 * @param visitData - The visit data to include in the email
 * @returns Promise<boolean> - True if email was sent successfully
 */
export async function sendVisitConfirmationEmail(visitData: VisitEmailData): Promise<boolean> {
  try {
    // Generate QR code
    const qrCodeDataUrl = await generateSimpleVisitQRCode(visitData.visitId);
    
    // Convert data URL to base64 string (remove data:image/png;base64, prefix)
    const qrCodeBase64 = qrCodeDataUrl.split(',')[1];
    
    // Send email via backend API (to avoid CORS issues)
    const response = await fetch(EMAIL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitId: visitData.visitId,
        visitorFirstName: visitData.visitorFirstName,
        visitorLastName: visitData.visitorLastName,
        visitorEmail: visitData.visitorEmail,
        visitorPhone: visitData.visitorPhone,
        visitDate: visitData.visitDate,
        purpose: visitData.purpose,
        places: visitData.places,
        status: visitData.status,
        scheduledAt: visitData.scheduledAt,
        qrCodeBase64: qrCodeBase64,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error sending email via backend API:', errorData);
      return false;
    }

    const data = await response.json();
    console.log('Visit confirmation email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending visit confirmation email:', error);
    return false;
  }
}

