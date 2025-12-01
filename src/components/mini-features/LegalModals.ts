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
      background-color: rgba(0, 0, 0, 0.5);
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
        background-color: rgba(0, 0, 0, 0.5);
      }
    }
    
    @keyframes legalModalSlideIn {
      0% {
        transform: scale(0.75) translateY(-50px);
        opacity: 0;
      }
      50% {
        transform: scale(1.05) translateY(0);
        opacity: 0.8;
      }
      100% {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes legalModalFadeOut {
      from {
        background-color: rgba(0, 0, 0, 0.5);
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
        transform: scale(0.75) translateY(50px);
        opacity: 0;
      }
    }
    
    #privacyPolicyModal.show {
      animation: legalModalFadeIn 0.3s ease-out forwards;
    }
    
    #privacyPolicyModal.show > div {
      animation: legalModalSlideIn 0.5s ease-out forwards;
    }
    
    #termsOfServiceModal.show {
      animation: legalModalFadeIn 0.3s ease-out forwards;
    }
    
    #termsOfServiceModal.show > div {
      animation: legalModalSlideIn 0.5s ease-out forwards;
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
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 md:p-8 max-w-4xl w-full mx-4 mt-4 sm:mt-8 relative transform scale-75 opacity-0 transition-all duration-500 ease-out">
      <button onclick="closePrivacyPolicyModal()" class="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl transition-colors duration-200 transform hover:scale-110 z-10">&times;</button>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Privacy Policy</h3>
      </div>
      
      <div class="max-h-[70vh] overflow-y-auto pr-2">
        <div class="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Last updated: ${new Date().toLocaleDateString()}</p>
          
          <section>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">1. Introduction</h4>
            <p class="mb-3">
              Welcome to GuestGo. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our guest management platform.
            </p>
          </section>
          
          <section>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">2. Information We Collect</h4>
            <p class="mb-2">We collect information that you provide directly to us, including:</p>
            <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
              <li>Personal identification information (name, email address, phone number)</li>
              <li>Visit scheduling information (dates, times, purposes)</li>
              <li>Face detection data for security and verification purposes</li>
              <li>QR code information for check-in and check-out processes</li>
              <li>Feedback and survey responses</li>
            </ul>
          </section>
          
          <section>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">3. How We Use Your Information</h4>
            <p class="mb-2">We use the information we collect to:</p>
            <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
              <li>Process and manage your visit requests</li>
              <li>Verify your identity and ensure security</li>
              <li>Send you visit confirmations and updates</li>
              <li>Improve our services and user experience</li>
              <li>Comply with legal obligations</li>
              <li>Respond to your inquiries and provide customer support</li>
            </ul>
          </section>
          
          <section>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">4. Data Security</h4>
            <p class="mb-3">
              We implement appropriate technical and organizational security measures to protect your personal information. Face detection data is encrypted and stored securely. We use industry-standard encryption protocols and access controls to safeguard your data.
            </p>
          </section>
          
          <section>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">5. Data Retention</h4>
            <p class="mb-3">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Visit records and associated data are retained in accordance with our data retention policies.
            </p>
          </section>
          
          <section>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">6. Your Rights</h4>
            <p class="mb-2">You have the right to:</p>
            <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
              <li>Access your personal information</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (subject to legal requirements)</li>
              <li>Opt-out of certain data processing activities</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>
          
          <section>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">7. Third-Party Services</h4>
            <p class="mb-3">
              We may use third-party services (such as email providers and cloud storage) to support our operations. These services are bound by their own privacy policies and security standards.
            </p>
          </section>
          
          <section>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">8. Contact Us</h4>
            <p class="mb-3">
              If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at:
            </p>
            <p class="mb-1">Email: <a href="mailto:support@guestgo.com" class="text-blue-600 dark:text-blue-400 hover:underline">support@guestgo.com</a></p>
            <p class="mb-1">Phone: <a href="tel:+639123456789" class="text-blue-600 dark:text-blue-400 hover:underline">+63 912 345 6789</a></p>
          </section>
        </div>
      </div>
      
      <div class="mt-6 flex justify-end">
        <button 
          onclick="closePrivacyPolicyModal()"
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
    
    setTimeout(() => {
      modal.classList.add('hidden');
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
