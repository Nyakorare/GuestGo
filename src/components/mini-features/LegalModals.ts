// Function to create and inject modal styles
function injectModalStyles() {
  if (document.getElementById('legal-modals-styles')) {
    return; // Styles already injected
  }
  
  const style = document.createElement('style');
  style.id = 'legal-modals-styles';
  style.textContent = `
    /* Legal Modal Animations */
    #privacyPolicyModal.show,
    #termsOfServiceModal.show {
      background-color: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
    }
    
    #privacyPolicyModal.show > div,
    #termsOfServiceModal.show > div {
      transform: scale(1);
      opacity: 1;
    }
    
    @keyframes legalModalFadeIn {
      from {
        background-color: rgba(0, 0, 0, 0);
      }
      to {
        background-color: rgba(0, 0, 0, 0.6);
      }
    }
    
    @keyframes legalModalSlideIn {
      0% {
        transform: scale(0.85) translateY(-30px);
        opacity: 0;
      }
      50% {
        transform: scale(1.02) translateY(0);
        opacity: 0.9;
      }
      100% {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes legalModalFadeOut {
      from {
        background-color: rgba(0, 0, 0, 0.6);
      }
      to {
        background-color: rgba(0, 0, 0, 0);
      }
    }
    
    @keyframes legalModalSlideOut {
      0% {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
      100% {
        transform: scale(0.85) translateY(30px);
        opacity: 0;
      }
    }
    
    @keyframes typing {
      from {
        width: 0;
      }
      to {
        width: 100%;
      }
    }
    
    @keyframes blink {
      0%, 50% {
        border-color: transparent;
      }
      51%, 100% {
        border-color: currentColor;
      }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    
    #privacyPolicyModal.show {
      animation: legalModalFadeIn 0.4s ease-out forwards;
    }
    
    #privacyPolicyModal.show > div {
      animation: legalModalSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    
    #termsOfServiceModal.show {
      animation: legalModalFadeIn 0.4s ease-out forwards;
    }
    
    #termsOfServiceModal.show > div {
      animation: legalModalSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    
    /* Typing animation for title */
    .typing-title {
      overflow: hidden;
      white-space: nowrap;
      border-right: 3px solid;
    }
    
    .typing-title.typing {
      border-right-color: currentColor;
    }
    
    .typing-title.complete {
      border-right: none;
      overflow: visible;
      white-space: normal;
    }
    
    /* Scroll animations for sections */
    .policy-section {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .policy-section.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    /* Enhanced styling */
    .policy-content-wrapper {
      position: relative;
    }
    
    .policy-content-wrapper::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100px;
      background: linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0));
      pointer-events: none;
      z-index: 10;
    }
    
    .dark .policy-content-wrapper::before {
      background: linear-gradient(to bottom, rgba(31,41,55,1), rgba(31,41,55,0));
    }
    
    /* Loading shimmer effect */
    .loading-shimmer {
      background: linear-gradient(
        90deg,
        rgba(255,255,255,0) 0%,
        rgba(255,255,255,0.2) 50%,
        rgba(255,255,255,0) 100%
      );
      background-size: 1000px 100%;
      animation: shimmer 2s infinite;
    }
    
    .dark .loading-shimmer {
      background: linear-gradient(
        90deg,
        rgba(255,255,255,0) 0%,
        rgba(255,255,255,0.1) 50%,
        rgba(255,255,255,0) 100%
      );
    }
    
    /* Enhanced section headers */
    .section-header {
      position: relative;
      padding-left: 1.5rem;
    }
    
    .section-header::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 100%;
      background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
      border-radius: 2px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .section-header.visible::before {
      opacity: 1;
    }
    
    /* Enhanced list items */
    .policy-list-item {
      opacity: 0;
      transform: translateX(-20px);
      transition: all 0.4s ease;
    }
    
    .policy-list-item.visible {
      opacity: 1;
      transform: translateX(0);
    }
    
    /* Gradient text effect */
    .gradient-text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .dark .gradient-text {
      background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    /* Enhanced button */
    .modal-close-btn {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .modal-close-btn:hover {
      transform: rotate(90deg) scale(1.1);
    }
    
    /* Scrollbar styling */
    .policy-scroll::-webkit-scrollbar {
      width: 8px;
    }
    
    .policy-scroll::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
    }
    
    .policy-scroll::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
      border-radius: 4px;
    }
    
    .policy-scroll::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(to bottom, #2563eb, #7c3aed);
    }
    
    .dark .policy-scroll::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
    }
  `;
  document.head.appendChild(style);
}

// Function to create Privacy Policy modal
function createPrivacyPolicyModal() {
  const existingModal = document.getElementById('privacyPolicyModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'privacyPolicyModal';
  modal.className = 'hidden fixed inset-0 bg-black bg-opacity-0 flex items-start justify-center z-[9999] backdrop-blur-sm transition-all duration-300 ease-out overflow-y-auto pt-4 sm:pt-8 md:pt-12';
  
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-4xl w-full mx-4 mt-4 sm:mt-8 relative transform scale-75 opacity-0 transition-all duration-500 ease-out border border-gray-200 dark:border-gray-700 overflow-hidden">
      <!-- Decorative gradient background -->
      <div class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      <!-- Close button -->
      <button onclick="closePrivacyPolicyModal()" class="modal-close-btn absolute top-4 right-4 text-gray-400 hover:text-red-500 text-3xl font-light z-10 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300">&times;</button>
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 pt-2">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-3xl font-bold gradient-text typing-title" data-text="Privacy Policy">Privacy Policy</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Last updated: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      <!-- Content wrapper with scroll animations -->
      <div class="policy-scroll max-h-[70vh] overflow-y-auto pr-2 policy-content-wrapper">
        <div class="space-y-6 text-sm text-gray-700 dark:text-gray-300">
          
          <section class="policy-section" data-section="0">
            <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-3 section-header flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>1. Introduction</span>
            </h4>
            <p class="mb-3 leading-relaxed">
              Welcome to GuestGo. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our guest management platform.
            </p>
          </section>
          
          <section class="policy-section" data-section="1">
            <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-3 section-header flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>2. Information We Collect</span>
            </h4>
            <p class="mb-3 leading-relaxed">We collect information that you provide directly to us, including:</p>
            <ul class="list-none ml-2 mb-3 space-y-2">
              <li class="policy-list-item flex items-start gap-2">
                <span class="text-blue-500 mt-1">▸</span>
                <span>Personal identification information (name, email address, phone number)</span>
              </li>
              <li class="policy-list-item flex items-start gap-2">
                <span class="text-blue-500 mt-1">▸</span>
                <span>Visit scheduling information (dates, times, purposes)</span>
              </li>
              <li class="policy-list-item flex items-start gap-2">
                <span class="text-blue-500 mt-1">▸</span>
                <span>Face detection data for security and verification purposes</span>
              </li>
              <li class="policy-list-item flex items-start gap-2">
                <span class="text-blue-500 mt-1">▸</span>
                <span>QR code information for check-in and check-out processes</span>
              </li>
              <li class="policy-list-item flex items-start gap-2">
                <span class="text-blue-500 mt-1">▸</span>
                <span>Feedback and survey responses</span>
              </li>
            </ul>
          </section>
          
          <section class="policy-section" data-section="2">
            <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-3 section-header flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-pink-500"></span>
              <span>3. How We Use Your Information</span>
            </h4>
            <p class="mb-3 leading-relaxed">We use the information we collect to:</p>
            <ul class="list-none ml-2 mb-3 space-y-2">
              <li class="policy-list-item flex items-start gap-2">
                <span class="text-purple-500 mt-1">▸</span>
                <span>Process and manage your visit requests</span>
              </li>
              <li class="policy-list-item flex items-start gap-2">
                <span class="text-purple-500 mt-1">▸</span>
                <span>Verify your identity and ensure security</span>
              </li>
              <li class="policy-list-item flex items-start gap-2">
                <span class="text-purple-500 mt-1">▸</span>
                <span>Send you visit confirmations and updates</span>
              </li>
              <li class="policy-list-item flex items-start gap-2">
                <span class="text-purple-500 mt-1">▸</span>
                <span>Improve our services and user experience</span>
              </li>
              <li class="policy-list-item flex items-start gap-2">
                <span class="text-purple-500 mt-1">▸</span>
                <span>Comply with legal obligations</span>
              </li>
              <li class="policy-list-item flex items-start gap-2">
                <span class="text-purple-500 mt-1">▸</span>
                <span>Respond to your inquiries and provide customer support</span>
              </li>
            </ul>
          </section>
          
          <section class="policy-section" data-section="3">
            <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-3 section-header flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>4. Data Security</span>
            </h4>
            <p class="mb-3 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information. Face detection data is encrypted and stored securely. We use industry-standard encryption protocols and access controls to safeguard your data.
            </p>
          </section>
          
          <section class="policy-section" data-section="4">
            <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-3 section-header flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-cyan-500"></span>
              <span>5. Data Retention</span>
            </h4>
            <p class="mb-3 leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Visit records and associated data are retained in accordance with our data retention policies.
            </p>
          </section>
          
          <section class="policy-section" data-section="5">
            <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-3 section-header flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-teal-500"></span>
              <span>6. Your Rights</span>
            </h4>
            <p class="mb-3 leading-relaxed">You have the right to:</p>
            <ul class="list-none ml-2 mb-3 space-y-2">
              <li class="policy-list-item flex items-start gap-2">
                <span class="text-teal-500 mt-1">▸</span>
                <span>Access your personal information</span>
              </li>
              <li class="policy-list-item flex items-start gap-2">
                <span class="text-teal-500 mt-1">▸</span>
                <span>Request correction of inaccurate data</span>
              </li>
              <li class="policy-list-item flex items-start gap-2">
                <span class="text-teal-500 mt-1">▸</span>
                <span>Request deletion of your data (subject to legal requirements)</span>
              </li>
              <li class="policy-list-item flex items-start gap-2">
                <span class="text-teal-500 mt-1">▸</span>
                <span>Opt-out of certain data processing activities</span>
              </li>
              <li class="policy-list-item flex items-start gap-2">
                <span class="text-teal-500 mt-1">▸</span>
                <span>Request a copy of your data</span>
              </li>
            </ul>
          </section>
          
          <section class="policy-section" data-section="6">
            <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-3 section-header flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              <span>7. Third-Party Services</span>
            </h4>
            <p class="mb-3 leading-relaxed">
              We may use third-party services (such as email providers and cloud storage) to support our operations. These services are bound by their own privacy policies and security standards.
            </p>
          </section>
          
          <section class="policy-section" data-section="7">
            <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-3 section-header flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>8. Contact Us</span>
            </h4>
            <p class="mb-3 leading-relaxed">
              If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at:
            </p>
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 space-y-2">
              <p class="mb-1 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <a href="mailto:support@guestgo.com" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">support@guestgo.com</a>
              </p>
              <p class="mb-1 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <a href="tel:+639123456789" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">+63 912 345 6789</a>
              </p>
            </div>
          </section>
        </div>
      </div>
      
      <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button 
          onclick="closePrivacyPolicyModal()"
          class="inline-flex justify-center items-center gap-2 rounded-lg border border-transparent shadow-sm px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-base font-medium text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm transition-all duration-300 transform hover:scale-105"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Close
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  return modal;
}

// Function to create Terms of Service modal
function createTermsOfServiceModal() {
  const existingModal = document.getElementById('termsOfServiceModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'termsOfServiceModal';
  modal.className = 'hidden fixed inset-0 bg-black bg-opacity-0 flex items-start justify-center z-[9999] backdrop-blur-sm transition-all duration-300 ease-out overflow-y-auto pt-4 sm:pt-8 md:pt-12';
  
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 md:p-8 max-w-4xl w-full mx-4 mt-4 sm:mt-8 relative transform scale-75 opacity-0 transition-all duration-500 ease-out">
      <button onclick="closeTermsOfServiceModal()" class="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl transition-colors duration-200 transform hover:scale-110 z-10">&times;</button>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Terms of Service</h3>
      </div>
      
      <div class="max-h-[70vh] overflow-y-auto pr-2">
        <div class="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Last updated: ${new Date().toLocaleDateString()}</p>
          
          <section>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">1. Acceptance of Terms</h4>
            <p class="mb-3">
              By accessing and using GuestGo, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>
          
          <section>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">2. Use License</h4>
            <p class="mb-2">Permission is granted to temporarily use GuestGo for personal and business purposes. This license does not include:</p>
            <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose without explicit permission</li>
              <li>Attempting to reverse engineer or decompile any software</li>
              <li>Removing any copyright or proprietary notations</li>
            </ul>
          </section>
          
          <section>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">3. User Responsibilities</h4>
            <p class="mb-2">As a user of GuestGo, you agree to:</p>
            <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
              <li>Provide accurate and complete information when scheduling visits</li>
              <li>Arrive on time for scheduled appointments</li>
              <li>Follow all security protocols and guidelines</li>
              <li>Respect the maximum visit limits (2 visits per week per user account)</li>
              <li>Notify us at least 24 hours in advance if you need to reschedule</li>
              <li>Bring valid identification for verification purposes</li>
            </ul>
          </section>
          
          <section>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">4. Visit Scheduling</h4>
            <p class="mb-3">
              Visit scheduling is subject to availability and approval. We reserve the right to cancel or reschedule visits due to security concerns, operational requirements, or other legitimate reasons. Maximum 2 visits per week per user account are permitted.
            </p>
          </section>
          
          <section>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">5. Security and Verification</h4>
            <p class="mb-3">
              GuestGo uses face detection technology and QR codes for security and verification purposes. By using our service, you consent to the collection and use of biometric data for these purposes. All data is encrypted and stored securely.
            </p>
          </section>
          
          <section>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">6. Prohibited Activities</h4>
            <p class="mb-2">You agree not to:</p>
            <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to the system</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Share your account credentials with others</li>
              <li>Use automated systems to schedule visits</li>
              <li>Provide false or misleading information</li>
            </ul>
          </section>
          
          <section>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">7. Limitation of Liability</h4>
            <p class="mb-3">
              GuestGo shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. We do not guarantee uninterrupted or error-free service.
            </p>
          </section>
          
          <section>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">8. Termination</h4>
            <p class="mb-3">
              We reserve the right to terminate or suspend your access to GuestGo immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
            </p>
          </section>
          
          <section>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">9. Changes to Terms</h4>
            <p class="mb-3">
              We reserve the right to modify these terms at any time. We will notify users of any material changes. Your continued use of the service after such modifications constitutes acceptance of the updated terms.
            </p>
          </section>
          
          <section>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">10. Contact Information</h4>
            <p class="mb-3">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p class="mb-1">Email: <a href="mailto:support@guestgo.com" class="text-blue-600 dark:text-blue-400 hover:underline">support@guestgo.com</a></p>
            <p class="mb-1">Phone: <a href="tel:+639123456789" class="text-blue-600 dark:text-blue-400 hover:underline">+63 912 345 6789</a></p>
          </section>
        </div>
      </div>
      
      <div class="mt-6 flex justify-end">
        <button 
          onclick="closeTermsOfServiceModal()"
          class="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
        >
          Close
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  return modal;
}

// Empty function for compatibility (modals are now created dynamically)
export function LegalModals() {
  return ``;
}

// Setup function to initialize modal functions
export function setupLegalModals(): void {
  // Inject styles
  injectModalStyles();
  
  // Create modals and append to document.body
  createPrivacyPolicyModal();
  createTermsOfServiceModal();
  
  // Global functions to open modals
  (window as any).openPrivacyPolicyModal = function() {
    const modal = document.getElementById('privacyPolicyModal');
    if (!modal) {
      createPrivacyPolicyModal();
      const newModal = document.getElementById('privacyPolicyModal');
      if (!newModal) return;
      openModal(newModal);
      return;
    }
    openModal(modal);
  };
  
  (window as any).closePrivacyPolicyModal = function() {
    const modal = document.getElementById('privacyPolicyModal');
    if (modal) {
      closeModal(modal);
    }
  };
  
  (window as any).openTermsOfServiceModal = function() {
    const modal = document.getElementById('termsOfServiceModal');
    if (!modal) {
      createTermsOfServiceModal();
      const newModal = document.getElementById('termsOfServiceModal');
      if (!newModal) return;
      openModal(newModal);
      return;
    }
    openModal(modal);
  };
  
  (window as any).closeTermsOfServiceModal = function() {
    const modal = document.getElementById('termsOfServiceModal');
    if (modal) {
      closeModal(modal);
    }
  };
  
  // Helper function to setup scroll animations
  function setupScrollAnimations(modal: HTMLElement) {
    const sections = modal.querySelectorAll('.policy-section');
    const listItems = modal.querySelectorAll('.policy-list-item');
    
    // Intersection Observer for scroll animations
    const observerOptions = {
      root: modal.querySelector('.policy-scroll'),
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
            const header = entry.target.querySelector('.section-header');
            if (header) {
              header.classList.add('visible');
            }
            
            // Animate list items in this section
            const items = entry.target.querySelectorAll('.policy-list-item');
            items.forEach((item, itemIndex) => {
              setTimeout(() => {
                (item as HTMLElement).classList.add('visible');
              }, itemIndex * 100);
            });
          }, index * 150);
        }
      });
    }, observerOptions);
    
    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }
  
  // Helper function to animate typing effect
  function animateTyping(element: HTMLElement, text: string, speed: number = 50) {
    const originalText = text || element.textContent || '';
    element.textContent = '';
    element.classList.add('typing');
    element.classList.remove('complete');
    
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < originalText.length) {
        element.textContent += originalText.charAt(i);
        i++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          element.classList.remove('typing');
          element.classList.add('complete');
        }, 500);
      }
    }, speed);
  }
  
  // Helper function to open modal
  function openModal(modal: HTMLElement) {
    // Add click handler to close when clicking outside
    const handleOutsideClick = (e: MouseEvent) => {
      if (e.target === modal) {
        if (modal.id === 'privacyPolicyModal') {
          (window as any).closePrivacyPolicyModal();
        } else if (modal.id === 'termsOfServiceModal') {
          (window as any).closeTermsOfServiceModal();
        }
      }
    };
    modal.addEventListener('click', handleOutsideClick);
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Prevent clicks inside modal from closing it
    const modalContent = modal.querySelector('div');
    if (modalContent) {
      modalContent.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
    
    // Small delay to ensure the modal is visible before animating
    setTimeout(() => {
      modal.classList.add('show');
      if (modalContent) {
        (modalContent as HTMLElement).style.transform = 'scale(1)';
        (modalContent as HTMLElement).style.opacity = '1';
      }
      
      // Animate typing effect for title (only for privacy policy modal)
      if (modal.id === 'privacyPolicyModal') {
        const titleElement = modal.querySelector('.typing-title') as HTMLElement;
        if (titleElement) {
          const titleText = titleElement.textContent || 'Privacy Policy';
          setTimeout(() => {
            animateTyping(titleElement, titleText, 80);
          }, 300);
        }
      }
      
      // Setup scroll animations
      setTimeout(() => {
        setupScrollAnimations(modal);
        
        // Trigger initial animations for first section
        const firstSection = modal.querySelector('.policy-section') as HTMLElement;
        if (firstSection) {
          setTimeout(() => {
            firstSection.classList.add('visible');
            const header = firstSection.querySelector('.section-header');
            if (header) {
              header.classList.add('visible');
            }
          }, 500);
        }
      }, 600);
    }, 10);
  }
  
  // Helper function to close modal
  function closeModal(modal: HTMLElement) {
    modal.classList.remove('show');
    const modalContent = modal.querySelector('div');
    if (modalContent) {
      (modalContent as HTMLElement).style.transform = 'scale(0.75)';
      (modalContent as HTMLElement).style.opacity = '0';
    }
    document.body.style.overflow = '';
    
    // Reset animation states for next open
    setTimeout(() => {
      modal.classList.add('hidden');
      
      // Reset all sections and list items
      const sections = modal.querySelectorAll('.policy-section');
      sections.forEach((section) => {
        section.classList.remove('visible');
        const header = section.querySelector('.section-header');
        if (header) {
          header.classList.remove('visible');
        }
        const items = section.querySelectorAll('.policy-list-item');
        items.forEach((item) => {
          item.classList.remove('visible');
        });
      });
      
      // Reset typing title
      const titleElement = modal.querySelector('.typing-title') as HTMLElement;
      if (titleElement) {
        titleElement.classList.remove('typing', 'complete');
        titleElement.textContent = titleElement.getAttribute('data-text') || 'Privacy Policy';
      }
    }, 500);
  }
  
  // Close modals on Escape key (only add listener once)
  if (!(window as any).legalModalsEscapeListenerAdded) {
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const privacyModal = document.getElementById('privacyPolicyModal');
        const termsModal = document.getElementById('termsOfServiceModal');
        
        if (privacyModal && !privacyModal.classList.contains('hidden')) {
          (window as any).closePrivacyPolicyModal();
        }
        if (termsModal && !termsModal.classList.contains('hidden')) {
          (window as any).closeTermsOfServiceModal();
        }
      }
    });
    (window as any).legalModalsEscapeListenerAdded = true;
  }
}
