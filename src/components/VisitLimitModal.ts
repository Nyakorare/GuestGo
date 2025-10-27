// Visit Limit Modal Component
// This component provides a modal interface for editing weekly and monthly visit limits

export interface VisitLimitData {
  placeId: string;
  placeName: string;
  currentWeeklyLimit: number;
  monthlyLimit: number;
}

export interface MonthlyLimitData {
  placeId: string;
  placeName: string;
  currentMonthlyLimit: number;
  weeklyLimit: number;
}

export interface ComprehensiveLimitData {
  placeId: string;
  placeName: string;
  currentWeeklyLimit: number;
  monthlyLimit: number;
  visitsThisWeek: number;
  visitsThisMonth: number;
}

export class VisitLimitModal {
  private modal: HTMLElement | null = null;
  private isOpen = false;

  constructor() {
    this.createModal();
  }

  private createModal(): void {
    // Create modal HTML
    const modalHTML = `
      <div id="visitLimitModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 hidden">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div class="mt-3">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white" id="modalTitle">
                Edit Visit Limits
              </h3>
              <button id="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Place Info -->
            <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 class="font-medium text-gray-900 dark:text-white" id="placeName">Place Name</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300" id="placeInfo">Current limits will be shown here</p>
              
              <!-- Usage Statistics -->
              <div class="mt-3 grid grid-cols-2 gap-3">
                <div class="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div class="text-lg font-bold text-blue-600 dark:text-blue-400" id="weeklyUsage">0/50</div>
                  <div class="text-xs text-gray-600 dark:text-gray-300">This Week</div>
                  <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                    <div class="bg-blue-600 h-2 rounded-full" id="weeklyProgress" style="width: 0%"></div>
                  </div>
                </div>
                <div class="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div class="text-lg font-bold text-purple-600 dark:text-purple-400" id="monthlyUsage">0/200</div>
                  <div class="text-xs text-gray-600 dark:text-gray-300">This Month</div>
                  <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                    <div class="bg-purple-600 h-2 rounded-full" id="monthlyProgress" style="width: 0%"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Form -->
            <form id="visitLimitForm">
              <div class="mb-4">
                <label for="weeklyLimit" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weekly Visit Limit
                </label>
                <input
                  type="number"
                  id="weeklyLimit"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter weekly limit"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1" id="weeklyHelp">
                  Cannot exceed monthly limit
                </p>
              </div>

              <div class="mb-4">
                <label for="monthlyLimit" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Visit Limit
                </label>
                <input
                  type="number"
                  id="monthlyLimit"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter monthly limit"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1" id="monthlyHelp">
                  Must be greater than or equal to weekly limit
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  id="cancelBtn"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="saveBtn"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('visitLimitModal');
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.modal) return;

    // Close modal events
    const closeModal = () => this.close();
    
    document.getElementById('closeModal')?.addEventListener('click', closeModal);
    document.getElementById('cancelBtn')?.addEventListener('click', closeModal);
    
    // Close on backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        closeModal();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        closeModal();
      }
    });

    // Form submission
    document.getElementById('visitLimitForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Real-time validation
    const weeklyInput = document.getElementById('weeklyLimit') as HTMLInputElement;
    const monthlyInput = document.getElementById('monthlyLimit') as HTMLInputElement;

    weeklyInput?.addEventListener('input', () => {
      this.validateInputs();
    });

    monthlyInput?.addEventListener('input', () => {
      this.validateInputs();
    });
  }

  private validateInputs(): void {
    const weeklyInput = document.getElementById('weeklyLimit') as HTMLInputElement;
    const monthlyInput = document.getElementById('monthlyLimit') as HTMLInputElement;
    const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;

    if (!weeklyInput || !monthlyInput || !saveBtn) return;

    const weeklyValue = parseInt(weeklyInput.value) || 0;
    const monthlyValue = parseInt(monthlyInput.value) || 0;

    // Validate weekly limit
    if (weeklyValue > monthlyValue && monthlyValue > 0) {
      weeklyInput.classList.add('border-red-500');
      weeklyInput.classList.remove('border-gray-300', 'dark:border-gray-600');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Weekly limit exceeds monthly limit';
    } else {
      weeklyInput.classList.remove('border-red-500');
      weeklyInput.classList.add('border-gray-300', 'dark:border-gray-600');
    }

    // Validate monthly limit
    if (monthlyValue < weeklyValue && weeklyValue > 0) {
      monthlyInput.classList.add('border-red-500');
      monthlyInput.classList.remove('border-gray-300', 'dark:border-gray-600');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Monthly limit is less than weekly limit';
    } else {
      monthlyInput.classList.remove('border-red-500');
      monthlyInput.classList.add('border-gray-300', 'dark:border-gray-600');
    }

    // Enable save button if validation passes
    if (!saveBtn.disabled && weeklyValue >= 0 && monthlyValue >= 0 && weeklyValue <= monthlyValue) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Changes';
    }
  }

  public openWeeklyLimit(data: VisitLimitData): Promise<{weeklyLimit: number, monthlyLimit: number} | null> {
    return new Promise((resolve) => {
      this.setupModal(data, 'weekly');
      this.open();
      
      // Store resolve function for later use
      (this.modal as any).resolve = resolve;
    });
  }

  public openMonthlyLimit(data: MonthlyLimitData): Promise<{weeklyLimit: number, monthlyLimit: number} | null> {
    return new Promise((resolve) => {
      this.setupModal(data, 'monthly');
      this.open();
      
      // Store resolve function for later use
      (this.modal as any).resolve = resolve;
    });
  }

  public openComprehensiveModal(data: ComprehensiveLimitData): Promise<{weeklyLimit: number, monthlyLimit: number} | null> {
    return new Promise((resolve) => {
      this.setupComprehensiveModal(data);
      this.open();
      
      // Store resolve function for later use
      (this.modal as any).resolve = resolve;
    });
  }

  private setupModal(data: VisitLimitData | MonthlyLimitData, mode: 'weekly' | 'monthly'): void {
    const placeNameEl = document.getElementById('placeName');
    const placeInfoEl = document.getElementById('placeInfo');
    const weeklyInput = document.getElementById('weeklyLimit') as HTMLInputElement;
    const monthlyInput = document.getElementById('monthlyLimit') as HTMLInputElement;
    const modalTitle = document.getElementById('modalTitle');

    if (!placeNameEl || !placeInfoEl || !weeklyInput || !monthlyInput || !modalTitle) return;

    // Set place name
    placeNameEl.textContent = data.placeName;

    // Set current values and info
    if (mode === 'weekly') {
      const weeklyData = data as VisitLimitData;
      weeklyInput.value = weeklyData.currentWeeklyLimit.toString();
      monthlyInput.value = weeklyData.monthlyLimit.toString();
      placeInfoEl.textContent = `Current weekly limit: ${weeklyData.currentWeeklyLimit}, Monthly limit: ${weeklyData.monthlyLimit}`;
      modalTitle.textContent = 'Edit Weekly Visit Limit';
    } else {
      const monthlyData = data as MonthlyLimitData;
      weeklyInput.value = monthlyData.weeklyLimit.toString();
      monthlyInput.value = monthlyData.currentMonthlyLimit.toString();
      placeInfoEl.textContent = `Current monthly limit: ${monthlyData.currentMonthlyLimit}, Weekly limit: ${monthlyData.weeklyLimit}`;
      modalTitle.textContent = 'Edit Monthly Visit Limit';
    }

    // Disable the input that's not being edited
    if (mode === 'weekly') {
      monthlyInput.disabled = true;
      weeklyInput.disabled = false;
    } else {
      weeklyInput.disabled = true;
      monthlyInput.disabled = false;
    }

    // Store mode for validation
    (this.modal as any).mode = mode;
  }

  private setupComprehensiveModal(data: ComprehensiveLimitData): void {
    const placeNameEl = document.getElementById('placeName');
    const placeInfoEl = document.getElementById('placeInfo');
    const weeklyInput = document.getElementById('weeklyLimit') as HTMLInputElement;
    const monthlyInput = document.getElementById('monthlyLimit') as HTMLInputElement;
    const modalTitle = document.getElementById('modalTitle');
    const weeklyUsageEl = document.getElementById('weeklyUsage');
    const monthlyUsageEl = document.getElementById('monthlyUsage');
    const weeklyProgressEl = document.getElementById('weeklyProgress') as HTMLElement;
    const monthlyProgressEl = document.getElementById('monthlyProgress') as HTMLElement;

    if (!placeNameEl || !placeInfoEl || !weeklyInput || !monthlyInput || !modalTitle || 
        !weeklyUsageEl || !monthlyUsageEl || !weeklyProgressEl || !monthlyProgressEl) return;

    // Set place name and title
    placeNameEl.textContent = data.placeName;
    modalTitle.textContent = 'Edit Visit Limits';

    // Set current values
    weeklyInput.value = data.currentWeeklyLimit.toString();
    monthlyInput.value = data.monthlyLimit.toString();
    
    // Set usage statistics
    weeklyUsageEl.textContent = `${data.visitsThisWeek}/${data.currentWeeklyLimit}`;
    monthlyUsageEl.textContent = `${data.visitsThisMonth}/${data.monthlyLimit}`;
    
    // Calculate and set progress bars
    const weeklyPercentage = Math.min((data.visitsThisWeek / data.currentWeeklyLimit) * 100, 100);
    const monthlyPercentage = Math.min((data.visitsThisMonth / data.monthlyLimit) * 100, 100);
    
    weeklyProgressEl.style.width = `${weeklyPercentage}%`;
    monthlyProgressEl.style.width = `${monthlyPercentage}%`;
    
    // Update progress bar colors based on usage
    if (weeklyPercentage >= 90) {
      weeklyProgressEl.className = 'bg-red-600 h-2 rounded-full';
    } else if (weeklyPercentage >= 75) {
      weeklyProgressEl.className = 'bg-yellow-600 h-2 rounded-full';
    } else {
      weeklyProgressEl.className = 'bg-blue-600 h-2 rounded-full';
    }
    
    if (monthlyPercentage >= 90) {
      monthlyProgressEl.className = 'bg-red-600 h-2 rounded-full';
    } else if (monthlyPercentage >= 75) {
      monthlyProgressEl.className = 'bg-yellow-600 h-2 rounded-full';
    } else {
      monthlyProgressEl.className = 'bg-purple-600 h-2 rounded-full';
    }

    // Set place info
    placeInfoEl.textContent = `Edit both weekly and monthly visit limits for this place.`;

    // Enable both inputs for comprehensive editing
    weeklyInput.disabled = false;
    monthlyInput.disabled = false;

    // Store mode for validation
    (this.modal as any).mode = 'comprehensive';
  }

  private open(): void {
    if (this.modal) {
      this.modal.classList.remove('hidden');
      this.isOpen = true;
      
      // Focus on the editable input
      const weeklyInput = document.getElementById('weeklyLimit') as HTMLInputElement;
      const monthlyInput = document.getElementById('monthlyLimit') as HTMLInputElement;
      const mode = (this.modal as any).mode;
      
      if (mode === 'comprehensive') {
        // In comprehensive mode, focus on weekly input first
        weeklyInput.focus();
        weeklyInput.select();
      } else if (!weeklyInput.disabled) {
        weeklyInput.focus();
        weeklyInput.select();
      } else if (!monthlyInput.disabled) {
        monthlyInput.focus();
        monthlyInput.select();
      }
    }
  }

  private close(): void {
    if (this.modal) {
      this.modal.classList.add('hidden');
      this.isOpen = false;
      
      // Clear resolve function
      delete (this.modal as any).resolve;
    }
  }

  private handleSubmit(): void {
    const weeklyInput = document.getElementById('weeklyLimit') as HTMLInputElement;
    const monthlyInput = document.getElementById('monthlyLimit') as HTMLInputElement;
    const resolve = (this.modal as any).resolve;

    if (!weeklyInput || !monthlyInput || !resolve) return;

    const weeklyLimit = parseInt(weeklyInput.value) || 0;
    const monthlyLimit = parseInt(monthlyInput.value) || 0;

    // Final validation
    if (weeklyLimit > monthlyLimit) {
      alert('Weekly limit cannot exceed monthly limit.');
      return;
    }

    if (monthlyLimit < weeklyLimit) {
      alert('Monthly limit cannot be less than weekly limit.');
      return;
    }

    // Resolve with the values
    resolve({ weeklyLimit, monthlyLimit });
    this.close();
  }
}

// Create global instance
export const visitLimitModal = new VisitLimitModal();

// Make it globally available
(window as any).visitLimitModal = visitLimitModal;
