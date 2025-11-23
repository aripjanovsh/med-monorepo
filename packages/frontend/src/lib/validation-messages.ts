export const VALIDATION_MESSAGES = {
  // Common form messages
  REQUIRED: "Обязательное поле",
  INVALID_FORMAT: "Неверный формат",

  // Employee form messages
  FIRST_NAME_MIN: "Имя должно содержать минимум 2 символа",
  FIRST_NAME_REQUIRED: "Обязательное поле",
  LAST_NAME_MIN: "Фамилия должна содержать минимум 2 символа",
  LAST_NAME_REQUIRED: "Обязательное поле",
  HIRE_DATE_REQUIRED: "Hire date is required",
  EMAIL_INVALID: "Неверный формат email",
  SALARY_POSITIVE: "Salary must be positive",

  // Patient form messages
  DATE_OF_BIRTH_REQUIRED: "Обязательное поле",
  DATE_OF_BIRTH_FUTURE: "Дата рождения не может быть в будущем",
  GENDER_REQUIRED: "Обязательное поле",
  PASSPORT_FORMAT: "Неверный формат паспорта",
  PHONE_MIN: "Неверный формат телефона",
  PHONE_REQUIRED: "Обязательное поле",

  // Common messages

  MIN_LENGTH: (min: number) => `Должно содержать минимум ${min} символов`,
  MAX_LENGTH: (max: number) => `Должно содержать не более ${max} символов`,
  POSITIVE_NUMBER: "Должно быть положительным числом",
} as const;
