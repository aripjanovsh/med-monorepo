/**
 * DTO (Data Transfer Objects) types for Employee API communication
 * CamelCase format matching backend API contracts
 */

import { PaginatedResponseDto, QueryParamsDto } from "@/types/api.types";
import type { FileResponseDto } from "@/features/file/file.dto";

// Base enums matching backend
export type EmployeeStatusDto =
  | "ACTIVE"
  | "INACTIVE"
  | "ON_LEAVE"
  | "TERMINATED";
export type GenderDto = "MALE" | "FEMALE";

// WorkSchedule type for JSON object with weekly work schedule
export interface WorkScheduleDay {
  from?: string; // HH:MM format
  to?: string; // HH:MM format
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

  // Avatar
  avatarId?: string;
  avatar?: FileResponseDto;

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

// Dashboard Stats Period Enum
export type StatsPeriod = "week" | "month" | "3months" | "6months" | "year";

// Dashboard Stats Query DTO
export interface EmployeeDashboardStatsQueryDto {
  period?: StatsPeriod;
}

// Visit stats
export interface VisitStatsDto {
  total: number;
  completed: number;
  canceled: number;
  inProgress: number;
  waiting: number;
}

// Time stats
export interface TimeStatsDto {
  avgServiceTimeMinutes: number;
  avgWaitingTimeMinutes: number;
}

// Activity stats
export interface ActivityStatsDto {
  totalServiceOrders: number;
  completedServiceOrders: number;
  totalPrescriptions: number;
  assignedPatients: number;
  newPatientsThisPeriod: number;
}

// Financial stats
export interface FinancialStatsDto {
  totalRevenue: number;
  avgRevenuePerVisit: number;
}

// Efficiency stats
export interface EfficiencyStatsDto {
  completionRate: number;
}

// Chart data point
export interface ChartDataPointDto {
  label: string;
  completed: number;
  canceled: number;
}

export interface RevenueChartDataPointDto {
  label: string;
  revenue: number;
}

export interface GenderChartDataPointDto {
  label: string;
  male: number;
  female: number;
}

// Employee Dashboard Stats Response DTO
export interface EmployeeDashboardStatsResponseDto {
  period: StatsPeriod;
  periodStart: string;
  periodEnd: string;
  visits: VisitStatsDto;
  time: TimeStatsDto;
  activity: ActivityStatsDto;
  financial: FinancialStatsDto;
  efficiency: EfficiencyStatsDto;
  visitsChart: ChartDataPointDto[];
  revenueChart: RevenueChartDataPointDto[];
  genderChart: GenderChartDataPointDto[];
  visitsTrend: number;
  revenueTrend: number;
  efficiencyTrend: number;
}
