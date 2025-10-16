import supabase from '../config/supabase';
import { showNotification } from '../pages/dashboard/index';

export interface FeedbackSurveyData {
  visitId: string;
  visitorName: string;
  visitDate: string;
  places: string[];
}

// ISO 25010 Quality Characteristics with descriptions
const qualityCharacteristics = [
  {
    id: 'functional_suitability',
    name: 'Functional Suitability',
    description: 'The degree to which the system provides functions that meet stated and implied needs when used under specified conditions.',
    question: 'Did the system provide all the functions you expected to complete your tasks?'
  },
  {
    id: 'performance_efficiency',
    name: 'Performance Efficiency',
    description: 'The performance relative to the amount of resources used under stated conditions.',
    question: 'Was the system\'s response time and performance satisfactory during your visit?'
  },
  {
    id: 'compatibility',
    name: 'Compatibility',
    description: 'The degree to which a product can exchange information with other products and perform its required functions while sharing the same environment.',
    question: 'Did the system work well with your device and browser?'
  },
  {
    id: 'usability',
    name: 'Usability',
    description: 'The degree to which a product can be used by specified users to achieve specified goals with effectiveness, efficiency, and satisfaction.',
    question: 'Was the system easy to use and navigate?'
  },
  {
    id: 'reliability',
    name: 'Reliability',
    description: 'The degree to which a system performs specified functions under specified conditions for a specified period of time.',
    question: 'Did the system work reliably without errors or interruptions?'
  },
  {
    id: 'security',
    name: 'Security',
    description: 'The degree to which a product protects information and data so that persons have the degree of data access appropriate to their types and levels of authorization.',
    question: 'Did you feel your personal information was secure and protected?'
  },
  {
    id: 'maintainability',
    name: 'Maintainability',
    description: 'The degree of effectiveness and efficiency with which a product can be modified by the intended maintainers.',
    question: 'Did the system appear well-maintained and up-to-date?'
  },
  {
    id: 'portability',
    name: 'Portability',
    description: 'The degree of effectiveness and efficiency with which a system can be transferred from one hardware, software, or other operational environment to another.',
    question: 'Did the system work consistently across different devices or locations?'
  }
];

export function showFeedbackSurveyModal(data: FeedbackSurveyData): void {
  // Check if modal already exists
  const existingModal = document.getElementById('feedbackSurveyModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal HTML
  const modalHTML = `
    <div id="feedbackSurveyModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <!-- Header -->
            <div class="flex justify-between items-center mb-6">
              <div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Visit Feedback Survey</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Help us improve by sharing your experience
                </p>
              </div>
              <button 
                id="closeFeedbackModalBtn"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Visit Information -->
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h4 class="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Visit Details</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="font-medium text-blue-700 dark:text-blue-300">Visitor:</span>
                  <span class="text-blue-600 dark:text-blue-400 ml-2">${data.visitorName}</span>
                </div>
                <div>
                  <span class="font-medium text-blue-700 dark:text-blue-300">Visit Date:</span>
                  <span class="text-blue-600 dark:text-blue-400 ml-2">${new Date(data.visitDate).toLocaleDateString()}</span>
                </div>
                <div class="md:col-span-2">
                  <span class="font-medium text-blue-700 dark:text-blue-300">Places Visited:</span>
                  <span class="text-blue-600 dark:text-blue-400 ml-2">${data.places.join(', ')}</span>
                </div>
              </div>
            </div>

            <!-- Survey Form -->
            <form id="feedbackSurveyForm" class="space-y-6">
              <!-- ISO 25010 Quality Characteristics -->
              <div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  System Quality Assessment (ISO 25010 Standards)
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Please rate each aspect of the system on a scale of 1 (Poor) to 5 (Excellent):
                </p>
                
                <div class="space-y-6">
                  ${qualityCharacteristics.map(char => `
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                          ${char.name}
                        </label>
                        <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          ${char.description}
                        </p>
                        <p class="text-sm text-gray-700 dark:text-gray-300 font-medium">
                          ${char.question}
                        </p>
                      </div>
                      <div class="flex items-center space-x-4">
                        <span class="text-xs text-gray-500 dark:text-gray-400">Poor</span>
                        <div class="flex space-x-2">
                          ${[1, 2, 3, 4, 5].map(rating => `
                            <label class="flex items-center">
                              <input 
                                type="radio" 
                                name="${char.id}" 
                                value="${rating}" 
                                required
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                              >
                              <span class="ml-1 text-sm text-gray-700 dark:text-gray-300">${rating}</span>
                            </label>
                          `).join('')}
                        </div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Excellent</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Overall Satisfaction -->
              <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <label class="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                  Overall Satisfaction
                </label>
                <p class="text-sm text-green-700 dark:text-green-300 mb-3">
                  How satisfied are you with your overall visit experience?
                </p>
                <div class="flex items-center space-x-4">
                  <span class="text-xs text-gray-500 dark:text-gray-400">Very Dissatisfied</span>
                  <div class="flex space-x-2">
                    ${[1, 2, 3, 4, 5].map(rating => `
                      <label class="flex items-center">
                        <input 
                          type="radio" 
                          name="overall_satisfaction" 
                          value="${rating}" 
                          required
                          class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                        >
                        <span class="ml-1 text-sm text-gray-700 dark:text-gray-300">${rating}</span>
                      </label>
                    `).join('')}
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">Very Satisfied</span>
                </div>
              </div>

              <!-- Additional Comments -->
              <div>
                <label for="comments" class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea 
                  id="comments" 
                  name="comments" 
                  rows="4" 
                  maxlength="1000"
                  placeholder="Please share any additional feedback, suggestions, or comments about your visit experience..."
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                ></textarea>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maximum 1000 characters
                </p>
              </div>

              <!-- Submit Button -->
              <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                  type="button" 
                  id="cancelFeedbackBtn"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  id="submitFeedbackBtn"
                  class="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Lock body scroll
  document.body.classList.add('overflow-hidden');

  // Set up event listeners
  setupFeedbackModalEventListeners(data.visitId);
}

function setupFeedbackModalEventListeners(visitId: string): void {
  const modal = document.getElementById('feedbackSurveyModal');
  const closeBtn = document.getElementById('closeFeedbackModalBtn');
  const cancelBtn = document.getElementById('cancelFeedbackBtn');
  const form = document.getElementById('feedbackSurveyForm') as HTMLFormElement;
  const submitBtn = document.getElementById('submitFeedbackBtn') as HTMLButtonElement;

  // Close modal when clicking outside
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeFeedbackModal();
    }
  });

  // Close button
  closeBtn?.addEventListener('click', closeFeedbackModal);
  cancelBtn?.addEventListener('click', closeFeedbackModal);

  // Form submission
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitFeedback(visitId, form, submitBtn);
  });

  // Character count for comments
  const commentsTextarea = document.getElementById('comments') as HTMLTextAreaElement;
  if (commentsTextarea) {
    commentsTextarea.addEventListener('input', () => {
      const maxLength = 1000;
      const currentLength = commentsTextarea.value.length;
      
      if (currentLength > maxLength) {
        commentsTextarea.value = commentsTextarea.value.substring(0, maxLength);
      }
    });
  }
}

async function submitFeedback(visitId: string, form: HTMLFormElement, submitBtn: HTMLButtonElement): Promise<void> {
  try {
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    // Get form data
    const formData = new FormData(form);
    
    // Validate that all required fields are filled
    const requiredFields = [
      'functional_suitability',
      'performance_efficiency', 
      'compatibility',
      'usability',
      'reliability',
      'security',
      'maintainability',
      'portability',
      'overall_satisfaction'
    ];

    for (const field of requiredFields) {
      if (!formData.get(field)) {
        throw new Error(`Please rate ${field.replace('_', ' ')}`);
      }
    }

    // Prepare feedback data
    const feedbackData = {
      p_visit_id: visitId,
      p_functional_suitability: parseInt(formData.get('functional_suitability') as string),
      p_performance_efficiency: parseInt(formData.get('performance_efficiency') as string),
      p_compatibility: parseInt(formData.get('compatibility') as string),
      p_usability: parseInt(formData.get('usability') as string),
      p_reliability: parseInt(formData.get('reliability') as string),
      p_security: parseInt(formData.get('security') as string),
      p_maintainability: parseInt(formData.get('maintainability') as string),
      p_portability: parseInt(formData.get('portability') as string),
      p_overall_satisfaction: parseInt(formData.get('overall_satisfaction') as string),
      p_comments: formData.get('comments') as string || null
    };

    // Submit feedback to database
    const { data, error } = await supabase.rpc('submit_visit_feedback', feedbackData);

    if (error) {
      throw new Error(error.message);
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to submit feedback');
    }

    // Show success message
    showNotification('Thank you for your feedback! Your input helps us improve our services.', 'success');
    
    // Close modal
    closeFeedbackModal();

    // Refresh the past visits list to update the feedback button state
    if (typeof (window as any).refreshVisitorPastVisits === 'function') {
      (window as any).refreshVisitorPastVisits();
    }

  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    showNotification(error.message || 'Failed to submit feedback. Please try again.', 'error');
    
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Feedback';
  }
}

function closeFeedbackModal(): void {
  const modal = document.getElementById('feedbackSurveyModal');
  if (modal) {
    modal.remove();
  }
  
  // Restore body scroll
  document.body.classList.remove('overflow-hidden');
}

// Function to check if feedback exists for a visit
export async function hasFeedbackForVisit(visitId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('has_feedback_for_visit', {
      p_visit_id: visitId
    });

    if (error) {
      console.error('Error checking feedback status:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error in hasFeedbackForVisit:', error);
    return false;
  }
}
