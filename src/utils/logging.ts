import supabase from '../config/supabase';

export type LogAction = 'password_change' | 'place_update' | 'place_availability_toggle' | 'place_create' | 'personnel_assignment' | 'personnel_removal' | 'personnel_availability_change' | 'visit_scheduled' | 'visit_completed';

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
    // First, fetch the logs
    const { data: logs, error } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100); // Limit to last 100 logs

    if (error) {
      console.error('Error fetching logs:', error);
      return [];
    }

    if (!logs || logs.length === 0) {
      return [];
    }

    // Get unique user IDs from logs
    const userIds = [...new Set(logs.map(log => log.user_id).filter(id => id))];

    // Fetch user information for all users
    let userInfo: any = {};
    if (userIds.length > 0) {
      const { data: users, error: userError } = await supabase
        .from('user_roles')
        .select('user_id, first_name, last_name, email, role')
        .in('user_id', userIds);

      if (!userError && users) {
        userInfo = users.reduce((acc: any, user: any) => {
          acc[user.user_id] = user;
          return acc;
        }, {});
      }
    }

    // Combine logs with user information
    const logsWithUsers = logs.map(log => ({
      ...log,
      user_roles: log.user_id ? userInfo[log.user_id] : null
    }));

    // Debug: Log any logs with potentially problematic details
    logsWithUsers.forEach((log, index) => {
      if (log.details && typeof log.details !== 'object' && typeof log.details !== 'string') {
        console.warn(`Log ${index} has unexpected details type:`, typeof log.details, log.details);
      }
      if (typeof log.details === 'string') {
        try {
          JSON.parse(log.details);
        } catch (error) {
          console.error(`Log ${index} has invalid JSON in details:`, log.details, error);
        }
      }
    });

    return logsWithUsers;
  } catch (error) {
    console.error('Error in getLogs:', error);
    return [];
  }
} 