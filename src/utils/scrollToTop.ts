export function scrollToTop(smooth: boolean = true): void {
  if (typeof window === 'undefined') return;

  const behavior: ScrollBehavior = smooth ? 'smooth' : 'auto';

  window.scrollTo({
    top: 0,
    left: 0,
    behavior,
  });
}

