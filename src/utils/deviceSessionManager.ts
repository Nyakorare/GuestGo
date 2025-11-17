import supabase from '../config/supabase';

const DEVICE_ID_KEY = 'guestgo_device_id';
const DEVICE_SESSION_KEY = 'guestgo_device_session';

/**
 * Generates a unique device ID and stores it in localStorage
 */
function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    // Generate a unique device ID using timestamp and random string
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
}

/**
 * Shows a notification when account is logged in on another device
 */
function showDeviceLogoutNotification() {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.device-logout-notification');
  existingNotifications.forEach(notification => notification.remove());

  const notification = document.createElement('div');
  notification.className = 'device-logout-notification fixed top-20 right-4 z-50 px-6 py-4 rounded-md shadow-lg bg-yellow-500 text-white max-w-md';
  notification.innerHTML = `
    <div class="flex items-start">
      <svg class="h-6 w-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div>
        <p class="font-semibold mb-1">Account Logged In on Another Device</p>
        <p class="text-sm">Your account has been logged in on another device. You have been automatically logged out for security.</p>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Remove notification after 8 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 8000);
}

/**
 * Checks if the current device matches the stored device ID for the user
 * Returns true if this device is the active one, false if another device has taken over
 */
async function validateDeviceSession(userId: string, deviceId: string): Promise<boolean> {
  try {
    // Get user metadata to check stored device ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const storedDeviceId = user.user_metadata?.device_id;
    const storedSessionId = user.user_metadata?.session_id;
    const currentSessionId = localStorage.getItem(DEVICE_SESSION_KEY);

    // If no device ID is stored, this is the first login - allow it
    if (!storedDeviceId) {
      return true;
    }

    // Check if device ID and session ID both match
    if (storedDeviceId === deviceId && storedSessionId === currentSessionId) {
      return true;
    }

    // Device ID or session ID doesn't match - another device has taken over
    return false;
  } catch (error) {
    console.error('Error validating device session:', error);
    return false;
  }
}

/**
 * Stores device information in user metadata
 */
async function storeDeviceInfo(userId: string, deviceId: string): Promise<void> {
  try {
    // Generate a unique session ID for this login
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(DEVICE_SESSION_KEY, sessionId);

    // Update user metadata with device ID and session ID
    const { error } = await supabase.auth.updateUser({
      data: {
        device_id: deviceId,
        session_id: sessionId,
        last_device_login: new Date().toISOString()
      }
    });

    if (error) {
      console.error('Error storing device info:', error);
    }
  } catch (error) {
    console.error('Error storing device info:', error);
  }
}

/**
 * Invalidates all sessions for a user (signs them out everywhere)
 */
async function invalidateAllSessions(): Promise<void> {
  try {
    // Sign out the current session
    await supabase.auth.signOut();
    
    // Clear local storage
    localStorage.removeItem(DEVICE_SESSION_KEY);
    
    // Redirect to home
    window.location.hash = '/';
    
    // Show notification
    showDeviceLogoutNotification();
    
    // Reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 100);
  } catch (error) {
    console.error('Error invalidating sessions:', error);
  }
}

/**
 * Handles login - checks for existing device sessions and manages device switching
 */
export async function handleDeviceLogin(userId: string): Promise<void> {
  const deviceId = getOrCreateDeviceId();
  
  try {
    // Get current user to check existing device
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const storedDeviceId = user.user_metadata?.device_id;
    const storedSessionId = user.user_metadata?.session_id;
    const currentSessionId = localStorage.getItem(DEVICE_SESSION_KEY);

    // If no device ID is stored, this is the first login - store it
    if (!storedDeviceId) {
      await storeDeviceInfo(userId, deviceId);
      return;
    }

    // If device ID matches and session ID matches, this is the same device - allow it
    if (storedDeviceId === deviceId && storedSessionId === currentSessionId) {
      return; // Already valid, no need to update
    }

    // Device ID doesn't match OR session ID doesn't match
    // This means either:
    // 1. A new device is logging in (device ID different) - update metadata to invalidate old device
    // 2. Same device but session expired/changed - update session ID
    
    // Update device info - this will invalidate the old device/session
    await storeDeviceInfo(userId, deviceId);
    
    // If this is a different device, the old device will be signed out on next check
  } catch (error) {
    console.error('Error handling device login:', error);
  }
}

/**
 * Monitors auth state changes to detect when a session is invalidated
 */
export function initializeDeviceSessionManager() {
  // Check initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      handleDeviceLogin(session.user.id);
    }
  });

  // Listen for auth state changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      // User just logged in - handle device session
      await handleDeviceLogin(session.user.id);
    } else if (event === 'SIGNED_OUT') {
      // User signed out - clear device session
      localStorage.removeItem(DEVICE_SESSION_KEY);
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      // Token refreshed - validate device session
      const deviceId = getOrCreateDeviceId();
      const isValid = await validateDeviceSession(session.user.id, deviceId);
      
      if (!isValid) {
        // Device session invalid - sign out
        await invalidateAllSessions();
      }
    }
  });

  // Periodically check if the session is still valid (every 30 seconds)
  setInterval(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const deviceId = getOrCreateDeviceId();
      const isValid = await validateDeviceSession(session.user.id, deviceId);
      
      if (!isValid) {
        // Device session invalid - sign out
        await invalidateAllSessions();
      }
    }
  }, 30000); // Check every 30 seconds
}

