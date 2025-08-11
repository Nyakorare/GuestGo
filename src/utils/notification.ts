/**
 * Notification utilities for dashboard indicators
 */

export interface NotificationConfig {
  action: string;
  className: string;
  title?: string;
}

/**
 * Configuration for different notification types
 */
export const NOTIFICATION_CONFIGS: NotificationConfig[] = [
  {
    action: 'visit_completed_flagged',
    className: 'bg-red-500',
    title: 'Important: Visit completed with flags'
  },
  {
    action: 'visit_flagged_no_exit',
    className: 'bg-red-500',
    title: 'Important: Visit flagged - no exit scan'
  }
];

/**
 * Check if a log entry should have a notification indicator
 */
export function shouldShowNotification(logAction: string): boolean {
  return NOTIFICATION_CONFIGS.some(config => config.action === logAction);
}

/**
 * Get notification configuration for a specific action
 */
export function getNotificationConfig(logAction: string): NotificationConfig | null {
  return NOTIFICATION_CONFIGS.find(config => config.action === logAction) || null;
}

/**
 * Generate HTML for notification indicator
 */
export function generateNotificationIndicator(logAction: string): string {
  const config = getNotificationConfig(logAction);
  if (!config) return '';
  
  return `
    <div class="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 ${config.className} rounded-full animate-pulse"
         title="${config.title || 'Important notification'}">
    </div>
  `;
}

/**
 * Add notification indicators to log action badges
 */
export function addNotificationToActionBadge(badgeHtml: string, logAction: string): string {
  const notificationIndicator = generateNotificationIndicator(logAction);
  if (!notificationIndicator) return badgeHtml;
  
  // Wrap the badge in a relative container and add the notification indicator
  return `
    <div class="relative inline-block">
      ${badgeHtml}
      ${notificationIndicator}
    </div>
  `;
}

/**
 * Add notification indicators to log containers (rows/cards)
 */
export function addNotificationToLogContainer(containerHtml: string, logAction: string): string {
  const notificationIndicator = generateNotificationIndicator(logAction);
  if (!notificationIndicator) return containerHtml;
  
  // Wrap the container in a relative container and add the notification indicator
  return `
    <div class="relative pl-6">
      ${containerHtml}
      ${notificationIndicator}
    </div>
  `;
} 