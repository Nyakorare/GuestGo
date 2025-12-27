import supabase from '../config/supabase';
import { showNotification } from '../pages/dashboard/index';
import { computeCriteriaScores, validateAllQuestionsAnswered } from '../utils/feedbackComputation';

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
