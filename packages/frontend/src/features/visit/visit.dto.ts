import type { PaginatedResponseDto, QueryParamsDto } from "@/types/api.types";
import type { VisitStatus } from "./visit.constants";

export enum VisitIncludeRelation {
  PATIENT = "patient",
  EMPLOYEE = "employee",
  APPOINTMENT = "appointment",
  PROTOCOL = "protocol",
  ORGANIZATION = "organization",
  PRESCRIPTIONS = "prescriptions",
  SERVICE_ORDERS = "serviceOrders",
}

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
  avatarId?: string;
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

export interface SimpleOrganizationDto {
  id: string;
  name: string;
  slug: string;
}

export interface SimpleServiceDto {
  id: string;
  name: string;
  price: number;
}

export interface SimpleServiceOrderDto {
  id: string;
  status: string;
  paymentStatus: string;
  service: SimpleServiceDto;
}

// Main DTOs
export interface VisitResponseDto {
  id: string;
  visitDate: string; // ISO
  status: VisitStatus;
  notes?: string;
  diagnosis?: string;
  queueNumber?: number;
  queuedAt?: string; // ISO - when visit was added to queue
  startedAt?: string; // ISO - when visit status changed to IN_PROGRESS
  completedAt?: string; // ISO - when visit was completed
  finishedAt?: string; // ISO - deprecated, use completedAt
  waitingTimeMinutes?: number; // Time spent waiting
  serviceTimeMinutes?: number; // Time spent in service
  patient?: SimplePatientDto;
  employee?: SimpleEmployeeDto;
  appointment?: SimpleAppointmentDto;
  protocol?: SimpleProtocolTemplateDto;
  protocolData?: string; // JSON string of FilledFormData
  prescriptions?: SimplePrescriptionDto[];
  serviceOrders?: SimpleServiceOrderDto[];
  organization?: SimpleOrganizationDto;
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

export interface StartVisitRequestDto {
  // organizationId is automatically injected from JWT on backend
}

export interface CompleteVisitRequestDto {
  notes?: string;
  // organizationId is automatically injected from JWT on backend
}

export interface VisitsQueryParamsDto extends QueryParamsDto {
  organizationId?: string;
  status?: VisitStatus;
  patientId?: string;
  employeeId?: string;
  dateFrom?: string; // ISO
  dateTo?: string; // ISO
  include?: VisitIncludeRelation[]; // Relations to include in the response
}

export type VisitsListResponseDto = PaginatedResponseDto<VisitResponseDto>;

// Active Visit DTOs
export interface ActiveVisitEmployeeDto {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  department?: {
    id: string;
    name: string;
  };
  title?: {
    id: string;
    name: string;
  };
}

export interface ActiveVisitResponseDto {
  id: string;
  status: VisitStatus;
  visitDate: string; // ISO string
  startedAt?: string; // ISO string
  queuedAt?: string; // ISO string
  notes?: string;
  employee: ActiveVisitEmployeeDto;
}
