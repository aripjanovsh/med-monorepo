export const PATIENT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Активен" },
  { value: "INACTIVE", label: "Неактивен" },
  { value: "DECEASED", label: "Умер" },
];

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Мужской" },
  { value: "FEMALE", label: "Женский" },
];

export const CONTACT_RELATION_OPTIONS = [
  { value: "SELF", label: "Сам пациент" },
  { value: "PARENT", label: "Родитель" },
  { value: "CHILD", label: "Ребенок" },
  { value: "SPOUSE", label: "Супруг/Супруга" },
  { value: "SIBLING", label: "Брат/Сестра" },
  { value: "FRIEND", label: "Друг" },
  { value: "GUARDIAN", label: "Опекун" },
  { value: "OTHER", label: "Другое" },
];

export const CONTACT_TYPE_OPTIONS = [
  { value: "PRIMARY", label: "Основной" },
  { value: "EMERGENCY", label: "Экстренный" },
  { value: "WORK", label: "Рабочий" },
  { value: "SECONDARY", label: "Дополнительный" },
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

export const CONTACT_RELATION = {
  SELF: "SELF",
  PARENT: "PARENT",
  CHILD: "CHILD",
  SPOUSE: "SPOUSE",
  SIBLING: "SIBLING",
  FRIEND: "FRIEND",
  GUARDIAN: "GUARDIAN",
  OTHER: "OTHER",
} as const;

export const CONTACT_TYPE = {
  PRIMARY: "PRIMARY",
  EMERGENCY: "EMERGENCY",
  WORK: "WORK",
  SECONDARY: "SECONDARY",
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
export type ContactRelation = 
  (typeof CONTACT_RELATION)[keyof typeof CONTACT_RELATION];
export type ContactType = (typeof CONTACT_TYPE)[keyof typeof CONTACT_TYPE];
