import type { PaginatedResponseDto, QueryParamsDto } from "@/types/api.types";
import type { AppointmentStatus } from "./appointment.constants";

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
  title?: {
    id: string;
    name: string;
  };
}

export interface SimpleServiceDto {
  id: string;
  code: string;
  name: string;
  type: string;
  price?: number;
}

export interface SimpleUserDto {
  id: string;
  phone: string;
  role: string;
}

export interface SimpleOrganizationDto {
  id: string;
  name: string;
  slug: string;
}

export interface SimpleAppointmentTypeDto {
  id: string;
  name: string;
  code?: string;
  color?: string;
  durationMin?: number;
}

// Main DTOs
export interface AppointmentResponseDto {
  id: string;
  scheduledAt: string; // ISO
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  reason?: string;
  roomNumber?: string;
  confirmedAt?: string; // ISO
  canceledAt?: string; // ISO
  cancelReason?: string;
  checkInAt?: string; // ISO
  checkOutAt?: string; // ISO
  patient: SimplePatientDto;
  employee: SimpleEmployeeDto;
  service?: SimpleServiceDto;
  createdBy: SimpleUserDto;
  confirmedBy?: SimpleUserDto;
  canceledBy?: SimpleUserDto;
  organization: SimpleOrganizationDto;
  appointmentTypeId?: string;
  appointmentType?: SimpleAppointmentTypeDto;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface CreateAppointmentRequestDto {
  scheduledAt: string; // ISO
  duration: number;
  notes?: string;
  reason?: string;
  roomNumber?: string;
  patientId: string;
  employeeId: string;
  serviceId?: string;
  createdById: string;
  appointmentTypeId?: string;
}

export interface UpdateAppointmentRequestDto
  extends Partial<CreateAppointmentRequestDto> {
  id: string;
}

export interface UpdateAppointmentStatusRequestDto {
  status: AppointmentStatus;
  userId?: string;
  cancelReason?: string;
}

export interface AppointmentsQueryParamsDto extends QueryParamsDto {
  patientId?: string;
  employeeId?: string;
  serviceId?: string;
  status?: AppointmentStatus;
  appointmentTypeId?: string;
  scheduledFrom?: string; // ISO
  scheduledTo?: string; // ISO
}

export type AppointmentsListResponseDto =
  PaginatedResponseDto<AppointmentResponseDto>;
