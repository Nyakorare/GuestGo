// Email service for sending visit completion emails with feedback survey links
// Backend API endpoint (to avoid CORS issues)
// Automatically detects production vs development
const getEmailApiUrl = (): string => {
  // If explicitly set, use that (highest priority)
  if (import.meta.env.VITE_EMAIL_API_URL) {
    return import.meta.env.VITE_EMAIL_API_URL;
  }
  
  // Auto-detect: if we're on localhost, use local server
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3000/api/send-completion-email';
  }
  
  // Production: default to Vercel serverless function (relative path)
  // This works automatically on Vercel deployments
  return '/api/send-completion-email';
};

const EMAIL_API_URL = getEmailApiUrl();

export interface CompletionEmailData {
  visitId: string;
  visitorFirstName: string;
  visitorLastName: string;
  visitorEmail: string;
  visitorRole: 'guest' | 'visitor';
  visitDate: string;
  purpose: string;
  places: Array<{
    placeId: string;
    placeName: string;
    placeLocation: string | null;
  }>;
}

/**
 * Send visit completion email with thank you message and feedback survey link
 * @param visitData - The visit data to include in the email
 * @returns Promise<boolean> - True if email was sent successfully
 */
export async function sendVisitCompletionEmail(visitData: CompletionEmailData): Promise<boolean> {
  try {
    // Get the base URL for feedback survey link
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://your-domain.com'; // Fallback for server-side
    
    // Build feedback survey link for guests (using hash-based routing)
    const feedbackSurveyLink = visitData.visitorRole === 'guest'
      ? `${baseUrl}/#/feedback/${visitData.visitId}`
      : null;

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
        visitorRole: visitData.visitorRole,
        visitDate: visitData.visitDate,
        purpose: visitData.purpose,
        places: visitData.places,
        feedbackSurveyLink: feedbackSurveyLink,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error sending completion email via backend API:', errorData);
      return false;
    }

    const data = await response.json();
    console.log('Visit completion email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending visit completion email:', error);
    return false;
  }
}
