// Python AI API Configuration
// Production: https://guestgo-ai.onrender.com
// Local dev: http://localhost:5000
// Set VITE_PYTHON_API_URL in Vercel environment variables

// Normalize URL to remove trailing slashes to prevent double slashes in API calls
const normalizeUrl = (url: string): string => {
  return url.replace(/\/+$/, '');
};

export const PYTHON_API_URL = normalizeUrl(import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:5000');

