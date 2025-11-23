/**
 * Patient model utilities for transforming between layers
 * Utility functions for patient data manipulation
 */

import { formatDate as formatDateUtil } from "@/lib/date.utils";
import { SimplePatientDto } from "../visit";
import { PatientResponseDto, PatientDoctorDto } from "./patient.dto";

// =============================================
// Utility Functions
// =============================================

export const getPatientFullName = (
  patient?:
    | PatientResponseDto
    | SimplePatientDto
    | { firstName: string; lastName: string; middleName?: string }
): string => {
  if (!patient) {
    return "—";
  }
  return [patient.lastName, patient.firstName, patient.middleName]
    .filter(Boolean)
    .join(" ");
};

export const getPatientInitials = (
  patient:
    | PatientResponseDto
    | SimplePatientDto
    | { firstName: string; lastName: string }
): string => {
  return [patient.lastName?.[0], patient.firstName?.[0]]
    .filter(Boolean)
    .join("");
};

export const formatPatientLanguage = (language?: {
  name?: string;
  nativeName?: string;
}): string => {
  if (!language) return "-";
  return language.nativeName
    ? `${language.name} (${language.nativeName})`
    : language.name || "-";
};

export const isPatientActive = (patient: PatientResponseDto): boolean => {
  return patient.status === "ACTIVE";
};

export const getPatientDisplayStatus = (status?: string): string => {
  switch (status) {
    case "ACTIVE":
      return "Активен";
    case "INACTIVE":
      return "Неактивен";
    case "DECEASED":
      return "Умер";
    default:
      return "Неизвестно";
  }
};

export const calculatePatientAge = (dateOfBirth?: string | Date): number => {
  if (!dateOfBirth) return 0;

  const birthDate =
    typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - birthDate.getTime());
  const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));

  return diffYears;
};

export const getPatientPrimaryPhone = (
  patient: PatientResponseDto
): string | null => {
  return patient.phone || null;
};

export const getPatientSecondaryPhone = (
  patient: PatientResponseDto
): string | null => {
  return patient.secondaryPhone || null;
};

export const getPatientEmail = (patient: PatientResponseDto): string | null => {
  return patient.email || null;
};

export const getPatientPrimaryDoctor = (
  patient: PatientResponseDto
): PatientDoctorDto | null => {
  return (
    patient.doctors?.find((doctor) => doctor.isActive) ||
    patient.doctors?.[0] ||
    null
  );
};

export const getPatientDoctorNames = (
  patient: PatientResponseDto
): string[] => {
  return (
    patient.doctors
      ?.filter((doctor) => doctor.isActive)
      ?.map((doctor) => `${doctor.firstName} ${doctor.lastName}`) || []
  );
};

export const formatPatientDisplayName = (
  patient: PatientResponseDto
): string => {
  const fullName = getPatientFullName(patient);
  const patientId = patient.patientId ? ` (${patient.patientId})` : "";
  return `${fullName}${patientId}`;
};

export const getGenderDisplay = (gender: string): string => {
  switch (gender) {
    case "MALE":
      return "Мужской";
    case "FEMALE":
      return "Женский";
    default:
      return "Не указан";
  }
};

export const formatPatientInfo = (patient: PatientResponseDto): string => {
  const age = calculatePatientAge(patient.dateOfBirth);
  const gender = getGenderDisplay(patient.gender);
  return `${age} лет, ${gender}`;
};

export const hasPatientVisited = (patient: PatientResponseDto): boolean => {
  return !!patient.lastVisitedAt;
};

export const getPatientLastVisit = (patient: PatientResponseDto): string => {
  if (!patient.lastVisitedAt) {
    return "Не посещал";
  }

  const visitDate = new Date(patient.lastVisitedAt);
  return visitDate.toLocaleDateString("ru-RU");
};

export const isPatientNew = (patient: PatientResponseDto): boolean => {
  return !hasPatientVisited(patient);
};

// =============================================
// Date Formatting Functions
// =============================================

/**
 * Format date with time (DD.MM.YYYY HH:mm)
 */
export const formatPatientDateTime = (date?: string | Date): string => {
  if (!date) return "-";
  return formatDateUtil(date, "dd.MM.yyyy HH:mm");
};

/**
 * Format date only (DD.MM.YYYY)
 */
export const formatPatientDate = (date?: string | Date): string => {
  if (!date) return "-";
  return formatDateUtil(date, "dd.MM.yyyy");
};

// =============================================
// Status Display Functions
// =============================================

/**
 * Get human-readable patient status
 */
export const getPatientStatusDisplay = (
  status?: PatientResponseDto["status"]
): string => {
  if (!status) return "-";

  const statusMap: Record<string, string> = {
    ACTIVE: "Активный",
    INACTIVE: "Неактивный",
    DECEASED: "Умерший",
  };

  return statusMap[status] || status;
};

/**
 * Get notification status display
 */
export const getNotificationStatusDisplay = (enabled?: boolean): string => {
  if (enabled === undefined || enabled === null) return "-";
  return enabled ? "Включены" : "Выключены";
};

// =============================================
// Doctor Functions
// =============================================

/**
 * Get assigned doctors as comma-separated string
 */
export const getAssignedDoctorsDisplay = (
  patient: PatientResponseDto
): string => {
  const doctors = patient.doctors
    ?.filter((d) => d.isActive)
    .map((d) => `${d.firstName} ${d.lastName}`)
    .join(", ");

  return doctors || "-";
};

// =============================================
// Passport Functions
// =============================================

/**
 * Get passport series and number combined
 */
export const getPassportSeriesNumber = (
  patient: PatientResponseDto
): string => {
  if (patient.passportSeries && patient.passportNumber) {
    return `${patient.passportSeries} ${patient.passportNumber}`;
  }
  return "-";
};

/**
 * Check if patient has passport information
 */
export const hasPassportInfo = (patient: PatientResponseDto): boolean => {
  return !!(
    patient.passportSeries ||
    patient.passportNumber ||
    patient.passportIssuedBy
  );
};

// =============================================
// Display ID Functions
// =============================================

/**
 * Get patient display ID (patientId or fallback to id)
 */
export const getPatientDisplayId = (patient: PatientResponseDto): string => {
  return patient.patientId || patient.id;
};

// =============================================
// Language Functions (new)
// =============================================

export const getPatientPrimaryLanguage = (
  patient: PatientResponseDto
): string => {
  return patient.primaryLanguage?.name || "Не указан";
};

export const getPatientSecondaryLanguage = (
  patient: PatientResponseDto
): string => {
  return patient.secondaryLanguage?.name || "Не указан";
};

export const getPatientLanguages = (patient: PatientResponseDto): string => {
  const primary = patient.primaryLanguage?.name;
  const secondary = patient.secondaryLanguage?.name;

  if (primary && secondary) {
    return `${primary}, ${secondary}`;
  } else if (primary) {
    return primary;
  } else if (secondary) {
    return secondary;
  }

  return "Не указаны";
};

// =============================================
// Address Functions (new)
// =============================================

export const getPatientFullAddress = (patient: PatientResponseDto): string => {
  const parts: string[] = [];

  if (patient.country?.name) parts.push(patient.country.name);
  if (patient.region?.name) parts.push(patient.region.name);
  if (patient.city?.name) parts.push(patient.city.name);
  if (patient.district?.name) parts.push(patient.district.name);
  if (patient.address) parts.push(patient.address);

  return parts.length > 0 ? parts.join(", ") : "Не указан";
};

export const getPatientShortAddress = (patient: PatientResponseDto): string => {
  const city = patient.city?.name;
  const address = patient.address;

  if (city && address) {
    return `${city}, ${address}`;
  } else if (city) {
    return city;
  } else if (address) {
    return address;
  }

  return "Не указан";
};

export const getPatientCountry = (patient: PatientResponseDto): string => {
  return patient.country?.name || "Не указана";
};

export const getPatientRegion = (patient: PatientResponseDto): string => {
  return patient.region?.name || "Не указан";
};

export const getPatientCity = (patient: PatientResponseDto): string => {
  return patient.city?.name || "Не указан";
};

export const getPatientDistrict = (patient: PatientResponseDto): string => {
  return patient.district?.name || "Не указан";
};

// =============================================
// Form Helper Functions (new)
// =============================================

export const mapPatientToFormData = (patient: PatientResponseDto) => {
  return {
    // Basic info
    firstName: patient.firstName,
    lastName: patient.lastName,
    middleName: patient.middleName || "",
    patientId: patient.patientId || "",
    dateOfBirth: patient.dateOfBirth,
    gender: (patient.gender as "MALE" | "FEMALE") || undefined,
    status: patient.status,

    // Passport information
    passportSeries: patient.passportSeries || "",
    passportNumber: patient.passportNumber || "",
    passportIssuedBy: patient.passportIssuedBy || "",
    passportIssueDate: patient.passportIssueDate
      ? patient.passportIssueDate.split("T")[0]
      : "",
    passportExpiryDate: patient.passportExpiryDate
      ? patient.passportExpiryDate.split("T")[0]
      : "",

    // Language IDs - extract from nested objects
    primaryLanguageId: patient.primaryLanguage?.id || "",
    secondaryLanguageId: patient.secondaryLanguage?.id || "",

    // Address IDs - extract from nested objects
    countryId: patient.country?.id || "",
    regionId: patient.region?.id || "",
    cityId: patient.city?.id || "",
    districtId: patient.district?.id || "",
    address: patient.address || "",

    // Location hierarchy for LocationSelectField
    locationHierarchy: {
      countryId: patient.country?.id || "",
      regionId: patient.region?.id || "",
      cityId: patient.city?.id || "",
      districtId: patient.district?.id || "",
      selectedId:
        patient.district?.id ||
        patient.city?.id ||
        patient.region?.id ||
        patient.country?.id ||
        "",
    },

    // Simple contact fields
    phone: patient.phone || "",
    secondaryPhone: patient.secondaryPhone || "",
    email: patient.email || "",

    // Related data
    doctorIds: patient.doctors?.map((d) => d.employeeId) || [],
  };
};

export const mapFormDataToCreateRequest = (formData: any) => {
  // Exclude UI-only fields from API request
  const { locationHierarchy, ...apiData } = formData;

  return {
    ...apiData,
    // Ensure date is in ISO format
    dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
  };
};

export const mapFormDataToUpdateRequest = (
  formData: any,
  patientId: string
) => {
  const createRequest = mapFormDataToCreateRequest(formData);
  return {
    ...createRequest,
    id: patientId,
  };
};
