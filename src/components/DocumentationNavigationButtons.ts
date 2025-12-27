export function DocumentationNavigationButtons(): string {
  return `
    <!-- Back Button -->
    <button 
      id="docsBackButton"
      class="mb-4 inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
      aria-label="Go back"
    >
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
      </svg>
      Back
    </button>
  `;
}

export function setupScrollToTopButton(): void {
  // Remove existing scroll to top button if it exists
  const existingButton = document.getElementById('scrollToTopButton');
  if (existingButton) {
    existingButton.remove();
  }

  // Create and append scroll to top button directly to body
  const scrollToTopButton = document.createElement('button');
  scrollToTopButton.id = 'scrollToTopButton';
  scrollToTopButton.className = 'fixed bottom-6 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300';
  scrollToTopButton.setAttribute('aria-label', 'Scroll to top');
  
  // Add SVG icon with animation
  scrollToTopButton.innerHTML = `
    <svg class="w-6 h-6 scroll-to-top-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
    </svg>
  `;

  // Add custom styles for enhanced hover animations (only if not already added)
  if (!document.getElementById('scroll-to-top-button-styles')) {
    const style = document.createElement('style');
    style.id = 'scroll-to-top-button-styles';
    style.textContent = `
      #scrollToTopButton {
        cursor: pointer;
      }
      #scrollToTopButton:hover {
        transform: scale(1.1) translateY(-2px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      #scrollToTopButton:active {
        transform: scale(0.95) translateY(0);
      }
      #scrollToTopButton:hover .scroll-to-top-icon {
        animation: bounceUp 0.6s ease-in-out;
      }
      #scrollToTopButton.clicked {
        animation: clickPulse 0.4s ease-out;
      }
      #scrollToTopButton.clicked .scroll-to-top-icon {
        animation: iconSpin 0.5s ease-out;
      }
      @keyframes bounceUp {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-4px);
        }
      }
      @keyframes clickPulse {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(0.85);
        }
        100% {
          transform: scale(1);
        }
      }
      @keyframes iconSpin {
        0% {
          transform: translateY(0) rotate(0deg);
        }
        50% {
          transform: translateY(-6px) rotate(180deg);
        }
        100% {
          transform: translateY(0) rotate(360deg);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Append to body
  document.body.appendChild(scrollToTopButton);

  // Scroll to top on click with animation
  scrollToTopButton.addEventListener('click', () => {
    // Add click animation class
    scrollToTopButton.classList.add('clicked');
    
    // Remove animation class after animation completes
    setTimeout(() => {
      scrollToTopButton.classList.remove('clicked');
    }, 500);
    
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

export function setupDocumentationNavigationButtons(): void {
  // Setup back button
  const backButton = document.getElementById('docsBackButton');
  if (backButton) {
    backButton.addEventListener('click', () => {
      // Check if there's history to go back to, otherwise go to home
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.hash = '/';
      }
    });
  }

  // Setup scroll to top button
  setupScrollToTopButton();
}

