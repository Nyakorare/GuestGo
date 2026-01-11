export type Theme = 'light' | 'dark';

// Check for saved theme preference or system preference
export function getThemePreference(): Theme {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
    return localStorage.getItem('theme') as Theme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Function to update theme
export function updateTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
  updateThemeIcons(theme);
}

// Function to update theme toggle button icons
export function updateThemeIcons(theme: Theme) {
  const darkIcon = document.getElementById('theme-toggle-dark-icon');
  const lightIcon = document.getElementById('theme-toggle-light-icon');
  const toggleButton = document.getElementById('theme-toggle');
  
  // Add rotation animation to button
  toggleButton?.classList.add('theme-toggle-rotate');
  setTimeout(() => {
    toggleButton?.classList.remove('theme-toggle-rotate');
  }, 600);
  
  if (theme === 'dark') {
    // Fade out dark icon, fade in light icon
    darkIcon?.classList.add('theme-icon-fade-out');
    setTimeout(() => {
      darkIcon?.classList.add('hidden');
      darkIcon?.classList.remove('theme-icon-fade-out');
      lightIcon?.classList.remove('hidden');
      lightIcon?.classList.add('theme-icon-fade-in');
      setTimeout(() => {
        lightIcon?.classList.remove('theme-icon-fade-in');
      }, 300);
    }, 150);
  } else {
    // Fade out light icon, fade in dark icon
    lightIcon?.classList.add('theme-icon-fade-out');
    setTimeout(() => {
      lightIcon?.classList.add('hidden');
      lightIcon?.classList.remove('theme-icon-fade-out');
      darkIcon?.classList.remove('hidden');
      darkIcon?.classList.add('theme-icon-fade-in');
      setTimeout(() => {
        darkIcon?.classList.remove('theme-icon-fade-in');
      }, 300);
    }, 150);
  }
}
