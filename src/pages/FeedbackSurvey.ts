import supabase from '../config/supabase';
import { showNotification } from '../pages/dashboard/index';

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

export function FeedbackSurveyPage(visitId: string): string {
  return `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div class="text-center">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Visit Feedback Survey</h1>
            <p class="text-gray-600 dark:text-gray-400">
              Help us improve by sharing your experience
            </p>
          </div>
        </div>

        <!-- Visit Information -->
        <div id="visitInfoContainer" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <h4 class="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">Visit Details</h4>
          <div id="visitInfoContent" class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="animate-pulse">
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <!-- Survey Form -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
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
                type="submit"
                id="submitFeedbackBtn"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

export async function setupFeedbackSurveyPage(visitId: string): Promise<void> {
  // Load visit information
  await loadVisitInfo(visitId);

  // Setup form submission
  const form = document.getElementById('feedbackSurveyForm') as HTMLFormElement;
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitFeedback(visitId, form);
    });
  }
}

async function loadVisitInfo(visitId: string): Promise<void> {
  try {
    const { data: visitData, error } = await supabase
      .from('scheduled_visits')
      .select('visitor_first_name, visitor_last_name, visit_date, purpose')
      .eq('id', visitId)
      .single();

    if (error) {
      throw error;
    }

    // Get places for this visit
    const { data: placesData } = await supabase
      .from('scheduled_visit_places')
      .select('place_id, places_to_visit(name)')
      .eq('visit_id', visitId);

    const places = placesData?.map(p => (p.places_to_visit as any)?.name).filter(Boolean) || [];

    const visitInfoContent = document.getElementById('visitInfoContent');
    if (visitInfoContent) {
      visitInfoContent.innerHTML = `
        <div>
          <span class="font-medium text-blue-700 dark:text-blue-300">Visitor:</span>
          <span class="text-blue-600 dark:text-blue-400 ml-2">${visitData.visitor_first_name} ${visitData.visitor_last_name}</span>
        </div>
        <div>
          <span class="font-medium text-blue-700 dark:text-blue-300">Visit Date:</span>
          <span class="text-blue-600 dark:text-blue-400 ml-2">${new Date(visitData.visit_date).toLocaleDateString()}</span>
        </div>
        <div class="md:col-span-2">
          <span class="font-medium text-blue-700 dark:text-blue-300">Places Visited:</span>
          <span class="text-blue-600 dark:text-blue-400 ml-2">${places.length > 0 ? places.join(', ') : 'N/A'}</span>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading visit info:', error);
    const visitInfoContent = document.getElementById('visitInfoContent');
    if (visitInfoContent) {
      visitInfoContent.innerHTML = `
        <div class="md:col-span-2 text-red-600 dark:text-red-400">
          Error loading visit information. Please check the visit ID.
        </div>
      `;
    }
  }
}

async function submitFeedback(visitId: string, form: HTMLFormElement): Promise<void> {
  try {
    const submitBtn = document.getElementById('submitFeedbackBtn') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }

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
    
    // Show success message on page
    const formContainer = form.parentElement;
    if (formContainer) {
      formContainer.innerHTML = `
        <div class="text-center py-12">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Your feedback has been submitted successfully. We appreciate your input!
          </p>
          <a href="/" class="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Return to Home
          </a>
        </div>
      `;
    }
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    showNotification(error.message || 'Error submitting feedback. Please try again.', 'error');
    
    const submitBtn = document.getElementById('submitFeedbackBtn') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Feedback';
    }
  }
}
