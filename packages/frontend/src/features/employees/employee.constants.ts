export const EMPLOYEE_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Активен" },
  { value: "INACTIVE", label: "Неактивен" },
  { value: "ON_LEAVE", label: "В отпуске" },
  { value: "TERMINATED", label: "Уволен" },
] as const;

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Мужской" },
  { value: "FEMALE", label: "Женский" },
];

export const USER_ROLE_OPTIONS = [
  { value: "DOCTOR", label: "Врач" },
  { value: "NURSE", label: "Медсестра" },
  { value: "RECEPTIONIST", label: "Регистратор" },
  { value: "ADMIN", label: "Админ" },
];

export const EMPLOYEE_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ON_LEAVE: "ON_LEAVE",
  TERMINATED: "TERMINATED",
} as const;

export const GENDER = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;

export const USER_ROLE = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  DOCTOR: "DOCTOR",
  NURSE: "NURSE",
  RECEPTIONIST: "RECEPTIONIST",
  PATIENT: "PATIENT",
} as const;

export const WORKING_DAYS = {
  SUNDAY: "S",
  MONDAY: "M",
  TUESDAY: "T",
  WEDNESDAY: "W",
  THURSDAY: "T",
  FRIDAY: "F",
} as const;

export const WEEK_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const WEEK_DAYS_SHORT = {
  monday: "Пн",
  tuesday: "Вт",
  wednesday: "Ср",
  thursday: "Чт",
  friday: "Пт",
  saturday: "Сб",
  sunday: "Вс",
} as const;

export const WEEK_DAYS_LONG = {
  monday: "Понедельник",
  tuesday: "Вторник",
  wednesday: "Среда",
  thursday: "Четверг",
  friday: "Пятница",
  saturday: "Суббота",
  sunday: "Воскресенье",
} as const;

export const FORM_STEPS = [
  { key: "staff", title: "Информация" },
  { key: "hours", title: "График работы" },
  { key: "account", title: "Аккаунт и уведомления" },
] as const;

export type EmployeeStatus =
  (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];
export type Gender = (typeof GENDER)[keyof typeof GENDER];
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
export type WorkingDay = (typeof WORKING_DAYS)[keyof typeof WORKING_DAYS];
