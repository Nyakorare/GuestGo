import { sendVerificationEmail } from '../config/emailjs';

export function setupEventListeners() {
  // Function to toggle multiple places checkboxes
  const placeToVisitSelect = document.getElementById('placeToVisit') as HTMLSelectElement;
  if (placeToVisitSelect) {
    placeToVisitSelect.addEventListener('change', function(e: Event) {
      const target = e.target as HTMLSelectElement;
      const multiplePlacesContainer = document.getElementById('multiplePlacesContainer');
      if (multiplePlacesContainer) {
        if (target.value === 'multiple') {
          multiplePlacesContainer.classList.remove('hidden');
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
      scheduleSubmitBtn.disabled = !(areAllFieldsFilled() && isEmailVerified);
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

  // Add input event listener for email validation
  scheduleEmail?.addEventListener('input', () => {
    const email = scheduleEmail.value;
    if (sendVerificationCode) {
      if (isGmailEmail(email)) {
        sendVerificationCode.disabled = false;
        sendVerificationCode.classList.remove('opacity-50', 'cursor-not-allowed');
        verificationStatus!.textContent = '';
      } else {
        sendVerificationCode.disabled = true;
        sendVerificationCode.classList.add('opacity-50', 'cursor-not-allowed');
        verificationStatus!.textContent = 'Only Gmail addresses are allowed';
        verificationStatus!.className = 'mt-1 text-sm text-red-600';
      }
    }

    // Reset verification state
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
  });

  // Send verification code
  sendVerificationCode?.addEventListener('click', async () => {
    const email = scheduleEmail.value;
    if (!isValidEmail(email)) {
      verificationStatus!.textContent = 'Please enter a valid email address';
      verificationStatus!.className = 'mt-1 text-sm text-red-600';
      return;
    }

    if (!isGmailEmail(email)) {
      verificationStatus!.textContent = 'Only Gmail addresses are allowed';
      verificationStatus!.className = 'mt-1 text-sm text-red-600';
      return;
    }

    // Generate new code
    currentCode = generateVerificationCode();
    
    // Disable send button and show loading state
    sendVerificationCode.disabled = true;
    sendVerificationCode.textContent = 'Sending...';
    
    // Send verification email
    const emailSent = await sendVerificationEmail(email, currentCode);
    
    if (emailSent) {
      verificationCodeContainer?.classList.remove('hidden');
      verificationStatus!.textContent = 'Verification code sent! Please check your email.';
      verificationStatus!.className = 'mt-1 text-sm text-green-600';
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
        verificationStatus!.textContent = 'Verification code has expired. Please request a new one.';
        verificationStatus!.className = 'mt-1 text-sm text-red-600';
        isEmailVerified = false;
        updateSubmitButtonState();
      }, 5 * 60 * 1000); // 5 minutes
    } else {
      verificationStatus!.textContent = 'Failed to send verification code. Please try again.';
      verificationStatus!.className = 'mt-1 text-sm text-red-600';
      sendVerificationCode.disabled = false;
      sendVerificationCode.textContent = 'Send Code';
    }
  });

  // Verify code
  verifyCode?.addEventListener('click', () => {
    const code = verificationCode.value;
    if (!code) {
      verificationStatus!.textContent = 'Please enter the verification code';
      verificationStatus!.className = 'mt-1 text-sm text-red-600';
      return;
    }

    if (!currentCode) {
      verificationStatus!.textContent = 'Verification code has expired. Please request a new one.';
      verificationStatus!.className = 'mt-1 text-sm text-red-600';
      return;
    }

    if (code === currentCode) {
      isEmailVerified = true;
      verificationStatus!.textContent = 'Email verified successfully!';
      verificationStatus!.className = 'mt-1 text-sm text-green-600';
      clearTimers();
      updateSubmitButtonState();
      
      // Disable verification inputs after successful verification
      disableVerificationInputs();
      
      // Invalidate the code after successful verification
      currentCode = null;
    } else {
      verificationStatus!.textContent = 'Invalid verification code. Please try again.';
      verificationStatus!.className = 'mt-1 text-sm text-red-600';
    }
  });

  // Reset verification when email changes
  scheduleEmail?.addEventListener('input', () => {
    isEmailVerified = false;
    verificationCodeSent = false;
    verificationCodeContainer?.classList.add('hidden');
    verificationCode.value = '';
    verificationStatus!.textContent = '';
    clearTimers();
    if (sendVerificationCode) {
      sendVerificationCode.disabled = false;
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
} 