/**
 * Patient model utilities for transforming between layers
 * Utility functions for patient data manipulation
 */

import {
  PatientResponseDto,
  PatientContactDto,
  PatientDoctorDto,
} from "./patient.dto";

// =============================================
// Utility Functions
// =============================================

export const getPatientFullName = (patient: PatientResponseDto): string => {
  return [patient.lastName, patient.firstName, patient.middleName]
    .filter(Boolean)
    .join(" ");
};

export const getPatientInitials = (patient: PatientResponseDto): string => {
  return [patient.lastName?.[0], patient.firstName?.[0]]
    .filter(Boolean)
    .join("");
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

export const getPatientPrimaryContact = (
  patient: PatientResponseDto
): PatientContactDto | null => {
  return (
    patient.contacts?.find((contact) => contact.type === "PRIMARY") || null
  );
};

export const getPatientEmergencyContact = (
  patient: PatientResponseDto
): PatientContactDto | null => {
  return (
    patient.contacts?.find((contact) => contact.type === "EMERGENCY") || null
  );
};

export const getPatientSelfContact = (
  patient: PatientResponseDto
): PatientContactDto | null => {
  return (
    patient.contacts?.find((contact) => contact.relation === "SELF") || null
  );
};

export const getPatientPrimaryPhone = (
  patient: PatientResponseDto
): string | null => {
  const primaryContact =
    getPatientSelfContact(patient) || getPatientPrimaryContact(patient);
  return primaryContact?.primaryPhone || null;
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

export const getContactDisplayName = (contact: PatientContactDto): string => {
  if (contact.relation === "SELF") {
    return "Сам пациент";
  }

  const firstName = contact.firstName || "";
  const lastName = contact.lastName || "";
  const name = `${firstName} ${lastName}`.trim();

  return name || "Без имени";
};

export const getContactRelationDisplay = (relation: string): string => {
  switch (relation) {
    case "SELF":
      return "Сам пациент";
    case "PARENT":
      return "Родитель";
    case "CHILD":
      return "Ребенок";
    case "SPOUSE":
      return "Супруг/Супруга";
    case "SIBLING":
      return "Брат/Сестра";
    case "FRIEND":
      return "Друг";
    case "GUARDIAN":
      return "Опекун";
    case "OTHER":
      return "Другое";
    default:
      return "Неизвестно";
  }
};

export const getContactTypeDisplay = (type: string): string => {
  switch (type) {
    case "PRIMARY":
      return "Основной";
    case "EMERGENCY":
      return "Экстренный";
    case "WORK":
      return "Рабочий";
    case "SECONDARY":
      return "Дополнительный";
    default:
      return "Неизвестно";
  }
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
    passportIssueDate: patient.passportIssueDate || "",
    passportExpiryDate: patient.passportExpiryDate || "",

    // Language IDs
    primaryLanguageId: patient.primaryLanguageId || "",
    secondaryLanguageId: patient.secondaryLanguageId || "",

    // Address IDs
    countryId: patient.countryId || "",
    regionId: patient.regionId || "",
    cityId: patient.cityId || "",
    districtId: patient.districtId || "",
    address: patient.address || "",

    // Location hierarchy for LocationSelectField
    locationHierarchy: {
      countryId: patient.countryId,
      regionId: patient.regionId,
      cityId: patient.cityId,
      districtId: patient.districtId,
      selectedId:
        patient.districtId ||
        patient.cityId ||
        patient.regionId ||
        patient.countryId,
    },

    // Related data
    contacts: patient.contacts || [],
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
