import type { PaginatedResponseDto, QueryParamsDto } from "@/types/api.types";

// Enums
export type VisitStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELED";

// Nested DTOs (simplified)
export interface SimplePatientDto {
  id: string;
  patientId?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string; // ISO
  gender: string;
}

export interface SimpleEmployeeDto {
  id: string;
  employeeId?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface SimpleAppointmentDto {
  id: string;
  scheduledAt: string; // ISO
  status: string;
  type: string;
}

export interface SimpleProtocolTemplateDto {
  id: string;
  name: string;
  description: string;
}

export interface SimplePrescriptionDto {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  createdAt: string; // ISO
}

export interface SimpleLabOrderDto {
  id: string;
  testName: string;
  status: string;
  createdAt: string; // ISO
}

export interface SimpleMedicalRecordDto {
  id: string;
  type: string;
  content: unknown;
  createdAt: string; // ISO
}

export interface SimpleOrganizationDto {
  id: string;
  name: string;
  slug: string;
}

// Main DTOs
export interface VisitResponseDto {
  id: string;
  visitDate: string; // ISO
  status: VisitStatus;
  notes?: string;
  patient: SimplePatientDto;
  employee: SimpleEmployeeDto;
  appointment?: SimpleAppointmentDto;
  protocol?: SimpleProtocolTemplateDto;
  protocolData?: string; // JSON string of FilledFormData
  medicalRecords: SimpleMedicalRecordDto[];
  prescriptions: SimplePrescriptionDto[];
  labOrders: SimpleLabOrderDto[];
  organization: SimpleOrganizationDto;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface CreateVisitRequestDto {
  appointmentId?: string;
  patientId: string;
  employeeId: string;
  visitDate?: string; // ISO, default now()
  protocolId?: string;
  notes?: string;
}

export interface UpdateVisitRequestDto extends Partial<CreateVisitRequestDto> {
  id: string;
  protocolData?: string; // JSON string of FilledFormData
}

export interface UpdateVisitStatusRequestDto {
  status: VisitStatus;
}

export interface VisitsQueryParamsDto extends QueryParamsDto {
  status?: VisitStatus;
  patientId?: string;
  employeeId?: string;
  dateFrom?: string; // ISO
  dateTo?: string; // ISO
}

export type VisitsListResponseDto = PaginatedResponseDto<VisitResponseDto>;
