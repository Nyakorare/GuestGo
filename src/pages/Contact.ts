import supabase from '../config/supabase';
import { SendUsMessage } from '../components/mini-features/SendUsMessage';
import { FindUs } from '../components/mini-features/FindUs';
import { BusinessHours } from '../components/mini-features/BusinessHours';
import { FollowUs } from '../components/mini-features/FollowUs';
import { UserFeedback } from '../components/mini-features/UserFeedback';
import { Footer } from '../components/mini-features/Footer';
import { initializeGoogleMap } from '../components/mini-features/GoogleMap';

export function ContactPage() {
  return `    <div class="w-full py-12 -mx-4 sm:-mx-6 lg:-mx-8">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-200 px-4 sm:px-6 lg:px-8">
        Contact Us
      </h1>
      
      <!-- Contact Person Cards Auto-Sliding Animation -->
      <div class="relative overflow-hidden pb-6 w-screen" style="margin-left: calc(50% - 50vw);">
        <div class="contact-slider flex" style="animation: slideInfinite 40s linear infinite;">
          <!-- Card 1 -->
          <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10 overflow-hidden flex mr-4" style="width: 14.2857%;">
            <!-- Left Side - Current Design -->
            <div class="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/glenn.jpg" alt="Glenn R. Galbadores I" class="w-full h-full object-cover rounded-full" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">Glenn R. Galbadores I</h3>
              <p class="text-gray-600 dark:text-gray-300 text-center">CEO</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">glenn@guestgo.com</p>
            </div>
            <!-- Right Side - New Design -->
            <div class="w-1/2 p-6 bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              <div class="relative z-10 text-center">
                <div class="mb-4">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <h4 class="text-sm font-semibold mb-3 opacity-95">Leadership</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Strategic Vision</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Team Building</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Innovation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10 overflow-hidden flex mr-4" style="width: 14.2857%;">
            <!-- Left Side - Current Design -->
            <div class="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/kurt.jpg" alt="Kurt Angelo F. Ballarta" class="w-full h-full object-cover rounded-full" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">Kurt Angelo F. Ballarta</h3>
              <p class="text-gray-600 dark:text-gray-300 text-center">CTO</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">kurt@guestgo.com</p>
            </div>
            <!-- Right Side - New Design -->
            <div class="w-1/2 p-6 bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-600 dark:to-purple-800 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              <div class="relative z-10 text-center">
                <div class="mb-4">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                  </svg>
                </div>
                <h4 class="text-sm font-semibold mb-3 opacity-95">Technology</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>System Architecture</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Cloud Solutions</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10 overflow-hidden flex mr-4" style="width: 14.2857%;">
            <!-- Left Side - Current Design -->
            <div class="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/justine.jpg" alt="Justine B. Mantilla" class="w-full h-full object-cover rounded-full" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">Justine B. Mantilla</h3>
              <p class="text-gray-600 dark:text-gray-300 text-center">COO</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">justine@guestgo.com</p>
            </div>
            <!-- Right Side - New Design -->
            <div class="w-1/2 p-6 bg-gradient-to-br from-green-500 to-green-700 dark:from-green-600 dark:to-green-800 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              <div class="relative z-10 text-center">
                <div class="mb-4">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <h4 class="text-sm font-semibold mb-3 opacity-95">Operations</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Process Optimization</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Quality Assurance</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Efficiency</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 4 -->
          <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10 overflow-hidden flex mr-4" style="width: 14.2857%;">
            <!-- Left Side - Current Design -->
            <div class="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/walter.jpg" alt="John Walter D. Marquez" class="w-full h-full object-cover rounded-full" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">John Walter D. Marquez</h3>
              <p class="text-gray-600 dark:text-gray-300 text-center">CFO</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">walter@guestgo.com</p>
            </div>
            <!-- Right Side - New Design -->
            <div class="w-1/2 p-6 bg-gradient-to-br from-orange-500 to-orange-700 dark:from-orange-600 dark:to-orange-800 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              <div class="relative z-10 text-center">
                <div class="mb-4">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h4 class="text-sm font-semibold mb-3 opacity-95">Finance</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Financial Planning</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Budget Management</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 5 -->
          <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10 overflow-hidden flex mr-4" style="width: 14.2857%;">
            <!-- Left Side - Current Design -->
            <div class="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/ken.jpg" alt="Ken Zedrick E. Montano" class="w-full h-full object-cover rounded-full" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">Ken Zedrick E. Montano</h3>
              <p class="text-gray-600 dark:text-gray-300 text-center">CMO</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">ken@guestgo.com</p>
            </div>
            <!-- Right Side - New Design -->
            <div class="w-1/2 p-6 bg-gradient-to-br from-pink-500 to-pink-700 dark:from-pink-600 dark:to-pink-800 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              <div class="relative z-10 text-center">
                <div class="mb-4">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
                  </svg>
                </div>
                <h4 class="text-sm font-semibold mb-3 opacity-95">Marketing</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Brand Strategy</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Digital Campaigns</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Growth</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Duplicate cards for seamless infinite loop -->
          <!-- Card 1 (Duplicate) -->
          <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10 overflow-hidden flex mr-4" style="width: 14.2857%;">
            <!-- Left Side - Current Design -->
            <div class="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/glenn.jpg" alt="Glenn R. Galbadores I" class="w-full h-full object-cover rounded-full" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">Glenn R. Galbadores I</h3>
              <p class="text-gray-600 dark:text-gray-300 text-center">CEO</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">glenn@guestgo.com</p>
            </div>
            <!-- Right Side - New Design -->
            <div class="w-1/2 p-6 bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              <div class="relative z-10 text-center">
                <div class="mb-4">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <h4 class="text-sm font-semibold mb-3 opacity-95">Leadership</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Strategic Vision</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Team Building</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Innovation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2 (Duplicate) -->
          <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl hover:z-10 overflow-hidden flex mr-4" style="width: 14.2857%;">
            <!-- Left Side - Current Design -->
            <div class="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/kurt.jpg" alt="Kurt Angelo F. Ballarta" class="w-full h-full object-cover rounded-full" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">Kurt Angelo F. Ballarta</h3>
              <p class="text-gray-600 dark:text-gray-300 text-center">CTO</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">kurt@guestgo.com</p>
            </div>
            <!-- Right Side - New Design -->
            <div class="w-1/2 p-6 bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-600 dark:to-purple-800 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              <div class="relative z-10 text-center">
                <div class="mb-4">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                  </svg>
                </div>
                <h4 class="text-sm font-semibold mb-3 opacity-95">Technology</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>System Architecture</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Cloud Solutions</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                    <span>Security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${SendUsMessage()}

      ${FindUs()}

      ${BusinessHours()}

      ${FollowUs()}

      ${UserFeedback()}
      
      ${Footer()}
    </div>
    <script>
      // Contact form validation and submission
      document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('contact-form');
        if (!form) return;
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const submitText = submitBtn?.querySelector('.submit-text');
        const loadingText = submitBtn?.querySelector('.loading-text');
        const successMessage = document.getElementById('form-success');

        // Form validation
        function validateField(field) {
          const value = field.value.trim();
          const errorDiv = field.parentNode.querySelector('.error-message');
          
          if (field.hasAttribute('required') && !value) {
            errorDiv.textContent = 'This field is required';
            errorDiv.classList.remove('hidden');
            field.classList.add('border-red-500');
            return false;
          }
          
          if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errorDiv.textContent = 'Please enter a valid email address';
              errorDiv.classList.remove('hidden');
              field.classList.add('border-red-500');
              return false;
            }
          }
          
          errorDiv.classList.add('hidden');
          field.classList.remove('border-red-500');
          return true;
        }

        // Real-time validation
        form.querySelectorAll('input, select, textarea').forEach(field => {
          field.addEventListener('blur', () => validateField(field));
          field.addEventListener('input', () => {
            if (field.classList.contains('border-red-500')) {
              validateField(field);
            }
          });
        });

        // Form submission
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          
          let isValid = true;
          form.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
            if (!validateField(field)) {
              isValid = false;
            }
          });

          if (isValid && submitBtn && submitText && loadingText) {
            // Show loading state
            submitBtn.disabled = true;
            submitText.classList.add('hidden');
            loadingText.classList.remove('hidden');
            
            // Simulate form submission
            setTimeout(() => {
              submitBtn.disabled = false;
              submitText.classList.remove('hidden');
              loadingText.classList.add('hidden');
              if (successMessage) successMessage.classList.remove('hidden');
              form.reset();
              
              // Hide success message after 5 seconds
              setTimeout(() => {
                if (successMessage) successMessage.classList.add('hidden');
              }, 5000);
            }, 2000);
          }
        });
      });
    </script>
  `;
}

// Load feedback from database
async function loadFeedback() {
  const feedbackContainer = document.getElementById('feedback-container');
  const feedbackLoading = document.getElementById('feedback-loading');
  const feedbackEmpty = document.getElementById('feedback-empty');
  
  if (!feedbackContainer || !feedbackLoading || !feedbackEmpty) {
    console.error('Feedback container elements not found');
    return;
  }
  
  try {
    // Fetch all available feedbacks with comments and positive ratings
    const { data, error: queryError } = await supabase
      .from('visit_feedback')
      .select('id, comments, overall_satisfaction, submitted_at, scheduled_visits(visitor_first_name, visitor_last_name)')
      .not('comments', 'is', null)
      .gte('overall_satisfaction', 4)
      .order('submitted_at', { ascending: false })
      .limit(100);
    
    if (queryError) {
      console.error('Error loading feedback:', queryError);
      feedbackLoading.classList.add('hidden');
      feedbackEmpty.classList.remove('hidden');
      return;
    }
    
    // Hide loading state
    feedbackLoading.classList.add('hidden');
    
    // If no feedback found, show empty state
    if (!data || data.length === 0) {
      feedbackEmpty.classList.remove('hidden');
      return;
    }
    
    // Process feedback data
    const processedFeedback = data.map(item => ({
      id: item.id,
      visitor_name: (item.scheduled_visits?.visitor_first_name || '') + ' ' + (item.scheduled_visits?.visitor_last_name || '') || 'Anonymous',
      comments: item.comments,
      overall_satisfaction: item.overall_satisfaction,
      submitted_at: item.submitted_at
    })).filter(fb => fb.comments && fb.comments.trim().length > 0);
    
    if (processedFeedback.length === 0) {
      feedbackEmpty.classList.remove('hidden');
      return;
    }
    
    // Randomly select 3-5 feedbacks (or all if less than 3 available)
    const numToShow = Math.min(Math.max(3, Math.floor(Math.random() * 3) + 3), processedFeedback.length);
    const selectedFeedbacks: typeof processedFeedback = [];
    const usedIndices = new Set<number>();
    
    // Randomly select feedbacks without duplicates
    while (selectedFeedbacks.length < numToShow && usedIndices.size < processedFeedback.length) {
      const randomIndex = Math.floor(Math.random() * processedFeedback.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        selectedFeedbacks.push(processedFeedback[randomIndex]);
      }
    }
    
    // Clear container and render multiple feedbacks
    const colors = [
      { bg: 'bg-blue-100', darkBg: 'dark:bg-blue-900', text: 'text-blue-600', darkText: 'dark:text-blue-400' },
      { bg: 'bg-purple-100', darkBg: 'dark:bg-purple-900', text: 'text-purple-600', darkText: 'dark:text-purple-400' },
      { bg: 'bg-green-100', darkBg: 'dark:bg-green-900', text: 'text-green-600', darkText: 'dark:text-green-400' },
      { bg: 'bg-orange-100', darkBg: 'dark:bg-orange-900', text: 'text-orange-600', darkText: 'dark:text-orange-400' },
      { bg: 'bg-pink-100', darkBg: 'dark:bg-pink-900', text: 'text-pink-600', darkText: 'dark:text-pink-400' }
    ];
    
    let feedbacksHtml = '';
    selectedFeedbacks.forEach((feedback, index) => {
      const color = colors[index % colors.length];
      const rating = feedback.overall_satisfaction || 5;
      const comment = (feedback.comments || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      const visitorName = feedback.visitor_name || 'Anonymous';
      const date = new Date(feedback.submitted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
      // Create stars HTML (5 stars, fill up to rating)
      let starsHtml = '';
      for (let i = 0; i < 5; i++) {
        if (i < rating) {
          starsHtml += '<span class="text-amber-400">★</span>';
        } else {
          starsHtml += '<span class="text-gray-300 dark:text-gray-600">★</span>';
        }
      }

      feedbacksHtml += '<div class="testimonial-item p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 hover:border-amber-200 dark:hover:border-amber-800/70 hover:shadow-md transition-all duration-200">' +
        '<div class="flex gap-4">' +
          '<div class="flex-shrink-0 w-1 rounded-full ' + color.bg + ' ' + color.darkBg + ' min-h-[4rem]"></div>' +
          '<div class="min-w-0 flex-1">' +
            '<blockquote class="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">' +
              '"' + comment + '"' +
            '</blockquote>' +
            '<div class="flex flex-wrap items-center justify-between gap-2">' +
              '<div class="flex items-center gap-2">' +
                '<cite class="text-sm font-semibold text-gray-900 dark:text-white not-italic">' + visitorName + '</cite>' +
                '<span class="text-xs text-gray-500 dark:text-gray-400">' + date + '</span>' +
              '</div>' +
              '<div class="flex items-center gap-0.5 text-base" aria-label="Rating: ' + rating + ' out of 5">' +
                starsHtml +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    });
    
    feedbackContainer.innerHTML = feedbacksHtml;
  } catch (error) {
    console.error('Error in loadFeedback:', error);
    feedbackLoading.classList.add('hidden');
    feedbackEmpty.classList.remove('hidden');
  }
}

// Setup function for Contact page
export function setupContactPage(): void {
  // Load feedback when page loads
  setTimeout(() => {
    loadFeedback();
  }, 100);

  // Initialize Google Map (Leaflet)
  setTimeout(() => {
    initializeGoogleMap();
  }, 200);

  // Setup scroll to top button and home button
  import('../components/DocumentationNavigationButtons').then(({ setupScrollToTopButton }) => {
    setupScrollToTopButton();
  });
  import('../components/HomeButton').then(({ setupHomeButton }) => {
    setupHomeButton();
  });

  // Initialize business hours status
  function initBusinessStatus() {
    function updateBusinessStatus(showLoading = false) {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const hour = now.getHours();
      const minute = now.getMinutes();
      const currentTime = hour * 60 + minute;
      
      const statusIndicator = document.getElementById('status-indicator');
      const statusText = document.getElementById('status-text');
      const nextOpening = document.getElementById('next-opening');
      const currentStatusDiv = document.getElementById('current-status');
      
      if (!statusIndicator || !statusText || !nextOpening) return;
      
      // Show loading state
      if (showLoading) {
        statusIndicator.className = 'w-4 h-4 rounded-full bg-gray-400 animate-pulse';
        statusText.textContent = 'Checking status...';
        statusText.className = 'text-xl font-bold text-gray-600 dark:text-gray-400';
        nextOpening.textContent = 'Please wait...';
        if (currentStatusDiv) {
          currentStatusDiv.classList.remove('border-green-300', 'dark:border-green-700', 'border-red-300', 'dark:border-red-700');
          currentStatusDiv.classList.add('border-gray-200', 'dark:border-gray-600');
        }
        return;
      }
      
      // Schedule configuration (matching the left side)
      const schedule = {
        mondayFriday: { open: 9 * 60, close: 18 * 60 }, // 9:00 AM - 6:00 PM
        saturday: { open: 10 * 60, close: 16 * 60 }, // 10:00 AM - 4:00 PM
        sunday: { open: null, close: null } // Closed
      };
      
      let isOpen = false;
      let nextOpen = '';
      let closingTime = '';
      
      // Remove active class from all schedule items
      const mondayFridayEl = document.getElementById('schedule-monday-friday');
      const saturdayEl = document.getElementById('schedule-saturday');
      const sundayEl = document.getElementById('schedule-sunday');
      
      if (mondayFridayEl) mondayFridayEl.classList.remove('schedule-day-active');
      if (saturdayEl) saturdayEl.classList.remove('schedule-day-active');
      if (sundayEl) sundayEl.classList.remove('schedule-day-active');
      
      // Determine status based on current day and time
      if (day >= 1 && day <= 5) { // Monday to Friday
        // Highlight current day
        if (mondayFridayEl) mondayFridayEl.classList.add('schedule-day-active');
        
        if (currentTime >= schedule.mondayFriday.open && currentTime < schedule.mondayFriday.close) {
          isOpen = true;
          closingTime = '6:00 PM';
        } else if (currentTime < schedule.mondayFriday.open) {
          // Before opening today
          nextOpen = 'Today at 9:00 AM';
        } else {
          // After closing - check if tomorrow is Saturday or Sunday
          if (day === 5) {
            // Friday - next is Saturday
            nextOpen = 'Tomorrow at 10:00 AM';
          } else {
            // Monday-Thursday - next is tomorrow
            nextOpen = 'Tomorrow at 9:00 AM';
          }
        }
      } else if (day === 6) { // Saturday
        // Highlight current day
        if (saturdayEl) saturdayEl.classList.add('schedule-day-active');
        
        if (currentTime >= schedule.saturday.open && currentTime < schedule.saturday.close) {
          isOpen = true;
          closingTime = '4:00 PM';
        } else if (currentTime < schedule.saturday.open) {
          // Before opening today
          nextOpen = 'Today at 10:00 AM';
        } else {
          // After closing - next is Monday
          nextOpen = 'Monday at 9:00 AM';
        }
      } else { // Sunday (day === 0)
        // Highlight current day
        if (sundayEl) sundayEl.classList.add('schedule-day-active');
        
        // Always closed on Sunday
        nextOpen = 'Tomorrow at 9:00 AM';
      }
      
      // Update status display with fade transition
      if (currentStatusDiv) {
        currentStatusDiv.style.opacity = '0';
        currentStatusDiv.style.transition = 'opacity 0.3s ease-in-out';
      }
      
      setTimeout(() => {
        if (isOpen) {
          statusIndicator.className = 'w-4 h-4 rounded-full bg-green-500 animate-pulse';
          statusText.textContent = 'We\'re Open!';
          statusText.className = 'text-xl font-bold text-green-600 dark:text-green-400';
          nextOpening.textContent = 'Open until ' + closingTime;
          if (currentStatusDiv) {
            currentStatusDiv.classList.remove('border-gray-200', 'dark:border-gray-600', 'border-red-300', 'dark:border-red-700');
            currentStatusDiv.classList.add('border-green-300', 'dark:border-green-700');
          }
        } else {
          statusIndicator.className = 'w-4 h-4 rounded-full bg-red-500 animate-pulse';
          statusText.textContent = 'We\'re Closed';
          statusText.className = 'text-xl font-bold text-red-600 dark:text-red-400';
          nextOpening.textContent = 'Next opening: ' + nextOpen;
          if (currentStatusDiv) {
            currentStatusDiv.classList.remove('border-gray-200', 'dark:border-gray-600', 'border-green-300', 'dark:border-green-700');
            currentStatusDiv.classList.add('border-red-300', 'dark:border-red-700');
          }
        }
        
        // Remove pulse animation from status container when loaded
        if (currentStatusDiv) {
          currentStatusDiv.classList.remove('animate-pulse-glow');
          currentStatusDiv.style.opacity = '1';
        }
      }, 150);
    }

    // Wait a bit for DOM to be ready, then initialize
    setTimeout(() => {
      const statusIndicator = document.getElementById('status-indicator');
      const statusText = document.getElementById('status-text');
      const nextOpening = document.getElementById('next-opening');
      
      if (!statusIndicator || !statusText || !nextOpening) {
        // Retry if elements not found
        setTimeout(() => initBusinessStatus(), 300);
        return;
      }
      
      // Show loading state initially
      updateBusinessStatus(true);
      
      // Update status after a short delay (DOM ready)
      setTimeout(() => {
        updateBusinessStatus(false);
      }, 800);
      
      // Update business status every minute
      setInterval(() => {
        updateBusinessStatus(false);
      }, 60000);
    }, 200);
  }

  // Initialize business status
  initBusinessStatus();
}