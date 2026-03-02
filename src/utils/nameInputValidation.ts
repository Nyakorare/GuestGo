/**
 * Validates name inputs to disallow symbols.
 * Allows only letters (including Unicode), spaces, hyphens, and apostrophes.
 */

const NAME_INPUT_PATTERN = /[^\p{L}\s\-']/gu;

/**
 * Removes symbols from a string, keeping only letters, spaces, hyphens, and apostrophes.
 */
export function sanitizeNameInput(value: string): string {
  return value.replace(NAME_INPUT_PATTERN, '');
}

/**
 * Attaches input validation to the schedule modal's first name and last name fields.
 * Prevents symbols from being entered.
 */
export function initScheduleModalNameValidation(): void {
  const firstNameInput = document.getElementById('scheduleFirstName') as HTMLInputElement | null;
  const lastNameInput = document.getElementById('scheduleLastName') as HTMLInputElement | null;

  const handleInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const cursorPos = input.selectionStart ?? input.value.length;
    const before = input.value.substring(0, cursorPos);
    const after = input.value.substring(cursorPos);
    const sanitizedBefore = sanitizeNameInput(before);
    const sanitizedAfter = sanitizeNameInput(after);
    const newValue = sanitizedBefore + sanitizedAfter;
    if (input.value !== newValue) {
      input.value = newValue;
      const newCursorPos = sanitizedBefore.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
    }
  };

  const handlePaste = (e: Event) => {
    const input = e.target as HTMLInputElement;
    e.preventDefault();
    const pastedText = (e as ClipboardEvent).clipboardData?.getData('text') ?? '';
    const sanitized = sanitizeNameInput(pastedText);
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    const before = input.value.substring(0, start);
    const after = input.value.substring(end);
    input.value = before + sanitized + after;
    const newCursorPos = start + sanitized.length;
    input.setSelectionRange(newCursorPos, newCursorPos);
  };

  if (firstNameInput) {
    firstNameInput.addEventListener('input', handleInput);
    firstNameInput.addEventListener('paste', handlePaste);
  }
  if (lastNameInput) {
    lastNameInput.addEventListener('input', handleInput);
    lastNameInput.addEventListener('paste', handlePaste);
  }
}
