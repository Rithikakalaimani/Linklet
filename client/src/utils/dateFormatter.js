/**
 * Date formatting utilities with timezone support
 * All dates are stored in UTC in the database and automatically converted
 * to the user's local timezone when displayed
 */

/**
 * Format a date to local date string
 * @param {string|Date} date - ISO date string or Date object
 * @returns {string} Formatted date in user's local timezone
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format a date to local date and time string
 * @param {string|Date} date - ISO date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date and time in user's local timezone
 */
export const formatDateTime = (date, options = {}) => {
  if (!date) return 'N/A';
  try {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options,
    };
    return new Date(date).toLocaleString(undefined, defaultOptions);
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format a date with timezone information
 * @param {string|Date} date - ISO date string or Date object
 * @returns {string} Formatted date with timezone abbreviation
 */
export const formatDateTimeWithTimezone = (date) => {
  if (!date) return 'N/A';
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short', // Shows timezone abbreviation (e.g., PST, EST)
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} date - ISO date string or Date object
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return 'N/A';
  try {
    const dateObj = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Check if a date is in the past
 * @param {string|Date} date - ISO date string or Date object
 * @returns {boolean} True if date is in the past
 */
export const isPast = (date) => {
  if (!date) return false;
  try {
    return new Date(date) < new Date();
  } catch (error) {
    return false;
  }
};

/**
 * Check if a date is in the future
 * @param {string|Date} date - ISO date string or Date object
 * @returns {boolean} True if date is in the future
 */
export const isFuture = (date) => {
  if (!date) return false;
  try {
    return new Date(date) > new Date();
  } catch (error) {
    return false;
  }
};
