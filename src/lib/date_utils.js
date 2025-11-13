/**
 * Date Utility Functions
 * Handles relative offset calculations and date range validation
 */

/**
 * Calculate absolute date from relative offset
 * @param {Date} baseDate - Base date (usually today)
 * @param {number} offset - Days to add to base date
 * @returns {Date} Calculated date
 */
export function addDays(baseDate, offset) {
  const result = new Date(baseDate);
  result.setDate(result.getDate() + offset);
  return result;
}

/**
 * Format date to ISO 8601 (YYYY-MM-DD)
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatToISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate search date range from relative offsets
 * Per spec: startDate = offset from today, endDate = duration in days
 * Example: startDate=3, endDate=4 -> search from day 3 through day 6 (4-day period)
 *
 * @param {number} startDate - Offset from today (natural number, positive integer)
 * @param {number} endDate - Duration in days (natural number, positive integer)
 * @param {Date} baseDate - Base date (defaults to today)
 * @returns {Object} { searchStartDate: string (ISO), searchEndDate: string (ISO) }
 */
export function calculateDateRange(startDate, endDate, baseDate = new Date()) {
  // Validate inputs
  if (!Number.isInteger(startDate) || startDate < 1 || startDate > 365) {
    throw new Error('startDate must be a positive integer between 1 and 365');
  }

  if (!Number.isInteger(endDate) || endDate < 1 || endDate > 365) {
    throw new Error('endDate must be a positive integer between 1 and 365');
  }

  // Per FR-003: searchStartDate = today + startDate days
  //             searchEndDate = searchStartDate + (endDate - 1) days
  // Both boundaries are inclusive
  const searchStartDate = addDays(baseDate, startDate);
  const searchEndDate = addDays(searchStartDate, endDate - 1);

  return {
    searchStartDate: formatToISO(searchStartDate),
    searchEndDate: formatToISO(searchEndDate),
  };
}

/**
 * Check if a date string is in valid ISO 8601 format and represents a real calendar date
 * Validates format, range, and calendar validity (e.g., Feb 29 only in leap years)
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} True if valid
 */
export function isValidISODate(dateStr) {
  if (typeof dateStr !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

  // Parse and validate by checking if the date auto-corrects
  // If '2025-02-29' becomes '2025-03-01', it's invalid
  const date = new Date(dateStr + 'T00:00:00.000Z');
  if (isNaN(date.getTime())) return false;

  // Format back and compare - if different, the date was auto-corrected
  const formatted = formatToISO(new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return formatted === dateStr;
}

/**
 * Check if an event date falls within a date range (inclusive)
 * @param {string} eventDate - Event date (ISO format)
 * @param {string} rangeStart - Range start date (ISO format)
 * @param {string} rangeEnd - Range end date (ISO format)
 * @returns {boolean} True if event is within range
 */
export function isDateInRange(eventDate, rangeStart, rangeEnd) {
  const event = new Date(eventDate);
  const start = new Date(rangeStart);
  const end = new Date(rangeEnd);

  return event >= start && event <= end;
}

/**
 * Get current date (for testing purposes, can be mocked)
 * @returns {Date} Current date
 */
export function getCurrentDate() {
  return new Date();
}
