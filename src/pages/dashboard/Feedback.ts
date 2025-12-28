import supabase from '../../config/supabase';
import { showNotification } from './index';

interface FeedbackData {
  id: string;
  visit_id: string;
  visitor_user_id: string | null;
  visitor_email: string;
  functional_suitability: number;
  performance_efficiency: number;
  compatibility: number;
  usability: number;
  reliability: number;
  security: number;
  maintainability: number;
  portability: number;
  overall_satisfaction: number;
  comments: string | null;
  submitted_at: string;
  ip_address: string | null;
  user_agent: string | null;
  // Visit details
  visitor_name?: string;
  visit_date?: string;
  places?: string[];
}

let allFeedback: FeedbackData[] = [];
let filteredFeedback: FeedbackData[] = [];

export function renderFeedback(): string {
  return `
    <div>
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Visitor Feedback Management</h2>
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-4">
          <!-- Search and Filter Section -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3">
            <!-- Search Input -->
            <div class="relative">
              <input 
                type="text" 
                id="feedbackSearchInput"
                placeholder="Search feedback..."
                class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
              >
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
            <!-- Rating Filter -->
            <select 
              id="feedbackRatingFilter"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1+ Stars</option>
            </select>
            <!-- Date Filter -->
            <select 
              id="feedbackDateFilter"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
           <button 
             id="refreshFeedbackBtn"
             class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
           >
             <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
             </svg>
             Refresh
           </button>
         </div>
       </div>

       <!-- Excel Report Generation Section -->
       <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
         <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generate Excel Report</h3>
         <div class="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
           <div class="flex-1">
             <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From Date</label>
             <input 
               type="date" 
               id="reportFromDate"
               class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
             >
           </div>
           <div class="flex-1">
             <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To Date</label>
             <input 
               type="date" 
               id="reportToDate"
               class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
             >
           </div>
           <button 
             id="generateExcelBtn"
             class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
             </svg>
             Generate Excel Report
           </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Feedback</p>
              <p id="totalFeedbackCount" class="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Satisfaction</p>
              <p id="avgSatisfaction" class="text-2xl font-semibold text-gray-900 dark:text-white">0.0</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">With Comments</p>
              <p id="feedbackWithComments" class="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">This Week</p>
              <p id="feedbackThisWeek" class="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
            </div>
          </div>
        </div>
      </div>
      
      <div id="feedbackList" class="space-y-4">
        <!-- Feedback will be loaded here -->
      </div>
    </div>
  `;
}

export async function setupFeedbackEventListeners(): Promise<void> {
  // Load feedback data
  await loadFeedback();

  // Search input
  const searchInput = document.getElementById('feedbackSearchInput') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('input', applyFeedbackFilters);
  }

  // Rating filter
  const ratingFilter = document.getElementById('feedbackRatingFilter') as HTMLSelectElement;
  if (ratingFilter) {
    ratingFilter.addEventListener('change', applyFeedbackFilters);
  }

  // Date filter
  const dateFilter = document.getElementById('feedbackDateFilter') as HTMLSelectElement;
  if (dateFilter) {
    dateFilter.addEventListener('change', applyFeedbackFilters);
  }

  // Refresh button
  const refreshBtn = document.getElementById('refreshFeedbackBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadFeedback);
  }

  // Generate Excel button
  const generateExcelBtn = document.getElementById('generateExcelBtn');
  if (generateExcelBtn) {
    generateExcelBtn.addEventListener('click', generateExcelReport);
  }

  // Set default date range (last 30 days)
  const fromDateInput = document.getElementById('reportFromDate') as HTMLInputElement;
  const toDateInput = document.getElementById('reportToDate') as HTMLInputElement;
  
  if (fromDateInput && toDateInput) {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    toDateInput.value = today.toISOString().split('T')[0];
    fromDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
  }
}

async function loadFeedback(): Promise<void> {
  try {
    showNotification('Loading feedback data...', 'info');
    
    // Use the admin function to get feedback data
    const { data: feedbackData, error } = await supabase
      .rpc('get_all_feedback_for_admin');

    if (error) {
      console.error('Error loading feedback:', error);
      showNotification('Error loading feedback data', 'error');
      return;
    }

    // Process feedback data and get places for each visit
    allFeedback = await Promise.all((feedbackData || []).map(async (feedback) => {
      // Get places for this visit using the admin function
      const { data: placesData } = await supabase
        .rpc('get_visit_places_for_admin', { p_visit_id: feedback.visit_id });

      const places = placesData?.map(p => p.place_name) || [];

      return {
        ...feedback,
        visitor_name: `${feedback.visitor_first_name} ${feedback.visitor_last_name}`,
        places: places
      };
    }));

    // Apply current filters
    applyFeedbackFilters();
    
    // Update statistics
    updateFeedbackStatistics();
    
    showNotification('Feedback data loaded successfully', 'success');
  } catch (error) {
    console.error('Error in loadFeedback:', error);
    showNotification('Error loading feedback data', 'error');
  }
}

function applyFeedbackFilters(): void {
  const searchInput = document.getElementById('feedbackSearchInput') as HTMLInputElement;
  const ratingFilter = document.getElementById('feedbackRatingFilter') as HTMLSelectElement;
  const dateFilter = document.getElementById('feedbackDateFilter') as HTMLSelectElement;

  const searchTerm = searchInput?.value.toLowerCase() || '';
  const ratingFilterValue = ratingFilter?.value || 'all';
  const dateFilterValue = dateFilter?.value || 'all';

  filteredFeedback = allFeedback.filter(feedback => {
    // Search filter
    if (searchTerm) {
      const searchableText = [
        feedback.visitor_name,
        feedback.visitor_email,
        feedback.comments || ''
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }

    // Rating filter
    if (ratingFilterValue !== 'all') {
      const minRating = parseInt(ratingFilterValue);
      if (feedback.overall_satisfaction < minRating) {
        return false;
      }
    }

    // Date filter
    if (dateFilterValue !== 'all') {
      const feedbackDate = new Date(feedback.submitted_at);
      const now = new Date();
      
      switch (dateFilterValue) {
        case 'today':
          if (feedbackDate.toDateString() !== now.toDateString()) {
            return false;
          }
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (feedbackDate < weekAgo) {
            return false;
          }
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (feedbackDate < monthAgo) {
            return false;
          }
          break;
      }
    }

    return true;
  });

  displayFeedback();
}

function displayFeedback(): void {
  const feedbackList = document.getElementById('feedbackList');
  if (!feedbackList) return;

  if (filteredFeedback.length === 0) {
    feedbackList.innerHTML = `
      <div class="text-center py-8">
        <div class="text-gray-500 dark:text-gray-400">
          <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <p class="text-lg font-medium">No feedback found</p>
          <p class="text-sm">Try adjusting your search or filter criteria.</p>
        </div>
      </div>
    `;
    return;
  }

  feedbackList.innerHTML = filteredFeedback.map(feedback => `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="p-6">
        <!-- Feedback Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              ${feedback.visitor_name}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              ${feedback.visitor_email}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Visit ID: ${feedback.visit_id}
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <div class="flex items-center">
              ${generateStarRating(feedback.overall_satisfaction)}
            </div>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              ${new Date(feedback.submitted_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <!-- ISO 25010 Ratings -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div class="text-center">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Functional Suitability</p>
            <div class="flex justify-center">
              ${generateStarRating(feedback.functional_suitability)}
            </div>
          </div>
          <div class="text-center">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Performance Efficiency</p>
            <div class="flex justify-center">
              ${generateStarRating(feedback.performance_efficiency)}
            </div>
          </div>
          <div class="text-center">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Compatibility</p>
            <div class="flex justify-center">
              ${generateStarRating(feedback.compatibility)}
            </div>
          </div>
          <div class="text-center">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Usability</p>
            <div class="flex justify-center">
              ${generateStarRating(feedback.usability)}
            </div>
          </div>
          <div class="text-center">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Reliability</p>
            <div class="flex justify-center">
              ${generateStarRating(feedback.reliability)}
            </div>
          </div>
          <div class="text-center">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Security</p>
            <div class="flex justify-center">
              ${generateStarRating(feedback.security)}
            </div>
          </div>
          <div class="text-center">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Maintainability</p>
            <div class="flex justify-center">
              ${generateStarRating(feedback.maintainability)}
            </div>
          </div>
          <div class="text-center">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Portability</p>
            <div class="flex justify-center">
              ${generateStarRating(feedback.portability)}
            </div>
          </div>
        </div>

        <!-- Visit Details -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Visit Details</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Visit Date:</span>
              <span class="text-gray-600 dark:text-gray-400 ml-2">
                ${new Date(feedback.visit_date).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Places Visited:</span>
              <span class="text-gray-600 dark:text-gray-400 ml-2">
                ${Array.isArray(feedback.places) ? feedback.places.join(', ') : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <!-- Comments -->
        ${feedback.comments ? `
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Comments</h4>
            <p class="text-sm text-blue-700 dark:text-blue-300">${feedback.comments}</p>
          </div>
        ` : ''}

        <!-- Submission Details -->
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>Submitted: ${new Date(feedback.submitted_at).toLocaleString()}</span>
            ${feedback.ip_address ? `<span>IP: ${feedback.ip_address}</span>` : ''}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function generateStarRating(rating: number): string {
  const stars = [];
  for (let i = 1; i <= 4; i++) {
    if (i <= rating) {
      stars.push('<svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>');
    } else {
      stars.push('<svg class="w-4 h-4 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>');
    }
  }
  return stars.join('');
}

function updateFeedbackStatistics(): void {
  const totalCount = allFeedback.length;
  const avgSatisfaction = totalCount > 0 ? 
    (allFeedback.reduce((sum, f) => sum + f.overall_satisfaction, 0) / totalCount).toFixed(1) : '0.0';
  const withComments = allFeedback.filter(f => f.comments && f.comments.trim().length > 0).length;
  
  // Calculate this week's feedback
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek = allFeedback.filter(f => new Date(f.submitted_at) >= weekAgo).length;

  // Update DOM elements
  const totalCountEl = document.getElementById('totalFeedbackCount');
  const avgSatisfactionEl = document.getElementById('avgSatisfaction');
  const withCommentsEl = document.getElementById('feedbackWithComments');
  const thisWeekEl = document.getElementById('feedbackThisWeek');

  if (totalCountEl) totalCountEl.textContent = totalCount.toString();
  if (avgSatisfactionEl) avgSatisfactionEl.textContent = avgSatisfaction;
  if (withCommentsEl) withCommentsEl.textContent = withComments.toString();
  if (thisWeekEl) thisWeekEl.textContent = thisWeek.toString();
}

async function generateExcelReport(): Promise<void> {
  try {
    const fromDateInput = document.getElementById('reportFromDate') as HTMLInputElement;
    const toDateInput = document.getElementById('reportToDate') as HTMLInputElement;
    const generateBtn = document.getElementById('generateExcelBtn') as HTMLButtonElement;

    if (!fromDateInput || !toDateInput || !generateBtn) {
      showNotification('Error: Date inputs not found', 'error');
      return;
    }

    const fromDate = fromDateInput.value;
    const toDate = toDateInput.value;

    if (!fromDate || !toDate) {
      showNotification('Please select both from and to dates', 'error');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      showNotification('From date cannot be later than to date', 'error');
      return;
    }

    // Disable button and show loading
    generateBtn.disabled = true;
    generateBtn.innerHTML = `
      <svg class="w-4 h-4 inline mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
      Generating...
    `;

    showNotification('Generating Excel report...', 'info');

    // Get feedback data for the specified date range
    const { data: feedbackData, error } = await supabase
      .rpc('get_all_feedback_for_admin');

    if (error) {
      console.error('Error loading feedback for report:', error);
      showNotification('Error loading feedback data for report', 'error');
      return;
    }

    // Filter feedback by date range
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);
    toDateObj.setHours(23, 59, 59, 999); // Include the entire end date

    const filteredFeedback = (feedbackData || []).filter(feedback => {
      const feedbackDate = new Date(feedback.submitted_at);
      return feedbackDate >= fromDateObj && feedbackDate <= toDateObj;
    });

    if (filteredFeedback.length === 0) {
      showNotification('No feedback found in the selected date range', 'warning');
      return;
    }

    // Get places for each feedback
    const feedbackWithPlaces = await Promise.all(filteredFeedback.map(async (feedback) => {
      const { data: placesData } = await supabase
        .rpc('get_visit_places_for_admin', { p_visit_id: feedback.visit_id });

      const places = placesData?.map(p => p.place_name).join(', ') || 'N/A';

      return {
        ...feedback,
        places: places
      };
    }));

    // Generate Excel file
    await generateExcelFile(feedbackWithPlaces, fromDate, toDate);

    showNotification(`Excel report generated successfully with ${filteredFeedback.length} feedback entries`, 'success');

  } catch (error) {
    console.error('Error generating Excel report:', error);
    showNotification('Error generating Excel report', 'error');
  } finally {
    // Re-enable button
    const generateBtn = document.getElementById('generateExcelBtn') as HTMLButtonElement;
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.innerHTML = `
        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        Generate Excel Report
      `;
    }
  }
}

async function generateExcelFile(feedbackData: any[], fromDate: string, toDate: string): Promise<void> {
  // Create CSV content (Excel can open CSV files)
  const headers = [
    'Feedback ID',
    'Visit ID',
    'Visitor Name',
    'Visitor Email',
    'Visit Date',
    'Places Visited',
    'Functional Suitability',
    'Performance Efficiency',
    'Compatibility',
    'Usability',
    'Reliability',
    'Security',
    'Maintainability',
    'Portability',
    'Overall Satisfaction',
    'Comments',
    'Submitted At',
    'IP Address'
  ];

  // Calculate criterion means
  const criteriaFields = [
    'functional_suitability',
    'performance_efficiency',
    'compatibility',
    'usability',
    'reliability',
    'security',
    'maintainability',
    'portability'
  ];

  const criterionMeans: { [key: string]: number } = {};
  let grandTotal = 0;

  criteriaFields.forEach(field => {
    const validScores = feedbackData
      .map(f => f[field])
      .filter(score => score !== null && score !== undefined && !isNaN(score));
    
    if (validScores.length > 0) {
      const mean = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
      criterionMeans[field] = Math.round(mean * 100) / 100; // Round to 2 decimal places
      grandTotal += criterionMeans[field];
    } else {
      criterionMeans[field] = 0;
    }
  });

  // Calculate grand mean
  const grandMean = criteriaFields.length > 0 
    ? Math.round((grandTotal / criteriaFields.length) * 100) / 100 
    : 0;

  // Build CSV rows
  const dataRows = feedbackData.map(feedback => [
    feedback.id,
    feedback.visit_id,
    `"${feedback.visitor_first_name} ${feedback.visitor_last_name}"`,
    `"${feedback.visitor_email}"`,
    feedback.visit_date,
    `"${feedback.places}"`,
    feedback.functional_suitability,
    feedback.performance_efficiency,
    feedback.compatibility,
    feedback.usability,
    feedback.reliability,
    feedback.security,
    feedback.maintainability,
    feedback.portability,
    feedback.overall_satisfaction,
    `"${(feedback.comments || '').replace(/"/g, '""')}"`,
    feedback.submitted_at,
    feedback.ip_address || ''
  ].join(','));

  // Add summary rows
  const summaryRows = [
    '', // Empty row separator
    [
      'CRITERION MEANS',
      '',
      '',
      '',
      '',
      '',
      criterionMeans.functional_suitability,
      criterionMeans.performance_efficiency,
      criterionMeans.compatibility,
      criterionMeans.usability,
      criterionMeans.reliability,
      criterionMeans.security,
      criterionMeans.maintainability,
      criterionMeans.portability,
      '', // Overall Satisfaction (not included in grand mean)
      '',
      '',
      ''
    ].join(','),
    '', // Empty row separator
    [
      'GRAND MEAN (All ISO 25010 Criteria)',
      '',
      '',
      '',
      '',
      '',
      grandMean,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '', // Overall Satisfaction (not included in grand mean)
      '',
      '',
      ''
    ].join(',')
  ];

  const csvContent = [
    headers.join(','),
    ...dataRows,
    ...summaryRows
  ].join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `feedback_report_${fromDate}_to_${toDate}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
