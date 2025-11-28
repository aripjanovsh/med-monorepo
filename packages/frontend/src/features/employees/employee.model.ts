/**
 * Employee model mappers for transforming between layers
 * DTO ↔ Domain ↔ Form transformations
 */

import { formatDate as formatDateUtil } from "@/lib/date.utils";
import { EmployeeResponseDto } from "./employee.dto";
import { SimpleEmployeeDto } from "../visit";
import { GENDER } from "./employee.constants";
import { fileHelpers } from "@/features/file/file.api";

// =============================================
// Utility Functions
// =============================================

export const getEmployeeFullName = (
  employee?: EmployeeResponseDto | SimpleEmployeeDto
): string => {
  if (!employee) {
    return "—";
  }
  return [employee.lastName, employee.firstName, employee.middleName]
    .filter(Boolean)
    .join(" ");
};

export const getEmployeeShortName = (
  employee:
    | EmployeeResponseDto
    | SimpleEmployeeDto
    | { firstName: string; lastName: string; middleName?: string }
): string => {
  return `${employee.firstName} ${employee.lastName}`;
};

export const getEmployeeInitials = (employee: EmployeeResponseDto): string => {
  return `${employee.lastName?.[0] || ""}${employee.firstName?.[0] || ""}`;
};

export const getEmployeeTitle = (employee: EmployeeResponseDto): string => {
  return employee.title?.name;
};

export const getEmployeeAvatarUrl = (
  employee: EmployeeResponseDto | SimpleEmployeeDto | undefined
): string | undefined => {
  if (!employee) return undefined;

  const avatarId = "avatarId" in employee ? employee.avatarId : undefined;
  if (!avatarId) return undefined;

  return fileHelpers.getImageUrl(avatarId);
};

export const getEmployeeId = (employee: EmployeeResponseDto): string => {
  return employee.employeeId || "";
};

export const isEmployeeActive = (employee: EmployeeResponseDto): boolean => {
  return employee.status === "ACTIVE";
};

export const getEmployeeDisplayStatus = (status?: string): string => {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "INACTIVE":
      return "Inactive";
    case "ON_LEAVE":
      return "On Leave";
    case "TERMINATED":
      return "Terminated";
    default:
      return "Unknown";
  }
};

export const calculateEmployeeExperience = (hireDate?: Date): number => {
  if (!hireDate) return 0;

  const today = new Date();
  const diffTime = Math.abs(today.getTime() - hireDate.getTime());
  const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));

  return diffYears;
};

export const getEmployeePhone = (employee: EmployeeResponseDto): string => {
  return employee.phone || employee.workPhone || "Не указан";
};

// =============================================
// Date Formatting Functions
// =============================================

/**
 * Format date with time (DD.MM.YYYY HH:mm)
 */
export const formatEmployeeDateTime = (date?: string | Date): string => {
  if (!date) return "-";
  return formatDateUtil(date, "dd.MM.yyyy HH:mm");
};

/**
 * Format date only (DD.MM.YYYY)
 */
export const formatEmployeeDate = (date?: string | Date): string => {
  if (!date) return "-";
  return formatDateUtil(date, "dd.MM.yyyy");
};

// =============================================
// Gender Display Functions
// =============================================

/**
 * Get human-readable gender
 */
export const getGenderDisplay = (gender?: string): string => {
  if (!gender) return "-";
  return gender === "MALE" ? "Мужской" : "Женский";
};

// =============================================
// Status Display Functions
// =============================================

/**
 * Get human-readable employee status in Russian
 */
export const getEmployeeStatusDisplay = (status?: string): string => {
  if (!status) return "-";

  const statusMap: Record<string, string> = {
    ACTIVE: "Активный",
    INACTIVE: "Неактивный",
    ON_LEAVE: "В отпуске",
    TERMINATED: "Уволен",
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
// Passport Functions
// =============================================

/**
 * Get passport series and number combined
 */
export const getPassportSeriesNumber = (
  employee: EmployeeResponseDto
): string => {
  if (employee.passportSeries && employee.passportNumber) {
    return `${employee.passportSeries} ${employee.passportNumber}`;
  }
  return "-";
};

/**
 * Check if employee has passport information
 */
export const hasPassportInfo = (employee: EmployeeResponseDto): boolean => {
  return !!(
    employee.passportSeries ||
    employee.passportNumber ||
    employee.passportIssuedBy
  );
};

// =============================================
// Display ID Functions
// =============================================

/**
 * Get employee display ID (employeeId or fallback to id)
 */
export const getEmployeeDisplayId = (employee: EmployeeResponseDto): string => {
  return employee.employeeId || employee.id;
};

// =============================================
// Service Types Functions
// =============================================

/**
 * Get service types as comma-separated string
 */
export const getServiceTypesDisplay = (
  employee: EmployeeResponseDto
): string => {
  if (!Array.isArray(employee.serviceTypes)) return "-";

  const types = (employee.serviceTypes as any[])
    .map((s) => (typeof s === "string" ? s : s?.name))
    .filter(Boolean)
    .join(", ");

  return types || "-";
};

// =============================================
// Salary Functions
// =============================================

/**
 * Format salary with currency (сум)
 */
export const formatSalary = (salary?: number): string => {
  if (!salary) return "-";
  return `${salary.toLocaleString()} сум`;
};

// =============================================
// Work Schedule Functions
// =============================================

/**
 * Get work schedule for a specific day
 */
export const getWorkScheduleForDay = (
  employee: EmployeeResponseDto,
  day: string
): string => {
  if (!employee.workSchedule) {
    return "Не рабочий день";
  }

  const schedule = (employee.workSchedule as any)?.[day];
  if (!schedule) {
    return "Не рабочий день";
  }

  // Check if from and to values exist and are not empty
  if (
    !schedule.from ||
    !schedule.to ||
    schedule.from === "" ||
    schedule.to === ""
  ) {
    return "Не рабочий день";
  }

  return `${schedule.from} - ${schedule.to}`;
};

/**
 * Check if employee has work schedule
 */
export const hasWorkSchedule = (employee: EmployeeResponseDto): boolean => {
  return !!employee.workSchedule;
};

// =============================================
// Form Helper Functions (new)
// =============================================

export const mapEmployeeToFormData = (employee: EmployeeResponseDto) => {
  // Build locationHierarchy from individual location IDs
  const locationHierarchy =
    employee.countryId ||
    employee.regionId ||
    employee.cityId ||
    employee.districtId
      ? {
          countryId: employee.countryId || "",
          regionId: employee.regionId || "",
          cityId: employee.cityId || "",
          districtId: employee.districtId || "",
          selectedId:
            employee.districtId ||
            employee.cityId ||
            employee.regionId ||
            employee.countryId ||
            "",
        }
      : undefined;

  return {
    // Core fields
    firstName: employee.firstName || "",
    lastName: employee.lastName || "",
    middleName: employee.middleName || "",
    dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split("T")[0] : "",
    hireDate: employee.hireDate || "",
    gender: employee.gender as "MALE" | "FEMALE" | undefined,

    // Passport information
    passportSeries: employee.passportSeries || "",
    passportNumber: employee.passportNumber || "",
    passportIssuedBy: employee.passportIssuedBy || "",
    passportIssueDate: employee.passportIssueDate
      ? employee.passportIssueDate.split("T")[0]
      : "",
    passportExpiryDate: employee.passportExpiryDate
      ? employee.passportExpiryDate.split("T")[0]
      : "",

    // Contact information
    email: employee.email || "",
    phone: employee.phone || "",
    secondaryPhone: employee.secondaryPhone || "",
    workPhone: employee.workPhone || "",
    userAccountPhone: "",

    // Employment Details
    titleId: employee.titleId || "",
    salary: employee.salary || 0,

    // Work details
    workSchedule: employee.workSchedule || {},

    // Languages
    primaryLanguageId: employee.primaryLanguageId || "",
    secondaryLanguageId: employee.secondaryLanguageId || "",

    // Notifications
    textNotificationsEnabled: employee.textNotificationsEnabled || false,

    // Address
    countryId: employee.countryId || "",
    regionId: employee.regionId || "",
    cityId: employee.cityId || "",
    districtId: employee.districtId || "",
    address: employee.address || "",
    locationHierarchy,

    // Additional Info
    notes: employee.notes || "",

    // Form-specific fields
    createUserAccount: false,
    userAccountRoleIds: [],
  };
};

export const mapFormDataToCreateRequest = (formData: any) => {
  // Omit virtual UI-only fields from payload
  const { createUserAccount, locationHierarchy, passport, ...rest } = formData;

  if (!createUserAccount) {
    delete rest.userAccountPhone;
    delete rest.userAccountRoleIds;
  }

  return rest;
};

export const mapFormDataToUpdateRequest = (
  formData: any,
  employeeId: string
) => {
  const createRequest = mapFormDataToCreateRequest(formData);
  return {
    ...createRequest,
    id: employeeId,
  };
};
