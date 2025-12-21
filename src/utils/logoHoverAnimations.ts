/**
 * Random hover animations for the GuestGo logo
 * Each hover triggers a different random animation
 */

// Array of animation definitions
const animations = [
  {
    name: 'logoSpin',
    keyframes: `
      @keyframes logoSpin {
        0% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(180deg) scale(1.1); }
        100% { transform: rotate(360deg) scale(1); }
      }
    `,
    className: 'animate-logo-spin',
    duration: '0.6s'
  },
  {
    name: 'logoBounce',
    keyframes: `
      @keyframes logoBounce {
        0%, 100% { transform: translateY(0) scale(1); }
        25% { transform: translateY(-8px) scale(1.05); }
        50% { transform: translateY(0) scale(1.1); }
        75% { transform: translateY(-4px) scale(1.05); }
      }
    `,
    className: 'animate-logo-bounce',
    duration: '0.5s'
  },
  {
    name: 'logoPulse',
    keyframes: `
      @keyframes logoPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.15); opacity: 0.9; }
      }
    `,
    className: 'animate-logo-pulse',
    duration: '0.4s'
  },
  {
    name: 'logoShake',
    keyframes: `
      @keyframes logoShake {
        0%, 100% { transform: translateX(0) rotate(0deg); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-4px) rotate(-5deg); }
        20%, 40%, 60%, 80% { transform: translateX(4px) rotate(5deg); }
      }
    `,
    className: 'animate-logo-shake',
    duration: '0.5s'
  },
  {
    name: 'logoWiggle',
    keyframes: `
      @keyframes logoWiggle {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(5deg); }
        75% { transform: rotate(-5deg); }
      }
    `,
    className: 'animate-logo-wiggle',
    duration: '0.4s'
  },
  {
    name: 'logoFlip',
    keyframes: `
      @keyframes logoFlip {
        0% { transform: rotateY(0deg) scale(1); }
        50% { transform: rotateY(180deg) scale(1.1); }
        100% { transform: rotateY(360deg) scale(1); }
      }
    `,
    className: 'animate-logo-flip',
    duration: '0.6s'
  },
  {
    name: 'logoZoom',
    keyframes: `
      @keyframes logoZoom {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }
    `,
    className: 'animate-logo-zoom',
    duration: '0.4s'
  },
  {
    name: 'logoGlow',
    keyframes: `
      @keyframes logoGlow {
        0%, 100% { filter: drop-shadow(0 0 0px rgba(59, 130, 246, 0)); transform: scale(1); }
        50% { filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 20px rgba(59, 130, 246, 0.4)); transform: scale(1.05); }
      }
    `,
    className: 'animate-logo-glow',
    duration: '0.5s'
  },
  {
    name: 'logoSlide',
    keyframes: `
      @keyframes logoSlide {
        0%, 100% { transform: translateX(0) scale(1); }
        25% { transform: translateX(-6px) scale(1.05); }
        75% { transform: translateX(6px) scale(1.05); }
      }
    `,
    className: 'animate-logo-slide',
    duration: '0.5s'
  },
  {
    name: 'logoRotate',
    keyframes: `
      @keyframes logoRotate {
        0% { transform: rotate(0deg) scale(1); }
        100% { transform: rotate(360deg) scale(1.1); }
      }
    `,
    className: 'animate-logo-rotate',
    duration: '0.7s'
  },
  {
    name: 'logoElastic',
    keyframes: `
      @keyframes logoElastic {
        0%, 100% { transform: scale(1); }
        30% { transform: scale(1.3); }
        60% { transform: scale(0.9); }
        80% { transform: scale(1.1); }
      }
    `,
    className: 'animate-logo-elastic',
    duration: '0.6s'
  },
  {
    name: 'logoTilt',
    keyframes: `
      @keyframes logoTilt {
        0%, 100% { transform: rotate(0deg) scale(1); }
        25% { transform: rotate(10deg) scale(1.05); }
        75% { transform: rotate(-10deg) scale(1.05); }
      }
    `,
    className: 'animate-logo-tilt',
    duration: '0.5s'
  },
  {
    name: 'logoFloat',
    keyframes: `
      @keyframes logoFloat {
        0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
        50% { transform: translateY(-10px) rotate(5deg) scale(1.1); }
      }
    `,
    className: 'animate-logo-float',
    duration: '0.5s'
  },
  {
    name: 'logoSqueeze',
    keyframes: `
      @keyframes logoSqueeze {
        0%, 100% { transform: scaleX(1) scaleY(1); }
        25% { transform: scaleX(1.2) scaleY(0.8); }
        50% { transform: scaleX(0.8) scaleY(1.2); }
        75% { transform: scaleX(1.1) scaleY(0.9); }
      }
    `,
    className: 'animate-logo-squeeze',
    duration: '0.5s'
  },
  {
    name: 'logoBlink',
    keyframes: `
      @keyframes logoBlink {
        0%, 50%, 100% { opacity: 1; transform: scale(1); }
        25%, 75% { opacity: 0.5; transform: scale(1.1); }
      }
    `,
    className: 'animate-logo-blink',
    duration: '0.4s'
  }
];

// Inject CSS styles into the document
function injectStyles() {
  // Check if styles are already injected
  if (document.getElementById('logo-hover-animations-styles')) {
    return;
  }

  const styleSheet = document.createElement('style');
  styleSheet.id = 'logo-hover-animations-styles';
  
  // Add all keyframes
  let cssContent = animations.map(anim => anim.keyframes).join('\n');
  
  // Add animation classes
  animations.forEach(anim => {
    cssContent += `
      .${anim.className} {
        animation: ${anim.name} ${anim.duration} ease-in-out;
      }
    `;
  });

  styleSheet.textContent = cssContent;
  document.head.appendChild(styleSheet);
}

// Get a random animation
function getRandomAnimation() {
  const randomIndex = Math.floor(Math.random() * animations.length);
  return animations[randomIndex];
}

// Initialize logo hover animations
export function initLogoHoverAnimations() {
  // Inject CSS styles
  injectStyles();

  // Wait for DOM to be ready
  const setupAnimations = () => {
    const logo = document.querySelector('img[alt="GuestGo Logo"]') as HTMLImageElement;
    
    if (!logo) {
      // Retry after a short delay if logo isn't found yet
      setTimeout(setupAnimations, 100);
      return;
    }

    // Add ID if it doesn't exist
    if (!logo.id) {
      logo.id = 'guestgo-logo';
    }

    // Add cursor pointer for better UX
    logo.style.cursor = 'pointer';
    logo.style.transition = 'transform 0.1s ease';

    // Track current animation to prevent conflicts
    let currentAnimation: string | null = null;

    // Handle hover enter
    logo.addEventListener('mouseenter', () => {
      // Remove previous animation class
      if (currentAnimation) {
        logo.classList.remove(currentAnimation);
      }

      // Get a random animation
      const randomAnim = getRandomAnimation();
      currentAnimation = randomAnim.className;

      // Apply the animation
      logo.classList.add(currentAnimation);

      // Remove animation class after animation completes
      setTimeout(() => {
        if (logo.classList.contains(currentAnimation!)) {
          logo.classList.remove(currentAnimation!);
        }
        currentAnimation = null;
      }, parseFloat(randomAnim.duration) * 1000);
    });

    // Handle hover leave - ensure animation stops cleanly
    logo.addEventListener('mouseleave', () => {
      if (currentAnimation) {
        logo.classList.remove(currentAnimation);
        currentAnimation = null;
      }
    });
  };

  // Start setup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAnimations);
  } else {
    setupAnimations();
  }
}

