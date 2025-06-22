import { sendVerificationEmail } from '../config/emailjs';
import supabase from '../config/supabase';

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

    // Add "Multiple Places" option at the end
    const multipleOption = document.createElement('option');
    multipleOption.value = 'multiple';
    if (availablePlacesCount < 2) {
      multipleOption.textContent = 'Multiple Places (requires at least 2 available places)';
      multipleOption.disabled = true;
    } else {
      multipleOption.textContent = 'Multiple Places';
    }
    placeToVisitSelect.appendChild(multipleOption);

    // Update help text
    const helpText = placeToVisitSelect.parentElement?.querySelector('p');
    if (helpText) {
      if (availablePlacesCount < 2) {
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
        if (target.value === 'multiple' && availablePlacesCount >= 2) {
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
  if (scheduleNowBtn) {
    scheduleNowBtn.addEventListener('click', function() {
      const modal = document.getElementById('scheduleModal');
      if (modal) {
        modal.classList.remove('hidden');
      }
    });
  }

  const closeScheduleModalBtn = document.getElementById('closeScheduleModalBtn');
  if (closeScheduleModalBtn) {
    closeScheduleModalBtn.addEventListener('click', function() {
      const modal = document.getElementById('scheduleModal');
      if (modal) {
        modal.classList.add('hidden');
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
    scheduleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
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

        // Get current user if logged in
        const { data: { user } } = await supabase.auth.getUser();
        const visitorUserId = user?.id || null;

        // Validate place selection
        if (placeToVisit === 'multiple') {
          // Check if multiple places option is available
          if (availablePlacesCount < 2) {
            throw new Error('Multiple places option is not available. Please select a single place.');
          }
          
          const selectedPlaces = Array.from(document.querySelectorAll('input[name="places"]:checked'))
            .map((checkbox: HTMLInputElement) => checkbox.value);
          
          if (selectedPlaces.length === 0) {
            throw new Error('Please select at least one place to visit');
          }

          // Schedule visits for each selected place
          for (const placeId of selectedPlaces) {
            await supabase.rpc('schedule_visit', {
              p_visitor_first_name: firstName,
              p_visitor_last_name: lastName,
              p_visitor_email: email,
              p_visitor_phone: phone,
              p_place_id: placeId,
              p_visit_date: visitDate,
              p_purpose: purpose === 'other' ? otherPurpose : purpose,
              p_other_purpose: purpose === 'other' ? otherPurpose : null,
              p_visitor_user_id: visitorUserId
            });
          }
        } else {
          // Schedule visit for single place
          await supabase.rpc('schedule_visit', {
            p_visitor_first_name: firstName,
            p_visitor_last_name: lastName,
            p_visitor_email: email,
            p_visitor_phone: phone,
            p_place_id: placeToVisit,
            p_visit_date: visitDate,
            p_purpose: purpose === 'other' ? otherPurpose : purpose,
            p_other_purpose: purpose === 'other' ? otherPurpose : null,
            p_visitor_user_id: visitorUserId
          });
        }

        // Show success message
        alert('Visit scheduled successfully! You will receive a confirmation email shortly.');
        
        // Close modal and reset form
        const modal = document.getElementById('scheduleModal');
        if (modal) {
          modal.classList.add('hidden');
        }
        scheduleForm.reset();
        
        // Reset verification state
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
        if (sendVerificationCode) {
          sendVerificationCode.textContent = 'Send Code';
        }
        
        // Re-enable email input field and send code button
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

      } catch (error: any) {
        console.error('Error scheduling visit:', error);
        alert('Error scheduling visit: ' + (error.message || 'Please try again'));
      } finally {
        // Reset button state
        if (scheduleSubmitBtn) {
          scheduleSubmitBtn.disabled = false;
          scheduleSubmitBtn.textContent = 'Schedule Visit';
        }
      }
    });
  }
} 