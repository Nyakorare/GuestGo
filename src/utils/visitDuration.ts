/**
 * Utility function to calculate the duration between entrance and exit times
 * @param entranceTime - The entrance timestamp (ISO string or Date)
 * @param exitTime - The exit timestamp (ISO string or Date)
 * @returns Formatted duration string (e.g., "2h 30m" or "45m" or "N/A")
 */
export function calculateVisitDuration(
  entranceTime: string | Date | null | undefined,
  exitTime: string | Date | null | undefined
): string {
  // If either time is missing, return N/A
  if (!entranceTime || !exitTime) {
    return 'N/A';
  }

  try {
    const entrance = new Date(entranceTime);
    const exit = new Date(exitTime);

    // Check if dates are valid
    if (isNaN(entrance.getTime()) || isNaN(exit.getTime())) {
      return 'N/A';
    }

    // Calculate difference in milliseconds
    const diffMs = exit.getTime() - entrance.getTime();

    // If exit is before entrance, return N/A
    if (diffMs < 0) {
      return 'N/A';
    }

    // Convert to seconds, minutes, and hours
    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    // Format the duration
    if (totalHours > 0) {
      if (minutes > 0) {
        return `${totalHours}h ${minutes}m`;
      } else {
        return `${totalHours}h`;
      }
    } else if (totalMinutes > 0) {
      if (seconds > 0) {
        return `${totalMinutes}m ${seconds}s`;
      } else {
        return `${totalMinutes}m`;
      }
    } else {
      return `${totalSeconds}s`;
    }
  } catch (error) {
    console.error('Error calculating visit duration:', error);
    return 'N/A';
  }
}

