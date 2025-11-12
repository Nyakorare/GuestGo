import { sendVerificationEmail } from '../config/emailjs';
import supabase from '../config/supabase';
import { showNotification } from '../pages/dashboard/index';
import { showLoadingOverlay, updateLoadingOverlay, hideLoadingOverlay } from '../utils/loadingOverlay';

// Global variables for form state management
let isEmailVerified = false;
let verificationCodeSent = false;
let countdownInterval: number | null = null;
let codeExpirationTimeout: number | null = null;
let currentCode: string | null = null;
let emailCheckTimeout: number | null = null;

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

// Ensure this initialization only runs once
let modalEventListenersInitialized = false;

export async function setupEventListeners() {
  if (modalEventListenersInitialized) {
    return;
  }
  // Fetch places from database with personnel assignments and visit limit information
  const { data: places, error: placesError } = await supabase
    .from('places_to_visit')
    .select('*')
    .order('name');

  if (placesError) {
    console.error('Error fetching places:', placesError);
    return;
  }

  modalEventListenersInitialized = true;

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

  // Check visit limits for each place
  const placesWithAvailabilityAndLimits = await Promise.all(
    places?.map(async (place) => {
      const hasPersonnel = availablePlaceIds.has(place.id);
      
      // If no personnel assigned, mark as unavailable
      if (!hasPersonnel) {
        return {
          ...place,
          is_available: false,
          unavailability_reason: 'No personnel assigned'
        };
      }

      // Check visit limit for this place
      try {
        const { data: limitCheck, error: limitError } = await supabase.rpc('check_place_weekly_visit_limit', {
          p_place_id: place.id,
          p_visit_date: new Date().toISOString().split('T')[0] // Today's date
        });

        if (limitError) {
          console.error('Error checking visit limit for place:', place.name, limitError);
          // If we can't check the limit, assume it's available
          return {
            ...place,
            is_available: true,
            unavailability_reason: null
          };
        }

        // If limit check returns false, place is at capacity
        if (!limitCheck) {
          return {
            ...place,
            is_available: false,
            unavailability_reason: `Visit limit reached`
          };
        }

        return {
          ...place,
          is_available: true,
          unavailability_reason: null
        };
      } catch (error) {
        console.error('Error checking visit limit:', error);
        // If there's an error, assume it's available
        return {
          ...place,
          is_available: true,
          unavailability_reason: null
        };
      }
    }) || []
  );

  const placesWithAvailability = placesWithAvailabilityAndLimits;

  // Store places data globally for reuse
  (window as any).placesWithAvailability = placesWithAvailability;

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
        option.textContent = `${place.name} (${place.unavailability_reason || 'currently unavailable'})`;
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

    placeToVisitSelect.addEventListener('change', async function(e: Event) {
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
              <label for="place_${place.id}" class="ml-2 block text-sm ${place.is_available ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}">${place.name}${!place.is_available ? ` (${place.unavailability_reason || 'currently unavailable'})` : ''}</label>
            `;
            multiplePlacesContainer.appendChild(checkboxDiv);
          });
          
          // Add event listeners to checkboxes to update unavailable dates when selection changes
          const checkboxes = multiplePlacesContainer.querySelectorAll('input[name="places"]');
          checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', async () => {
              await updateUnavailableDatesDisplay();
              // Re-validate the date when place selection changes
              if (typeof (window as any).validateVisitDate === 'function') {
                await (window as any).validateVisitDate();
              }
              // Update purpose field state when checkbox selection changes
              if (typeof (window as any).updatePurposeFieldState === 'function') {
                await (window as any).updatePurposeFieldState();
              }
              // Update visit date field state
              if (typeof (window as any).updateVisitDateFieldState === 'function') {
                (window as any).updateVisitDateFieldState();
              }
              
              // Re-validate the date if one is already selected
              const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
              if (visitDateInput && visitDateInput.value) {
                if (typeof (window as any).validateVisitDate === 'function') {
                  await (window as any).validateVisitDate();
                }
              }
              
              // Update submit button state
              updateSubmitButtonState();
            });
          });
        } else {
          multiplePlacesContainer.classList.add('hidden');
        }
      }
      
      // Update purpose field state when place selection changes
      if (typeof (window as any).updatePurposeFieldState === 'function') {
        await (window as any).updatePurposeFieldState();
      }
      // Update visit date field state
      if (typeof (window as any).updateVisitDateFieldState === 'function') {
        (window as any).updateVisitDateFieldState();
      }
      
      // Update unavailable dates display when place selection changes
      await updateUnavailableDatesDisplay();
      
      // Re-validate the date when place selection changes
      const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
      if (visitDateInput && visitDateInput.value) {
        if (typeof (window as any).validateVisitDate === 'function') {
          await (window as any).validateVisitDate();
        }
      }
      
      // Update submit button state
      updateSubmitButtonState();
    });
  }

  // Function to load purposes for a place
  async function loadPurposesForPlace(placeId: string): Promise<any[]> {
    try {
      const { data: purposes, error } = await supabase
        .from('place_purposes')
        .select('*')
        .eq('place_id', placeId)
        .order('purpose');

      if (error) {
        console.error('Error loading purposes for place:', error);
        return [];
      }

      return purposes || [];
    } catch (error) {
      console.error('Error accessing place_purposes table:', error);
      return [];
    }
  }

  // Function to populate purpose dropdown with purposes for a place
  async function populatePurposeDropdown(placeId: string) {
    const purposeSelect = document.getElementById('purpose') as HTMLSelectElement;
    if (!purposeSelect) return;

    // Save the currently selected purpose value and other purpose text before clearing
    const previouslySelectedPurpose = purposeSelect.value;
    const otherPurposeTextarea = document.getElementById('otherPurpose') as HTMLTextAreaElement;
    const previouslyOtherPurposeText = otherPurposeTextarea?.value || '';

    const purposes = await loadPurposesForPlace(placeId);
    
    // Clear existing options except the first one
    purposeSelect.innerHTML = '<option value="">Select a purpose</option>';

    if (purposes.length === 0) {
      // If no purposes configured, show a message
      const noPurposeOption = document.createElement('option');
      noPurposeOption.value = '';
      noPurposeOption.textContent = 'No purposes configured for this place';
      noPurposeOption.disabled = true;
      purposeSelect.appendChild(noPurposeOption);
      return;
    }

    // Add purposes from database
    purposes.forEach((purpose: any) => {
      const option = document.createElement('option');
      option.value = purpose.purpose;
      option.textContent = `${purpose.purpose} (${purpose.required_days === 0 ? 'Same day' : purpose.required_days + ' day' + (purpose.required_days > 1 ? 's' : '')})`;
      option.setAttribute('data-required-days', purpose.required_days.toString());
      purposeSelect.appendChild(option);
    });
    
    // Add "other" option if not already present
    const hasOther = Array.from(purposeSelect.options).some(opt => opt.value === 'other');
    if (!hasOther) {
      const otherOption = document.createElement('option');
      otherOption.value = 'other';
      otherOption.textContent = 'Other';
      purposeSelect.appendChild(otherOption);
    }

    // Restore the previously selected purpose if it still exists in the new options
    if (previouslySelectedPurpose) {
      const optionExists = Array.from(purposeSelect.options).some(opt => opt.value === previouslySelectedPurpose);
      if (optionExists) {
        purposeSelect.value = previouslySelectedPurpose;
        
        // If "other" was selected, restore the other purpose text and show the container
        if (previouslySelectedPurpose === 'other') {
          const otherPurposeContainer = document.getElementById('otherPurposeContainer');
          if (otherPurposeContainer) {
            otherPurposeContainer.classList.remove('hidden');
          }
          if (otherPurposeTextarea) {
            otherPurposeTextarea.value = previouslyOtherPurposeText;
            otherPurposeTextarea.disabled = false;
          }
        }
      }
    }
  }

  // Function to create purpose selector for multiple places
  async function createMultiplePlacePurposeSelectors() {
    const multiplePlacesContainer = document.getElementById('multiplePlacesContainer');
    const multiplePurposesContainer = document.getElementById('multiplePurposesContainer');
    
    if (!multiplePlacesContainer || !multiplePurposesContainer) return;

    // Get all checked places
    const checkedPlaces = Array.from(document.querySelectorAll('input[name="places"]:checked'))
      .map(checkbox => {
        const checkboxEl = checkbox as HTMLInputElement;
        const label = document.querySelector(`label[for="${checkboxEl.id}"]`);
        return {
          id: checkboxEl.value,
          name: label?.textContent?.trim() || checkboxEl.value
        };
      });

    // Save existing purpose values before clearing
    const savedPurposeValues: Record<string, { purpose: string; otherPurpose: string }> = {};
    checkedPlaces.forEach(place => {
      const purposeSelect = document.getElementById(`purpose_${place.id}`) as HTMLSelectElement;
      const otherPurposeTextarea = document.getElementById(`otherPurpose_${place.id}`) as HTMLTextAreaElement;
      if (purposeSelect) {
        savedPurposeValues[place.id] = {
          purpose: purposeSelect.value || '',
          otherPurpose: otherPurposeTextarea?.value || ''
        };
      }
    });

    // Clear existing purpose selectors
    multiplePurposesContainer.innerHTML = '';

    if (checkedPlaces.length === 0) {
      multiplePurposesContainer.classList.add('hidden');
      return;
    }

    multiplePurposesContainer.classList.remove('hidden');

    // Create purpose selector for each checked place
    for (const place of checkedPlaces) {
      const purposes = await loadPurposesForPlace(place.id);
      
      const purposeDiv = document.createElement('div');
      purposeDiv.className = 'mb-4';
      purposeDiv.innerHTML = `
        <label for="purpose_${place.id}" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Purpose for <span class="font-semibold">${place.name}</span>
        </label>
        <select 
          id="purpose_${place.id}" 
          name="place_purposes" 
          data-place-id="${place.id}"
          class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        >
          <option value="">Select a purpose</option>
        </select>
        <div id="otherPurposeContainer_${place.id}" class="hidden mt-2">
          <label for="otherPurpose_${place.id}" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Please specify (max 10 words, 50 characters)</label>
          <textarea 
            id="otherPurpose_${place.id}" 
            name="otherPurpose_${place.id}"
            rows="2"
            maxlength="50"
            class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          ></textarea>
          <div class="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Words: <span id="wordCount_${place.id}">0</span>/10</span>
            <span>Characters: <span id="charCount_${place.id}">0</span>/50</span>
          </div>
        </div>
      `;
      
      multiplePurposesContainer.appendChild(purposeDiv);

      const purposeSelect = purposeDiv.querySelector(`#purpose_${place.id}`) as HTMLSelectElement;
      
      if (purposes.length === 0) {
        const noPurposeOption = document.createElement('option');
        noPurposeOption.value = '';
        noPurposeOption.textContent = 'No purposes configured for this place';
        noPurposeOption.disabled = true;
        purposeSelect.appendChild(noPurposeOption);
        purposeSelect.disabled = true;
      } else {
        purposes.forEach((purpose: any) => {
          const option = document.createElement('option');
          option.value = purpose.purpose;
          option.textContent = `${purpose.purpose} (${purpose.required_days === 0 ? 'Same day' : purpose.required_days + ' day' + (purpose.required_days > 1 ? 's' : '')})`;
          option.setAttribute('data-required-days', purpose.required_days.toString());
          purposeSelect.appendChild(option);
        });
        
        // Add "other" option if not already present
        const hasOther = Array.from(purposeSelect.options).some(opt => opt.value === 'other');
        if (!hasOther) {
          const otherOption = document.createElement('option');
          otherOption.value = 'other';
          otherOption.textContent = 'Other';
          purposeSelect.appendChild(otherOption);
        }

        // Restore the previously selected purpose if it exists
        const savedValue = savedPurposeValues[place.id];
        if (savedValue && savedValue.purpose) {
          const optionExists = Array.from(purposeSelect.options).some(opt => opt.value === savedValue.purpose);
          if (optionExists) {
            purposeSelect.value = savedValue.purpose;
            
            // If "other" was selected, restore the other purpose text and show the container
            if (savedValue.purpose === 'other') {
              const otherPurposeContainer = document.getElementById(`otherPurposeContainer_${place.id}`);
              if (otherPurposeContainer) {
                otherPurposeContainer.classList.remove('hidden');
              }
              const otherPurposeTextarea = document.getElementById(`otherPurpose_${place.id}`) as HTMLTextAreaElement;
              if (otherPurposeTextarea) {
                otherPurposeTextarea.value = savedValue.otherPurpose;
              }
            }
          }
        }

        // Add event listener for "other" purpose
        purposeSelect.addEventListener('change', async function(e) {
          const target = e.target as HTMLSelectElement;
          const otherPurposeContainer = document.getElementById(`otherPurposeContainer_${place.id}`);
          if (otherPurposeContainer) {
            if (target.value === 'other') {
              otherPurposeContainer.classList.remove('hidden');
            } else {
              otherPurposeContainer.classList.add('hidden');
              const otherPurposeTextarea = document.getElementById(`otherPurpose_${place.id}`) as HTMLTextAreaElement;
              if (otherPurposeTextarea) {
                otherPurposeTextarea.value = '';
              }
            }
          }
          // Update visit date field state and min when purpose changes
          updateVisitDateFieldState();
          await updateVisitDateMin();
          
          // Validate date if a date is already selected
          const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
          if (visitDateInput && visitDateInput.value) {
            if (typeof (window as any).validateVisitDate === 'function') {
              await (window as any).validateVisitDate();
            }
          }
          
          // Update submit button state
          updateSubmitButtonState();
        });

        // Add word/character count validation for other purpose textarea
        const otherPurposeTextarea = purposeDiv.querySelector(`#otherPurpose_${place.id}`) as HTMLTextAreaElement;
        const wordCountDisplay = purposeDiv.querySelector(`#wordCount_${place.id}`);
        const charCountDisplay = purposeDiv.querySelector(`#charCount_${place.id}`);
        
        if (otherPurposeTextarea && wordCountDisplay && charCountDisplay) {
          otherPurposeTextarea.addEventListener('input', function() {
            const text = otherPurposeTextarea.value;
            const segments = text.split(' ');
            const wordCount = segments.length;
            const charCount = text.length;
            
            wordCountDisplay.textContent = wordCount.toString();
            charCountDisplay.textContent = charCount.toString();
            
            if (wordCount > 10 || charCount > 50) {
              let truncatedText = text;
              if (charCount > 50) {
                truncatedText = text.substring(0, 50);
              } else if (wordCount > 10) {
                const words = text.split(' ');
                truncatedText = words.slice(0, 10).join(' ');
              }
              otherPurposeTextarea.value = truncatedText;
              wordCountDisplay.textContent = truncatedText.split(' ').length.toString();
              charCountDisplay.textContent = truncatedText.length.toString();
            }
          });
        }
      }
    }
  }

  // Function to toggle other purpose text box and manage purpose field state
  const purposeSelect = document.getElementById('purpose') as HTMLSelectElement;
  const otherPurposeTextarea = document.getElementById('otherPurpose') as HTMLTextAreaElement;
  const multiplePurposesContainer = document.getElementById('multiplePurposesContainer');
  const scheduleSubmitBtn = document.getElementById('scheduleSubmitBtn') as HTMLButtonElement;
  const scheduleForm = document.getElementById('scheduleForm') as HTMLFormElement;
  const scheduleEmail = document.getElementById('scheduleEmail') as HTMLInputElement;
  
  // Function to update visit date minimum based on purpose required days
  async function updateVisitDateMin() {
    const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
    if (!visitDateInput) return;

    // Get current Philippine date
    let currentPhilippineDate: Date;
    try {
      const { data: philippineDateData, error } = await supabase.rpc('get_philippine_date');
      if (error) {
        currentPhilippineDate = getPhilippineDate();
      } else {
        currentPhilippineDate = new Date(philippineDateData);
      }
    } catch {
      currentPhilippineDate = getPhilippineDate();
    }
    currentPhilippineDate.setHours(0, 0, 0, 0);

    const placeToVisitSelect = document.getElementById('placeToVisit') as HTMLSelectElement;
    let maxRequiredDays = 0;

    if (placeToVisitSelect?.value === 'multiple') {
      // For multiple places, find the maximum required days across all selected purposes
      const checkedPlaceIds = Array.from(document.querySelectorAll('input[name="places"]:checked'))
        .map((checkbox) => (checkbox as HTMLInputElement).value);

      for (const placeId of checkedPlaceIds) {
        const purposeSelect = document.getElementById(`purpose_${placeId}`) as HTMLSelectElement;
        if (purposeSelect && purposeSelect.value) {
          const selectedOption = purposeSelect.options[purposeSelect.selectedIndex];
          if (selectedOption && selectedOption.value !== 'other') {
            const requiredDays = parseInt(selectedOption.getAttribute('data-required-days') || '0', 10);
            maxRequiredDays = Math.max(maxRequiredDays, requiredDays);
          }
        }
      }
    } else if (placeToVisitSelect?.value && placeToVisitSelect.value !== '') {
      // Single place - get required days from selected purpose
      if (purposeSelect && purposeSelect.value) {
        const selectedOption = purposeSelect.options[purposeSelect.selectedIndex];
        if (selectedOption && selectedOption.value !== 'other') {
          maxRequiredDays = parseInt(selectedOption.getAttribute('data-required-days') || '0', 10);
        }
      }
    }

    // Calculate minimum date: today + max required days
    const minDate = new Date(currentPhilippineDate);
    minDate.setDate(minDate.getDate() + maxRequiredDays);
    
    // Also get max date (1 month from today)
    const endOfCurrentMonth = new Date(currentPhilippineDate.getFullYear(), currentPhilippineDate.getMonth() + 1, 0);
    const isLastDayOfMonth = currentPhilippineDate.getDate() === endOfCurrentMonth.getDate();
    const philippineMaxDate = isLastDayOfMonth
      ? new Date(currentPhilippineDate.getFullYear(), currentPhilippineDate.getMonth() + 2, 0)
      : endOfCurrentMonth;

    // Update min and max dates
    visitDateInput.min = minDate.toISOString().split('T')[0];
    visitDateInput.max = philippineMaxDate.toISOString().split('T')[0];

    // Update advance notice message
    const dateAdvanceNotice = document.getElementById('dateAdvanceNotice');
    if (dateAdvanceNotice) {
      if (maxRequiredDays > 0) {
        dateAdvanceNotice.textContent = `⚠️ This purpose requires ${maxRequiredDays} day${maxRequiredDays > 1 ? 's' : ''} advance notice. Earliest available date: ${minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        dateAdvanceNotice.classList.remove('hidden');
      } else {
        dateAdvanceNotice.classList.add('hidden');
      }
    }

    // If current date value is before the new minimum, update it
    if (visitDateInput.value) {
      const currentValue = new Date(visitDateInput.value);
      currentValue.setHours(0, 0, 0, 0);
      if (currentValue < minDate) {
        visitDateInput.value = minDate.toISOString().split('T')[0];
      }
    }
  }

  // Function to enable/disable visit date field based on purpose selection
  function updateVisitDateFieldState() {
    const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
    const placeToVisitSelect = document.getElementById('placeToVisit') as HTMLSelectElement;
    const dateAdvanceNotice = document.getElementById('dateAdvanceNotice');

    if (!visitDateInput || !placeToVisitSelect) return;

    let hasPurposeSelected = false;

    if (placeToVisitSelect.value === 'multiple') {
      // For multiple places, check if all checked places have a purpose selected
      const checkedPlaces = document.querySelectorAll('input[name="places"]:checked');
      if (checkedPlaces.length > 0) {
        hasPurposeSelected = true;
        // Check each checked place has a purpose
        checkedPlaces.forEach((checkbox) => {
          const placeId = (checkbox as HTMLInputElement).value;
          const purposeSelect = document.getElementById(`purpose_${placeId}`) as HTMLSelectElement;
          if (!purposeSelect || !purposeSelect.value) {
            hasPurposeSelected = false;
          }
        });
      }
    } else if (placeToVisitSelect.value && placeToVisitSelect.value !== '') {
      // Single place - check if purpose is selected
      const purposeSelect = document.getElementById('purpose') as HTMLSelectElement;
      if (purposeSelect && purposeSelect.value) {
        hasPurposeSelected = true;
      }
    }

    if (hasPurposeSelected) {
      visitDateInput.disabled = false;
      visitDateInput.classList.remove('disabled:bg-gray-100', 'dark:disabled:bg-gray-800', 'disabled:cursor-not-allowed', 'disabled:opacity-50');
      // Update min date based on purpose
      updateVisitDateMin();
    } else {
      visitDateInput.disabled = true;
      visitDateInput.classList.add('disabled:bg-gray-100', 'dark:disabled:bg-gray-800', 'disabled:cursor-not-allowed', 'disabled:opacity-50');
      visitDateInput.value = '';
      if (dateAdvanceNotice) {
        dateAdvanceNotice.classList.add('hidden');
      }
    }
  }

  // Function to enable/disable purpose field based on place selection
  async function updatePurposeFieldState() {
    const placeToVisitSelect = document.getElementById('placeToVisit') as HTMLSelectElement;
    const singlePurposeContainer = document.getElementById('singlePurposeContainer');
    
    if (!placeToVisitSelect) return;
    
    if (placeToVisitSelect.value === 'multiple') {
      // Hide single purpose container, show multiple purposes container
      if (singlePurposeContainer) {
        singlePurposeContainer.classList.add('hidden');
      }
      if (multiplePurposesContainer) {
        await createMultiplePlacePurposeSelectors();
      }
      // Update visit date field state after purposes are created
      setTimeout(() => {
        updateVisitDateFieldState();
        updateVisitDateMin();
      }, 100);
    } else if (placeToVisitSelect.value && placeToVisitSelect.value !== '') {
      // Single place selected
      if (singlePurposeContainer) {
        singlePurposeContainer.classList.remove('hidden');
      }
      if (multiplePurposesContainer) {
        multiplePurposesContainer.classList.add('hidden');
      }
      
      if (purposeSelect) {
        purposeSelect.disabled = false;
        purposeSelect.classList.remove('disabled:bg-gray-100', 'dark:disabled:bg-gray-800', 'disabled:cursor-not-allowed', 'disabled:opacity-50');
        await populatePurposeDropdown(placeToVisitSelect.value);
        if (otherPurposeTextarea) {
          otherPurposeTextarea.disabled = false;
        }
        // Update visit date field state (will remain disabled until purpose is selected)
        updateVisitDateFieldState();
      }
    } else {
      // No place selected
      if (singlePurposeContainer) {
        singlePurposeContainer.classList.add('hidden');
      }
      if (multiplePurposesContainer) {
        multiplePurposesContainer.classList.add('hidden');
      }
      
      if (purposeSelect) {
        purposeSelect.disabled = true;
        purposeSelect.classList.add('disabled:bg-gray-100', 'dark:disabled:bg-gray-800', 'disabled:cursor-not-allowed', 'disabled:opacity-50');
        purposeSelect.innerHTML = '<option value="">Select a place first</option>';
        const otherPurposeContainer = document.getElementById('otherPurposeContainer');
        if (otherPurposeContainer) {
          otherPurposeContainer.classList.add('hidden');
        }
        if (otherPurposeTextarea) {
          otherPurposeTextarea.value = '';
          otherPurposeTextarea.disabled = true;
        }
      }
      // Disable visit date when no place is selected
      updateVisitDateFieldState();
    }
    
    // Update submit button state after place/purpose state changes
    updateSubmitButtonState();
  }
  
  if (purposeSelect) {
    // Initialize purpose field as disabled
    updatePurposeFieldState();
    
    purposeSelect.addEventListener('change', async function(e: Event) {
      const target = e.target as HTMLSelectElement;
      const otherPurposeContainer = document.getElementById('otherPurposeContainer');
      if (otherPurposeContainer) {
        if (target.value === 'other') {
          otherPurposeContainer.classList.remove('hidden');
          if (otherPurposeTextarea) {
            otherPurposeTextarea.disabled = false;
          }
        } else {
          otherPurposeContainer.classList.add('hidden');
          if (otherPurposeTextarea) {
            otherPurposeTextarea.value = '';
            otherPurposeTextarea.disabled = true;
          }
        }
      }
      // Update visit date field state and min when purpose changes
      updateVisitDateFieldState();
      await updateVisitDateMin();
      
      // Validate date if a date is already selected
      const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
      if (visitDateInput && visitDateInput.value) {
        if (typeof (window as any).validateVisitDate === 'function') {
          await (window as any).validateVisitDate();
        }
      }
      
      // Update submit button state
      updateSubmitButtonState();
    });
  }

  // Add event listeners to multiple place purpose selectors for date min updates
  // This will be called when multiple place purposes are created
  function setupMultiplePlacePurposeDateUpdates() {
    // Listen for changes on all purpose selects for multiple places
    document.addEventListener('change', async function(e) {
      const target = e.target as HTMLElement;
      if (target && target.id && target.id.startsWith('purpose_') && target.tagName === 'SELECT') {
        // Update visit date field state and min when any multiple place purpose changes
        updateVisitDateFieldState();
        await updateVisitDateMin();
        
        // Validate date if a date is already selected
        const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
        if (visitDateInput && visitDateInput.value) {
          if (typeof (window as any).validateVisitDate === 'function') {
            await (window as any).validateVisitDate();
          }
        }
        
        // Update submit button state
        updateSubmitButtonState();
      }
    });
  }
  setupMultiplePlacePurposeDateUpdates();

  // Expose functions globally
  (window as any).updatePurposeFieldState = updatePurposeFieldState;
  (window as any).updateVisitDateFieldState = updateVisitDateFieldState;
  (window as any).updateVisitDateMin = updateVisitDateMin;

  // Function to validate word count and character limit
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
    // Remove any existing click listeners to prevent duplicates
    const newBtn = scheduleNowBtn.cloneNode(true);
    scheduleNowBtn.parentNode?.replaceChild(newBtn, scheduleNowBtn);
    
    // Add the click listener to the new button
    newBtn.addEventListener('click', async function() {
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
      if (modal) {
        modal.classList.remove('hidden');
        // Initialize date validation when modal opens
        if (typeof (window as any).initializeDateValidation === 'function') {
          (window as any).initializeDateValidation();
        }
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
  const sendVerificationCode = document.getElementById('sendVerificationCode') as HTMLButtonElement;
  const verificationCodeContainer = document.getElementById('verificationCodeContainer');
  const verificationCode = document.getElementById('verificationCode') as HTMLInputElement;
  const verifyCode = document.getElementById('verifyCode');
  const verificationStatus = document.getElementById('verificationStatus');
  const emailValidationStatus = document.getElementById('emailValidationStatus');
  // Note: scheduleSubmitBtn, scheduleForm, and scheduleEmail are declared earlier (above) to avoid initialization order issues

  // Set initial state of send code button
  if (sendVerificationCode) {
    sendVerificationCode.disabled = true;
    sendVerificationCode.classList.add('opacity-50', 'cursor-not-allowed');
  }


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

  // Expose timers clearer for external flows (e.g., confirmation scheduling)
  (window as any).modalClearTimers = clearTimers;

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
    
    // Check all required inputs
    requiredInputs.forEach(input => {
      const inputEl = input as HTMLInputElement | HTMLSelectElement;
      // Skip disabled fields (they're not yet available)
      if (inputEl.disabled) {
        allFilled = false;
        return;
      }
      if (!inputEl.value) {
        allFilled = false;
      }
    });
    
    // Special check for multiple places - ensure all selected places have purposes
    const placeToVisitSelect = document.getElementById('placeToVisit') as HTMLSelectElement;
    if (placeToVisitSelect?.value === 'multiple') {
      const checkedPlaces = document.querySelectorAll('input[name="places"]:checked');
      if (checkedPlaces.length === 0) {
        allFilled = false;
      } else {
        // Check each checked place has a purpose selected
        checkedPlaces.forEach((checkbox) => {
          const placeId = (checkbox as HTMLInputElement).value;
          const purposeSelect = document.getElementById(`purpose_${placeId}`) as HTMLSelectElement;
          if (!purposeSelect || purposeSelect.disabled || !purposeSelect.value) {
            allFilled = false;
          } else if (purposeSelect.value === 'other') {
            // If "other" is selected, check if textarea is filled
            const otherPurposeTextarea = document.getElementById(`otherPurpose_${placeId}`) as HTMLTextAreaElement;
            if (!otherPurposeTextarea || !otherPurposeTextarea.value.trim()) {
              allFilled = false;
            }
          }
        });
      }
    } else {
      // Single place - check if purpose is selected and if "other", check textarea
      const purposeSelect = document.getElementById('purpose') as HTMLSelectElement;
      if (purposeSelect && !purposeSelect.disabled && purposeSelect.value) {
        if (purposeSelect.value === 'other') {
          const otherPurposeTextarea = document.getElementById('otherPurpose') as HTMLTextAreaElement;
          if (!otherPurposeTextarea || !otherPurposeTextarea.value.trim()) {
            allFilled = false;
          }
        }
      } else if (purposeSelect && !purposeSelect.disabled && !purposeSelect.value) {
        // Purpose field is enabled but no value selected
        allFilled = false;
      }
    }
    
    return allFilled;
  }

  // Function to update submit button state
  function updateSubmitButtonState() {
    if (scheduleSubmitBtn) {
      const isLoggedIn = scheduleEmail.readOnly;
      const allFieldsFilled = areAllFieldsFilled();
      const emailValid = isLoggedIn || isEmailVerified;
      
      // Check if date validation blocks scheduling (unavailable date)
      const dateValidationStatus = document.getElementById('dateValidationStatus');
      const hasUnavailableDateError = dateValidationStatus && 
        (dateValidationStatus.textContent?.includes('Cannot schedule on this date') ||
         dateValidationStatus.textContent?.includes('❌') ||
         dateValidationStatus.className.includes('text-red-600'));
      
      // Check if visit date is disabled (means no purpose selected yet)
      const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
      const visitDateDisabled = visitDateInput && visitDateInput.disabled;
      
      scheduleSubmitBtn.disabled = !(allFieldsFilled && emailValid && !hasUnavailableDateError && !visitDateDisabled);
    }
  }

  // Add input event listeners to all form fields
  scheduleForm?.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', updateSubmitButtonState);
    field.addEventListener('change', updateSubmitButtonState);
  });
  
  // Use event delegation for dynamically created purpose selectors in multiple places
  // This avoids needing to re-attach listeners when elements are added/removed
  // Note: multiplePurposesContainer is already declared above, so we reuse it
  if (multiplePurposesContainer) {
    multiplePurposesContainer.addEventListener('input', updateSubmitButtonState);
    multiplePurposesContainer.addEventListener('change', updateSubmitButtonState);
  }
  
  // Also listen for checkbox changes in multiple places container
  const multiplePlacesContainer = document.getElementById('multiplePlacesContainer');
  if (multiplePlacesContainer) {
    multiplePlacesContainer.addEventListener('change', updateSubmitButtonState);
  }

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
  const verificationCode = document.getElementById('verificationCode') as HTMLInputElement;
  const verifyCode = document.getElementById('verifyCode') as HTMLButtonElement;
  
    if (verificationCode) {
    verificationCode.disabled = false;
      verificationCode.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    if (verifyCode) {
    verifyCode.disabled = false;
      verifyCode.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }

  // Expose verification input enabler for external flows
  (window as any).modalEnableVerificationInputs = enableVerificationInputs;

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
    if (typeof (window as any).modalClearTimers === 'function') {
      (window as any).modalClearTimers();
    } else {
      clearTimers();
    }
    if (sendVerificationCode) {
      sendVerificationCode.textContent = 'Send Code';
    }
    currentCode = null;
    (window as any).modalEnableVerificationInputs?.();
    updateSubmitButtonState();
    
    // Re-validate date to check weekly visit limits with new email
    if (typeof (window as any).validateVisitDate === 'function') {
      await (window as any).validateVisitDate();
    }

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
    
    // Re-validate date to check weekly visit limits with new email
    if (typeof (window as any).validateVisitDate === 'function') {
      await (window as any).validateVisitDate();
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
    if (typeof (window as any).modalClearTimers === 'function') {
      (window as any).modalClearTimers();
    } else {
      clearTimers();
    }
    
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
    (window as any).modalEnableVerificationInputs?.();
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

  // Handle form submission - now shows confirmation modal instead of direct scheduling
  if (scheduleForm) {
    let isScheduling = false;
    scheduleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isScheduling) return;
      isScheduling = true;
      
      try {
        // Get form data
        const firstName = (document.getElementById('scheduleFirstName') as HTMLInputElement).value;
        const lastName = (document.getElementById('scheduleLastName') as HTMLInputElement).value;
        const email = scheduleEmail.value;
        const phone = phoneInput.value;
        const visitDate = (document.getElementById('visitDate') as HTMLInputElement).value;
        const placeToVisit = placeToVisitSelect.value;
        
        // Handle purposes - single place or multiple places
        let purpose = '';
        let otherPurpose = '';
        let placePurposes: Array<{ placeId: string; purpose: string; otherPurpose?: string }> = [];
        
        if (placeToVisit === 'multiple') {
          // Get purposes for each selected place
          const checkedPlaceIds = Array.from(document.querySelectorAll('input[name="places"]:checked'))
            .map((checkbox) => (checkbox as HTMLInputElement).value);
          
          for (const placeId of checkedPlaceIds) {
            const purposeSelect = document.getElementById(`purpose_${placeId}`) as HTMLSelectElement;
            if (!purposeSelect || !purposeSelect.value) {
              throw new Error(`Please select a purpose for all selected places`);
            }
            
            const selectedPurpose = purposeSelect.value;
            const otherPurposeTextarea = document.getElementById(`otherPurpose_${placeId}`) as HTMLTextAreaElement;
            const otherPurposeValue = (selectedPurpose === 'other' && otherPurposeTextarea) ? otherPurposeTextarea.value : '';
            
            if (selectedPurpose === 'other' && !otherPurposeValue.trim()) {
              throw new Error(`Please specify the purpose for all selected places`);
            }
            
            placePurposes.push({
              placeId: placeId,
              purpose: selectedPurpose === 'other' ? otherPurposeValue : selectedPurpose,
              otherPurpose: selectedPurpose === 'other' ? otherPurposeValue : undefined
            });
          }
          
          // For multiple places, use the first place's purpose as the main purpose (for backward compatibility)
          if (placePurposes.length > 0) {
            purpose = placePurposes[0].purpose;
            otherPurpose = placePurposes[0].otherPurpose || '';
          }
        } else {
          // Single place
          purpose = purposeSelect.value;
          otherPurpose = otherPurposeTextarea?.value || '';
          
          if (!purpose) {
            throw new Error('Please select a purpose for your visit');
          }
          
          if (purpose === 'other' && !otherPurpose.trim()) {
            throw new Error('Please specify the purpose of your visit');
          }
        }

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
        
      
        
        if (philippineSelectedDate.getTime() < philippineToday.getTime()) {
          throw new Error(`Cannot schedule visits for past dates. Current Philippine date is ${philippineToday.toLocaleDateString()}. Please select today or a future date.`);
        }

        // Determine max date:
        // - If today is the last day of the month, allow selecting dates into next month
        // - Otherwise, cap at the end of the current month
        const endOfCurrentMonth = new Date(philippineToday.getFullYear(), philippineToday.getMonth() + 1, 0);
        const isLastDayOfMonth = philippineToday.getDate() === endOfCurrentMonth.getDate();
        const philippineMaxDate = isLastDayOfMonth
          ? new Date(philippineToday.getFullYear(), philippineToday.getMonth() + 2, 0)
          : endOfCurrentMonth;

        if (philippineSelectedDate.getTime() > philippineMaxDate.getTime()) {
          const maxRangeLabel = isLastDayOfMonth ? 'next month' : 'the current month';
          throw new Error(`Cannot schedule visits beyond ${maxRangeLabel}. Maximum allowed date is ${philippineMaxDate.toLocaleDateString()}.`);
        }

        // Additional validation: Check if the date input has validation errors
        const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
        if (visitDateInput && visitDateInput.classList.contains('border-red-500')) {
          throw new Error('Please select a valid date before submitting the form.');
        }

        // Get current user if logged in
        const { data: { user } } = await supabase.auth.getUser();
        // Ensure we properly handle undefined/null values and convert empty strings to null
        const visitorUserId = (user?.id && user.id.trim() !== '') ? user.id : null;
        
        console.log('Form submission - User data:', { user, visitorUserId, userIdType: typeof user?.id });

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
        }

        // Show confirmation modal instead of directly scheduling
        console.log('About to show confirmation modal with data:', {
          firstName,
          lastName,
          email,
          phone,
          visitDate,
          placeToVisit,
          purpose,
          otherPurpose,
          visitorUserId
        });
        
        showVisitConfirmationModal({
          firstName,
          lastName,
          email,
          phone,
          visitDate,
          placeToVisit,
          purpose,
          otherPurpose,
          visitorUserId,
          placePurposes: placeToVisit === 'multiple' ? placePurposes : undefined
        });

        // Reset scheduling flag since we're not actually scheduling yet
        isScheduling = false;
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
        // Reset purpose field state and visit date state
        if (typeof (window as any).updatePurposeFieldState === 'function') {
          (window as any).updatePurposeFieldState();
        }
        if (typeof (window as any).updateVisitDateFieldState === 'function') {
          (window as any).updateVisitDateFieldState();
        }
        // Note: Visit date should remain disabled until place is selected
        // Date validation will be re-initialized when place is selected
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

  // Function to get unavailable dates for selected places (only current and upcoming dates)
  async function getUnavailableDatesForPlaces(placeIds: string[]): Promise<Array<{place_id: string, place_name: string, unavailable_from: string}>> {
    if (!placeIds || placeIds.length === 0) return [];
    
    try {
      // Get current Philippine date for filtering
      let currentPhilippineDate: Date;
      try {
        const { data: philippineDateData, error: dateError } = await supabase.rpc('get_philippine_date');
        if (dateError) {
          console.error('Error getting Philippine date:', dateError);
          currentPhilippineDate = getPhilippineDate();
        } else {
          currentPhilippineDate = new Date(philippineDateData);
        }
      } catch {
        currentPhilippineDate = getPhilippineDate();
      }
      currentPhilippineDate.setHours(0, 0, 0, 0);
      
      // Format date for query (YYYY-MM-DD)
      const currentDateStr = currentPhilippineDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('personnel_availability')
        .select(`
          place_id,
          unavailable_from,
          places_to_visit!inner(name)
        `)
        .in('place_id', placeIds)
        .not('unavailable_from', 'is', null)
        .gte('unavailable_from', currentDateStr); // Only get dates >= today
      
      if (error) {
        console.error('Error fetching unavailable dates:', error);
        return [];
      }
      
      return (data || []).map((item: any) => ({
        place_id: item.place_id,
        place_name: item.places_to_visit?.name || 'Unknown Place',
        unavailable_from: item.unavailable_from
      }));
    } catch (error) {
      console.error('Exception fetching unavailable dates:', error);
      return [];
    }
  }

  // Function to update unavailable dates display
  async function updateUnavailableDatesDisplay() {
    const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
    if (!visitDateInput) return;

    // Get selected places
    const placeToVisitSelect = document.getElementById('placeToVisit') as HTMLSelectElement;
    let selectedPlaceIds: string[] = [];
    
    if (placeToVisitSelect?.value === 'multiple') {
      // Get all checked places
      const checkedPlaces = Array.from(document.querySelectorAll('input[name="places"]:checked'))
        .map((checkbox) => (checkbox as HTMLInputElement).value);
      selectedPlaceIds = checkedPlaces;
    } else if (placeToVisitSelect?.value) {
      selectedPlaceIds = [placeToVisitSelect.value];
    }
    
    // Get or create unavailable dates display element
    let unavailableDatesDisplay = document.getElementById('unavailableDatesDisplay');
    if (!unavailableDatesDisplay && visitDateInput.parentNode) {
      unavailableDatesDisplay = document.createElement('div');
      unavailableDatesDisplay.id = 'unavailableDatesDisplay';
      unavailableDatesDisplay.className = 'mt-2 text-sm';
      // Insert after dateValidationStatus if it exists, otherwise after visitDateInput
      const dateValidationStatus = document.getElementById('dateValidationStatus');
      if (dateValidationStatus) {
        dateValidationStatus.parentNode?.insertBefore(unavailableDatesDisplay, dateValidationStatus.nextSibling);
      } else {
        visitDateInput.parentNode.insertBefore(unavailableDatesDisplay, visitDateInput.nextSibling);
      }
    }
    
    if (!unavailableDatesDisplay || selectedPlaceIds.length === 0) {
      if (unavailableDatesDisplay) {
        unavailableDatesDisplay.innerHTML = '';
      }
      return;
    }
    
    // Fetch unavailable dates
    const unavailableDates = await getUnavailableDatesForPlaces(selectedPlaceIds);
    
    if (unavailableDates.length === 0) {
      unavailableDatesDisplay.innerHTML = '';
      return;
    }
    
    // Get current Philippine date for comparison
    let currentPhilippineDate: Date;
    try {
      const { data: currentDateData, error } = await supabase.rpc('get_philippine_date');
      if (error) {
        currentPhilippineDate = getPhilippineDate();
      } else {
        currentPhilippineDate = new Date(currentDateData);
      }
    } catch (error) {
      currentPhilippineDate = getPhilippineDate();
    }
    currentPhilippineDate.setHours(0, 0, 0, 0);
    
    // Format unavailable dates
    const formatDateStr = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    // Separate current (today) and upcoming (future) unavailable dates
    // Note: Past dates are already filtered in getUnavailableDatesForPlaces query
    const currentUnavailable: typeof unavailableDates = [];
    const upcomingUnavailable: typeof unavailableDates = [];
    
    unavailableDates.forEach((item) => {
      const unavailableDate = new Date(item.unavailable_from);
      unavailableDate.setHours(0, 0, 0, 0);
      
      // Only process dates that are today or in the future (past dates already filtered)
      if (unavailableDate.getTime() === currentPhilippineDate.getTime()) {
        // Today - currently unavailable
        currentUnavailable.push(item);
      } else if (unavailableDate > currentPhilippineDate) {
        // Future dates - will be unavailable
        upcomingUnavailable.push(item);
      }
      // Past dates are ignored (already filtered in query)
    });
    
    let html = '<div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">';
    html += '<p class="text-xs font-semibold text-orange-800 dark:text-orange-200 mb-2">⚠️ Personnel Unavailable Dates:</p>';
    
    if (currentUnavailable.length > 0) {
      html += '<div class="mb-2">';
      html += '<p class="text-xs font-medium text-red-700 dark:text-red-300 mb-1">Currently Unavailable:</p>';
      html += '<ul class="text-xs text-red-600 dark:text-red-400 space-y-1 list-disc list-inside">';
      currentUnavailable.forEach((item) => {
        html += `<li>${item.place_name} - ${formatDateStr(item.unavailable_from)}</li>`;
      });
      html += '</ul></div>';
    }
    
    if (upcomingUnavailable.length > 0) {
      html += '<div>';
      html += '<p class="text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">Will be Unavailable:</p>';
      html += '<ul class="text-xs text-orange-600 dark:text-orange-400 space-y-1 list-disc list-inside">';
      upcomingUnavailable.forEach((item) => {
        html += `<li>${item.place_name} - ${formatDateStr(item.unavailable_from)}</li>`;
      });
      html += '</ul></div>';
    }
    
    html += '</div>';
    unavailableDatesDisplay.innerHTML = html;
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
    
    // Determine max date:
    // - If today is the last day of the month, allow selecting dates into next month
    // - Otherwise, cap at the end of the current month
    const endOfCurrentMonth = new Date(philippineToday.getFullYear(), philippineToday.getMonth() + 1, 0);
    const isLastDayOfMonth = philippineToday.getDate() === endOfCurrentMonth.getDate();
    philippineMaxDate = isLastDayOfMonth
      ? new Date(philippineToday.getFullYear(), philippineToday.getMonth() + 2, 0)
      : endOfCurrentMonth;

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

    // Expose validateDate function globally so it can be called when place selection changes
    (window as any).validateVisitDate = async function() {
      await validateDate();
    };

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

      // Check if date meets required days for selected purpose
      const placeToVisitSelect = document.getElementById('placeToVisit') as HTMLSelectElement;
      let maxRequiredDays = 0;

      if (placeToVisitSelect?.value === 'multiple') {
        // For multiple places, find the maximum required days across all selected purposes
        const checkedPlaceIds = Array.from(document.querySelectorAll('input[name="places"]:checked'))
          .map((checkbox) => (checkbox as HTMLInputElement).value);

        for (const placeId of checkedPlaceIds) {
          const purposeSelect = document.getElementById(`purpose_${placeId}`) as HTMLSelectElement;
          if (purposeSelect && purposeSelect.value) {
            const selectedOption = purposeSelect.options[purposeSelect.selectedIndex];
            if (selectedOption && selectedOption.value !== 'other') {
              const requiredDays = parseInt(selectedOption.getAttribute('data-required-days') || '0', 10);
              maxRequiredDays = Math.max(maxRequiredDays, requiredDays);
            }
          }
        }
      } else if (placeToVisitSelect?.value && placeToVisitSelect.value !== '') {
        // Single place - get required days from selected purpose
        const purposeSelect = document.getElementById('purpose') as HTMLSelectElement;
        if (purposeSelect && purposeSelect.value) {
          const selectedOption = purposeSelect.options[purposeSelect.selectedIndex];
          if (selectedOption && selectedOption.value !== 'other') {
            maxRequiredDays = parseInt(selectedOption.getAttribute('data-required-days') || '0', 10);
          }
        }
      }

      // Calculate minimum allowed date based on required days
      const minAllowedDate = new Date(currentPhilippineDate);
      minAllowedDate.setDate(minAllowedDate.getDate() + maxRequiredDays);

      // Clear previous validation
      visitDateInput.classList.remove('border-red-500', 'border-green-500', 'border-yellow-500', 'focus:border-red-500', 'focus:border-green-500', 'focus:border-yellow-500');
      if (dateValidationStatus) dateValidationStatus.className = 'mt-1 text-sm';

      // Check if date meets required advance notice (must be at least the required days away)
      // Allow dates that are >= minAllowedDate (i.e., on or after the required days)
      if (maxRequiredDays > 0 && philippineSelectedDate.getTime() < minAllowedDate.getTime()) {
        visitDateInput.classList.add('border-red-500', 'focus:border-red-500');
        if (dateValidationStatus) {
          dateValidationStatus.textContent = `❌ This purpose requires ${maxRequiredDays} day${maxRequiredDays > 1 ? 's' : ''} advance notice. You can schedule for ${minAllowedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} or any date after.`;
          dateValidationStatus.className = 'mt-1 text-sm text-red-600 font-medium';
        }
        // Disable submit button
        const scheduleSubmitBtnCheck = document.getElementById('scheduleSubmitBtn') as HTMLButtonElement;
        if (scheduleSubmitBtnCheck) scheduleSubmitBtnCheck.disabled = true;
        return false;
      }
      
      // If date meets the minimum requirement (on or after required days), show success
      if (maxRequiredDays > 0 && philippineSelectedDate.getTime() >= minAllowedDate.getTime()) {
        visitDateInput.classList.add('border-green-500', 'focus:border-green-500');
        if (dateValidationStatus) {
          const daysFromToday = Math.floor((philippineSelectedDate.getTime() - currentPhilippineDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysFromToday === maxRequiredDays) {
            dateValidationStatus.textContent = `✅ Date meets the ${maxRequiredDays} day${maxRequiredDays > 1 ? 's' : ''} advance notice requirement.`;
          } else {
            dateValidationStatus.textContent = `✅ Date is ${daysFromToday} day${daysFromToday > 1 ? 's' : ''} away (${maxRequiredDays} day${maxRequiredDays > 1 ? 's' : ''} minimum required).`;
          }
          dateValidationStatus.className = 'mt-1 text-sm text-green-600 font-medium';
        }
      }

      // Check if date is in the past
      if (philippineSelectedDate.getTime() < currentPhilippineDate.getTime()) {
        visitDateInput.classList.add('border-red-500', 'focus:border-red-500');
        if (dateValidationStatus) {
          dateValidationStatus.textContent = `❌ Cannot schedule for past dates. Current Philippine date is ${currentPhilippineDate.toLocaleDateString()}.`;
          dateValidationStatus.className = 'mt-1 text-sm text-red-600 font-medium';
        }
        // Disable submit button
        const scheduleSubmitBtnCheck = document.getElementById('scheduleSubmitBtn') as HTMLButtonElement;
        if (scheduleSubmitBtnCheck) scheduleSubmitBtnCheck.disabled = true;
        return false;
      }

      // Check if date is beyond the allowed max date
      if (philippineSelectedDate.getTime() > philippineMaxDate.getTime()) {
        visitDateInput.classList.add('border-red-500', 'focus:border-red-500');
        if (dateValidationStatus) {
          const maxRangeLabel = isLastDayOfMonth ? 'next month' : 'the current month';
          dateValidationStatus.textContent = `❌ Cannot schedule beyond ${maxRangeLabel}. Maximum allowed date is ${philippineMaxDate.toLocaleDateString()}.`;
          dateValidationStatus.className = 'mt-1 text-sm text-red-600 font-medium';
        }
        // Disable submit button
        const scheduleSubmitBtnCheck = document.getElementById('scheduleSubmitBtn') as HTMLButtonElement;
        if (scheduleSubmitBtnCheck) scheduleSubmitBtnCheck.disabled = true;
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
          .in('status', ['pending', 'completed', 'completed_flagged']);
        if (checkError) {
          console.error('Error checking for existing scheduled visit:', checkError);
        } else if (existingVisits && existingVisits.length > 0) {
          visitDateInput.classList.add('border-red-500', 'focus:border-red-500');
          if (dateValidationStatus) {
            dateValidationStatus.textContent = `❌ You already have a scheduled visit on this date.`;
            dateValidationStatus.className = 'mt-1 text-sm text-red-600 font-medium';
          }
          const scheduleSubmitBtnCheck = document.getElementById('scheduleSubmitBtn') as HTMLButtonElement;
          if (scheduleSubmitBtnCheck) scheduleSubmitBtnCheck.disabled = true;
          return false;
        } else {
          // If no error, re-enable the button (unless another validation disables it)
          const scheduleSubmitBtnCheck = document.getElementById('scheduleSubmitBtn') as HTMLButtonElement;
          if (scheduleSubmitBtnCheck) scheduleSubmitBtnCheck.disabled = false;
        }
      }

      // Get submit button reference
      const scheduleSubmitBtnLocal = document.getElementById('scheduleSubmitBtn') as HTMLButtonElement;
      
      // Get selected places for validation
      // Reuse placeToVisitSelect already declared above
      let selectedPlaceIds: string[] = [];
      if (placeToVisitSelect?.value === 'multiple') {
        selectedPlaceIds = Array.from(document.querySelectorAll('input[name="places"]:checked'))
          .map((checkbox) => (checkbox as HTMLInputElement).value);
      } else if (placeToVisitSelect?.value) {
        selectedPlaceIds = [placeToVisitSelect.value];
      }
      
      // Check place visit limits for selected places and date
      if (selectedPlaceIds.length > 0 && visitDateInput.value) {
        const selectedDateStr = philippineSelectedDate.toISOString().split('T')[0];
        let placeLimitError = '';
        let hasPlaceLimitError = false;
        
        for (const placeId of selectedPlaceIds) {
          try {
            const { data: limitCheck, error: limitError } = await supabase.rpc('check_place_weekly_visit_limit', {
              p_place_id: placeId,
              p_visit_date: selectedDateStr
            });
            
            if (limitError) {
              console.error('Error checking visit limit for place:', placeId, limitError);
              // Continue checking other places even if one fails
            } else if (!limitCheck) {
              // Get place name for error message
              const placesWithAvailability = (window as any).placesWithAvailability;
              const place = placesWithAvailability?.find((p: any) => p.id === placeId);
              const placeName = place?.name || 'this place';
              
              hasPlaceLimitError = true;
              placeLimitError = `❌ ${placeName} has reached its visit limit for this date. Please choose a different place or date.`;
              break; // Stop checking once we find a limit issue
            }
          } catch (error) {
            console.error('Exception checking place visit limit:', error);
          }
        }
        
        if (hasPlaceLimitError) {
          visitDateInput.classList.add('border-red-500', 'focus:border-red-500');
          if (dateValidationStatus) {
            dateValidationStatus.textContent = placeLimitError;
            dateValidationStatus.className = 'mt-1 text-sm text-red-600 font-medium';
          }
          if (scheduleSubmitBtnLocal) {
            scheduleSubmitBtnLocal.disabled = true;
          }
          return false;
        }
      }
      
      // Check weekly visit limit (2 visits per week per user/email)
      if (visitDateInput.value && (userId || userEmail)) {
        try {
          // Calculate week start and end for the selected date
          const selectedDateForWeek = new Date(philippineSelectedDate);
          const dayOfWeek = selectedDateForWeek.getDay(); // 0 = Sunday, 6 = Saturday
          const weekStart = new Date(selectedDateForWeek);
          weekStart.setDate(weekStart.getDate() - dayOfWeek);
          weekStart.setHours(0, 0, 0, 0);
          
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          
          // Only check visits from today onwards (not past visits)
          const weekStartForQuery = weekStart.getTime() < currentPhilippineDate.getTime() 
            ? currentPhilippineDate 
            : weekStart;
          
          const weekStartStr = weekStartForQuery.toISOString().split('T')[0];
          const weekEndStr = weekEnd.toISOString().split('T')[0];
          
          let weeklyVisitCount = 0;
          
          if (userId) {
            // Check by user_id
            const { data: visits, error: visitError } = await supabase
              .from('scheduled_visits')
              .select('id')
              .eq('visitor_user_id', userId)
              .gte('visit_date', weekStartStr)
              .lte('visit_date', weekEndStr)
              .in('status', ['pending', 'completed', 'completed_flagged']);
            
            if (visitError) {
              console.error('Error checking weekly visit limit:', visitError);
            } else {
              weeklyVisitCount = visits?.length || 0;
            }
          } else if (userEmail) {
            // Check by email
            const { data: visits, error: visitError } = await supabase
              .from('scheduled_visits')
              .select('id')
              .eq('visitor_email', userEmail)
              .gte('visit_date', weekStartStr)
              .lte('visit_date', weekEndStr)
              .in('status', ['pending', 'completed', 'completed_flagged']);
            
            if (visitError) {
              console.error('Error checking weekly visit limit:', visitError);
            } else {
              weeklyVisitCount = visits?.length || 0;
            }
          }
          
          if (weeklyVisitCount >= 2) {
            visitDateInput.classList.add('border-red-500', 'focus:border-red-500');
            if (dateValidationStatus) {
              dateValidationStatus.textContent = `❌ You have reached your weekly visit limit (2 visits per week). You already have ${weeklyVisitCount} visit(s) scheduled for this week. Please choose a different week.`;
              dateValidationStatus.className = 'mt-1 text-sm text-red-600 font-medium';
            }
            if (scheduleSubmitBtnLocal) {
              scheduleSubmitBtnLocal.disabled = true;
            }
            return false;
          } else if (weeklyVisitCount === 1) {
            // Warning: one more visit allowed
            if (dateValidationStatus && !dateValidationStatus.textContent.includes('❌')) {
              const existingText = dateValidationStatus.textContent || '';
              if (!existingText.includes('weekly visit limit')) {
                visitDateInput.classList.add('border-yellow-500', 'focus:border-yellow-500');
                dateValidationStatus.textContent = `${existingText ? existingText + ' ' : ''}⚠️ You have 1 visit scheduled this week. You can schedule 1 more visit.`;
                dateValidationStatus.className = 'mt-1 text-sm text-yellow-600 font-medium';
              }
            }
          }
        } catch (error) {
          console.error('Exception checking weekly visit limit:', error);
        }
      }
      
      // Check if selected date matches any unavailable dates for selected places
      
      let hasUnavailableDate = false;
      let unavailableWarning = '';
      
      // Only check unavailable dates if a place is selected and a date is chosen
      if (selectedPlaceIds.length > 0 && visitDateInput.value) {
        const unavailableDates = await getUnavailableDatesForPlaces(selectedPlaceIds);
        const selectedDateStr = philippineSelectedDate.toISOString().split('T')[0];
        const matchingUnavailable = unavailableDates.filter((item) => {
          const unavailableDate = new Date(item.unavailable_from);
          unavailableDate.setHours(0, 0, 0, 0);
          return unavailableDate.toISOString().split('T')[0] === selectedDateStr;
        });
        
        if (matchingUnavailable.length > 0) {
          hasUnavailableDate = true;
          const placeNames = matchingUnavailable.map(item => item.place_name).join(', ');
          unavailableWarning = `⚠️ Personnel at ${placeNames} ${matchingUnavailable.length === 1 ? 'is' : 'are'} unavailable on this date. Cannot schedule on this date.`;
        }
      }
      
      // Disable submit button if date matches unavailable dates
      if (hasUnavailableDate) {
        if (scheduleSubmitBtnLocal) {
          scheduleSubmitBtnLocal.disabled = true;
        }
      }

      // Check if date is today
      if (philippineSelectedDate.getTime() === currentPhilippineDate.getTime()) {
        if (hasUnavailableDate) {
          visitDateInput.classList.add('border-orange-500', 'focus:border-orange-500');
          if (dateValidationStatus) {
            dateValidationStatus.textContent = `${unavailableWarning} Cannot schedule on this date.`;
            dateValidationStatus.className = 'mt-1 text-sm text-orange-600 font-medium';
          }
          return false; // Return false to prevent scheduling
        } else {
          visitDateInput.classList.add('border-yellow-500', 'focus:border-yellow-500');
          if (dateValidationStatus) {
            dateValidationStatus.textContent = `⚠️ Scheduling for today (${currentPhilippineDate.toLocaleDateString()}). Please ensure you can visit today.`;
            dateValidationStatus.className = 'mt-1 text-sm text-yellow-600 font-medium';
          }
        }
        return true;
      }

      // Check if date is tomorrow
      const philippineTomorrow = new Date(currentPhilippineDate);
      philippineTomorrow.setDate(philippineTomorrow.getDate() + 1);
      if (philippineSelectedDate.getTime() === philippineTomorrow.getTime()) {
        if (hasUnavailableDate) {
          visitDateInput.classList.add('border-orange-500', 'focus:border-orange-500');
          if (dateValidationStatus) {
            dateValidationStatus.textContent = `${unavailableWarning} Cannot schedule on this date.`;
            dateValidationStatus.className = 'mt-1 text-sm text-orange-600 font-medium';
          }
          return false; // Return false to prevent scheduling
        } else {
          visitDateInput.classList.add('border-green-500', 'focus:border-green-500');
          if (dateValidationStatus) {
            dateValidationStatus.textContent = `✅ Scheduling for tomorrow (${philippineTomorrow.toLocaleDateString()}).`;
            dateValidationStatus.className = 'mt-1 text-sm text-green-600 font-medium';
          }
        }
        return true;
      }

      // Valid future date - only show success if no errors or warnings
      if (hasUnavailableDate) {
        visitDateInput.classList.add('border-orange-500', 'focus:border-orange-500');
        if (dateValidationStatus) {
          // Only overwrite if there's no critical error message already
          if (!dateValidationStatus.textContent.includes('❌')) {
            dateValidationStatus.textContent = `${unavailableWarning} Cannot schedule on this date.`;
            dateValidationStatus.className = 'mt-1 text-sm text-orange-600 font-medium';
          }
        }
        return false; // Return false to prevent scheduling
      } else {
        // Only show success message if there are no error messages
        if (dateValidationStatus && !dateValidationStatus.textContent.includes('❌')) {
          // Check if we already have a warning message (weekly limit at 1)
          if (!dateValidationStatus.textContent.includes('⚠️') || dateValidationStatus.textContent.includes('weekly visit limit')) {
            visitDateInput.classList.add('border-green-500', 'focus:border-green-500');
            // Only show generic success if we don't have a specific message already
            if (!dateValidationStatus.textContent || dateValidationStatus.textContent.includes('Valid date selected')) {
              dateValidationStatus.textContent = `✅ Valid date selected: ${philippineSelectedDate.toLocaleDateString()}.`;
              dateValidationStatus.className = 'mt-1 text-sm text-green-600 font-medium';
            }
          } else {
            // Keep the warning message but ensure border is appropriate
            visitDateInput.classList.add('border-yellow-500', 'focus:border-yellow-500');
          }
        } else if (!dateValidationStatus || !dateValidationStatus.textContent.includes('❌')) {
          // No status element or no error, show success
          visitDateInput.classList.add('border-green-500', 'focus:border-green-500');
          if (dateValidationStatus) {
            dateValidationStatus.textContent = `✅ Valid date selected: ${philippineSelectedDate.toLocaleDateString()}.`;
            dateValidationStatus.className = 'mt-1 text-sm text-green-600 font-medium';
          }
        }
      }
      
      // If no unavailable date and we passed all validations, update button state
      // The updateSubmitButtonState function will handle final state based on form completion
      // Always update button state after date validation
      updateSubmitButtonState();
      return true;
    }

    // Add event listeners for real-time validation
    // Remove existing listeners to avoid duplicates
    visitDateInput.removeEventListener('change', validateDate);
    visitDateInput.removeEventListener('input', validateDate);
    visitDateInput.removeEventListener('blur', validateDate);
    
    // Add fresh event listeners
    visitDateInput.addEventListener('change', async () => {
      await validateDate();
      await updateUnavailableDatesDisplay();
    });
    visitDateInput.addEventListener('input', async () => {
      await validateDate();
      await updateUnavailableDatesDisplay();
    });
    visitDateInput.addEventListener('blur', async () => {
      await validateDate();
      await updateUnavailableDatesDisplay();
    });

    // Initial validation
    await validateDate();
    
    // Update unavailable dates display
    await updateUnavailableDatesDisplay();

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
    const unavailableDatesDisplay = document.getElementById('unavailableDatesDisplay');
    
    if (visitDateInput) {
      visitDateInput.classList.remove('border-red-500', 'border-green-500', 'border-yellow-500', 'border-orange-500', 'focus:border-red-500', 'focus:border-green-500', 'focus:border-yellow-500', 'focus:border-orange-500');
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
    
    if (unavailableDatesDisplay) {
      unavailableDatesDisplay.innerHTML = '';
    }
  }

  // Expose for external callers (e.g., confirmation scheduler)
  (window as any).resetDateValidation = resetDateValidation;

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
      
      // Calculate the week boundaries (Sunday to Saturday) - same as home page
      const weekStart = new Date(philippineToday);
      const dayOfWeek = weekStart.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysToSubtract = dayOfWeek; // Days to go back to Sunday
      weekStart.setDate(philippineToday.getDate() - daysToSubtract);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Query the database for all pending, completed, and completed_flagged visits for the current week
      // Use the same logic as home page - only current week visits matter
      const { data: visits, error } = await supabase
        .from('scheduled_visits')
        .select('visit_date, status')
        .or(`visitor_user_id.eq.${user.id},visitor_email.eq.${user.email}`)
        .in('status', ['pending', 'completed', 'completed_flagged']);

      if (error) {
        console.error('Error loading weekly visit count for modal:', error);
        return;
      }

      // Filter visits in JavaScript to ensure proper date comparison (same as home page)
      const currentWeekVisits = visits?.filter(visit => {
        const visitDate = new Date(visit.visit_date);
        return visitDate >= weekStart && visitDate <= weekEnd;
      }) || [];

      // Count the visits for current week only
      const visitCount = currentWeekVisits.length;
      const pendingCount = currentWeekVisits.filter(v => v.status === 'pending').length;
      const completedCount = currentWeekVisits.filter(v => v.status === 'completed').length;
      const completedFlaggedCount = currentWeekVisits.filter(v => v.status === 'completed_flagged').length;
      const totalCompletedSchedules = completedCount + completedFlaggedCount;

      // Calculate remaining visits for this week (same logic as home page)
      const remainingVisits = Math.max(0, 2 - visitCount);

      // Format the week range for display (same as home page)
      const weekStartMonth = weekStart.toLocaleString('en-US', { month: 'short' });
      const weekStartDay = weekStart.getDate();
      const weekEndMonth = weekEnd.toLocaleString('en-US', { month: 'short' });
      const weekEndDay = weekEnd.getDate();
      const weekYear = weekEnd.getFullYear();
      let weekRangeStr = '';
      if (weekStartMonth === weekEndMonth) {
        weekRangeStr = `${weekStartMonth} ${weekStartDay}-${weekEndDay}, ${weekYear}`;
        } else {
        weekRangeStr = `${weekStartMonth} ${weekStartDay} - ${weekEndMonth} ${weekEndDay}, ${weekYear}`;
      }

      // Create status display (same as home page)
      let statusHtml = '';
      if (remainingVisits === 2) {
        const completedText = completedFlaggedCount > 0 ? `${totalCompletedSchedules} completed (${completedFlaggedCount} flagged)` : `${totalCompletedSchedules} completed`;
        statusHtml = `<span class="font-medium text-green-600 dark:text-green-400">2 visits remaining</span> (${pendingCount} pending this week, ${completedText})`;
      } else if (remainingVisits === 1) {
        const completedText = completedFlaggedCount > 0 ? `${totalCompletedSchedules} completed (${completedFlaggedCount} flagged)` : `${totalCompletedSchedules} completed`;
        statusHtml = `<span class="font-medium text-yellow-600 dark:text-yellow-400">1 visit remaining</span> (${pendingCount} pending this week, ${completedText})`;
      } else {
        const completedText = completedFlaggedCount > 0 ? `${totalCompletedSchedules} completed (${completedFlaggedCount} flagged)` : `${totalCompletedSchedules} completed`;
        statusHtml = `<span class="font-medium text-red-600 dark:text-red-400">No visits remaining</span> (${pendingCount} pending this week, ${completedText})`;
      }

      // Create the weekly visit count display (same styling as home page)
      const weeklyVisitDiv = document.createElement('div');
      weeklyVisitDiv.id = 'modalWeeklyVisitCount';
      weeklyVisitDiv.className = 'mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4';
      
      weeklyVisitDiv.innerHTML = `
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
              Weekly Visit Status
            </h3>
            <div class="mt-1 text-sm text-blue-700 dark:text-blue-300">
              <span class="block font-semibold">Week of ${weekRangeStr}</span>${statusHtml}
        </div>
        <div class="mt-1 text-xs text-blue-600 dark:text-blue-400">
          Maximum 2 visits per week per user account
            </div>
          </div>
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
      
      // Calculate the week boundaries (Sunday to Saturday) - same as home page
      const weekStart = new Date(philippineToday);
      const dayOfWeek = weekStart.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysToSubtract = dayOfWeek; // Days to go back to Sunday
      weekStart.setDate(philippineToday.getDate() - daysToSubtract);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Query the database for all pending, completed, and completed_flagged visits for the current week
      // Use the same logic as home page - only current week visits matter
      const { data: visits, error } = await supabase
        .from('scheduled_visits')
        .select('visit_date, status')
        .or(`visitor_user_id.eq.${user.id},visitor_email.eq.${user.email}`)
        .in('status', ['pending', 'completed', 'completed_flagged']);

      if (error) {
        console.error('Error refreshing weekly visit count for modal:', error);
        return;
      }

      // Filter visits in JavaScript to ensure proper date comparison (same as home page)
      const currentWeekVisits = visits?.filter(visit => {
          const visitDate = new Date(visit.visit_date);
        return visitDate >= weekStart && visitDate <= weekEnd;
      }) || [];

      // Count the visits for current week only
      const visitCount = currentWeekVisits.length;
      const pendingCount = currentWeekVisits.filter(v => v.status === 'pending').length;
      const completedCount = currentWeekVisits.filter(v => v.status === 'completed').length;
      const completedFlaggedCount = currentWeekVisits.filter(v => v.status === 'completed_flagged').length;
      const totalCompletedSchedules = completedCount + completedFlaggedCount;

      // Calculate remaining visits for this week (same logic as home page)
      const remainingVisits = Math.max(0, 2 - visitCount);

      // Format the week range for display (same as home page)
      const weekStartMonth = weekStart.toLocaleString('en-US', { month: 'short' });
      const weekStartDay = weekStart.getDate();
      const weekEndMonth = weekEnd.toLocaleString('en-US', { month: 'short' });
      const weekEndDay = weekEnd.getDate();
      const weekYear = weekEnd.getFullYear();
          let weekRangeStr = '';
          if (weekStartMonth === weekEndMonth) {
            weekRangeStr = `${weekStartMonth} ${weekStartDay}-${weekEndDay}, ${weekYear}`;
          } else {
            weekRangeStr = `${weekStartMonth} ${weekStartDay} - ${weekEndMonth} ${weekEndDay}, ${weekYear}`;
          }
          
      // Create status display (same as home page)
      let statusHtml = '';
      if (remainingVisits === 2) {
        const completedText = completedFlaggedCount > 0 ? `${totalCompletedSchedules} completed (${completedFlaggedCount} flagged)` : `${totalCompletedSchedules} completed`;
        statusHtml = `<span class="font-medium text-green-600 dark:text-green-400">2 visits remaining</span> (${pendingCount} pending this week, ${completedText})`;
      } else if (remainingVisits === 1) {
        const completedText = completedFlaggedCount > 0 ? `${totalCompletedSchedules} completed (${completedFlaggedCount} flagged)` : `${totalCompletedSchedules} completed`;
        statusHtml = `<span class="font-medium text-yellow-600 dark:text-yellow-400">1 visit remaining</span> (${pendingCount} pending this week, ${completedText})`;
      } else {
        const completedText = completedFlaggedCount > 0 ? `${totalCompletedSchedules} completed (${completedFlaggedCount} flagged)` : `${totalCompletedSchedules} completed`;
        statusHtml = `<span class="font-medium text-red-600 dark:text-red-400">No visits remaining</span> (${pendingCount} pending this week, ${completedText})`;
      }

      // Update the display (same styling as home page)
      modalWeeklyVisitCount.innerHTML = `
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
              Weekly Visit Status
            </h3>
            <div class="mt-1 text-sm text-blue-700 dark:text-blue-300">
              <span class="block font-semibold">Week of ${weekRangeStr}</span>${statusHtml}
            </div>
        <div class="mt-1 text-xs text-blue-600 dark:text-blue-400">
          Maximum 2 visits per week per user account
            </div>
          </div>
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
      .in('status', ['pending', 'completed', 'completed_flagged'])
      .gte('visit_date', weekStart.toISOString())
      .lte('visit_date', weekEnd.toISOString());

    // Query for previous week's visits for this email
    const { data: prevWeekVisits, error: prevWeekError } = await supabase
      .from('scheduled_visits')
      .select('visit_date, status')
      .eq('visitor_email', email)
      .in('status', ['pending', 'completed', 'completed_flagged'])
      .gte('visit_date', prevWeekStart.toISOString())
      .lte('visit_date', prevWeekEnd.toISOString());

    // Query for future schedules (next week and beyond within the month)
    const { data: futureVisits, error: futureError } = await supabase
      .from('scheduled_visits')
      .select('visit_date, status')
      .eq('visitor_email', email)
      .in('status', ['pending', 'completed', 'completed_flagged'])
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

    // Count the pending, completed, and completed_flagged visits for the current week
    const visitCount = visits?.length || 0;
    const pendingCount = visits?.filter(v => v.status === 'pending').length || 0;
    const completedCount = visits?.filter(v => v.status === 'completed').length || 0;
    const completedFlaggedCount = visits?.filter(v => v.status === 'completed_flagged').length || 0;

    // Count the pending, completed, and completed_flagged visits for the previous week
    const prevPendingCount = prevWeekVisits?.filter(v => v.status === 'pending').length || 0;
    const prevCompletedCount = prevWeekVisits?.filter(v => v.status === 'completed').length || 0;
    const prevCompletedFlaggedCount = prevWeekVisits?.filter(v => v.status === 'completed_flagged').length || 0;
    const prevTotalCount = prevWeekVisits?.length || 0;

    // Count future visits
    const futureVisitCount = futureVisits?.length || 0;

    // NEW LOGIC: Determine refresh slots based on previous week
    let refreshSlots = 2; // default: allow 2 visits
    
    // First, check previous week logic
    if (prevTotalCount > 0) {
      const prevCompletedTotal = prevCompletedCount + prevCompletedFlaggedCount;
      if (prevPendingCount === 2) {
        refreshSlots = 0; // 2 pending = no refresh
      } else if (prevPendingCount === 1 && prevCompletedTotal === 1) {
        refreshSlots = 1; // 1 pending, 1 completed (including flagged) = 1 refresh
      } else if (prevPendingCount === 0 && prevCompletedTotal === 2) {
        refreshSlots = 2; // 2 completed (including flagged) = 2 refresh
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
      const completedText = completedFlaggedCount > 0 ? `${completedCount + completedFlaggedCount} completed (${completedFlaggedCount} flagged)` : `${completedCount} completed`;
      statusHtml = `<span class="font-medium text-yellow-600 dark:text-yellow-400">1 visit remaining</span> (${pendingCount} pending, ${completedText})`;
    } else {
      const completedText = completedFlaggedCount > 0 ? `${completedCount + completedFlaggedCount} completed (${completedFlaggedCount} flagged)` : `${completedCount} completed`;
      statusHtml = `<span class="font-medium text-red-600 dark:text-red-400">No visits remaining</span> (${pendingCount} pending, ${completedText})`;
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

// Interface for visit confirmation data
interface VisitConfirmationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  visitDate: string;
  placeToVisit: string;
  purpose: string;
  otherPurpose: string;
  visitorUserId: string | null;
  placePurposes?: Array<{ placeId: string; purpose: string; otherPurpose?: string }>;
}

// Function to show the visit confirmation modal
export function showVisitConfirmationModal(data: VisitConfirmationData) {
  console.log('showVisitConfirmationModal called with data:', data);
  const modal = document.getElementById('visitConfirmationModal');
  console.log('Modal element found:', !!modal);
  if (!modal) {
    console.error('Confirmation modal not found in DOM');
    return;
  }

  // Ensure visitorUserId is properly handled before storing
  const cleanData = {
    ...data,
    visitorUserId: (data.visitorUserId && data.visitorUserId.trim() !== '') ? data.visitorUserId : null
  };
  
  console.log('showVisitConfirmationModal - Original data:', data);
  console.log('showVisitConfirmationModal - Cleaned data:', cleanData);
  
  // Store the data in the modal for later use
  (modal as any).visitData = cleanData;

  // Get place names for display
  let placesText = '';
  if (data.placeToVisit === 'multiple') {
    const selectedPlaces = Array.from(document.querySelectorAll('input[name="places"]:checked'))
      .map((checkbox) => {
        const label = document.querySelector(`label[for="${(checkbox as HTMLInputElement).id}"]`);
        return label?.textContent?.trim() || (checkbox as HTMLInputElement).value;
      });
    placesText = selectedPlaces.join(', ');
  } else {
    const placeSelect = document.getElementById('placeToVisit') as HTMLSelectElement;
    const selectedOption = placeSelect?.options[placeSelect.selectedIndex];
    placesText = selectedOption?.textContent?.trim() || data.placeToVisit;
  }

  // Format the visit date for display
  const visitDate = new Date(data.visitDate);
  const formattedDate = visitDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format the purpose for display
  let purposeText = '';
  if (data.placeToVisit === 'multiple' && data.placePurposes && data.placePurposes.length > 0) {
    // For multiple places, show purposes for each place
    const placeNames = placesText.split(', ');
    purposeText = data.placePurposes.map((pp, index) => {
      const placeName = placeNames[index] || `Place ${index + 1}`;
      const purpose = pp.purpose;
      return `${placeName}: ${purpose}`;
    }).join('; ');
  } else {
    purposeText = data.purpose === 'other' ? data.otherPurpose : data.purpose;
  }

  // Update the confirmation modal with the visit details
  const confirmationName = document.getElementById('confirmationName');
  const confirmationEmail = document.getElementById('confirmationEmail');
  const confirmationPhone = document.getElementById('confirmationPhone');
  const confirmationDate = document.getElementById('confirmationDate');
  const confirmationPlaces = document.getElementById('confirmationPlaces');
  const confirmationPurpose = document.getElementById('confirmationPurpose');

  if (confirmationName) confirmationName.textContent = `${data.firstName} ${data.lastName}`;
  if (confirmationEmail) confirmationEmail.textContent = data.email;
  if (confirmationPhone) confirmationPhone.textContent = `+63${data.phone}`;
  if (confirmationDate) confirmationDate.textContent = formattedDate;
  if (confirmationPlaces) confirmationPlaces.textContent = placesText;
  if (confirmationPurpose) confirmationPurpose.textContent = purposeText;

  // Reset the agreement checkbox
  const agreementCheckbox = document.getElementById('visitAgreement') as HTMLInputElement;
  if (agreementCheckbox) {
    agreementCheckbox.checked = false;
  }

  // Enable confirm button initially (no face detection required here)
  const confirmBtn = document.getElementById('confirmScheduleBtn') as HTMLButtonElement;
  if (confirmBtn) {
    confirmBtn.disabled = false;
  }

  // Show the modal
  modal.classList.remove('hidden');
  // No face verification required in this flow
  (modal as any).faceVerified = true;
  
  // Set up event listeners for this modal instance
  setupConfirmationModalEventListeners();
}

// Function to handle the actual visit scheduling
async function scheduleVisitFromConfirmation(data: VisitConfirmationData) {
  const confirmBtn = document.getElementById('confirmScheduleBtn') as HTMLButtonElement;
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Scheduling...';
  }

  // Show global loading overlay during scheduling
  showLoadingOverlay('Scheduling in progress');

  try {
    let placeIds: string[];
    
    if (data.placeToVisit === 'multiple') {
      placeIds = Array.from(document.querySelectorAll('input[name="places"]:checked'))
        .map((checkbox) => (checkbox as HTMLInputElement).value);
    } else {
      placeIds = [data.placeToVisit];
    }

    // Ensure visitorUserId is properly handled - convert empty string to null
    const visitorUserId = data.visitorUserId && data.visitorUserId.trim() !== '' ? data.visitorUserId : null;
    
    // Prevent duplicate schedules for the same date
    // Check by user_id if available; otherwise check by email
    try {
      const baseQuery = supabase
        .from('scheduled_visits')
        .select('id, status')
        .eq('visit_date', data.visitDate)
        .in('status', ['pending', 'completed', 'completed_flagged'])
        .limit(1);

      let existing;
      if (visitorUserId) {
        ({ data: existing } = await baseQuery.eq('visitor_user_id', visitorUserId));
      } else {
        ({ data: existing } = await baseQuery.eq('visitor_email', data.email));
      }

      if (existing && existing.length > 0) {
        throw new Error('You already have a scheduled visit on this date with this account/email.');
      }
    } catch (checkErr: any) {
      if (checkErr instanceof Error && checkErr.message.startsWith('You already have')) {
        throw checkErr;
      }
      throw new Error('Error checking existing schedules. Please try again.');
    }

    // Call the schedule_visit function
    const { data: visitData, error: scheduleError } = await supabase.rpc('schedule_visit', {
      p_visitor_first_name: data.firstName,
      p_visitor_last_name: data.lastName,
      p_visitor_email: data.email,
      p_visitor_phone: data.phone,
      p_place_ids: placeIds,
      p_visit_date: data.visitDate,
      p_purpose: data.purpose === 'other' ? data.otherPurpose : data.purpose,
      p_other_purpose: data.purpose === 'other' ? data.otherPurpose : null,
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
        throw new Error('Cannot schedule visits beyond the current month. Please select a date within this month.');
      } else if (scheduleError.message.includes('Only users with visitor role can schedule visits')) {
        throw new Error('Only visitors can schedule visits. Please contact an administrator if you need access.');
      } else if (scheduleError.message.includes('You already have a scheduled visit on this date.')) {
        throw new Error('You already have a scheduled visit on this date. Please choose a different date.');
      } else if (scheduleError.message.includes('visit limit reached')) {
        throw new Error('This place has reached its visit limit. Please choose a different place or date.');
      } else {
        throw new Error(`Scheduling failed: ${scheduleError.message}`);
      }
    }

    // Show success message and update overlay
    showNotification('Visit scheduled successfully! You will receive a confirmation email shortly.', 'success');
    updateLoadingOverlay('Completed');
    
    // Close both modals
    const confirmationModal = document.getElementById('visitConfirmationModal');
    const scheduleModal = document.getElementById('scheduleModal');
    
    if (confirmationModal) {
      confirmationModal.classList.add('hidden');
    }
    if (scheduleModal) {
      scheduleModal.classList.add('hidden');
    }

    // Show visit ID and QR code modal
    await showVisitIdAndQRModal(visitData);

    // Hide loading overlay after showing the modal
    hideLoadingOverlay();

    // Reset the schedule form
    const scheduleForm = document.getElementById('scheduleForm') as HTMLFormElement;
    if (scheduleForm) {
      scheduleForm.reset();
    }

    // Reset form state
    resetDateValidation();
    isEmailVerified = false;
    verificationCodeSent = false;
    const verificationCodeContainer = document.getElementById('verificationCodeContainer');
    const verificationCode = document.getElementById('verificationCode') as HTMLInputElement;
    const verificationStatus = document.getElementById('verificationStatus');
    const emailValidationStatus = document.getElementById('emailValidationStatus');
    const sendVerificationCode = document.getElementById('sendVerificationCode');
    const scheduleEmail = document.getElementById('scheduleEmail') as HTMLInputElement;

    if (verificationCodeContainer) verificationCodeContainer.classList.add('hidden');
    if (verificationCode) verificationCode.value = '';
    if (verificationStatus) verificationStatus.textContent = '';
    if (emailValidationStatus) {
      emailValidationStatus.textContent = '';
      emailValidationStatus.className = 'mt-1 text-sm';
    }
    (window as any).modalClearTimers?.();
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
    // Use global-safe accessor to avoid reference errors when this function is out of scope
    (window as any).modalEnableVerificationInputs?.();

  } catch (error: any) {
    console.error('Error scheduling visit:', error);
    showNotification(error.message || 'Failed to schedule visit. Please try again.', 'error');
    
    // Re-enable the confirm button
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirm & Schedule Visit';
    }
    // Hide overlay on error only
    hideLoadingOverlay();
  }
}

// Set up confirmation modal event listeners (called when modal is shown)
function setupConfirmationModalEventListeners() {
  
  
  // Close confirmation modal when clicking outside
  const confirmationModal = document.getElementById('visitConfirmationModal');
  if (confirmationModal) {
    // Remove any existing listeners to prevent duplicates
    confirmationModal.removeEventListener('click', handleModalClick);
    confirmationModal.addEventListener('click', handleModalClick);
  }

  // Close confirmation modal button
  const closeConfirmationBtn = document.getElementById('closeConfirmationModalBtn');
  if (closeConfirmationBtn) {
    closeConfirmationBtn.removeEventListener('click', handleCloseModal);
    closeConfirmationBtn.addEventListener('click', handleCloseModal);
  }

  // Cancel confirmation button
  const cancelConfirmationBtn = document.getElementById('cancelConfirmationBtn');
  if (cancelConfirmationBtn) {
    cancelConfirmationBtn.removeEventListener('click', handleCloseModal);
    cancelConfirmationBtn.addEventListener('click', handleCloseModal);
  }

  // Agreement checkbox - simply toggles confirm button (no face detection)
  const agreementCheckbox = document.getElementById('visitAgreement') as HTMLInputElement;
  const confirmBtn = document.getElementById('confirmScheduleBtn') as HTMLButtonElement;
  if (agreementCheckbox && confirmBtn) {
    const onAgreementChange = () => {
      confirmBtn.disabled = !agreementCheckbox.checked;
    };
    agreementCheckbox.removeEventListener('change', onAgreementChange as any);
    agreementCheckbox.addEventListener('change', onAgreementChange);
    // Initialize state based on current checkbox
    confirmBtn.disabled = !agreementCheckbox.checked;
  }

  // Confirm schedule button
  if (confirmBtn) {
    confirmBtn.removeEventListener('click', handleConfirmSchedule);
    confirmBtn.addEventListener('click', handleConfirmSchedule);
  }
}

// Event handler functions
function handleModalClick(e: Event) {
  const target = e.target as HTMLElement;
  const modal = document.getElementById('visitConfirmationModal');
  if (target === modal) {
    modal?.classList.add('hidden');
  }
}

function handleCloseModal() {
  
  const modal = document.getElementById('visitConfirmationModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

async function handleAgreementChangeWithFace(e: Event) {
  const checkbox = e.target as HTMLInputElement;
  const confirmBtn = document.getElementById('confirmScheduleBtn') as HTMLButtonElement;
  const modal = document.getElementById('visitConfirmationModal') as HTMLElement | null;
  if (!confirmBtn || !modal) return;
  console.log('Agreement checkbox changed:', checkbox.checked);

  // Always disable confirm initially until both conditions are true
  confirmBtn.disabled = true;

  if (!checkbox.checked) {
    (modal as any).faceVerified = false;
    return;
  }

  try {
    const { openFaceDetectionModal } = await import('../utils/AI-Face-Detection/blazefaceModal');
    const result = await openFaceDetectionModal();
    if (result.success) {
      (modal as any).faceVerified = true;
      confirmBtn.disabled = false;
    } else {
      (modal as any).faceVerified = false;
      confirmBtn.disabled = true;
    }
  } catch (err) {
    console.error('Face detection failed to start:', err);
    (modal as any).faceVerified = false;
    confirmBtn.disabled = true;
  }
}

async function handleConfirmSchedule() {
  
  
  // Get the stored data from the modal instead of reading from form fields
  const modal = document.getElementById('visitConfirmationModal');
  if (!modal || !(modal as any).visitData) {
    console.error('No visit data found in modal');
    return;
  }

  const visitData = (modal as any).visitData as VisitConfirmationData;
  

  // Ensure visitorUserId is properly handled - convert empty string to null
  if (visitData.visitorUserId && visitData.visitorUserId.trim() === '') {
    visitData.visitorUserId = null;
  }

  

  await scheduleVisitFromConfirmation(visitData);
}

// Set up confirmation modal event listeners (legacy function for initial setup)
export function setupConfirmationModalListeners() {
  // This function is kept for compatibility but the real setup happens when modal is shown
}

// Test function to manually show confirmation modal (for debugging)
(window as any).testConfirmationModal = () => {
  
  const testData: VisitConfirmationData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '9123456789',
    visitDate: '2024-01-15',
    placeToVisit: 'Office Building A',
    purpose: 'Meeting',
    otherPurpose: '',
    visitorUserId: null
  };
  
  showVisitConfirmationModal(testData);
  
};

// Function to show visit ID and QR code modal after successful scheduling
async function showVisitIdAndQRModal(visitId: string) {
  try {
    // Import QR code generation function
    const { generateSimpleVisitQRCode } = await import('../utils/qrCode');
    
    // Generate QR code
    const qrCodeDataUrl = await generateSimpleVisitQRCode(visitId);
    
    // Create modal HTML
    const modalHTML = `
      <div id="visitIdQRModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Visit Scheduled Successfully!</h3>
                <button 
                  id="closeVisitIdQRModalBtn"
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div class="text-center">
                <div class="mb-4">
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Visit ID:</p>
                  <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                    <p id="visitIdDisplay" class="font-mono text-sm text-gray-900 dark:text-white break-all">${visitId}</p>
                  </div>
                </div>
                
                <div class="mb-4">
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">QR Code:</p>
                  <div class="inline-block p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                    <img src="${qrCodeDataUrl}" alt="Visit QR Code" class="w-48 h-48 mx-auto" />
                  </div>
                </div>
                
                <div class="mb-6">
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Save your Visit ID or take a screenshot of this QR code. You can use either to track your visit progress.
                  </p>
                </div>
                
                <div class="flex gap-3">
                  <button
                    id="copyVisitIdBtn"
                    class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Copy Visit ID
                  </button>
                  <button
                    id="trackVisitBtn"
                    class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Track Visit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Set up event listeners
    setupVisitIdQRModalEventListeners(visitId);
    
  } catch (error) {
    console.error('Error showing visit ID and QR modal:', error);
    showNotification('Error generating visit details. Please note your visit ID: ' + visitId, 'error');
  }
}

// Set up event listeners for visit ID and QR modal
function setupVisitIdQRModalEventListeners(visitId: string) {
  const modal = document.getElementById('visitIdQRModal');
  const closeBtn = document.getElementById('closeVisitIdQRModalBtn');
  const copyBtn = document.getElementById('copyVisitIdBtn');
  const trackBtn = document.getElementById('trackVisitBtn');
  
  // Close modal when clicking outside
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeVisitIdQRModal();
    }
  });
  
  // Close button
  closeBtn?.addEventListener('click', closeVisitIdQRModal);
  
  // Copy visit ID button
  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(visitId);
      showNotification('Visit ID copied to clipboard!', 'success');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showNotification('Failed to copy visit ID', 'error');
    }
  });
  
  // Track visit button
  trackBtn?.addEventListener('click', () => {
    closeVisitIdQRModal();
    // Navigate to track schedule page
    window.location.hash = '#/track-schedule';
    // Set the visit ID in the input field after navigation
    setTimeout(() => {
      const visitIdInput = document.getElementById('visitIdInput') as HTMLInputElement;
      if (visitIdInput) {
        visitIdInput.value = visitId;
      }
    }, 100);
  });
}

// Close visit ID and QR modal
function closeVisitIdQRModal() {
  const modal = document.getElementById('visitIdQRModal');
  if (modal) {
    modal.remove();
  }
  // After closing the success modal, refresh the Home page UI if we're on Home
  try {
    const hash = window.location.hash || '';
    const isHome = hash === '' || hash === '#' || hash === '#/' || hash === '#/home';
    if (isHome) {
      // Defer to allow DOM to settle
      setTimeout(() => {
        (window as any).refreshWeeklyVisitCount?.();
        (window as any).updateScheduleButtonVisibility?.();
      }, 0);
    }
  } catch (e) {
    // Non-fatal; ignore refresh errors
    console.error('Home refresh after modal close failed:', e);
  }
}

// Function to update place availability based on selected visit date
export async function updatePlaceAvailabilityForDate(visitDate: string) {
  const placesWithAvailability = (window as any).placesWithAvailability;
  if (!placesWithAvailability) {
    console.error('Places data not available');
    return;
  }

  // Recheck visit limits for the selected date
  const updatedPlaces = await Promise.all(
    placesWithAvailability.map(async (place: any) => {
      // If no personnel assigned, keep as unavailable
      if (!place.is_available && place.unavailability_reason === 'No personnel assigned') {
        return place;
      }

      // Check visit limit for the selected date
      try {
        const { data: limitCheck, error: limitError } = await supabase.rpc('check_place_weekly_visit_limit', {
          p_place_id: place.id,
          p_visit_date: visitDate
        });

        if (limitError) {
          console.error('Error checking visit limit for place:', place.name, limitError);
          return place; // Keep current state
        }

        // Update availability based on limit check
        if (!limitCheck) {
          return {
            ...place,
            is_available: false,
            unavailability_reason: `Visit limit reached`
          };
        } else {
          return {
            ...place,
            is_available: true,
            unavailability_reason: null
          };
        }
      } catch (error) {
        console.error('Error checking visit limit:', error);
        return place; // Keep current state
      }
    })
  );

  // Update global storage
  (window as any).placesWithAvailability = updatedPlaces;

  // Update the dropdown options
  const placeToVisitSelect = document.getElementById('placeToVisit') as HTMLSelectElement;
  if (placeToVisitSelect) {
    // Save the currently selected value before clearing
    const previouslySelectedValue = placeToVisitSelect.value;
    
    // Clear existing options except the first one
    placeToVisitSelect.innerHTML = '<option value="">Select a place</option>';
    
    // Add updated places
    updatedPlaces.forEach(place => {
      const option = document.createElement('option');
      option.value = place.id;
      if (place.is_available) {
        option.textContent = place.name;
      } else {
        option.textContent = `${place.name} (${place.unavailability_reason || 'currently unavailable'})`;
        option.disabled = true;
      }
      placeToVisitSelect.appendChild(option);
    });

    // Add "Multiple Places" option
    const availablePlacesCount = updatedPlaces.filter(place => place.is_available).length;
    const { data: { user } } = await supabase.auth.getUser();
    const isLoggedIn = !!user;

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
    
    // Restore the previously selected value if it's still valid and available
    if (previouslySelectedValue) {
      if (previouslySelectedValue === 'multiple') {
        // For multiple places, check if the option is still enabled
        if (!multipleOption.disabled) {
          placeToVisitSelect.value = 'multiple';
          // Ensure multiple places container is visible (already updated above)
          const multiplePlacesContainer = document.getElementById('multiplePlacesContainer');
          if (multiplePlacesContainer) {
            multiplePlacesContainer.classList.remove('hidden');
          }
          // Manually update dependent fields without triggering full change event
          // (to avoid rebuilding the container we just updated)
          if (typeof (window as any).updatePurposeFieldState === 'function') {
            await (window as any).updatePurposeFieldState();
          }
          if (typeof (window as any).updateVisitDateFieldState === 'function') {
            (window as any).updateVisitDateFieldState();
          }
          await updateUnavailableDatesDisplay();
          updateSubmitButtonState();
        }
      } else {
        // For single place, check if it still exists and is available
        const selectedPlace = updatedPlaces.find(p => p.id === previouslySelectedValue);
        if (selectedPlace && selectedPlace.is_available) {
          placeToVisitSelect.value = previouslySelectedValue;
          // Trigger change event to update dependent fields for single place
          const changeEvent = new Event('change', { bubbles: true });
          placeToVisitSelect.dispatchEvent(changeEvent);
        }
      }
    }
  }

  // Update multiple places checkboxes if the container is visible
  const multiplePlacesContainer = document.getElementById('multiplePlacesContainer');
  if (multiplePlacesContainer && !multiplePlacesContainer.classList.contains('hidden')) {
    // Save currently checked place IDs before clearing
    const previouslyCheckedPlaceIds = Array.from(
      multiplePlacesContainer.querySelectorAll('input[name="places"]:checked')
    ).map((checkbox) => (checkbox as HTMLInputElement).value);
    
    multiplePlacesContainer.innerHTML = '';
    
    updatedPlaces.forEach(place => {
      const checkboxDiv = document.createElement('div');
      checkboxDiv.className = 'flex items-center';
      const isChecked = previouslyCheckedPlaceIds.includes(place.id) && place.is_available;
      checkboxDiv.innerHTML = `
        <input type="checkbox" id="place_${place.id}" name="places" value="${place.id}" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" ${!place.is_available ? 'disabled' : ''} ${isChecked ? 'checked' : ''}>
        <label for="place_${place.id}" class="ml-2 block text-sm ${place.is_available ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}">${place.name}${!place.is_available ? ` (${place.unavailability_reason || 'currently unavailable'})` : ''}</label>
      `;
      multiplePlacesContainer.appendChild(checkboxDiv);
    });
    
    // Re-attach event listeners for the checkboxes if needed
    const checkboxes = multiplePlacesContainer.querySelectorAll('input[name="places"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', async () => {
        await updateUnavailableDatesDisplay();
        // Re-validate the date when place selection changes
        if (typeof (window as any).validateVisitDate === 'function') {
          await (window as any).validateVisitDate();
        }
        // Update purpose field state when checkbox selection changes
        if (typeof (window as any).updatePurposeFieldState === 'function') {
          await (window as any).updatePurposeFieldState();
        }
        // Update visit date field state
        if (typeof (window as any).updateVisitDateFieldState === 'function') {
          (window as any).updateVisitDateFieldState();
        }
        
        // Re-validate the date if one is already selected
        const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
        if (visitDateInput && visitDateInput.value) {
          if (typeof (window as any).validateVisitDate === 'function') {
            await (window as any).validateVisitDate();
          }
        }
        
        // Update submit button state
        updateSubmitButtonState();
      });
    });
  }
  
  // Re-validate date after updating place availability to check place limits
  const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
  if (visitDateInput && visitDateInput.value) {
    if (typeof (window as any).validateVisitDate === 'function') {
      await (window as any).validateVisitDate();
    }
  }
} 