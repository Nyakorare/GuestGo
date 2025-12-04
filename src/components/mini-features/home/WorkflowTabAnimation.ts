/**
 * WorkflowTabAnimation
 * 
 * Adds an auto-advancing fill animation to the workflow tabs in the "How GuestGo Works" section.
 * - Each tab fills over 10 seconds before advancing to the next
 * - Loops back to the first tab after the last
 * - Clicking a tab restarts the animation from that tab
 * - Clicking again pauses/resumes the animation
 */

let animationState: {
  currentStepIndex: number;
  animationInterval: number | null;
  isPaused: boolean;
  fillProgress: number;
  fillOverlays: HTMLElement[];
  logoElements: HTMLElement[];
  stepButtons: HTMLElement[];
  lastClickTime: number;
  lastClickedIndex: number;
} | null = null;

const FILL_DURATION = 10000; // 10 seconds in milliseconds
const UPDATE_INTERVAL = 16; // ~60fps updates
const CLICK_DEBOUNCE = 300; // ms to distinguish single vs double click

export function initWorkflowTabAnimation() {
  const workflowStepsContainer = document.getElementById('workflowSteps');
  if (!workflowStepsContainer) return;

  // Wait a bit for the DOM to be ready
  setTimeout(() => {
    const stepButtons = Array.from(workflowStepsContainer.querySelectorAll('[data-workflow-step]')) as HTMLElement[];
    if (stepButtons.length === 0) return;

    // Clean up existing animation if any
    if (animationState) {
      if (animationState.animationInterval !== null) {
        clearInterval(animationState.animationInterval);
      }
    }

    // Initialize state
    let currentStepIndex = 0;
    let animationInterval: number | null = null;
    let isPaused = false;
    let fillProgress = 0;
    const fillOverlays: HTMLElement[] = [];
    const logoElements: HTMLElement[] = [];
    let lastClickTime = 0;
    let lastClickedIndex = -1;

    // Create fill overlay elements for each button
    stepButtons.forEach((button) => {
      // Make button relative positioned if not already
      const originalPosition = window.getComputedStyle(button).position;
      if (originalPosition === 'static') {
        button.style.position = 'relative';
      }
      // Allow overflow so logo can extend beyond button
      button.style.overflow = 'visible';

      // Remove existing fill overlay if present
      const existingFill = button.querySelector('.workflow-tab-fill');
      if (existingFill) {
        existingFill.remove();
      }
      
      // Remove existing logo if present
      const existingLogo = button.querySelector('.workflow-tab-logo');
      if (existingLogo) {
        existingLogo.remove();
      }

      // Create progress bar at the bottom of the button
      const fillOverlay = document.createElement('div');
      fillOverlay.className = 'workflow-tab-fill';
      fillOverlay.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0%;
        height: 5px;
        background: linear-gradient(90deg, #2563eb, #4f46e5, #7c3aed, #a855f7);
        transition: width 0.1s linear;
        z-index: 10;
        pointer-events: none;
        box-shadow: 0 -3px 16px rgba(37, 99, 235, 0.7), 0 0 12px rgba(79, 70, 229, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        border-radius: 0 0 0.5rem 0.5rem;
        animation: pulse-glow 2s ease-in-out infinite;
        overflow: hidden;
      `;
      
      // Create logo at the front of the progress bar
      const logoElement = document.createElement('img');
      logoElement.className = 'workflow-tab-logo';
      logoElement.src = '/guestgo-logo-no_word.png';
      logoElement.alt = 'GuestGo';
      logoElement.style.cssText = `
        position: absolute;
        bottom: -8px;
        left: 0%;
        width: 24px;
        height: 24px;
        transform: translateX(-50%);
        transition: left 0.1s linear;
        z-index: 20;
        pointer-events: none;
        filter: brightness(0) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
        object-fit: contain;
      `;
      
      // Add keyframes for pulsing glow effect and jump animation
      if (!document.getElementById('workflow-tab-animation-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'workflow-tab-animation-styles';
        styleSheet.textContent = `
          @keyframes pulse-glow {
            0%, 100% {
              box-shadow: 0 -3px 16px rgba(37, 99, 235, 0.7), 0 0 12px rgba(79, 70, 229, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }
            50% {
              box-shadow: 0 -3px 20px rgba(37, 99, 235, 0.9), 0 0 16px rgba(79, 70, 229, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.3);
            }
          }
          @keyframes logo-jump {
            0% {
              transform: translateX(-50%) translateY(0) scale(1);
            }
            30% {
              transform: translateX(-50%) translateY(-20px) scale(1.1);
            }
            70% {
              transform: translateX(-50%) translateY(-15px) scale(1.05);
            }
            100% {
              transform: translateX(-50%) translateY(0) scale(1);
            }
          }
          @keyframes logo-bounce {
            0% {
              transform: translateX(-50%) translateY(-25px) scale(1.15);
            }
            40% {
              transform: translateX(-50%) translateY(5px) scale(0.95);
            }
            60% {
              transform: translateX(-50%) translateY(-8px) scale(1.05);
            }
            80% {
              transform: translateX(-50%) translateY(2px) scale(0.98);
            }
            100% {
              transform: translateX(-50%) translateY(0) scale(1);
            }
          }
          @keyframes fade-out {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }
          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `;
        document.head.appendChild(styleSheet);
      }
      
      button.appendChild(fillOverlay);
      button.appendChild(logoElement);
      fillOverlays.push(fillOverlay);
      logoElements.push(logoElement);
    });

    function updateFillDisplay(index: number, progress: number) {
      fillOverlays.forEach((overlay, i) => {
        if (i === index) {
          overlay.style.width = `${progress}%`;
        } else {
          overlay.style.width = '0%';
        }
      });
      
      // Update logo positions at the front of the progress bar
      logoElements.forEach((logo, i) => {
        if (i === index) {
          // Position logo at the leading edge of the progress bar
          logo.style.left = `${progress}%`;
          logo.style.opacity = progress > 0 ? '1' : '0';
        } else {
          logo.style.left = '0%';
          logo.style.opacity = '0';
        }
      });
    }

    function activateStep(index: number) {
      const step = stepButtons[index]?.dataset.workflowStep;
      if (!step) return;

      // Update button states
      stepButtons.forEach((btn, i) => {
        if (i === index) {
          btn.classList.remove('bg-white', 'dark:bg-gray-800', 'text-blue-600', 'dark:text-blue-400', 'border', 'border-blue-200', 'dark:border-gray-700');
          btn.classList.add('bg-blue-600', 'text-white');
        } else {
          btn.classList.remove('bg-blue-600', 'text-white');
          btn.classList.add('bg-white', 'dark:bg-gray-800', 'text-blue-600', 'dark:text-blue-400', 'border', 'border-blue-200', 'dark:border-gray-700');
        }
      });

      // Show corresponding panel
      document.querySelectorAll('[data-workflow-panel]').forEach(panel => {
        panel.classList.add('hidden');
      });
      const targetPanel = document.querySelector(`[data-workflow-panel="${step}"]`);
      if (targetPanel) {
        targetPanel.classList.remove('hidden');
      }
    }

    function startAnimation() {
      if (animationInterval !== null) {
        clearInterval(animationInterval);
      }

      const startTime = Date.now();
      const startProgress = fillProgress;

      animationInterval = window.setInterval(() => {
        if (isPaused) return;

        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, startProgress + (elapsed / FILL_DURATION) * 100);
        fillProgress = progress;

        updateFillDisplay(currentStepIndex, progress);

        if (progress >= 100) {
          // Stop the interval first
          if (animationInterval !== null) {
            clearInterval(animationInterval);
            animationInterval = null;
          }
          
          const nextStepIndex = (currentStepIndex + 1) % stepButtons.length;
          const currentButton = stepButtons[currentStepIndex];
          const nextButton = stepButtons[nextStepIndex];
          const currentLogo = logoElements[currentStepIndex];
          const nextLogo = logoElements[nextStepIndex];
          
          // Check if we're looping from last tab (index 3) to first tab (index 0)
          const isLoopingBack = currentStepIndex === stepButtons.length - 1 && nextStepIndex === 0;
          
          if (currentLogo && nextLogo && currentButton && nextButton && workflowStepsContainer) {
            // Ensure container is positioned relative
            const containerStyle = window.getComputedStyle(workflowStepsContainer);
            if (containerStyle.position === 'static') {
              workflowStepsContainer.style.position = 'relative';
            }
            
            // Get button positions for smooth transfer
            const currentRect = currentButton.getBoundingClientRect();
            const nextRect = nextButton.getBoundingClientRect();
            const containerRect = workflowStepsContainer.getBoundingClientRect();
            
            // Calculate positions relative to container
            // Use getBoundingClientRect which gives viewport coordinates, then subtract container offset
            const currentEndX = currentRect.right - containerRect.left;
            const nextStartX = nextRect.left - containerRect.left;
            
            // Calculate bottom position - use the same calculation as the logo (bottom: -8px from button bottom)
            // The logo is positioned at bottom: -8px relative to button, so we need button bottom relative to container
            const currentButtonBottom = currentRect.bottom - containerRect.top;
            const logoBottomOffset = 8; // Same as the logo's bottom: -8px
            const logoTopPosition = currentButtonBottom - logoBottomOffset;
            
            if (isLoopingBack) {
              // Fade out animation when looping back to first tab
              currentLogo.style.animation = 'fade-out 0.4s ease-out forwards';
              
              // After fade-out completes, fade in the first tab
              setTimeout(() => {
                // Move to next step
                fillProgress = 0;
                currentStepIndex = nextStepIndex;
                activateStep(currentStepIndex);
                
                // Reset current logo
                currentLogo.style.animation = '';
                currentLogo.style.opacity = '0';
                
                // Fade in animation when looping back to first tab
                nextLogo.style.opacity = '0';
                nextLogo.style.left = '0%';
                nextLogo.style.transform = 'translateX(-50%) translateY(0) scale(1)';
                nextLogo.style.transition = 'none';
                nextLogo.style.animation = 'fade-in 0.5s ease-in forwards';
                
                // Restart animation after fade-in completes
                setTimeout(() => {
                  nextLogo.style.animation = '';
                  nextLogo.style.transition = 'left 0.1s linear';
                  startAnimation();
                }, 500);
              }, 400);
            } else {
              // Hide current logo and create a flying logo for smooth transfer
              currentLogo.style.opacity = '0';
              
              // Create a temporary flying logo that moves between tabs
              const flyingLogo = currentLogo.cloneNode(true) as HTMLElement;
              flyingLogo.style.cssText = `
                position: absolute;
                top: ${logoTopPosition}px;
                left: ${currentEndX}px;
                width: 24px;
                height: 24px;
                transform: translateX(-50%) translateY(0);
                z-index: 30;
                pointer-events: none;
                filter: brightness(0) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
                object-fit: contain;
                opacity: 1;
                transition: none;
                will-change: transform, left, top;
              `;
              workflowStepsContainer.appendChild(flyingLogo);
              
              // Force a reflow to ensure initial position is set
              flyingLogo.offsetHeight;
              
              // Calculate next logo position
              const nextButtonBottom = nextRect.bottom - containerRect.top;
              const nextLogoTopPosition = nextButtonBottom - logoBottomOffset;
              
              // Animate the logo jumping and moving to next tab
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  flyingLogo.style.transition = 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1), top 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                  flyingLogo.style.left = `${nextStartX}px`;
                  flyingLogo.style.top = `${nextLogoTopPosition}px`;
                  flyingLogo.style.transform = 'translateX(-50%) translateY(-25px) scale(1.15)';
                });
              });
              
              // After transfer completes, show next logo and clean up
              setTimeout(() => {
                // Move to next step
                fillProgress = 0;
                currentStepIndex = nextStepIndex;
                activateStep(currentStepIndex);
                
                // Remove flying logo
                flyingLogo.remove();
                
                // Show next logo at start with a bounce landing animation
                nextLogo.style.opacity = '1';
                nextLogo.style.left = '0%';
                nextLogo.style.transform = 'translateX(-50%) translateY(-25px) scale(1.15)';
                nextLogo.style.transition = 'none';
                nextLogo.style.animation = 'logo-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
                
                // Restart animation after bounce completes
                setTimeout(() => {
                  nextLogo.style.animation = '';
                  nextLogo.style.transition = 'left 0.1s linear';
                  nextLogo.style.transform = 'translateX(-50%) translateY(0) scale(1)';
                  startAnimation();
                }, 600);
              }, 600);
            }
          } else {
            // Fallback if elements not found
            fillProgress = 0;
            currentStepIndex = nextStepIndex;
            activateStep(currentStepIndex);
            updateFillDisplay(currentStepIndex, 0);
            startAnimation();
          }
        }
      }, UPDATE_INTERVAL);
    }

    function stopAnimation() {
      if (animationInterval !== null) {
        clearInterval(animationInterval);
        animationInterval = null;
      }
    }

    // Add click handlers to tabs
    // We'll handle tab switching ourselves to avoid conflicts
    stepButtons.forEach((button, index) => {
      button.addEventListener('click', (e) => {
        const now = Date.now();
        const timeSinceLastClick = now - lastClickTime;
        const isSameTab = lastClickedIndex === index;

        // If clicking again quickly on same tab, toggle pause/resume
        if (isSameTab && timeSinceLastClick < CLICK_DEBOUNCE) {
          e.preventDefault();
          e.stopPropagation();
          
          if (isPaused) {
            // Resume animation
            isPaused = false;
            startAnimation();
          } else {
            // Pause animation
            isPaused = true;
            stopAnimation();
          }
        } else {
          // Restart animation from clicked tab
          isPaused = false;
          stopAnimation();
          fillProgress = 0;
          currentStepIndex = index;
          activateStep(currentStepIndex);
          updateFillDisplay(currentStepIndex, 0);
          
          // Hide logos on inactive tabs
          logoElements.forEach((logo, i) => {
            if (i !== index) {
              logo.style.opacity = '0';
            }
          });
          
          // Restart animation
          setTimeout(() => {
            startAnimation();
          }, 100);
        }

        lastClickTime = now;
        lastClickedIndex = index;
      });
    });

    // Save state
    animationState = {
      currentStepIndex,
      animationInterval,
      isPaused,
      fillProgress,
      fillOverlays,
      logoElements,
      stepButtons,
      lastClickTime,
      lastClickedIndex
    };

    // Start the animation
    activateStep(currentStepIndex);
    updateFillDisplay(currentStepIndex, 0); // Initialize logo position
    startAnimation();
  }, 200);
}

