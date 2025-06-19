import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://srfcewglmzczveopbwsk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyZmNld2dsbXpjenZlb3Bid3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDI5ODEsImV4cCI6MjA2NTU3ODk4MX0.H6b6wbYOVytt2VOirSmJnjMkm-ba3H-i0LkCszxqYLY'
);

export type LogAction = 'password_change' | 'place_update' | 'place_availability_toggle' | 'place_create';

export interface LogDetails {
  [key: string]: any;
}

export async function logAction(
  action: LogAction,
  details?: LogDetails
): Promise<void> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Cannot log action: No user found');
      return;
    }

    // Get user agent and IP (if available)
    const userAgent = navigator.userAgent;
    // Note: IP address would need to be passed from the server side
    // For now, we'll leave it as null

    // Call the database function to log the action
    const { error } = await supabase.rpc('log_action', {
      p_user_id: user.id,
      p_action: action,
      p_details: details || null,
      p_ip_address: null, // Would be set server-side
      p_user_agent: userAgent
    });

    if (error) {
      console.error('Error logging action:', error);
    }
  } catch (error) {
    console.error('Error in logAction:', error);
  }
}

export async function getLogs(): Promise<any[]> {
  try {
    const { data: logs, error } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100); // Limit to last 100 logs

    if (error) {
      console.error('Error fetching logs:', error);
      return [];
    }

    return logs || [];
  } catch (error) {
    console.error('Error in getLogs:', error);
    return [];
  }
} 