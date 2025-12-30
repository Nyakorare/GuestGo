import supabase from '../config/supabase';
import { showNotification } from '../pages/dashboard/index';
import { computeCriteriaScores, validateAllQuestionsAnswered } from '../utils/feedbackComputation';

export interface FeedbackSurveyData {
  visitId: string;
  visitorName: string;
  visitDate: string;
  places: string[];
}

// ISO 25010 Quality Characteristics with multiple questions per criteria
interface Question {
  id: string;
  text: string;
  textFilipino: string;
}

interface QualityCharacteristic {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  maxScore: number; // 4 or 5
}

const qualityCharacteristics: QualityCharacteristic[] = [
  {
    id: 'functional_suitability',
    name: 'Functional Suitability',
    description: 'The degree to which the system provides functions that meet stated and implied needs when used under specified conditions.',
    maxScore: 4,
    questions: [
      {
        id: 'functional_suitability_q1',
        text: 'The set of functions covers all specified user objectives.',
        textFilipino: 'Ang buong sistema ay sumasaklaw sa lahat ng tinukoy na mga gawain at mga layunin ng gumagamit.'
      },
      {
        id: 'functional_suitability_q2',
        text: 'The function provides the correct results with the needed degree of precision.',
        textFilipino: 'Ang sistema ay nagbibigay ng tamang resulta sa kinakailangan na antas ng pagiging tama.'
      },
      {
        id: 'functional_suitability_q3',
        text: 'The function facilitates the accomplishment of specified tasks and objectives.',
        textFilipino: 'Ang paggamit sa sistema ay nangangasiwa sa pagtupad ng tiyakang mga gawain at layunin.'
      }
    ]
  },
  {
    id: 'performance_efficiency',
    name: 'Performance Efficiency',
    description: 'The performance relative to the amount of resources used under stated conditions.',
    maxScore: 4,
    questions: [
      {
        id: 'performance_efficiency_q1',
        text: 'The response and processing times and throughput rates of a product or system, when performing its functions, meet requirements.',
        textFilipino: 'Nakatutugon ang sistema sa mga kinakailangan oras ng pagtugon at pag proseso at mga antas ng throughput ng isang produkto o sistema, kapag naka pagsasagawa ng tungkulin nito.'
      },
      {
        id: 'performance_efficiency_q2',
        text: 'The amounts and types of resources used by a product or system, when performing its functions, meet requirements.',
        textFilipino: 'Ang halaga at uri ng mga mapagkukunan na ginagamit ng sistema, kapag gumaganap ng tungkulin nito ay nakatutugon sa mga pangangailangan.'
      },
      {
        id: 'performance_efficiency_q3',
        text: 'The maximum limits of the product or system parameter meet requirements.',
        textFilipino: 'Natutugunan ng pinakamataas na limitasyon o parametro ng sistema ang mga pangangailangan.'
      }
    ]
  },
  {
    id: 'compatibility',
    name: 'Compatibility',
    description: 'The degree to which a product can exchange information with other products and perform its required functions while sharing the same environment.',
    maxScore: 4,
    questions: [
      {
        id: 'compatibility_q1',
        text: 'The system can be used on other devices with the function being the same.',
        textFilipino: 'Ang system ay maaaring magamit sa ibang mga device nang hindi nagbabago ang mga functionality nito.'
      },
      {
        id: 'compatibility_q2',
        text: 'The system can exchange information and mutually use the information that has been exchanged.',
        textFilipino: 'Ang system ay maaaring magpalitan ng impormasyon at magamit nang magkasama ang mga impormasyong naipasa na.'
      }
    ]
  },
  {
    id: 'usability',
    name: 'Usability',
    description: 'The degree to which a product can be used by specified users to achieve specified goals with effectiveness, efficiency, and satisfaction.',
    maxScore: 4,
    questions: [
      {
        id: 'usability_q1',
        text: 'The system is recognizable for its use and needs.',
        textFilipino: 'Maaaring matukoy kung ang system ay angkop sa kanilang pag-gamit at pangangailangan.'
      },
      {
        id: 'usability_q2',
        text: 'The system is easy to use and can be learned how to use easily.',
        textFilipino: 'Madali gamitin ang system at madaling matutunan gamitin ito.'
      },
      {
        id: 'usability_q3',
        text: 'The system is easy to control.',
        textFilipino: 'Madali lang kontrolin ang system.'
      },
      {
        id: 'usability_q4',
        text: 'The system has error handling that protects users from making errors.',
        textFilipino: 'Pinoprotektahan ng system sa pagkakamali ang gumagamit sa pamamagitan ng error handling.'
      },
      {
        id: 'usability_q5',
        text: 'The system has a friendly user interface, making it easy to use.',
        textFilipino: 'Mas napadali ang pag gamit ng system dahil sa design nito.'
      },
      {
        id: 'usability_q6',
        text: 'The system can be used by everyone, depending on their role given its scope and limitation.',
        textFilipino: 'Nagagamit ang system ng lahat depende sa kanilang role.'
      }
    ]
  },
  {
    id: 'reliability',
    name: 'Reliability',
    description: 'The degree to which a system performs specified functions under specified conditions for a specified period of time.',
    maxScore: 4,
    questions: [
      {
        id: 'reliability_q1',
        text: 'The system performs specific functions without fault under normal operation.',
        textFilipino: 'Gumagana ang functions ng system sa normal na operasyon ng pag-gamit.'
      },
      {
        id: 'reliability_q2',
        text: 'The system is operational and accessible when required for use.',
        textFilipino: 'Maaring gamitin ang system pag kailangan ito gamitin.'
      },
      {
        id: 'reliability_q3',
        text: 'The system operates as intended despite the presence of hardware or software faults.',
        textFilipino: 'Nagagamit ang system sa dapat nitong pag-gamit kahit may problema ang gamit na hardware o software?'
      },
      {
        id: 'reliability_q4',
        text: 'In the event of an interruption or a failure, the system can recover the data directly affected and re-establish the desired state of the system.',
        textFilipino: 'Sa kaso ng pagkaantala o pagkabigo, kayang mabawi ng system ang mga direktang naapektuhang datos at maibalik ang nais na estado ng system.'
      }
    ]
  },
  {
    id: 'security',
    name: 'Security',
    description: 'The degree to which a product protects information and data so that persons have the degree of data access appropriate to their types and levels of authorization.',
    maxScore: 4,
    questions: [
      {
        id: 'security_q1',
        text: 'The system ensures that data are accessible only to those authorized to have access.',
        textFilipino: 'Ang system ay sinisigurong ang mga mahahalagang impormasyon ay makikita lang ng authorized personnel.'
      },
      {
        id: 'security_q2',
        text: 'The system ensures that the state of its system and data are protected from unauthorized modification or deletion either by malicious action or computer error.',
        textFilipino: 'Ang system ay sinisigurong protektado ang mga mahalagang impormasyon at hindi magagalaw ng mga taong walang access dito.'
      },
      {
        id: 'security_q3',
        text: 'Actions or events can be proven to have taken place so that the events or actions cannot be repudiated later.',
        textFilipino: 'Ang mga aksyon o kaganapan ay maaaring patunayan na naganap upang hindi ito maikaila sa hinaharap'
      },
      {
        id: 'security_q4',
        text: 'The actions of an entity can be traced back to that particular entity.',
        textFilipino: 'Ang mga aksyon ng isang entity ay maaaring masubaybayan pabalik sa partikular na entity na iyon.'
      },
      {
        id: 'security_q5',
        text: 'The identity of a subject or resource can be proved to be the one claimed.',
        textFilipino: 'Ang pagkakakilanlan ng isang subject o resource ay maaaring patunayan na siya ang inaangkin.'
      }
    ]
  },
  {
    id: 'maintainability',
    name: 'Maintainability',
    description: 'The degree of effectiveness and efficiency with which a product can be modified by the intended maintainers.',
    maxScore: 4,
    questions: [
      {
        id: 'maintainability_q1',
        text: 'The system can still be used even if modifications are made in it.',
        textFilipino: 'Magagamit pa din ang system kahit merong pagbabago sa system.'
      },
      {
        id: 'maintainability_q2',
        text: 'The system is dynamic and reusable.',
        textFilipino: 'Ang system ay maaring magamit pa din sa ibang pagkakataon.'
      },
      {
        id: 'maintainability_q3',
        text: 'The activities and functions in the system are easy to understand.',
        textFilipino: 'Madaling maintindihan ang mga kagamitan ng system.'
      },
      {
        id: 'maintainability_q4',
        text: 'The system can be effectively and efficiently modified without harming the present quality.',
        textFilipino: 'Maaring baguhin ang mga nasa loob ng system ng hindi nasisira ang kalidad nito.'
      },
      {
        id: 'maintainability_q5',
        text: 'The system can be tested if needed.',
        textFilipino: 'Maaring subukan ang system kung kinakailangan.'
      }
    ]
  },
  {
    id: 'portability',
    name: 'Portability',
    description: 'The degree of effectiveness and efficiency with which a system can be transferred from one hardware, software, or other operational environment to another.',
    maxScore: 4,
    questions: [
      {
        id: 'portability_q1',
        text: 'The system can be used in different types of devices.',
        textFilipino: 'Nagagamit ang system sa iba\'t ibang device.'
      },
      {
        id: 'portability_q2',
        text: 'The system can replace another product for the same purpose in the same environment.',
        textFilipino: 'Maaring mapalitan ng system ang isang katulad nito sa parehong environment'
      }
    ]
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
              <!-- Instructions -->
              <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <h4 class="text-base font-semibold text-blue-800 dark:text-blue-200 mb-2">Instructions</h4>
                <ul class="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>The survey employs ISO25010 Software Quality Metrics to evaluate the quality of the system.</li>
                  <li>Please rate each question on a scale of 1 to 4, where 1 is the lowest and 4 is the highest.</li>
                  <li>Read each question carefully and select the rating that best reflects your experience.</li>
                  <li>All questions are required and must be answered before submitting the survey.</li>
                  <li>Your feedback is valuable in helping us improve the system.</li>
                </ul>
              </div>

              <!-- ISO 25010 Quality Characteristics -->
              <div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  System Quality Assessment (ISO 25010 Standards)
                </h4>
                
                <div class="space-y-8">
                  ${qualityCharacteristics.map(char => `
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
                      <div class="mb-4">
                        <h5 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
                          ${char.name}
                        </h5>
                        <p class="text-xs text-gray-600 dark:text-gray-400 mb-4">
                          ${char.description}
                        </p>
                        <div class="space-y-4">
                          ${char.questions.map((question, qIndex) => `
                            <div class="bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-600">
                              <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                ${question.text}
                              </label>
                              <p class="text-xs text-gray-500 dark:text-gray-400 mb-3 italic">
                                ${question.textFilipino}
                              </p>
                              <div class="flex items-center space-x-4">
                                <span class="text-xs text-gray-500 dark:text-gray-400">Lowest (1)</span>
                                <div class="flex space-x-2">
                                  ${Array.from({ length: char.maxScore }, (_, i) => i + 1).map(rating => `
                                    <label class="flex items-center">
                                      <input 
                                        type="radio" 
                                        name="${question.id}" 
                                        value="${rating}" 
                                        required
                                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                      >
                                      <span class="ml-1 text-sm text-gray-700 dark:text-gray-300">${rating}</span>
                                    </label>
                                  `).join('')}
                                </div>
                                <span class="text-xs text-gray-500 dark:text-gray-400">Highest (${char.maxScore})</span>
                              </div>
                            </div>
                          `).join('')}
                        </div>
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
                  <span class="text-xs text-gray-500 dark:text-gray-400">Lowest (1)</span>
                  <div class="flex space-x-2">
                    ${[1, 2, 3, 4].map(rating => `
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
                  <span class="text-xs text-gray-500 dark:text-gray-400">Highest (4)</span>
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
    
    // Validate that all required questions are answered
    const validation = validateAllQuestionsAnswered(formData);
    if (!validation.valid) {
      throw new Error(`Please answer all questions. Missing: ${validation.missingFields.length} question(s)`);
    }

    // Compute criteria scores from individual question responses
    const criteriaScores = computeCriteriaScores(formData);

    // Prepare feedback data
    const feedbackData = {
      p_visit_id: visitId,
      p_functional_suitability: criteriaScores.functional_suitability,
      p_performance_efficiency: criteriaScores.performance_efficiency,
      p_compatibility: criteriaScores.compatibility,
      p_usability: criteriaScores.usability,
      p_reliability: criteriaScores.reliability,
      p_security: criteriaScores.security,
      p_maintainability: criteriaScores.maintainability,
      p_portability: criteriaScores.portability,
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

    // Refresh the track schedule feedback button state (for non-logged-in users)
    if (typeof (window as any).refreshTrackScheduleFeedbackButton === 'function') {
      (window as any).refreshTrackScheduleFeedbackButton(visitId);
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
