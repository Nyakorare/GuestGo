import supabase from '../config/supabase';

/**
 * Logs when a new account is created
 * @param userId - The ID of the newly created user
 * @param email - The email address of the new user
 * @param firstName - The first name of the new user
 * @param lastName - The last name of the new user
 */
export async function logAccountCreation(
  userId: string,
  email: string,
  firstName?: string,
  lastName?: string
): Promise<void> {
  try {
    const userAgent = navigator.userAgent;

    // Call the database function to log the account creation
    const { error } = await supabase.rpc('log_action', {
      p_user_id: userId,
      p_action: 'account_created',
      p_details: {
        email: email,
        first_name: firstName || null,
        last_name: lastName || null,
        timestamp: new Date().toISOString()
      },
      p_ip_address: null,
      p_user_agent: userAgent
    });

    if (error) {
      console.error('Error logging account creation:', error);
    }
  } catch (error) {
    const msg = (error as any)?.message || String(error);
    console.error('Error in logAccountCreation:', msg);
  }
}

