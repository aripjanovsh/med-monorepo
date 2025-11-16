import { FileCategory } from "./file.dto";

export const FILE_CATEGORY_LABELS: Record<FileCategory, string> = {
  [FileCategory.AVATAR]: "Аватар",
  [FileCategory.DOCUMENT]: "Документ",
  [FileCategory.ANALYSIS_RESULT]: "Результат анализа",
  [FileCategory.XRAY]: "Рентген",
  [FileCategory.ULTRASOUND]: "УЗИ",
  [FileCategory.CT_SCAN]: "КТ",
  [FileCategory.MRI]: "МРТ",
  [FileCategory.ECG]: "ЭКГ",
  [FileCategory.PRESCRIPTION]: "Рецепт",
  [FileCategory.MEDICAL_HISTORY]: "Медицинская история",
  [FileCategory.INSURANCE_CARD]: "Страховой полис",
  [FileCategory.REFERRAL]: "Направление",
  [FileCategory.CONSENT_FORM]: "Согласие",
  [FileCategory.GENERAL]: "Общее",
};

// Категории файлов специфичные для пациентов
export const PATIENT_FILE_CATEGORIES = [
  FileCategory.DOCUMENT,
  FileCategory.ANALYSIS_RESULT,
  FileCategory.XRAY,
  FileCategory.ULTRASOUND,
  FileCategory.CT_SCAN,
  FileCategory.MRI,
  FileCategory.ECG,
  FileCategory.PRESCRIPTION,
  FileCategory.MEDICAL_HISTORY,
  FileCategory.INSURANCE_CARD,
  FileCategory.REFERRAL,
  FileCategory.CONSENT_FORM,
  FileCategory.GENERAL,
] as const;

// Категории файлов специфичные для сотрудников
export const EMPLOYEE_FILE_CATEGORIES = [
  FileCategory.AVATAR,
  FileCategory.DOCUMENT,
  FileCategory.GENERAL,
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const ACCEPTED_ALL_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_DOCUMENT_TYPES,
];

export const MIME_TYPE_ICONS: Record<string, string> = {
  "image/jpeg": "📷",
  "image/jpg": "📷",
  "image/png": "📷",
  "image/webp": "📷",
  "application/pdf": "📄",
  "application/msword": "📝",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "📝",
  "application/vnd.ms-excel": "📊",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "📊",
};
