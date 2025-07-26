import { sendVerificationEmail } from '../config/emailjs';
import supabase from '../config/supabase';
import { showNotification } from '../pages/dashboard/index';

// Helper function to get current Philippine time
function getPhilippineTime(): Date {
  const now = new Date();
  // Get the timezone offset between UTC and Asia/Manila (UTC+8)
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const philippineTime = new Date(utcTime + (8 * 60 * 60 * 1000)); // Add 8 hours for UTC+8
  return philippineTime;
}

// Helper function to get Philippine date (date only)
function getPhilippineDate(): Date {
  const philippineTime = getPhilippineTime();
  philippineTime.setHours(0, 0, 0, 0);
  return philippineTime;
}

// Helper function to convert any date to Philippine time
function toPhilippineTime(date: Date): Date {
  // Get the timezone offset between UTC and Asia/Manila (UTC+8)
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  const philippineTime = new Date(utcTime + (8 * 60 * 60 * 1000)); // Add 8 hours for UTC+8
  return philippineTime;
}

export async function setupEventListeners() {
  // Fetch places from database with personnel assignments
  const { data: places, error: placesError } = await supabase
    .from('places_to_visit')
    .select('*')
    .order('name');

  if (placesError) {
    console.error('Error fetching places:', placesError);
    return;
  }

  // Get personnel assignments to determine availability
  let assignments: any[] = [];
  try {
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('place_personnel')
      .select('place_id');

    if (assignmentsError) {
      console.error('Error fetching personnel assignments:', assignmentsError);
      // Continue without assignments - places will be marked as unavailable
    } else {
      assignments = assignmentsData || [];
    }
  } catch (error) {
    console.error('Error accessing place_personnel table:', error);
    // Continue without assignments
  }

  // Create a set of places that have personnel assigned
  const availablePlaceIds = new Set(assignments.map(a => a.place_id));

  // Add availability information to places
  const placesWithAvailability = places?.map(place => ({
    ...place,
    is_available: availablePlaceIds.has(place.id)
  })) || [];

  // Count available places
  const availablePlacesCount = placesWithAvailability.filter(place => place.is_available).length;

  // Function to toggle multiple places checkboxes
  const placeToVisitSelect = document.getElementById('placeToVisit') as HTMLSelectElement;
  if (placeToVisitSelect) {
    // Clear existing options except the first one
    placeToVisitSelect.innerHTML = '<option value="">Select a place</option>';
    
    // Add places from database
    placesWithAvailability.forEach(place => {
      const option = document.createElement('option');
      option.value = place.id;
      if (place.is_available) {
        option.textContent = place.name;
      } else {
        option.textContent = `${place.name} (currently unavailable)`;
        option.disabled = true;
      }
      placeToVisitSelect.appendChild(option);
    });

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    const isLoggedIn = !!user;

    // Add "Multiple Places" option at the end
    const multipleOption = document.createElement('option');
    multipleOption.value = 'multiple';
    
    if (!isLoggedIn) {
      multipleOption.textContent = 'Multiple Places (login required)';
      multipleOption.disabled = true;
    } else if (availablePlacesCount < 2) {
      multipleOption.textContent = 'Multiple Places (requires at least 2 available places)';
      multipleOption.disabled = true;
    } else {
      multipleOption.textContent = 'Multiple Places';
    }
    placeToVisitSelect.appendChild(multipleOption);

    // Update help text
    const helpText = placeToVisitSelect.parentElement?.querySelector('p');
    if (helpText) {
      if (!isLoggedIn) {
        helpText.textContent = 'Multiple Places option requires login. Please login to access this feature.';
        helpText.className = 'mt-1 text-sm text-blue-600 dark:text-blue-400';
      } else if (availablePlacesCount < 2) {
        helpText.textContent = `Multiple Places option is disabled (only ${availablePlacesCount} available place)`;
        helpText.className = 'mt-1 text-sm text-orange-600 dark:text-orange-400';
      } else {
        helpText.textContent = `Multiple Places option requires at least 2 available places (${availablePlacesCount} available)`;
        helpText.className = 'mt-1 text-sm text-gray-500 dark:text-gray-400';
      }
    }

    placeToVisitSelect.addEventListener('change', function(e: Event) {
      const target = e.target as HTMLSelectElement;
      const multiplePlacesContainer = document.getElementById('multiplePlacesContainer');
      if (multiplePlacesContainer) {
        if (target.value === 'multiple' && isLoggedIn && availablePlacesCount >= 2) {
          multiplePlacesContainer.classList.remove('hidden');
          // Clear existing checkboxes
          multiplePlacesContainer.innerHTML = '';
          
          // Add checkboxes for each place
          placesWithAvailability.forEach(place => {
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'flex items-center';
            checkboxDiv.innerHTML = `
              <input type="checkbox" id="place_${place.id}" name="places" value="${place.id}" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" ${!place.is_available ? 'disabled' : ''}>
              <label for="place_${place.id}" class="ml-2 block text-sm ${place.is_available ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}">${place.name}${!place.is_available ? ' (currently unavailable)' : ''}</label>
            `;
            multiplePlacesContainer.appendChild(checkboxDiv);
          });
        } else {
          multiplePlacesContainer.classList.add('hidden');
        }
      }
    });
  }

  // Function to toggle other purpose text box
  const purposeSelect = document.getElementById('purpose') as HTMLSelectElement;
  if (purposeSelect) {
    purposeSelect.addEventListener('change', function(e: Event) {
      const target = e.target as HTMLSelectElement;
      const otherPurposeContainer = document.getElementById('otherPurposeContainer');
      if (otherPurposeContainer) {
        if (target.value === 'other') {
          otherPurposeContainer.classList.remove('hidden');
        } else {
          otherPurposeContainer.classList.add('hidden');
        }
      }
    });
  }

  // Function to validate word count and character limit
  const otherPurposeTextarea = document.getElementById('otherPurpose') as HTMLTextAreaElement;
  const wordCountDisplay = document.getElementById('wordCount');
  const charCountDisplay = document.getElementById('charCount');
  
  if (otherPurposeTextarea && wordCountDisplay && charCountDisplay) {
    const MAX_WORDS = 10;
    const MAX_CHARS = 50;

    const updateCounts = (text: string) => {
      // Split by spaces and count each segment (including empty ones)
      const segments = text.split(' ');
      const wordCount = segments.length;
      const charCount = text.length;
      
      // Update the displays
      wordCountDisplay.textContent = wordCount.toString();
      charCountDisplay.textContent = charCount.toString();
      
      // If over 10 words or 50 characters, truncate and update the textarea
      if (wordCount > MAX_WORDS || charCount > MAX_CHARS) {
        let truncatedText = text;
        
        // First truncate by character limit
        if (charCount > MAX_CHARS) {
          truncatedText = text.slice(0, MAX_CHARS);
        }
        
        // Then truncate by word limit
        const truncatedSegments = truncatedText.split(' ').slice(0, MAX_WORDS);
        otherPurposeTextarea.value = truncatedSegments.join(' ');
        
        // Update counts after truncation
        wordCountDisplay.textContent = truncatedSegments.length.toString();
        charCountDisplay.textContent = otherPurposeTextarea.value.length.toString();
      }
    };

    // Update on input
    otherPurposeTextarea.addEventListener('input', function(e: Event) {
      const target = e.target as HTMLTextAreaElement;
      updateCounts(target.value);
    });

    // Update on paste
    otherPurposeTextarea.addEventListener('paste', function(e: ClipboardEvent) {
      e.preventDefault();
      const pastedText = e.clipboardData?.getData('text') || '';
      const currentText = otherPurposeTextarea.value;
      const cursorPosition = otherPurposeTextarea.selectionStart || 0;
      
      // Combine the text and update
      const newText = currentText.slice(0, cursorPosition) + pastedText + currentText.slice(cursorPosition);
      updateCounts(newText);
      otherPurposeTextarea.value = newText;
    });

    // Initial count
    updateCounts(otherPurposeTextarea.value);
  }

  // Schedule modal open/close
  const scheduleNowBtn = document.getElementById('scheduleNowBtn');
  console.log('Setting up schedule button event listener. Button found:', !!scheduleNowBtn);
  if (scheduleNowBtn) {
    // Remove any existing click listeners to prevent duplicates
    const newBtn = scheduleNowBtn.cloneNode(true);
    scheduleNowBtn.parentNode?.replaceChild(newBtn, scheduleNowBtn);
    
    // Add the click listener to the new button
    newBtn.addEventListener('click', async function() {
      console.log('Schedule button clicked!');
      // Check if user is logged in and has visitor role
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user has visitor role
        try {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();
          
          if (roleData?.role !== 'visitor') {
            showNotification('Only visitors can schedule visits. Please contact an administrator if you need access.', 'error');
            return;
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          showNotification('Error checking user permissions. Please try again.', 'error');
          return;
        }
      }
      
      const modal = document.getElementById('scheduleModal');
      console.log('Opening modal. Modal found:', !!modal);
      if (modal) {
        modal.classList.remove('hidden');
        // Initialize date validation when modal opens
        initializeDateValidation();
      }
    });
  }

  // Handle clicking outside modal to close
  const scheduleModal = document.getElementById('scheduleModal');
  if (scheduleModal) {
    scheduleModal.addEventListener('click', function(e) {
      if (e.target === scheduleModal) {
        scheduleModal.classList.add('hidden');
        resetDateValidation();
      }
    });
  }

  // Handle ESC key to close modal
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById('scheduleModal');
      if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        resetDateValidation();
      }
    }
  });

  const closeScheduleModalBtn = document.getElementById('closeScheduleModalBtn');
  if (closeScheduleModalBtn) {
    closeScheduleModalBtn.addEventListener('click', function() {
      const modal = document.getElementById('scheduleModal');
      if (modal) {
        modal.classList.add('hidden');
        // Reset date validation when modal is closed
        resetDateValidation();
      }
    });
  }

  // Sign up modal open/close
  const closeSignUpModalBtn = document.getElementById('closeSignUpModalBtn');
  if (closeSignUpModalBtn) {
    closeSignUpModalBtn.addEventListener('click', function() {
      const modal = document.getElementById('signUpModal');
      if (modal) {
        modal.classList.add('hidden');
      }
    });
  }

  // Email verification functionality
  const scheduleEmail = document.getElementById('scheduleEmail') as HTMLInputElement;
  const sendVerificationCode = document.getElementById('sendVerificationCode') as HTMLButtonElement;
  const verificationCodeContainer = document.getElementById('verificationCodeContainer');
  const verificationCode = document.getElementById('verificationCode') as HTMLInputElement;
  const verifyCode = document.getElementById('verifyCode');
  const verificationStatus = document.getElementById('verificationStatus');
  const emailValidationStatus = document.getElementById('emailValidationStatus');
  const scheduleSubmitBtn = document.getElementById('scheduleSubmitBtn') as HTMLButtonElement;
  const scheduleForm = document.getElementById('scheduleForm') as HTMLFormElement;

  // Set initial state of send code button
  if (sendVerificationCode) {
    sendVerificationCode.disabled = true;
    sendVerificationCode.classList.add('opacity-50', 'cursor-not-allowed');
  }

  let isEmailVerified = false;
  let verificationCodeSent = false;
  let countdownInterval: number | null = null;
  let codeExpirationTimeout: number | null = null;
  let currentCode: string | null = null;
  let emailCheckTimeout: number | null = null;

  // Function to generate a random 6-digit code
  function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Function to start countdown timer
  function startCountdown() {
    let timeLeft = 60;
    sendVerificationCode.disabled = true;
    
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }

    countdownInterval = window.setInterval(() => {
      timeLeft--;
      sendVerificationCode.textContent = `Resend (${timeLeft}s)`;
      
      if (timeLeft <= 0) {
        clearInterval(countdownInterval!);
        sendVerificationCode.disabled = false;
        sendVerificationCode.textContent = 'Send Code';
      }
    }, 1000);
  }

  // Function to clear all timers
  function clearTimers() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    if (codeExpirationTimeout) {
      clearTimeout(codeExpirationTimeout);
      codeExpirationTimeout = null;
    }
    if (emailCheckTimeout) {
      clearTimeout(emailCheckTimeout);
      emailCheckTimeout = null;
    }
  }

  // Function to check if email is Gmail
  function isGmailEmail(email: string): boolean {
    return email.toLowerCase().endsWith('@gmail.com');
  }

  // Function to validate email format
  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Function to check if all required fields are filled
  function areAllFieldsFilled(): boolean {
    const requiredInputs = scheduleForm.querySelectorAll('input[required], select[required]');
    let allFilled = true;
    requiredInputs.forEach(input => {
      if (!(input as HTMLInputElement).value) {
        allFilled = false;
      }
    });
    return allFilled;
  }

  // Function to update submit button state
  function updateSubmitButtonState() {
    if (scheduleSubmitBtn) {
      const isLoggedIn = scheduleEmail.readOnly;
      scheduleSubmitBtn.disabled = !(areAllFieldsFilled() && (isLoggedIn || isEmailVerified));
    }
  }

  // Add input event listeners to all form fields
  scheduleForm?.querySelectorAll('input, select').forEach(field => {
    field.addEventListener('input', updateSubmitButtonState);
  });

  // Function to disable verification inputs
  function disableVerificationInputs() {
    if (verificationCode) {
      (verificationCode as HTMLInputElement).disabled = true;
      verificationCode.classList.add('opacity-50', 'cursor-not-allowed');
    }
    if (verifyCode) {
      (verifyCode as HTMLButtonElement).disabled = true;
      verifyCode.classList.add('opacity-50', 'cursor-not-allowed');
    }
  }

  // Function to enable verification inputs
  function enableVerificationInputs() {
    if (verificationCode) {
      (verificationCode as HTMLInputElement).disabled = false;
      verificationCode.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    if (verifyCode) {
      (verifyCode as HTMLButtonElement).disabled = false;
      verifyCode.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }

  // Function to check if email is already registered
  async function isEmailRegistered(email: string): Promise<boolean> {
    try {
      // Use the database function to check if email exists
      const { data, error } = await supabase.rpc('is_email_registered', {
        p_email: email
      });
      
      if (error) {
        console.error('Error checking email registration:', error);
        return false;
      }
      
      return data || false;
    } catch (error) {
      console.error('Error in isEmailRegistered:', error);
      return false;
    }
  }

  // Add input event listener for email validation
  scheduleEmail?.addEventListener('input', async () => {
    // Skip validation if email is readonly (user is logged in) or if email is already verified
    if (scheduleEmail.readOnly || scheduleEmail.disabled) {
      return;
    }

    const email = scheduleEmail.value;
    
    // Clear any existing timeout
    if (emailCheckTimeout) {
      clearTimeout(emailCheckTimeout);
    }

    // Reset verification state immediately
    isEmailVerified = false;
    verificationCodeSent = false;
    verificationCodeContainer?.classList.add('hidden');
    verificationCode.value = '';
    clearTimers();
    if (sendVerificationCode) {
      sendVerificationCode.textContent = 'Send Code';
    }
    currentCode = null;
    enableVerificationInputs();
    updateSubmitButtonState();

    // Clear previous status messages
    if (emailValidationStatus) {
      emailValidationStatus.textContent = '';
      emailValidationStatus.className = 'mt-1 text-sm';
    }

    // Show immediate feedback based on email format
    if (!email) {
      if (sendVerificationCode) {
        sendVerificationCode.disabled = true;
        sendVerificationCode.classList.add('opacity-50', 'cursor-not-allowed');
      }
      if (emailValidationStatus) {
        emailValidationStatus.textContent = 'Please enter an email address';
        emailValidationStatus.className = 'mt-1 text-sm text-gray-500';
      }
      return;
    }

    // Check email format first
    if (!isValidEmail(email)) {
      if (sendVerificationCode) {
        sendVerificationCode.disabled = true;
        sendVerificationCode.classList.add('opacity-50', 'cursor-not-allowed');
      }
      if (emailValidationStatus) {
        emailValidationStatus.textContent = 'Please enter a valid email address';
        emailValidationStatus.className = 'mt-1 text-sm text-red-600';
      }
      return;
    }

    // Check Gmail requirement
    if (!isGmailEmail(email)) {
      if (sendVerificationCode) {
        sendVerificationCode.disabled = true;
        sendVerificationCode.classList.add('opacity-50', 'cursor-not-allowed');
      }
      if (emailValidationStatus) {
        emailValidationStatus.textContent = 'Only Gmail addresses are allowed';
        emailValidationStatus.className = 'mt-1 text-sm text-red-600';
      }
      return;
    }

    // Show checking status
    if (emailValidationStatus) {
      emailValidationStatus.textContent = 'Checking email availability...';
      emailValidationStatus.className = 'mt-1 text-sm text-blue-600';
    }

    // Debounce the email registration check with shorter delay for more real-time feedback
    emailCheckTimeout = window.setTimeout(async () => {
      if (sendVerificationCode && isGmailEmail(email)) {
        // Check if email is already registered
        const isRegistered = await isEmailRegistered(email);
        if (isRegistered) {
          sendVerificationCode.disabled = true;
          sendVerificationCode.classList.add('opacity-50', 'cursor-not-allowed');
          if (emailValidationStatus) {
            emailValidationStatus.textContent = 'This email is already registered. Please login or use another Gmail account.';
            emailValidationStatus.className = 'mt-1 text-sm text-red-600';
          }
        } else {
          sendVerificationCode.disabled = false;
          sendVerificationCode.classList.remove('opacity-50', 'cursor-not-allowed');
          if (emailValidationStatus) {
            emailValidationStatus.textContent = '✓ Email is available for verification';
            emailValidationStatus.className = 'mt-1 text-sm text-green-600';
          }
        }
      }
    }, 300); // Reduced from 500ms to 300ms for more real-time feedback
  });

  // Send verification code
  sendVerificationCode?.addEventListener('click', async () => {
    // Prevent action if button is disabled or email field is disabled
    if (sendVerificationCode.disabled || scheduleEmail.disabled) {
      return;
    }

    const email = scheduleEmail.value.trim();
    if (!email) {
      if (emailValidationStatus) {
        emailValidationStatus.textContent = 'Please enter an email address';
        emailValidationStatus.className = 'mt-1 text-sm text-red-600';
      }
      return;
    }

    if (!isValidEmail(email)) {
      if (emailValidationStatus) {
        emailValidationStatus.textContent = 'Please enter a valid email address';
        emailValidationStatus.className = 'mt-1 text-sm text-red-600';
      }
      return;
    }

    if (!isGmailEmail(email)) {
      if (emailValidationStatus) {
        emailValidationStatus.textContent = 'Only Gmail addresses are allowed';
        emailValidationStatus.className = 'mt-1 text-sm text-red-600';
      }
      return;
    }

    // Double-check if email is registered before sending
    const isRegistered = await isEmailRegistered(email);
    if (isRegistered) {
      if (emailValidationStatus) {
        emailValidationStatus.textContent = 'This email is already registered. Please login or use another Gmail account.';
        emailValidationStatus.className = 'mt-1 text-sm text-red-600';
      }
      sendVerificationCode.disabled = true;
      sendVerificationCode.classList.add('opacity-50', 'cursor-not-allowed');
      return;
    }

    // Generate new code
    currentCode = generateVerificationCode();
    
    // Disable send button and show loading state
    sendVerificationCode.disabled = true;
    sendVerificationCode.textContent = 'Sending...';
    
    // Show sending status
    if (emailValidationStatus) {
      emailValidationStatus.textContent = 'Sending verification code...';
      emailValidationStatus.className = 'mt-1 text-sm text-blue-600';
    }
    
    // Send verification email to the current email from input field
    const emailSent = await sendVerificationEmail(email, currentCode);
    
    if (emailSent) {
      verificationCodeContainer?.classList.remove('hidden');
      if (verificationStatus) {
        verificationStatus.textContent = 'Verification code sent! Please check your email.';
        verificationStatus.className = 'mt-1 text-sm text-green-600';
      }
      verificationCodeSent = true;

      // Reset verification state
      isEmailVerified = false;
      enableVerificationInputs();
      verificationCode.value = '';

      // Start countdown for resend
      startCountdown();

      // Set code expiration after 5 minutes
      if (codeExpirationTimeout) {
        clearTimeout(codeExpirationTimeout);
      }
      codeExpirationTimeout = window.setTimeout(() => {
        currentCode = null;
        if (verificationStatus) {
          verificationStatus.textContent = 'Verification code has expired. Please request a new one.';
          verificationStatus.className = 'mt-1 text-sm text-red-600';
        }
        isEmailVerified = false;
        updateSubmitButtonState();
      }, 5 * 60 * 1000); // 5 minutes
    } else {
      if (emailValidationStatus) {
        emailValidationStatus.textContent = 'Failed to send verification code. Please try again.';
        emailValidationStatus.className = 'mt-1 text-sm text-red-600';
      }
      sendVerificationCode.disabled = false;
      sendVerificationCode.textContent = 'Send Code';
    }
  });

  // Add focus and blur events for immediate validation
  scheduleEmail?.addEventListener('blur', async () => {
    if (scheduleEmail.readOnly || scheduleEmail.disabled) {
      return;
    }

    const email = scheduleEmail.value;
    if (email && isGmailEmail(email)) {
      // Check immediately when user leaves the field
      const isRegistered = await isEmailRegistered(email);
      if (isRegistered) {
        sendVerificationCode.disabled = true;
        sendVerificationCode.classList.add('opacity-50', 'cursor-not-allowed');
        if (emailValidationStatus) {
          emailValidationStatus.textContent = 'This email is already registered. Please login or use another Gmail account.';
          emailValidationStatus.className = 'mt-1 text-sm text-red-600';
        }
      } else {
        sendVerificationCode.disabled = false;
        sendVerificationCode.classList.remove('opacity-50', 'cursor-not-allowed');
        if (emailValidationStatus) {
          emailValidationStatus.textContent = '✓ Email is available for verification';
          emailValidationStatus.className = 'mt-1 text-sm text-green-600';
        }
      }
    }
  });

  // Verify code
  verifyCode?.addEventListener('click', () => {
    const code = verificationCode.value;
    if (!code) {
      if (verificationStatus) {
        verificationStatus.textContent = 'Please enter the verification code';
        verificationStatus.className = 'mt-1 text-sm text-red-600';
      }
      return;
    }

    if (!currentCode) {
      if (verificationStatus) {
        verificationStatus.textContent = 'Verification code has expired. Please request a new one.';
        verificationStatus.className = 'mt-1 text-sm text-red-600';
      }
      return;
    }

    if (code === currentCode) {
      isEmailVerified = true;
      if (verificationStatus) {
        verificationStatus.textContent = 'Email verified successfully!';
        verificationStatus.className = 'mt-1 text-sm text-green-600';
      }
      clearTimers();
      updateSubmitButtonState();
      
      // Disable verification inputs after successful verification
      disableVerificationInputs();
      
      // Disable email input field and send code button to prevent changes
      if (scheduleEmail) {
        scheduleEmail.disabled = true;
        scheduleEmail.classList.add('opacity-50', 'cursor-not-allowed');
      }
      if (sendVerificationCode) {
        sendVerificationCode.disabled = true;
        sendVerificationCode.classList.add('opacity-50', 'cursor-not-allowed');
        sendVerificationCode.textContent = 'Email Verified';
      }
      
      // Update validation status to show email is locked
      if (emailValidationStatus) {
        emailValidationStatus.textContent = '✓ Email verified and locked';
        emailValidationStatus.className = 'mt-1 text-sm text-green-600';
      }
      
      // Invalidate the code after successful verification
      currentCode = null;
    } else {
      if (verificationStatus) {
        verificationStatus.textContent = 'Invalid verification code. Please try again.';
        verificationStatus.className = 'mt-1 text-sm text-red-600';
      }
    }
  });

  // Reset verification when email changes
  scheduleEmail?.addEventListener('input', () => {
    // Skip reset if email is readonly (user is logged in)
    if (scheduleEmail.readOnly) {
      return;
    }

    isEmailVerified = false;
    verificationCodeSent = false;
    verificationCodeContainer?.classList.add('hidden');
    verificationCode.value = '';
    if (verificationStatus) {
      verificationStatus.textContent = '';
    }
    if (emailValidationStatus) {
      emailValidationStatus.textContent = '';
      emailValidationStatus.className = 'mt-1 text-sm';
    }
    clearTimers();
    
    // Re-enable email input field and send code button
    if (scheduleEmail) {
      scheduleEmail.disabled = false;
      scheduleEmail.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    if (sendVerificationCode) {
      sendVerificationCode.disabled = false;
      sendVerificationCode.classList.remove('opacity-50', 'cursor-not-allowed');
      sendVerificationCode.textContent = 'Send Code';
    }
    
    currentCode = null;
    enableVerificationInputs();
    updateSubmitButtonState();
  });

  // Phone number validation
  const phoneInput = document.getElementById('phone') as HTMLInputElement;
  
  if (phoneInput) {
    // Only allow numbers
    phoneInput.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement;
      input.value = input.value.replace(/[^0-9]/g, '');
      
      // Validate if it starts with 9 (Philippine mobile number requirement)
      if (input.value.length > 0 && input.value[0] !== '9') {
        input.setCustomValidity('Philippine mobile numbers must start with 9');
      } else {
        input.setCustomValidity('');
      }
      
      updateSubmitButtonState();
    });

    // Validate on blur
    phoneInput.addEventListener('blur', () => {
      if (phoneInput.value.length > 0 && phoneInput.value.length !== 10) {
        phoneInput.setCustomValidity('Phone number must be 10 digits');
      } else if (phoneInput.value.length > 0 && phoneInput.value[0] !== '9') {
        phoneInput.setCustomValidity('Philippine mobile numbers must start with 9');
      } else {
        phoneInput.setCustomValidity('');
      }
    });
  }

  // Handle form submission
  if (scheduleForm) {
    let isScheduling = false;
    scheduleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isScheduling) return;
      isScheduling = true;
      // Show loading state
      if (scheduleSubmitBtn) {
        scheduleSubmitBtn.disabled = true;
        scheduleSubmitBtn.textContent = 'Scheduling...';
      }
      try {
        // Get form data
        const firstName = (document.getElementById('scheduleFirstName') as HTMLInputElement).value;
        const lastName = (document.getElementById('scheduleLastName') as HTMLInputElement).value;
        const email = scheduleEmail.value;
        const phone = phoneInput.value;
        const visitDate = (document.getElementById('visitDate') as HTMLInputElement).value;
        const placeToVisit = placeToVisitSelect.value;
        const purpose = purposeSelect.value;
        const otherPurpose = otherPurposeTextarea?.value || '';

        // Validate visit date using Philippine time from database
        let philippineToday: Date;
        try {
          const { data: philippineDateData, error } = await supabase.rpc('get_philippine_date');
          if (error) {
            console.error('Error getting Philippine date from DB:', error);
            philippineToday = getPhilippineDate();
          } else {
            philippineToday = new Date(philippineDateData);
          }
        } catch (error) {
          console.error('Exception getting Philippine date from DB:', error);
          philippineToday = getPhilippineDate();
        }
        
        // Normalize current date to start of day for comparison
        philippineToday.setHours(0, 0, 0, 0);
        
        const selectedDate = new Date(visitDate);
        selectedDate.setHours(0, 0, 0, 0);
        const philippineSelectedDate = toPhilippineTime(selectedDate);
        philippineSelectedDate.setHours(0, 0, 0, 0);
        
        // Debug logging for form submission
        console.log('Form Submission Date Validation Debug:', {
          visitDate: visitDate,
          selectedDate: selectedDate.toISOString(),
          philippineSelectedDate: philippineSelectedDate.toISOString(),
          philippineToday: philippineToday.toISOString(),
          selectedTime: philippineSelectedDate.getTime(),
          currentTime: philippineToday.getTime(),
          isToday: philippineSelectedDate.getTime() === philippineToday.getTime(),
          isPast: philippineSelectedDate.getTime() < philippineToday.getTime()
        });
        
        if (philippineSelectedDate.getTime() < philippineToday.getTime()) {
          throw new Error(`Cannot schedule visits for past dates. Current Philippine date is ${philippineToday.toLocaleDateString()}. Please select today or a future date.`);
        }

        // Check if date is more than 1 month in the future
        const philippineMaxDate = new Date(philippineToday);
        philippineMaxDate.setMonth(philippineMaxDate.getMonth() + 1);
        
        if (philippineSelectedDate.getTime() > philippineMaxDate.getTime()) {
          throw new Error(`Cannot schedule visits more than 1 month in advance. Maximum allowed date is ${philippineMaxDate.toLocaleDateString()}.`);
        }

        // Additional validation: Check if the date input has validation errors
        const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
        if (visitDateInput && visitDateInput.classList.contains('border-red-500')) {
          throw new Error('Please select a valid date before submitting the form.');
        }

        // Get current user if logged in
        const { data: { user } } = await supabase.auth.getUser();
        const visitorUserId = user?.id || null;

        // If user is logged in, check if they have visitor role
        if (user) {
          try {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
              .single();
            
            if (roleData?.role !== 'visitor') {
              throw new Error('Only visitors can schedule visits. Please contact an administrator if you need access.');
            }
          } catch (error) {
            if (error instanceof Error) {
              throw error;
            } else {
              throw new Error('Error checking user permissions. Please try again.');
            }
          }
        }

        // Validate place selection
        if (placeToVisit === 'multiple') {
          // Check if multiple places option is available
          if (availablePlacesCount < 2) {
            throw new Error('Multiple places option is not available. Please select a single place.');
          }
          
          const selectedPlaces = Array.from(document.querySelectorAll('input[name="places"]:checked'))
            .map((checkbox) => (checkbox as HTMLInputElement).value);
          
          if (selectedPlaces.length === 0) {
            throw new Error('Please select at least one place to visit');
          }

          let scheduleError = null;
          let visitData = null;
          if (placeToVisit === 'multiple') {
            // Check if multiple places option is available
            if (availablePlacesCount < 2) {
              throw new Error('Multiple places option is not available. Please select a single place.');
            }
            const selectedPlaces = Array.from(document.querySelectorAll('input[name="places"]:checked'))
              .map((checkbox) => (checkbox as HTMLInputElement).value);
            if (selectedPlaces.length === 0) {
              throw new Error('Please select at least one place to visit');
            }
            const result = await supabase.rpc('schedule_visit', {
              p_visitor_first_name: firstName,
              p_visitor_last_name: lastName,
              p_visitor_email: email,
              p_visitor_phone: phone,
              p_place_ids: selectedPlaces,
              p_visit_date: visitDate,
              p_purpose: purpose === 'other' ? otherPurpose : purpose,
              p_other_purpose: purpose === 'other' ? otherPurpose : null,
              p_visitor_user_id: visitorUserId
            });
            visitData = result.data;
            scheduleError = result.error;
          } else {
            const result = await supabase.rpc('schedule_visit', {
              p_visitor_first_name: firstName,
              p_visitor_last_name: lastName,
              p_visitor_email: email,
              p_visitor_phone: phone,
              p_place_ids: [placeToVisit],
              p_visit_date: visitDate,
              p_purpose: purpose === 'other' ? otherPurpose : purpose,
              p_other_purpose: purpose === 'other' ? otherPurpose : null,
              p_visitor_user_id: visitorUserId
            });
            visitData = result.data;
            scheduleError = result.error;
          }
          if (scheduleError) {
            if (scheduleError.message.includes('Maximum of 2 visits per week allowed per user account')) {
              throw new Error('Weekly visit limit exceeded. You can only schedule 2 visits per week per user account.');
            } else if (scheduleError.message.includes('Maximum of 2 visits per week allowed per email address')) {
              throw new Error('Weekly visit limit exceeded. You can only schedule 2 visits per week per email address.');
            } else if (scheduleError.message.includes('Cannot schedule visits for past dates')) {
              throw new Error('Cannot schedule visits for past dates. Please select today or a future date.');
            } else if (scheduleError.message.includes('Cannot schedule visits more than 1 month in advance')) {
              throw new Error('Cannot schedule visits more than 1 month in advance. Please select a date within the next month.');
            } else if (scheduleError.message.includes('Only users with visitor role can schedule visits')) {
              throw new Error('Only visitors can schedule visits. Please contact an administrator if you need access.');
            } else if (scheduleError.message.includes('You already have a scheduled visit on this date.')) {
              // Only show inline error, no notification
              isScheduling = false;
              if (scheduleSubmitBtn) {
                scheduleSubmitBtn.disabled = false;
                scheduleSubmitBtn.textContent = 'Schedule Visit';
              }
              return;
            } else {
              throw new Error(`Scheduling failed: ${scheduleError.message}`);
            }
          }
          // Only show success if there was NO error
          showNotification('Visit scheduled successfully! You will receive a confirmation email shortly.', 'success');
          const modal = document.getElementById('scheduleModal');
          if (modal) {
            modal.classList.add('hidden');
          }
          scheduleForm.reset();
          resetDateValidation();
          isEmailVerified = false;
          verificationCodeSent = false;
          verificationCodeContainer?.classList.add('hidden');
          verificationCode.value = '';
          if (verificationStatus) verificationStatus.textContent = '';
          if (emailValidationStatus) {
            emailValidationStatus.textContent = '';
            emailValidationStatus.className = 'mt-1 text-sm';
          }
          clearTimers();
          if (sendVerificationCode) sendVerificationCode.textContent = 'Send Code';
          if (scheduleEmail) {
            scheduleEmail.disabled = false;
            scheduleEmail.classList.remove('opacity-50', 'cursor-not-allowed');
          }
          if (sendVerificationCode) {
            sendVerificationCode.disabled = false;
            sendVerificationCode.classList.remove('opacity-50', 'cursor-not-allowed');
          }
          currentCode = null;
          enableVerificationInputs();
          isScheduling = false;
          // Hide error modal if it exists (fix for stale error modal)
          const errorModal = document.getElementById('scheduleErrorConfirmationModal');
          if (errorModal) {
            errorModal.classList.add('hidden');
          }
          setTimeout(() => { window.location.reload(); }, 1000);
          return; // <--- Ensure we return here so catch is not triggered after success
        } else {
          // Schedule visit for single place
          const { data: visitData, error: scheduleError } = await supabase.rpc('schedule_visit', {
            p_visitor_first_name: firstName,
            p_visitor_last_name: lastName,
            p_visitor_email: email,
            p_visitor_phone: phone,
            p_place_ids: [placeToVisit],
            p_visit_date: visitDate,
            p_purpose: purpose === 'other' ? otherPurpose : purpose,
            p_other_purpose: purpose === 'other' ? otherPurpose : null,
            p_visitor_user_id: visitorUserId
          });

          if (scheduleError) {
            // Handle specific database validation errors
            if (scheduleError.message.includes('Maximum of 2 visits per week allowed per user account')) {
              throw new Error('Weekly visit limit exceeded. You can only schedule 2 visits per week per user account.');
            } else if (scheduleError.message.includes('Maximum of 2 visits per week allowed per email address')) {
              throw new Error('Weekly visit limit exceeded. You can only schedule 2 visits per week per email address.');
            } else if (scheduleError.message.includes('Cannot schedule visits for past dates')) {
              throw new Error('Cannot schedule visits for past dates. Please select today or a future date.');
            } else if (scheduleError.message.includes('Cannot schedule visits more than 1 month in advance')) {
              throw new Error('Cannot schedule visits more than 1 month in advance. Please select a date within the next month.');
            } else if (scheduleError.message.includes('Only users with visitor role can schedule visits')) {
              throw new Error('Only visitors can schedule visits. Please contact an administrator if you need access.');
            } else {
              throw new Error(`Scheduling failed: ${scheduleError.message}`);
            }
          }
        }
        // Show success message only if no error
        showNotification('Visit scheduled successfully! You will receive a confirmation email shortly.', 'success');
        // Close modal and reset form
        const modal = document.getElementById('scheduleModal');
        if (modal) {
          modal.classList.add('hidden');
        }
        scheduleForm.reset();
        resetDateValidation();
        isEmailVerified = false;
        verificationCodeSent = false;
        verificationCodeContainer?.classList.add('hidden');
        verificationCode.value = '';
        if (verificationStatus) verificationStatus.textContent = '';
        if (emailValidationStatus) {
          emailValidationStatus.textContent = '';
          emailValidationStatus.className = 'mt-1 text-sm';
        }
        clearTimers();
        if (sendVerificationCode) sendVerificationCode.textContent = 'Send Code';
        if (scheduleEmail) {
          scheduleEmail.disabled = false;
          scheduleEmail.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        if (sendVerificationCode) {
          sendVerificationCode.disabled = false;
          sendVerificationCode.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        currentCode = null;
        enableVerificationInputs();
        isScheduling = false;
        // Hide error modal if it exists (fix for stale error modal)
        const errorModal = document.getElementById('scheduleErrorConfirmationModal');
        if (errorModal) {
          errorModal.classList.add('hidden');
        }
        setTimeout(() => { window.location.reload(); }, 1000);
        return; // <--- Ensure we return here so catch is not triggered after success
      } catch (error: any) {
        if (error && (error.message === '__SILENT_SUCCESS__' || error === '__SILENT_SUCCESS__')) return;
        console.error('Error scheduling visit:', error);
        // Only show inline error, no notification
        // Close modal and reset form after error to prevent error loop
        const modal = document.getElementById('scheduleModal');
        if (modal) {
          modal.classList.add('hidden');
        }
        scheduleForm.reset();
        resetDateValidation();
        // Set visitDate input to current Philippine date after reset (on error)
        const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
        if (visitDateInput) {
          const philippineToday = getPhilippineDate();
          visitDateInput.value = philippineToday.toISOString().split('T')[0];
          if (typeof (window as any).initializeDateValidation === 'function') {
            (window as any).initializeDateValidation();
          }
        }
        isEmailVerified = false;
        verificationCodeSent = false;
        verificationCodeContainer?.classList.add('hidden');
        verificationCode.value = '';
        if (verificationStatus) verificationStatus.textContent = '';
        if (emailValidationStatus) {
          emailValidationStatus.textContent = '';
          emailValidationStatus.className = 'mt-1 text-sm';
        }
        clearTimers();
        if (sendVerificationCode) sendVerificationCode.textContent = 'Send Code';
        if (scheduleEmail) {
          scheduleEmail.disabled = false;
          scheduleEmail.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        if (sendVerificationCode) {
          sendVerificationCode.disabled = false;
          sendVerificationCode.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        currentCode = null;
        enableVerificationInputs();
        // (REMOVED: do not reload page after error)
        return;
      } finally {
        // Only reset button state if still scheduling (not after a successful schedule)
        if (isScheduling && scheduleSubmitBtn) {
          scheduleSubmitBtn.disabled = false;
          scheduleSubmitBtn.textContent = 'Schedule Visit';
          isScheduling = false;
        }
      }
    });
  }

  // Function to initialize date validation for the scheduling modal
  (window as any).initializeDateValidation = async function initializeDateValidation() {
    const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
    if (!visitDateInput) return;

    // Get current Philippine time from database (real-time)
    let philippineToday: Date;
    let philippineMaxDate: Date;
    
    try {
      const { data: philippineDateData, error } = await supabase.rpc('get_philippine_date');
      if (error) {
        console.error('Error getting Philippine date from DB:', error);
        // Fallback to local calculation
        philippineToday = getPhilippineDate();
      } else {
        philippineToday = new Date(philippineDateData);
      }
    } catch (error) {
      console.error('Exception getting Philippine date from DB:', error);
      // Fallback to local calculation
      philippineToday = getPhilippineDate();
    }
    
    philippineMaxDate = new Date(philippineToday);
    philippineMaxDate.setMonth(philippineMaxDate.getMonth() + 1);

    // Set min and max dates
    visitDateInput.min = philippineToday.toISOString().split('T')[0];
    visitDateInput.max = philippineMaxDate.toISOString().split('T')[0];

    // Set default value to today if not already set
    if (!visitDateInput.value) {
      visitDateInput.value = philippineToday.toISOString().split('T')[0];
    }

    // Create or get the date validation status element
    let dateValidationStatus = document.getElementById('dateValidationStatus');
    if (!dateValidationStatus) {
      dateValidationStatus = document.createElement('div');
      dateValidationStatus.id = 'dateValidationStatus';
      dateValidationStatus.className = 'mt-1 text-sm';
      visitDateInput.parentNode?.insertBefore(dateValidationStatus, visitDateInput.nextSibling);
    }

    // Function to validate date and update status
    async function validateDate() {
      const selectedDate = new Date(visitDateInput.value);
      selectedDate.setHours(0, 0, 0, 0);
      const philippineSelectedDate = toPhilippineTime(selectedDate);
      philippineSelectedDate.setHours(0, 0, 0, 0);

      // Get current Philippine date from database for real-time validation
      let currentPhilippineDate: Date;
      try {
        const { data: currentDateData, error } = await supabase.rpc('get_philippine_date');
        if (error) {
          console.error('Error getting current Philippine date from DB:', error);
          currentPhilippineDate = getPhilippineDate();
        } else {
          currentPhilippineDate = new Date(currentDateData);
        }
      } catch (error) {
        console.error('Exception getting Philippine date from DB:', error);
        currentPhilippineDate = getPhilippineDate();
      }

      // Normalize current date to start of day for comparison
      currentPhilippineDate.setHours(0, 0, 0, 0);

      // Debug logging
      console.log('Modal Date Validation Debug:', {
        selectedDate: visitDateInput.value,
        selectedDateObj: selectedDate.toISOString(),
        philippineSelectedDate: philippineSelectedDate.toISOString(),
        currentPhilippineDate: currentPhilippineDate.toISOString(),
        selectedTime: philippineSelectedDate.getTime(),
        currentTime: currentPhilippineDate.getTime(),
        isToday: philippineSelectedDate.getTime() === currentPhilippineDate.getTime(),
        isPast: philippineSelectedDate.getTime() < currentPhilippineDate.getTime()
      });

      // Clear previous validation
      visitDateInput.classList.remove('border-red-500', 'border-green-500', 'border-yellow-500', 'focus:border-red-500', 'focus:border-green-500', 'focus:border-yellow-500');
      if (dateValidationStatus) dateValidationStatus.className = 'mt-1 text-sm';

      // Check if date is in the past
      if (philippineSelectedDate.getTime() < currentPhilippineDate.getTime()) {
        visitDateInput.classList.add('border-red-500', 'focus:border-red-500');
        if (dateValidationStatus) {
          dateValidationStatus.textContent = `❌ Cannot schedule for past dates. Current Philippine date is ${currentPhilippineDate.toLocaleDateString()}.`;
          dateValidationStatus.className = 'mt-1 text-sm text-red-600 font-medium';
        }
        return false;
      }

      // Check if date is more than 1 month in the future
      if (philippineSelectedDate.getTime() > philippineMaxDate.getTime()) {
        visitDateInput.classList.add('border-red-500', 'focus:border-red-500');
        if (dateValidationStatus) {
          dateValidationStatus.textContent = `❌ Cannot schedule more than 1 month in advance. Maximum allowed date is ${philippineMaxDate.toLocaleDateString()}.`;
          dateValidationStatus.className = 'mt-1 text-sm text-red-600 font-medium';
        }
        return false;
      }

      // LIVE CHECK: Query for existing scheduled visit for this user/email and date
      let userEmail = '';
      let userId = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
          userEmail = user.email || '';
        } else {
          const emailInput = document.getElementById('scheduleEmail') as HTMLInputElement;
          userEmail = emailInput?.value || '';
        }
      } catch (e) {
        // fallback to email input
        const emailInput = document.getElementById('scheduleEmail') as HTMLInputElement;
        userEmail = emailInput?.value || '';
      }
      if (userEmail && visitDateInput.value) {
        // Query for existing visit for this user/email and date
        let { data: existingVisits, error: checkError } = await supabase
          .from('scheduled_visits')
          .select('id')
          .or(`visitor_email.eq.${userEmail},visitor_user_id.eq.${userId}`)
          .eq('visit_date', visitDateInput.value)
          .in('status', ['pending', 'completed']);
        if (checkError) {
          console.error('Error checking for existing scheduled visit:', checkError);
        } else if (existingVisits && existingVisits.length > 0) {
          visitDateInput.classList.add('border-red-500', 'focus:border-red-500');
          if (dateValidationStatus) {
            dateValidationStatus.textContent = `❌ You already have a scheduled visit on this date.`;
            dateValidationStatus.className = 'mt-1 text-sm text-red-600 font-medium';
          }
          if (scheduleSubmitBtn) scheduleSubmitBtn.disabled = true;
          return false;
        } else {
          // If no error, re-enable the button (unless another validation disables it)
          if (scheduleSubmitBtn) scheduleSubmitBtn.disabled = false;
        }
      }

      // Check if date is today
      if (philippineSelectedDate.getTime() === currentPhilippineDate.getTime()) {
        visitDateInput.classList.add('border-yellow-500', 'focus:border-yellow-500');
        if (dateValidationStatus) {
          dateValidationStatus.textContent = `⚠️ Scheduling for today (${currentPhilippineDate.toLocaleDateString()}). Please ensure you can visit today.`;
          dateValidationStatus.className = 'mt-1 text-sm text-yellow-600 font-medium';
        }
        return true;
      }

      // Check if date is tomorrow
      const philippineTomorrow = new Date(currentPhilippineDate);
      philippineTomorrow.setDate(philippineTomorrow.getDate() + 1);
      if (philippineSelectedDate.getTime() === philippineTomorrow.getTime()) {
        visitDateInput.classList.add('border-green-500', 'focus:border-green-500');
        if (dateValidationStatus) {
          dateValidationStatus.textContent = `✅ Scheduling for tomorrow (${philippineTomorrow.toLocaleDateString()}).`;
          dateValidationStatus.className = 'mt-1 text-sm text-green-600 font-medium';
        }
        return true;
      }

      // Valid future date
      visitDateInput.classList.add('border-green-500', 'focus:border-green-500');
      if (dateValidationStatus) {
        dateValidationStatus.textContent = `✅ Valid date selected: ${philippineSelectedDate.toLocaleDateString()}.`;
        dateValidationStatus.className = 'mt-1 text-sm text-green-600 font-medium';
      }
      return true;
    }

    // Add event listeners for real-time validation
    visitDateInput.addEventListener('change', validateDate);
    visitDateInput.addEventListener('input', validateDate);
    visitDateInput.addEventListener('blur', validateDate);

    // Initial validation
    validateDate();

    // Add real-time clock display
    let clockDisplay = document.getElementById('philippineClock');
    if (!clockDisplay) {
      clockDisplay = document.createElement('div');
      clockDisplay.id = 'philippineClock';
      clockDisplay.className = 'text-xs text-gray-500 dark:text-gray-400 mt-1';
      visitDateInput.parentNode?.insertBefore(clockDisplay, dateValidationStatus);
    }

    // Update clock every second with real-time Philippine time from database
    async function updateClock() {
      try {
        const { data: philippineTimeData, error } = await supabase.rpc('get_philippine_timestamp');
        if (error) {
          console.error('Error getting Philippine time from DB:', error);
          // Fallback to local calculation
          const philippineTime = getPhilippineTime();
          clockDisplay.textContent = `Current Philippine time: ${philippineTime.toLocaleString('en-US', { 
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })} (local calculation)`;
        } else {
          const philippineTime = new Date(philippineTimeData);
          clockDisplay.textContent = `Current Philippine time: ${philippineTime.toLocaleString('en-US', { 
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })} (real-time from DB)`;
        }
      } catch (error) {
        console.error('Exception getting Philippine time from DB:', error);
        // Fallback to local calculation
        const philippineTime = getPhilippineTime();
        clockDisplay.textContent = `Current Philippine time: ${philippineTime.toLocaleString('en-US', { 
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })} (local calculation)`;
      }
    }

    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    // Clean up interval when modal is closed
    const modal = document.getElementById('scheduleModal');
    if (modal) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (modal.classList.contains('hidden')) {
              clearInterval(clockInterval);
              observer.disconnect();
            }
          }
        });
      });
      observer.observe(modal, { attributes: true });
    }

    // Add weekly visit count display for logged-in users
    addWeeklyVisitCountToModal();
  }

  // Function to reset date validation
  function resetDateValidation() {
    const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
    const dateValidationStatus = document.getElementById('dateValidationStatus');
    const clockDisplay = document.getElementById('philippineClock');
    const modalWeeklyVisitCount = document.getElementById('modalWeeklyVisitCount');
    
    if (visitDateInput) {
      visitDateInput.classList.remove('border-red-500', 'border-green-500', 'border-yellow-500', 'focus:border-red-500', 'focus:border-green-500', 'focus:border-yellow-500');
    }
    
    if (dateValidationStatus) {
      dateValidationStatus.textContent = '';
      dateValidationStatus.className = 'mt-1 text-sm';
    }
    
    if (clockDisplay) {
      clockDisplay.textContent = '';
    }
    
    if (modalWeeklyVisitCount) {
      modalWeeklyVisitCount.remove();
    }
  }

  // Function to add weekly visit count display to the modal
  async function addWeeklyVisitCountToModal() {
    // Prevent multiple simultaneous calls
    if (addWeeklyVisitCountToModal.isRunning) {
      return;
    }
    addWeeklyVisitCountToModal.isRunning = true;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) return;

      // Check if user has visitor role
      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        // Only show weekly visit count for visitor roles
        if (roleData?.role !== 'visitor') {
          return;
        }
      } catch (error) {
        console.error('Error checking user role for modal weekly visit count:', error);
        return;
      }

      // Check if weekly visit count is already displayed
      if (document.getElementById('modalWeeklyVisitCount')) {
        return;
      }

      const visitDateInput = document.getElementById('visitDate');
      if (!visitDateInput) return;

      // Get current Philippine date from database
      let philippineToday: Date;
      try {
        const { data: philippineDateData, error } = await supabase.rpc('get_philippine_date');
        if (error) {
          console.error('Error getting Philippine date from DB:', error);
          philippineToday = getPhilippineDate();
        } else {
          philippineToday = new Date(philippineDateData);
        }
      } catch (error) {
        console.error('Exception getting Philippine date from DB:', error);
        philippineToday = getPhilippineDate();
      }
      
      // Calculate the week boundaries (Sunday to Saturday)
      const weekStart = new Date(philippineToday);
      weekStart.setDate(philippineToday.getDate() - philippineToday.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Calculate previous week boundaries
      const prevWeekStart = new Date(weekStart);
      prevWeekStart.setDate(weekStart.getDate() - 7);
      prevWeekStart.setHours(0, 0, 0, 0);
      const prevWeekEnd = new Date(prevWeekStart);
      prevWeekEnd.setDate(prevWeekStart.getDate() + 6);
      prevWeekEnd.setHours(23, 59, 59, 999);

      // Calculate next week boundaries
      const nextWeekStart = new Date(weekStart);
      nextWeekStart.setDate(weekStart.getDate() + 7);
      nextWeekStart.setHours(0, 0, 0, 0);
      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
      nextWeekEnd.setHours(23, 59, 59, 999);

      // Calculate end of current month
      const endOfMonth = new Date(philippineToday.getFullYear(), philippineToday.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      // Query the database for all pending and completed visits for the current week
      const { data: visits, error } = await supabase
        .from('scheduled_visits')
        .select('visit_date, status')
        .eq('visitor_user_id', user.id)
        .in('status', ['pending', 'completed'])
        .gte('visit_date', weekStart.toISOString())
        .lte('visit_date', weekEnd.toISOString());

      // Query the database for all pending and completed visits for the previous week
      const { data: prevWeekVisits, error: prevWeekError } = await supabase
        .from('scheduled_visits')
        .select('visit_date, status')
        .eq('visitor_user_id', user.id)
        .in('status', ['pending', 'completed'])
        .gte('visit_date', prevWeekStart.toISOString())
        .lte('visit_date', prevWeekEnd.toISOString());

      // Query for future schedules (next week and beyond within the month)
      const { data: futureVisits, error: futureError } = await supabase
        .from('scheduled_visits')
        .select('visit_date, status')
        .eq('visitor_user_id', user.id)
        .in('status', ['pending', 'completed'])
        .gte('visit_date', nextWeekStart.toISOString())
        .lte('visit_date', endOfMonth.toISOString());

      if (error) {
        console.error('Error loading weekly visit count for modal:', error);
        return;
      }
      if (prevWeekError) {
        console.error('Error loading previous week visits for modal:', prevWeekError);
      }
      if (futureError) {
        console.error('Error loading future visits for modal:', futureError);
      }

      // Count the pending and completed visits for the current week
      const visitCount = visits?.length || 0;
      const pendingCount = visits?.filter(v => v.status === 'pending').length || 0;
      const completedCount = visits?.filter(v => v.status === 'completed').length || 0;

      // Count the pending and completed visits for the previous week
      const prevPendingCount = prevWeekVisits?.filter(v => v.status === 'pending').length || 0;
      const prevCompletedCount = prevWeekVisits?.filter(v => v.status === 'completed').length || 0;
      const prevTotalCount = prevWeekVisits?.length || 0;

      // Count future visits
      const futureVisitCount = futureVisits?.length || 0;

      // NEW LOGIC: Determine refresh slots based on previous week
      let refreshSlots = 2; // default: allow 2 visits
      // First, check previous week logic
      if (prevTotalCount > 0) {
        if (prevPendingCount === 2) {
          refreshSlots = 0; // 2 pending = no refresh
        } else if (prevPendingCount === 1 && prevCompletedCount === 1) {
          refreshSlots = 1; // 1 pending, 1 completed = 1 refresh
        } else if (prevPendingCount === 0 && prevCompletedCount === 2) {
          refreshSlots = 2; // 2 completed = 2 refresh
        } else {
          // For any other combination (e.g., only 1 visit last week)
          refreshSlots = 2 - prevPendingCount; // e.g., 1 completed, 0 pending = 1 refresh
        }
      }
      // Remove the futureVisitCount limiting logic

      // Calculate remaining visits for this week
      const remainingVisits = Math.max(0, refreshSlots - visitCount);

      // Debug logging
      console.log('Modal Weekly Visit Count Debug:', {
        userId: user.id,
        visitsFound: visits,
        visitCount: visitCount,
        refreshSlots: refreshSlots,
        remainingVisits: remainingVisits,
        futureVisitCount: futureVisitCount,
        query: {
          table: 'scheduled_visits',
          filters: {
            visitor_user_id: user.id,
            status_in: ['pending', 'completed']
          }
        }
      });

      let statusText = '';
      let statusColor = '';
      
      if (refreshSlots === 0) {
        statusText = 'No new visits allowed until previous week is cleared';
        statusColor = 'text-gray-600 dark:text-gray-400';
      } else if (remainingVisits === 2) {
        statusText = '2 visits remaining';
        statusColor = 'text-green-600 dark:text-green-400';
      } else if (remainingVisits === 1) {
        statusText = '1 visit remaining';
        statusColor = 'text-yellow-600 dark:text-yellow-400';
      } else {
        statusText = 'No visits remaining';
        statusColor = 'text-red-600 dark:text-red-400';
      }

      // Create the weekly visit count display
      const weeklyVisitDiv = document.createElement('div');
      weeklyVisitDiv.id = 'modalWeeklyVisitCount';
      weeklyVisitDiv.className = 'mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md';
      
      let weekText = `(${pendingCount} pending, ${completedCount} completed)`;
      if (futureVisitCount > 0) {
        weekText += ` • ${futureVisitCount} future schedule(s)`;
      }
      
      weeklyVisitDiv.innerHTML = `
        <div class="flex items-center text-sm">
          <svg class="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="font-medium ${statusColor}">${statusText}</span>
          <span class="text-gray-600 dark:text-gray-400 ml-1">
            ${weekText}
          </span>
        </div>
        <div class="mt-1 text-xs text-blue-600 dark:text-blue-400">
          Maximum 2 visits per week per user account
        </div>
      `;

      // Insert after the visit date input
      visitDateInput.parentNode?.insertBefore(weeklyVisitDiv, visitDateInput.nextSibling);

    } catch (error) {
      console.error('Error adding weekly visit count to modal:', error);
    } finally {
      addWeeklyVisitCountToModal.isRunning = false;
    }
  }

  // Function to refresh modal weekly visit count
  async function refreshModalWeeklyVisitCount() {
    // Prevent multiple simultaneous calls
    if (refreshModalWeeklyVisitCount.isRunning) {
      return;
    }
    refreshModalWeeklyVisitCount.isRunning = true;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) return;

      // Check if user has visitor role
      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        // Only refresh weekly visit count for visitor roles
        if (roleData?.role !== 'visitor') {
          return;
        }
      } catch (error) {
        console.error('Error checking user role for refresh:', error);
        return;
      }

      const modalWeeklyVisitCount = document.getElementById('modalWeeklyVisitCount');
      if (!modalWeeklyVisitCount) return;

      // Prevent rapid successive calls
      const now = Date.now();
      if (modalWeeklyVisitCount.dataset.lastRefresh) {
        const lastRefresh = parseInt(modalWeeklyVisitCount.dataset.lastRefresh);
        if (now - lastRefresh < 500) { // Prevent refreshes more than once every 500ms
          return;
        }
      }
      modalWeeklyVisitCount.dataset.lastRefresh = now.toString();

      // Get current Philippine date from database
      let philippineToday: Date;
      try {
        const { data: philippineDateData, error } = await supabase.rpc('get_philippine_date');
        if (error) {
          console.error('Error getting Philippine date from DB:', error);
          philippineToday = getPhilippineDate();
        } else {
          philippineToday = new Date(philippineDateData);
        }
      } catch (error) {
        console.error('Exception getting Philippine date from DB:', error);
        philippineToday = getPhilippineDate();
      }
      
      // Calculate the week boundaries (Sunday to Saturday)
      const weekStart = new Date(philippineToday);
      weekStart.setDate(philippineToday.getDate() - philippineToday.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Calculate previous week boundaries
      const prevWeekStart = new Date(weekStart);
      prevWeekStart.setDate(weekStart.getDate() - 7);
      prevWeekStart.setHours(0, 0, 0, 0);
      const prevWeekEnd = new Date(prevWeekStart);
      prevWeekEnd.setDate(prevWeekStart.getDate() + 6);
      prevWeekEnd.setHours(23, 59, 59, 999);

      // Calculate next week boundaries
      const nextWeekStart = new Date(weekStart);
      nextWeekStart.setDate(weekStart.getDate() + 7);
      nextWeekStart.setHours(0, 0, 0, 0);
      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
      nextWeekEnd.setHours(23, 59, 59, 999);

      // Calculate end of current month
      const endOfMonth = new Date(philippineToday.getFullYear(), philippineToday.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      // Query the database for all pending and completed visits for the current week
      const { data: visits, error } = await supabase
        .from('scheduled_visits')
        .select('visit_date, status')
        .eq('visitor_user_id', user.id)
        .in('status', ['pending', 'completed'])
        .gte('visit_date', weekStart.toISOString())
        .lte('visit_date', weekEnd.toISOString());

      // Query the database for all pending and completed visits for the previous week
      const { data: prevWeekVisits, error: prevWeekError } = await supabase
        .from('scheduled_visits')
        .select('visit_date, status')
        .eq('visitor_user_id', user.id)
        .in('status', ['pending', 'completed'])
        .gte('visit_date', prevWeekStart.toISOString())
        .lte('visit_date', prevWeekEnd.toISOString());

      // Query for future schedules (next week and beyond within the month)
      const { data: futureVisits, error: futureError } = await supabase
        .from('scheduled_visits')
        .select('visit_date, status')
        .eq('visitor_user_id', user.id)
        .in('status', ['pending', 'completed'])
        .gte('visit_date', nextWeekStart.toISOString())
        .lte('visit_date', endOfMonth.toISOString());

      if (error) {
        console.error('Error refreshing weekly visit count for modal:', error);
        return;
      }
      if (prevWeekError) {
        console.error('Error loading previous week visits for modal:', prevWeekError);
      }
      if (futureError) {
        console.error('Error loading future visits for modal:', futureError);
      }

      // Count the pending and completed visits for the current week
      const visitCount = visits?.length || 0;
      const pendingCount = visits?.filter(v => v.status === 'pending').length || 0;
      const completedCount = visits?.filter(v => v.status === 'completed').length || 0;

      // Count the pending and completed visits for the previous week
      const prevPendingCount = prevWeekVisits?.filter(v => v.status === 'pending').length || 0;
      const prevCompletedCount = prevWeekVisits?.filter(v => v.status === 'completed').length || 0;
      const prevTotalCount = prevWeekVisits?.length || 0;

      // Count future visits
      const futureVisitCount = futureVisits?.length || 0;

      // NEW LOGIC: Determine refresh slots based on previous week
      let refreshSlots = 2; // default: allow 2 visits
      
      // First, check previous week logic
      if (prevTotalCount > 0) {
        if (prevPendingCount === 2) {
          refreshSlots = 0; // 2 pending = no refresh
        } else if (prevPendingCount === 1 && prevCompletedCount === 1) {
          refreshSlots = 1; // 1 pending, 1 completed = 1 refresh
        } else if (prevPendingCount === 0 && prevCompletedCount === 2) {
          refreshSlots = 2; // 2 completed = 2 refresh
        } else {
          // For any other combination (e.g., only 1 visit last week)
          refreshSlots = 2 - prevPendingCount; // e.g., 1 completed, 0 pending = 1 refresh
        }
      }

      // Then, check if user has future schedules that would limit current week
      // (REMOVED: do not limit refreshSlots based on futureVisitCount)

      // Calculate remaining visits for this week
      const remainingVisits = Math.max(0, refreshSlots - visitCount);

      // Debug logging
      console.log('Refresh Modal Weekly Visit Count Debug:', {
        userId: user.id,
        visitsFound: visits,
        visitCount: visitCount,
        refreshSlots: refreshSlots,
        remainingVisits: remainingVisits,
        futureVisitCount: futureVisitCount,
        query: {
          table: 'scheduled_visits',
          filters: {
            visitor_user_id: user.id,
            status_in: ['pending', 'completed']
          }
        }
      });

      let statusText = '';
      let statusColor = '';
      
      if (refreshSlots === 0) {
        statusText = 'No new visits allowed until previous week is cleared';
        statusColor = 'text-gray-600 dark:text-gray-400';
      } else if (remainingVisits === 2) {
        statusText = '2 visits remaining';
        statusColor = 'text-green-600 dark:text-green-400';
      } else if (remainingVisits === 1) {
        statusText = '1 visit remaining';
        statusColor = 'text-yellow-600 dark:text-yellow-400';
      } else {
        statusText = 'No visits remaining';
        statusColor = 'text-red-600 dark:text-red-400';
      }

      // Completely recreate the modal content to prevent duplicates
      let weekText = `(${pendingCount} pending, ${completedCount} completed)`;
      // Optionally, show future schedules in a separate line, not in the main status
      let futureText = '';
      if (futureVisitCount > 0) {
        futureText = `<div class="text-xs text-blue-600 dark:text-blue-400">Future schedules: ${futureVisitCount} visit(s)</div>`;
      }
      
      modalWeeklyVisitCount.innerHTML = `
        <div class="flex items-center text-sm">
          <svg class="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="font-medium ${statusColor}">${statusText}</span>
          <span class="text-gray-600 dark:text-gray-400 ml-1">
            ${weekText}
          </span>
        </div>
        ${futureText}
        <div class="mt-1 text-xs text-blue-600 dark:text-blue-400">
          Maximum 2 visits per week per user account
        </div>
      `;

    } catch (error) {
      console.error('Error refreshing modal weekly visit count:', error);
    } finally {
      refreshModalWeeklyVisitCount.isRunning = false;
    }
  }

  // Function to check visits remaining for any email (guest or user)
  async function showLiveVisitCountReminder(email: string) {
    const reminderDiv = document.getElementById('liveVisitCountReminder');
    if (!reminderDiv) return;

    // Hide if email is empty or invalid
    if (!email || !isValidEmail(email)) {
      reminderDiv.innerHTML = '';
      reminderDiv.classList.add('hidden');
      return;
    }

    // Prevent multiple simultaneous calls for the same email
    if (reminderDiv.dataset.lastEmail === email && reminderDiv.dataset.lastUpdate) {
      const lastUpdate = parseInt(reminderDiv.dataset.lastUpdate);
      const now = Date.now();
      if (now - lastUpdate < 1000) { // Prevent updates more than once per second
        return;
      }
    }

    // Get current Philippine date from database
    let philippineToday: Date;
    try {
      const { data: philippineDateData, error } = await supabase.rpc('get_philippine_date');
      if (error) {
        philippineToday = getPhilippineDate();
      } else {
        philippineToday = new Date(philippineDateData);
      }
    } catch {
      philippineToday = getPhilippineDate();
    }

    // Calculate week boundaries
    const weekStart = new Date(philippineToday);
    weekStart.setDate(philippineToday.getDate() - philippineToday.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Calculate previous week boundaries
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(weekStart.getDate() - 7);
    prevWeekStart.setHours(0, 0, 0, 0);
    const prevWeekEnd = new Date(prevWeekStart);
    prevWeekEnd.setDate(prevWeekStart.getDate() + 6);
    prevWeekEnd.setHours(23, 59, 59, 999);

    // Calculate next week boundaries
    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(weekStart.getDate() + 7);
    nextWeekStart.setHours(0, 0, 0, 0);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
    nextWeekEnd.setHours(23, 59, 59, 999);

    // Calculate end of current month
    const endOfMonth = new Date(philippineToday.getFullYear(), philippineToday.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Query for this week's visits for this email
    const { data: visits, error } = await supabase
      .from('scheduled_visits')
      .select('visit_date, status')
      .eq('visitor_email', email)
      .in('status', ['pending', 'completed'])
      .gte('visit_date', weekStart.toISOString())
      .lte('visit_date', weekEnd.toISOString());

    // Query for previous week's visits for this email
    const { data: prevWeekVisits, error: prevWeekError } = await supabase
      .from('scheduled_visits')
      .select('visit_date, status')
      .eq('visitor_email', email)
      .in('status', ['pending', 'completed'])
      .gte('visit_date', prevWeekStart.toISOString())
      .lte('visit_date', prevWeekEnd.toISOString());

    // Query for future schedules (next week and beyond within the month)
    const { data: futureVisits, error: futureError } = await supabase
      .from('scheduled_visits')
      .select('visit_date, status')
      .eq('visitor_email', email)
      .in('status', ['pending', 'completed'])
      .gte('visit_date', nextWeekStart.toISOString())
      .lte('visit_date', endOfMonth.toISOString());

    if (error) {
      reminderDiv.innerHTML = '<span class="text-red-600">Error loading visit count</span>';
      reminderDiv.classList.remove('hidden');
      return;
    }
    if (prevWeekError) {
      console.error('Error loading previous week visits for guest:', prevWeekError);
    }
    if (futureError) {
      console.error('Error loading future visits for guest:', futureError);
    }

    // Count the pending and completed visits for the current week
    const visitCount = visits?.length || 0;
    const pendingCount = visits?.filter(v => v.status === 'pending').length || 0;
    const completedCount = visits?.filter(v => v.status === 'completed').length || 0;

    // Count the pending and completed visits for the previous week
    const prevPendingCount = prevWeekVisits?.filter(v => v.status === 'pending').length || 0;
    const prevCompletedCount = prevWeekVisits?.filter(v => v.status === 'completed').length || 0;
    const prevTotalCount = prevWeekVisits?.length || 0;

    // Count future visits
    const futureVisitCount = futureVisits?.length || 0;

    // NEW LOGIC: Determine refresh slots based on previous week
    let refreshSlots = 2; // default: allow 2 visits
    
    // First, check previous week logic
    if (prevTotalCount > 0) {
      if (prevPendingCount === 2) {
        refreshSlots = 0; // 2 pending = no refresh
      } else if (prevPendingCount === 1 && prevCompletedCount === 1) {
        refreshSlots = 1; // 1 pending, 1 completed = 1 refresh
      } else if (prevPendingCount === 0 && prevCompletedCount === 2) {
        refreshSlots = 2; // 2 completed = 2 refresh
      } else {
        // For any other combination (e.g., only 1 visit last week)
        refreshSlots = 2 - prevPendingCount; // e.g., 1 completed, 0 pending = 1 refresh
      }
    }

    // Then, check if user has future schedules that would limit current week
    if (futureVisitCount > 0) {
      // If user has future schedules, they should only get 1 refresh slot
      // This ensures they don't use up all their visits before reaching their scheduled dates
      refreshSlots = Math.min(refreshSlots, 1);
    }

    // Calculate remaining visits for this week
    const remainingVisits = Math.max(0, refreshSlots - visitCount);

    let statusHtml = '';
    let additionalInfo = '';
    
    if (refreshSlots === 0) {
      statusHtml = `<span class="font-medium text-gray-600 dark:text-gray-400">No new visits allowed until previous week is cleared</span>`;
    } else if (remainingVisits === 2) {
      statusHtml = `<span class="font-medium text-green-600 dark:text-green-400">2 visits remaining</span> (no scheduled visits)`;
    } else if (remainingVisits === 1) {
      statusHtml = `<span class="font-medium text-yellow-600 dark:text-yellow-400">1 visit remaining</span> (${pendingCount} pending, ${completedCount} completed)`;
    } else {
      statusHtml = `<span class="font-medium text-red-600 dark:text-red-400">No visits remaining</span> (${pendingCount} pending, ${completedCount} completed)`;
    }

    // Add information about future schedules if they exist
    if (futureVisitCount > 0) {
      const futureDates = futureVisits?.map(v => new Date(v.visit_date).toLocaleDateString()).join(', ');
      additionalInfo = `<div class="mt-1 text-xs text-blue-600 dark:text-blue-400">
        Future schedules: ${futureVisitCount} visit(s) on ${futureDates}
      </div>`;
    }

    // Clear any existing content first to prevent duplicates
    reminderDiv.innerHTML = '';
    
    // Create the reminder content
    const reminderContent = document.createElement('div');
    reminderContent.className = 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-2';
    reminderContent.innerHTML = `
      <div class="flex items-center">
        <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">${statusHtml}</h3>
          <div class="mt-1 text-xs text-blue-600 dark:text-blue-400">Maximum 2 visits per week per user account</div>
          ${additionalInfo}
        </div>
      </div>
    `;
    
    reminderDiv.appendChild(reminderContent);
    reminderDiv.classList.remove('hidden');
    
    // Store the last update time and email to prevent duplicates
    reminderDiv.dataset.lastEmail = email;
    reminderDiv.dataset.lastUpdate = Date.now().toString();

    // Disable schedule button and modal if no visits remaining or if 2 pending visits
    const scheduleBtn = document.getElementById('openScheduleModalBtn');
    if (scheduleBtn) {
      if (remainingVisits === 0 || pendingCount >= 2) {
        scheduleBtn.setAttribute('disabled', 'true');
        scheduleBtn.classList.add('opacity-50', 'cursor-not-allowed');
        scheduleBtn.title = 'You have reached your weekly visit limit or have 2 pending visits.';
      } else {
        scheduleBtn.removeAttribute('disabled');
        scheduleBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        scheduleBtn.title = '';
      }
    }
    // Optionally, hide or block the modal open event if no visits remaining or 2 pending
    let modalElem = document.getElementById('scheduleModal');
    if (modalElem && (remainingVisits === 0 || pendingCount >= 2)) {
      modalElem.classList.add('hidden');
    }
  }

  // Add live event listener to email input in modal
  setTimeout(() => {
    const scheduleEmail = document.getElementById('scheduleEmail') as HTMLInputElement;
    const reminderDiv = document.getElementById('liveVisitCountReminder');
    if (scheduleEmail && reminderDiv) {
      let debounceTimer: NodeJS.Timeout;
      
      scheduleEmail.addEventListener('input', async () => {
        // Clear any existing timer
        clearTimeout(debounceTimer);
        
        // Only show for non-logged-in users
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // Debounce the call to prevent rapid firing
          debounceTimer = setTimeout(() => {
            showLiveVisitCountReminder(scheduleEmail.value.trim());
          }, 300); // Wait 300ms after user stops typing
        } else {
          reminderDiv.innerHTML = '';
          reminderDiv.classList.add('hidden');
        }
      });
    }
  }, 500);
} 