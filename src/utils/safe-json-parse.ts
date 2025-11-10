/**
 * Safely parse JSON from a fetch Response with Content-Type validation
 * Prevents "Unexpected token" errors when server returns HTML instead of JSON
 * 
 * @param response - The fetch Response object
 * @param apiUrl - Optional API URL for error logging
 * @returns Parsed JSON data or null if parsing fails
 */
export async function safeJsonParse<T = any>(
  response: Response,
  apiUrl?: string
): Promise<T | null> {
  try {
    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      const url = apiUrl || response.url;
      console.error(`Service at ${url} returned ${response.status}: ${errorText.substring(0, 200)}`);
      return null;
    }

    // Check Content-Type to ensure it's JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      const url = apiUrl || response.url;
      console.error(`Service at ${url} returned non-JSON content (${contentType}): ${text.substring(0, 200)}`);
      return null;
    }

    // Parse JSON
    const data = await response.json();
    return data as T;
  } catch (error) {
    // Handle JSON parsing errors specifically
    const errorMessage = error instanceof Error ? error.message : String(error);
    const url = apiUrl || response.url;
    
    if (errorMessage.includes('Unexpected token') || errorMessage.includes('JSON')) {
      console.error(`Service at ${url} returned invalid JSON:`, errorMessage);
    } else {
      console.error(`Error parsing response from ${url}:`, error);
    }
    return null;
  }
}

