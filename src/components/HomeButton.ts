/**
 * Home Button Component
 * Creates a fixed floating home button above the scroll to top button
 */
export function setupHomeButton(): void {
  // Remove existing home button if it exists
  const existingButton = document.getElementById('homeButton');
  if (existingButton) {
    existingButton.remove();
  }

  // Create and append home button directly to body
  const homeButton = document.createElement('a');
  homeButton.id = 'homeButton';
  homeButton.href = '#/';
  homeButton.className = 'fixed bottom-24 right-6 z-50 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center';
  homeButton.setAttribute('aria-label', 'Go to home page');
  
  // Add SVG icon
  homeButton.innerHTML = `
    <svg class="w-6 h-6 home-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
    </svg>
  `;

  // Add custom styles for enhanced hover animations (only if not already added)
  if (!document.getElementById('home-button-styles')) {
    const style = document.createElement('style');
    style.id = 'home-button-styles';
    style.textContent = `
      #homeButton {
        cursor: pointer;
      }
      #homeButton:hover {
        transform: scale(1.1) translateY(-2px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      #homeButton:active {
        transform: scale(0.95) translateY(0);
      }
      #homeButton:hover .home-button-icon {
        animation: homeBounce 0.6s ease-in-out;
      }
      #homeButton.clicked {
        animation: homeClickPulse 0.5s ease-out;
      }
      #homeButton.clicked .home-button-icon {
        animation: homeIconSlide 0.5s ease-out;
      }
      @keyframes homeBounce {
        0%, 100% {
          transform: translateY(0) scale(1);
        }
        50% {
          transform: translateY(-4px) scale(1.1);
        }
      }
      @keyframes homeClickPulse {
        0% {
          transform: scale(1) rotate(0deg);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        25% {
          transform: scale(0.9) rotate(-5deg);
          box-shadow: 0 20px 25px -5px rgba(34, 197, 94, 0.4), 0 10px 10px -5px rgba(34, 197, 94, 0.2);
        }
        50% {
          transform: scale(1.15) rotate(5deg);
          box-shadow: 0 25px 50px -12px rgba(34, 197, 94, 0.6), 0 0 0 4px rgba(34, 197, 94, 0.3);
        }
        75% {
          transform: scale(0.95) rotate(-3deg);
          box-shadow: 0 15px 20px -5px rgba(34, 197, 94, 0.3), 0 0 0 2px rgba(34, 197, 94, 0.2);
        }
        100% {
          transform: scale(1) rotate(0deg);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
      }
      @keyframes homeIconSlide {
        0% {
          transform: translateX(0) translateY(0) scale(1);
        }
        25% {
          transform: translateX(-3px) translateY(-2px) scale(1.2);
        }
        50% {
          transform: translateX(3px) translateY(-4px) scale(1.3);
        }
        75% {
          transform: translateX(-2px) translateY(-2px) scale(1.1);
        }
        100% {
          transform: translateX(0) translateY(0) scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Append to body
  document.body.appendChild(homeButton);

  // Add click animation
  homeButton.addEventListener('click', () => {
    // Add click animation class
    homeButton.classList.add('clicked');
    
    // Remove animation class after animation completes
    setTimeout(() => {
      homeButton.classList.remove('clicked');
    }, 500);
  });
}

/**
 * Home Button Component (for inline use in pages - deprecated, use setupHomeButton instead)
 * A reusable button that navigates to the home page
 */
export function HomeButton(): string {
  return '';
}
