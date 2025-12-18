// Python AI API Configuration
// Production: https://guestgo-ai.onrender.com
// Local dev: http://localhost:5000
// Set VITE_PYTHON_API_URL in Vercel environment variables

const LOCAL_API_URL = 'http://localhost:5000';
const DEPLOYED_API_URL = 'https://guestgo-ai.onrender.com';

// Normalize URL to remove trailing slashes to prevent double slashes in API calls
const normalizeUrl = (url: string): string => {
  return url.replace(/\/+$/, '');
};

// Get API URL preference from localStorage
export function getApiUrlPreference(): 'local' | 'deployed' | null {
  if (typeof window !== 'undefined' && localStorage.getItem('aiApiPreference')) {
    return localStorage.getItem('aiApiPreference') as 'local' | 'deployed';
  }
  return null;
}

// Set API URL preference in localStorage
export function setApiUrlPreference(preference: 'local' | 'deployed'): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('aiApiPreference', preference);
  }
}

// Helper to detect if we're running on localhost
function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || 
         hostname === '127.0.0.1' || 
         hostname.includes('localhost');
}

// Get the effective API URL based on preference and availability
export function getEffectiveApiUrl(): string {
  const preference = getApiUrlPreference();
  const envUrl = import.meta.env.VITE_PYTHON_API_URL;
  
  // If environment variable is set, use it (takes precedence)
  if (envUrl) {
    return normalizeUrl(envUrl);
  }
  
  // If preference is set, use it
  if (preference === 'local') {
    return LOCAL_API_URL;
  }
  if (preference === 'deployed') {
    return DEPLOYED_API_URL;
  }
  
  // Default: always try local first, then fall back to deployed if local is unavailable
  // This allows both localhost and deployed sites to use a local model if available
  // The fallback logic in verification functions will handle switching to deployed if local fails
  // On localhost: local API is expected to be available
  // On deployed site: local API might be available if user has it running locally
  return LOCAL_API_URL;
}

// Export constants for use in other files
export { LOCAL_API_URL, DEPLOYED_API_URL };

// Default export for backward compatibility
export const PYTHON_API_URL = getEffectiveApiUrl();

