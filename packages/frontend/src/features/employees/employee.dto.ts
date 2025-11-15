/**
 * DTO (Data Transfer Objects) types for Employee API communication
 * CamelCase format matching backend API contracts
 */

import { PaginatedResponseDto, QueryParamsDto } from "@/types/api.types";

// Base enums matching backend
export type EmployeeStatusDto =
  | "ACTIVE"
  | "INACTIVE"
  | "ON_LEAVE"
  | "TERMINATED";
export type GenderDto = "MALE" | "FEMALE";

// WorkSchedule type for JSON object with weekly work schedule
export interface WorkScheduleDay {
  from: string; // HH:MM format
  to: string; // HH:MM format
}

export interface WorkScheduleDto {
  monday?: WorkScheduleDay | null;
  tuesday?: WorkScheduleDay | null;
  wednesday?: WorkScheduleDay | null;
  thursday?: WorkScheduleDay | null;
  friday?: WorkScheduleDay | null;
  saturday?: WorkScheduleDay | null;
  sunday?: WorkScheduleDay | null;
}

// Employee Response DTO from API (matches EmployeeResponseDto from backend)
export interface EmployeeResponseDto {
  id: string;
  userId?: string;
  employeeId?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: string; // ISO string
  gender?: GenderDto;

  // Passport information
  passportSeries?: string;
  passportNumber?: string;
  passportIssuedBy?: string;
  passportIssueDate?: string; // ISO string
  passportExpiryDate?: string; // ISO string

  email?: string;
  phone?: string;
  secondaryPhone?: string;
  workPhone?: string;
  titleId?: string;
  salary?: number;
  hireDate: string; // ISO string from backend
  terminationDate?: string; // ISO string
  status: EmployeeStatusDto;
  workSchedule?: WorkScheduleDto;
  primaryLanguageId?: string;
  secondaryLanguageId?: string;
  textNotificationsEnabled?: boolean;
  notes?: string;
  // Address fields
  countryId?: string;
  regionId?: string;
  cityId?: string;
  districtId?: string;
  address?: string;
  organizationId: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string

  // Related entities (optional in response)
  title?: any; // TitleResponseDto
  user?: any; // UserResponseDto
  organization?: any; // OrganizationResponseDto
  serviceTypes?: any[];
  primaryLanguage?: any; // LanguageResponseDto
  secondaryLanguage?: any; // LanguageResponseDto
  country?: any; // LocationResponseDto
  region?: any; // LocationResponseDto
  city?: any; // LocationResponseDto
  district?: any; // LocationResponseDto
}

// Create Employee Request DTO (matches CreateEmployeeDto from backend)
export interface CreateEmployeeRequestDto {
  employeeId?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: string; // ISO string
  gender?: GenderDto;

  // Passport information
  passportSeries?: string;
  passportNumber?: string;
  passportIssuedBy?: string;
  passportIssueDate?: string; // ISO string
  passportExpiryDate?: string; // ISO string

  email?: string;
  phone?: string;
  secondaryPhone?: string;
  workPhone?: string;
  titleId?: string;
  salary?: number;
  hireDate: string; // ISO string
  terminationDate?: string; // ISO string
  status?: EmployeeStatusDto;
  workSchedule?: WorkScheduleDto;
  primaryLanguageId?: string;
  secondaryLanguageId?: string;
  textNotificationsEnabled?: boolean;
  notes?: string;
  serviceTypeIds?: string[];
  // Address fields
  countryId?: string;
  regionId?: string;
  cityId?: string;
  districtId?: string;
  address?: string;

  // User account fields (optional)
  userAccountPhone?: string;
  userAccountRoleIds?: string[];
}

// Update Employee Request DTO (matches UpdateEmployeeDto from backend)
export interface UpdateEmployeeRequestDto
  extends Partial<CreateEmployeeRequestDto> {
  id: string; // This is added by frontend for the API path, not part of body
}

// Update Employee Status Request DTO (matches UpdateEmployeeStatusDto from backend)
export interface UpdateEmployeeStatusRequestDto {
  status: EmployeeStatusDto;
}

// Find All Employee Query DTO (matches FindAllEmployeeDto from backend)
export interface EmployeesQueryParamsDto extends QueryParamsDto {
  status?: EmployeeStatusDto;
  patientId?: string;
  role?: string;
  departmentId?: string;
  titleId?: string;
}

// API Response DTOs using PaginatedResponseDto
export type EmployeesListResponseDto =
  PaginatedResponseDto<EmployeeResponseDto>;

// Employee Stats DTO (if needed)
export interface EmployeeStatsDto {
  total: number;
  doctorCount: number;
  generalStaffCount: number;
}
