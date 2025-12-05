/**
 * Date utility functions using date-fns
 */

import {
  differenceInDays,
  differenceInYears,
  endOfDay,
  format,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns";

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

/**
 * Format date to specified format
 * @param date - Date string or Date object
 * @param formatString - Format string (e.g., "dd.MM.yyyy", "yyyy-MM-dd")
 * @returns Formatted date string or empty string if invalid
 */
export const formatDate = (
  date: string | Date,
  formatString: string = "dd.MM.yyyy"
): string => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;

    if (!isValid(dateObj)) return "";

    return format(dateObj, formatString);
  } catch {
    return "";
  }
};

export const startOfToday = (): Date => {
  return startOfDay(new Date());
};

export const endOfToday = (): Date => {
  return endOfDay(new Date());
};

/**
 * Format date relative to today (e.g., "2 дня назад", "сегодня")
 * @param date - Date string or Date object
 * @returns Relative date string
 */
export const formatRelativeDate = (date: string | Date): string => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;

    if (!isValid(dateObj)) return "";

    const today = new Date();
    const days = differenceInDays(today, dateObj);

    if (days === 0) return "сегодня";
    if (days === 1) return "вчера";
    if (days < 7) return `${days} ${getDaysWord(days)} назад`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} ${getWeeksWord(weeks)} назад`;
    }
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} ${getMonthsWord(months)} назад`;
    }

    const years = Math.floor(days / 365);
    return `${years} ${getYearsWord(years)} назад`;
  } catch {
    return "";
  }
};

const getDaysWord = (count: number): string => {
  if (count === 1) return "день";
  if (count >= 2 && count <= 4) return "дня";
  return "дней";
};

const getWeeksWord = (count: number): string => {
  if (count === 1) return "неделю";
  if (count >= 2 && count <= 4) return "недели";
  return "недель";
};

const getMonthsWord = (count: number): string => {
  if (count === 1) return "месяц";
  if (count >= 2 && count <= 4) return "месяца";
  return "месяцев";
};

const getYearsWord = (count: number): string => {
  if (count === 1) return "год";
  if (count >= 2 && count <= 4) return "года";
  return "лет";
};

/**
 * Форматирование минут 1мин., 1час 2мин., 1день 2часа 3мин.
 * @param minutes - количество минут
 * @returns строка с форматированными минутами
 */
export const formatMinutes = (minutes: number | null | undefined): string => {
  if (!minutes && minutes !== 0) return "";

  if (minutes === 0) return "0 мин.";

  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = minutes % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} ${getDaysWord(days)}`);
  }

  if (hours > 0) {
    parts.push(`${hours} ${getHoursWord(hours)}`);
  }

  if (mins > 0 || parts.length === 0) {
    parts.push(`${mins} ${getMinutesWord(mins)}`);
  }

  return parts.join(" ");
};

const getHoursWord = (count: number): string => {
  if (count === 1) return "час";
  if (count >= 2 && count <= 4) return "часа";
  return "часов";
};

const getMinutesWord = (count: number): string => {
  if (count === 1) return "мин.";
  if (count >= 2 && count <= 4) return "мин.";
  return "мин.";
};
