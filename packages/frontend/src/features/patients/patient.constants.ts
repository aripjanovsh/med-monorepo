export const PATIENT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Активен" },
  { value: "INACTIVE", label: "Неактивен" },
  { value: "DECEASED", label: "Умер" },
];

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Мужской" },
  { value: "FEMALE", label: "Женский" },
];

export const PATIENT_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  DECEASED: "DECEASED",
} as const;

export const GENDER = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;

export const FORM_STEPS = [
  { key: "basic", title: "Основная информация" },
  { key: "contacts", title: "Контакты" },
  { key: "doctors", title: "Врачи" },
  { key: "additional", title: "Дополнительная информация" },
] as const;

export type PatientStatus =
  (typeof PATIENT_STATUS)[keyof typeof PATIENT_STATUS];
export type Gender = (typeof GENDER)[keyof typeof GENDER];
