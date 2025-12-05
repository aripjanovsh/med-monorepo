/**
 * DTO (Data Transfer Objects) types for Patient API communication
 * CamelCase format matching backend API contracts
 */

import { PaginatedResponseDto, QueryParamsDto } from "@/types/api.types";

// Base enums matching backend
export type PatientStatusDto = "ACTIVE" | "INACTIVE" | "DECEASED";
export type GenderDto = "MALE" | "FEMALE";

// Patient Doctor DTO
export interface PatientDoctorDto {
  id: string;
  employeeId: string;
  avatarId?: string;
  title?: {
    id: string;
    name: string;
  };
  firstName: string;
  lastName: string;
  assignedAt: string; // ISO string
  isActive: boolean;
}

// Patient Response DTO from API (matches PatientResponseDto from backend)
export interface PatientResponseDto {
  id: string;
  patientId?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string; // ISO string from backend
  gender: GenderDto;

  // Passport information
  passportSeries?: string;
  passportNumber?: string;
  passportIssuedBy?: string;
  passportIssueDate?: string; // ISO string
  passportExpiryDate?: string; // ISO string

  // Language IDs (new fields)
  primaryLanguageId?: string;
  secondaryLanguageId?: string;

  // Address IDs (new fields)
  countryId?: string;
  regionId?: string;
  cityId?: string;
  districtId?: string;
  address?: string; // Specific street address

  // Simple contact fields
  phone?: string;
  secondaryPhone?: string;
  email?: string;

  status: PatientStatusDto;
  lastVisitedAt?: string; // ISO string
  organizationId: string;
  createdBy: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string

  // Related entities (if loaded)
  primaryLanguage?: {
    id: string;
    name: string;
    code?: string;
    nativeName?: string;
  };
  secondaryLanguage?: {
    id: string;
    name: string;
    code?: string;
    nativeName?: string;
  };
  country?: {
    id: string;
    name: string;
    code?: string;
    type: string;
  };
  region?: {
    id: string;
    name: string;
    code?: string;
    type: string;
  };
  city?: {
    id: string;
    name: string;
    code?: string;
    type: string;
  };
  district?: {
    id: string;
    name: string;
    code?: string;
    type: string;
  };

  doctors: PatientDoctorDto[];
}

// Create Patient Request DTO (matches CreatePatientDto from backend)
export interface CreatePatientRequestDto {
  patientId?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string; // ISO string
  gender: GenderDto;

  // Passport information
  passportSeries?: string;
  passportNumber?: string;
  passportIssuedBy?: string;
  passportIssueDate?: string; // ISO string
  passportExpiryDate?: string; // ISO string

  // Language IDs (new fields)
  primaryLanguageId?: string;
  secondaryLanguageId?: string;

  // Address IDs (new fields)
  countryId?: string;
  regionId?: string;
  cityId?: string;
  districtId?: string;
  address?: string; // Specific street address

  // Simple contact fields
  phone?: string;
  secondaryPhone?: string;
  email?: string;

  status?: PatientStatusDto;

  // Related data
  doctorIds?: string[];
}

// Update Patient Request DTO (matches UpdatePatientDto from backend)
export interface UpdatePatientRequestDto
  extends Partial<CreatePatientRequestDto> {
  id: string; // This is added by frontend for the API path, not part of body
  excludePatientId?: string; // For uniqueness validation
}

// Update Patient Status Request DTO (matches UpdatePatientStatusDto from backend)
export interface UpdatePatientStatusRequestDto {
  status: PatientStatusDto;
  organizationId?: string;
}

// Find All Patient Query DTO (matches FindAllPatientDto from backend)
export interface PatientsQueryParamsDto extends QueryParamsDto {
  // Patient specific filters
  status?: PatientStatusDto;
  gender?: GenderDto;
  organizationId?: string;
  doctorId?: string;
}

// Patient By ID Query DTO
export interface PatientByIdQueryDto {
  organizationId?: string;
}

// API Response DTOs using PaginatedResponseDto
export type PatientsListResponseDto = PaginatedResponseDto<PatientResponseDto>;

// Patient Stats DTO
export interface PatientStatsDto {
  total: number;
  byStatus: {
    active: number;
    inactive: number;
    deceased: number;
  };
}

// =============================================
// Patient History DTOs
// =============================================

export type VisitStatusDto =
  | "WAITING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED";

export interface HistoryDoctorDto {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  specialty?: string;
}

export interface HistoryPrescriptionDto {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  notes?: string;
  createdAt: string;
}

export interface HistoryServiceOrderDto {
  id: string;
  serviceName: string;
  serviceType: string;
  status: string;
  resultText?: string;
  createdAt: string;
}

export interface HistoryVisitDto {
  id: string;
  visitDate: string;
  status: VisitStatusDto;
  complaint?: string;
  anamnesis?: string;
  diagnosis?: string;
  conclusion?: string;
  notes?: string;
  aiSummary?: string;
  doctor: HistoryDoctorDto;
  prescriptions: HistoryPrescriptionDto[];
  serviceOrders: HistoryServiceOrderDto[];
}

export interface PatientAllergyHistoryDto {
  id: string;
  substance: string;
  reaction?: string;
  severity?: string;
  note?: string;
  createdAt: string;
}

export interface PatientParameterHistoryDto {
  id: string;
  parameterCode: string;
  valueNumeric?: number;
  valueText?: string;
  unit?: string;
  measuredAt: string;
}

export interface PatientDiagnosisHistoryDto {
  diagnosis: string;
  visitDate: string;
  doctorName: string;
  visitId: string;
}

export interface ActiveMedicationDto {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  prescribedAt: string;
  doctorName: string;
}

export interface PatientHistoryStatsDto {
  totalVisits: number;
  completedVisits: number;
  totalAllergies: number;
  totalDiagnoses: number;
  activeMedications: number;
  lastVisitDate?: string;
}

export interface PatientHistoryResponseDto {
  visits: HistoryVisitDto[];
  allergies: PatientAllergyHistoryDto[];
  parameters: PatientParameterHistoryDto[];
  diagnoses: PatientDiagnosisHistoryDto[];
  activeMedications: ActiveMedicationDto[];
  stats: PatientHistoryStatsDto;
}
