/**
 * Date utility functions using date-fns
 */

import { differenceInYears, parseISO, isValid } from "date-fns";

/**
 * Calculate age from date of birth string
 * @param dateOfBirth - Date string in ISO format (YYYY-MM-DD)
 * @returns Age in years or null if invalid date
 */
export const calculateAge = (dateOfBirth: string): number | null => {
  if (!dateOfBirth) return null;

  try {
    const birthDate = parseISO(dateOfBirth);
    
    if (!isValid(birthDate)) return null;

    const today = new Date();
    const age = differenceInYears(today, birthDate);

    return age;
  } catch {
    return null;
  }
};

/**
 * Check if a person is a minor (under 18 years old)
 * @param dateOfBirth - Date string in ISO format (YYYY-MM-DD)
 * @returns True if age is less than 18, false otherwise
 */
export const isMinor = (dateOfBirth: string): boolean => {
  const age = calculateAge(dateOfBirth);
  return age !== null && age < 18;
};

/**
 * Format age display
 * @param dateOfBirth - Date string in ISO format (YYYY-MM-DD)
 * @returns Formatted age string or empty string
 */
export const formatAge = (dateOfBirth: string): string => {
  const age = calculateAge(dateOfBirth);
  if (age === null) return "";
  
  if (age === 0) return "менее года";
  if (age === 1) return "1 год";
  if (age >= 2 && age <= 4) return `${age} года`;
  return `${age} лет`;
};
