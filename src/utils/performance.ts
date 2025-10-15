// Performance monitoring utility
class PerformanceMonitor {
  private navigationTimes: Map<string, number> = new Map();
  private startTime: number = 0;

  startNavigation(path: string) {
    this.startTime = performance.now();
  }

  endNavigation(path: string) {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    this.navigationTimes.set(path, duration);
    
    // Store timing for this path
    const times = Array.from(this.navigationTimes.entries())
      .filter(([p]) => p === path)
      .map(([, time]) => time);
    // Average accessible via getAverageTime()
  }

  getAverageTime(path: string): number {
    const times = Array.from(this.navigationTimes.entries())
      .filter(([p]) => p === path)
      .map(([, time]) => time);
    
    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  getAllTimes(): Map<string, number> {
    return new Map(this.navigationTimes);
  }

  clear() {
    this.navigationTimes.clear();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Performance optimization helpers
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout as any);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memory management helpers
export function clearUnusedCache() {
  // Clear page cache for non-critical pages after 5 minutes
  setTimeout(() => {
    const criticalPages = ['/', '/about', '/contact'];
    // This would be implemented in navigation.ts to clear non-critical cached pages
  }, 300000); // 5 minutes
}

// Export for global access
(window as any).performanceMonitor = performanceMonitor; 