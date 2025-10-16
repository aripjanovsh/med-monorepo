/**
 * Employee model mappers for transforming between layers
 * DTO ↔ Domain ↔ Form transformations
 */

import { EmployeeResponseDto } from "./employee.dto";

// =============================================
// Utility Functions
// =============================================

export const getEmployeeFullName = (employee: EmployeeResponseDto): string => {
  const parts = [employee.firstName];
  if (employee.middleName) parts.push(employee.middleName);
  parts.push(employee.lastName);
  return parts.join(" ");
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

