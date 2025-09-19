/**
 * Date utility functions to handle date formatting consistently
 * and avoid timezone issues when working with date-only values
 */

/**
 * Formats a date string for display in the UI
 * @param dateString - Date string in YYYY-MM-DD format or ISO string
 * @param locale - Locale for formatting (default: 'es-PE')
 * @returns Formatted date string
 */
export function formatDateForDisplay(
  dateString: string | undefined,
  locale: string = "es-PE",
): string {
  if (!dateString) return "";

  try {
    // Parse the date as local date to avoid timezone issues
    const [year, month, day] = dateString.split("T")[0].split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    return date.toLocaleDateString(locale);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

/**
 * Formats a date string for HTML date input (YYYY-MM-DD format)
 * @param dateString - Date string in any format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForInput(dateString: string): string {
  if (!dateString) return "";

  try {
    // If the date is already in YYYY-MM-DD format, return it
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }

    // If it includes time (ISO string), extract just the date part
    if (dateString.includes("T")) {
      return dateString.split("T")[0];
    }

    // Otherwise, try to parse and format
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }

    return "";
  } catch (error) {
    console.error("Error formatting date for input:", error);
    return "";
  }
}

/**
 * Parses a date string and returns a Date object in local time
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object or null if invalid
 */
export function parseLocalDate(dateString: string): Date | null {
  if (!dateString) return null;

  try {
    const [year, month, day] = dateString.split("T")[0].split("-");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } catch (error) {
    console.error("Error parsing local date:", error);
    return null;
  }
}

/**
 * Checks if a date string is valid
 * @param dateString - Date string to validate
 * @returns True if valid, false otherwise
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString) return false;

  try {
    const date = parseLocalDate(dateString);
    return date !== null && !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
}

/**
 * Compares two date strings (YYYY-MM-DD format)
 * @param date1 - First date string
 * @param date2 - Second date string
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDates(date1: string, date2: string): number {
  const d1 = parseLocalDate(date1);
  const d2 = parseLocalDate(date2);

  if (!d1 || !d2) return 0;

  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
}

/**
 * Gets today's date in YYYY-MM-DD format in Lima timezone
 * @returns Today's date string in Lima timezone
 */
export function getTodayString(): string {
  try {
    // Use Lima timezone to get the correct date
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  } catch (e) {
    console.error('Error getting Lima date:', e);
    // Fallback to UTC
    return new Date().toISOString().split("T")[0];
  }
}

/**
 * Gets current date in Lima timezone formatted for display
 * @returns Date string in DD/MM/YYYY format
 */
export function getTodayDisplayString(): string {
  try {
    return new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date());
  } catch (e) {
    console.error('Error getting Lima display date:', e);
    const today = getTodayString();
    const [year, month, day] = today.split('-');
    return `${day}/${month}/${year}`;
  }
}

/**
 * Converts TIME format from MySQL (HH:MM:SS) to HTML time input format (HH:MM)
 * @param timeString - Time string in HH:MM:SS format
 * @returns Time string in HH:MM format
 */
export function formatTimeForInput(timeString: string): string {
  if (!timeString) return "";

  try {
    // If already in HH:MM format, return as is
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      return timeString;
    }

    // If in HH:MM:SS format, extract HH:MM
    if (timeString.includes(":")) {
      const parts = timeString.split(":");
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
    }

    return timeString;
  } catch (error) {
    console.error("Error formatting time for input:", error);
    return timeString;
  }
}

/**
 * Converts HTML time input format (HH:MM) to MySQL TIME format (HH:MM:SS)
 * @param timeString - Time string in HH:MM format
 * @returns Time string in HH:MM:SS format
 */
export function formatTimeForDatabase(timeString: string): string {
  if (!timeString) return "";

  try {
    // If already in HH:MM:SS format, return as is
    if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return timeString;
    }

    // If in HH:MM format, add :00 seconds
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      return `${timeString}:00`;
    }

    return timeString;
  } catch (error) {
    console.error("Error formatting time for database:", error);
    return timeString;
  }
}

/**
 * Debug function to log form data changes
 * @param componentName - Name of the component for logging
 * @param field - Field that changed
 * @param value - New value
 * @param formData - Current form data
 */
