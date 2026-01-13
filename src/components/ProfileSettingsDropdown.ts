import supabase from '../config/supabase';

// Track if button was just clicked to prevent document click from immediately closing dropdown
let buttonJustClicked = false;

/**
 * Initialize the profile settings dropdown functionality
 * This function sets up all event listeners for the dropdown
 */
export function setupProfileSettingsDropdown(): void {
  const profileSettingsBtn = document.getElementById('profileSettingsBtn');
  const profileDropdown = document.getElementById('profile-dropdown');
  const accountSettingsBtn = document.getElementById('account-settings-btn');
  const profileLogoutBtn = document.getElementById('profile-logout-btn');
  const profileSettingsModal = document.getElementById('profileSettingsModal');

  if (!profileSettingsBtn || !profileDropdown) {
    setTimeout(() => setupProfileSettingsDropdown(), 100);
    return;
  }

  // Setup button click handler
  const handleButtonClick = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set flag to prevent document click from immediately closing
    buttonJustClicked = true;
    setTimeout(() => {
      buttonJustClicked = false;
    }, 100);
    
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) {
      const isHidden = dropdown.classList.contains('hidden');
      if (isHidden) {
        // Show dropdown - remove hidden class and add dropdown-open class
        dropdown.classList.remove('hidden');
        dropdown.classList.remove('dropdown-close');
        dropdown.classList.add('dropdown-open');
      } else {
        // Hide dropdown - add hidden class and remove dropdown-open
        dropdown.classList.add('hidden');
        dropdown.classList.remove('dropdown-open');
        dropdown.classList.add('dropdown-close');
      }
    }
  };

  // Remove any existing listener and add new one
  // Clone the button to remove all event listeners, then re-add
  const newBtn = profileSettingsBtn.cloneNode(true);
  profileSettingsBtn.parentNode?.replaceChild(newBtn, profileSettingsBtn);
  const freshBtn = document.getElementById('profileSettingsBtn');
  if (freshBtn) {
    freshBtn.addEventListener('click', handleButtonClick);
  }

  // Setup document click handler to close dropdown when clicking outside
  const handleDocumentClick = (e: MouseEvent) => {
    // If button was just clicked, ignore this event
    if (buttonJustClicked) {
      return;
    }
    
    const btn = document.getElementById('profileSettingsBtn');
    const dropdown = document.getElementById('profile-dropdown');
    
    if (btn && dropdown) {
      const target = e.target as Node;
      // Check if click is on the button itself - if so, don't close (button handler will toggle)
      if (btn.contains(target)) {
        return;
      }
      // Only close if click is outside both button and dropdown
      if (!dropdown.contains(target)) {
        dropdown.classList.add('hidden');
        dropdown.classList.remove('dropdown-open');
        dropdown.classList.add('dropdown-close');
      }
    }
  };

  // Remove existing document listener and add new one
  document.removeEventListener('click', handleDocumentClick);
  document.addEventListener('click', handleDocumentClick);

  // Setup account settings button
  if (accountSettingsBtn) {
    accountSettingsBtn.addEventListener('click', async () => {
      if (profileSettingsModal) {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get user's role and name
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role, first_name, last_name')
            .eq('user_id', user.id)
            .single();

          const modalUserRole = document.getElementById('modalUserRole');
          const modalUserName = document.getElementById('modalUserName');
          const modalUserId = document.getElementById('modalUserId');
          
          if (modalUserRole) {
            if (roleData) {
              // Capitalize first letter of role
              const role = roleData.role.charAt(0).toUpperCase() + roleData.role.slice(1);
              modalUserRole.textContent = role;
            } else {
              modalUserRole.textContent = 'User';
            }
          }

          // Set user full name
          if (modalUserName) {
            if (roleData && roleData.first_name && roleData.last_name) {
              modalUserName.textContent = `${roleData.first_name} ${roleData.last_name}`;
            } else if (roleData && roleData.first_name) {
              modalUserName.textContent = roleData.first_name;
            } else if (user.user_metadata?.first_name && user.user_metadata?.last_name) {
              modalUserName.textContent = `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
            } else if (user.user_metadata?.first_name) {
              modalUserName.textContent = user.user_metadata.first_name;
            } else if (user.email) {
              modalUserName.textContent = user.email;
            } else {
              modalUserName.textContent = 'User';
            }
          }

          // Set user ID
          if (modalUserId) {
            modalUserId.textContent = user.id;
          }
        }
        
        profileSettingsModal.classList.remove('hidden');
        profileDropdown.classList.add('hidden');
      }
    });
  }

  // Setup logout button
  if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.hash = '/';
      setTimeout(() => {
        window.location.reload();
      }, 50);
    });
  }

}

/**
 * Re-initialize the dropdown (useful when button becomes visible dynamically)
 */
export function reinitializeProfileSettingsDropdown(): void {
  setupProfileSettingsDropdown();
}
