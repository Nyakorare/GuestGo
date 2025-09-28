import supabase from '../config/supabase';

export type LogAction = 'password_change' | 'place_update' | 'place_availability_toggle' | 'place_create' | 'personnel_assignment' | 'personnel_removal' | 'personnel_availability_change' | 'visit_scheduled' | 'visit_completed' | 'gate_create' | 'gate_update' | 'gate_status_change' | 'role_change';

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

// Helper function to change user role with logging
export async function changeUserRoleWithLogging(
  targetUserId: string,
  newRole: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('change_user_role', {
      p_target_user_id: targetUserId,
      p_new_role: newRole,
      p_changed_by: (await supabase.auth.getUser()).data.user?.id
    });

    if (error) {
      console.error('Error changing user role:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in changeUserRoleWithLogging:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Helper function to get role change history for a specific user
export async function getUserRoleHistory(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_role_history', {
      p_user_id: userId,
      p_requested_by: (await supabase.auth.getUser()).data.user?.id
    });

    if (error) {
      console.error('Error fetching user role history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserRoleHistory:', error);
    return [];
  }
}

// Helper function to get all role change history
export async function getAllRoleChangeHistory(): Promise<any[]> {
  try {
    const { data, error } = await supabase.rpc('get_all_role_change_history', {
      p_requested_by: (await supabase.auth.getUser()).data.user?.id
    });

    if (error) {
      console.error('Error fetching all role change history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllRoleChangeHistory:', error);
    return [];
  }
} 