export const VALIDATION_MESSAGES = {
  // Employee form messages
  FIRST_NAME_MIN: "First name must be at least 2 characters",
  FIRST_NAME_REQUIRED: "First name is required",
  LAST_NAME_MIN: "Last name must be at least 2 characters",
  LAST_NAME_REQUIRED: "Last name is required",
  HIRE_DATE_REQUIRED: "Hire date is required",
  EMAIL_INVALID: "Invalid email format",
  SALARY_POSITIVE: "Salary must be positive",
  PASSWORD_MIN: "Password must be at least 6 characters",
  PASSWORD_REQUIRED: "Password is required when creating user account",
  USER_ROLE_REQUIRED: "User role is required when creating user account",

  // Common messages
  REQUIRED: "This field is required",
  INVALID_FORMAT: "Invalid format",
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be no more than ${max} characters`,
  POSITIVE_NUMBER: "Must be a positive number",
} as const;
