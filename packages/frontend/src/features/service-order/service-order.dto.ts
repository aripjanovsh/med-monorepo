import type { PaginatedResponseDto, QueryParamsDto } from "@/types/api.types";

// Enums
export type OrderStatus = "ORDERED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "PARTIALLY_PAID" | "REFUNDED";

// Nested DTOs
export interface SimplePatientDto {
  id: string;
  patientId?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth?: string; // ISO date
  gender?: "MALE" | "FEMALE";
}

export interface SimpleDoctorDto {
  id: string;
  employeeId?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  avatarId?: string;
}

export interface SimpleServiceDto {
  id: string;
  name: string;
  code?: string;
  price: number;
  type?: string;
}

export interface SimpleDepartmentDto {
  id: string;
  name: string;
  code?: string;
}

export interface SimpleProtocolTemplateDto {
  id: string;
  name: string;
}

export interface SimplePerformedByDto {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}

// Main DTOs
export interface ServiceOrderResponseDto {
  id: string;
  patientId: string;
  patient: SimplePatientDto;
  visitId?: string;
  doctorId: string;
  doctor: SimpleDoctorDto;
  serviceId: string;
  service: SimpleServiceDto;
  departmentId?: string;
  department?: SimpleDepartmentDto;
  protocolTemplateId?: string;
  protocolTemplate?: SimpleProtocolTemplateDto;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  resultText?: string;
  resultData?: Record<string, unknown>;
  resultFileUrl?: string;
  resultAt?: string; // ISO
  performedById?: string;
  performedBy?: SimplePerformedByDto;
  startedAt?: string; // ISO
  finishedAt?: string; // ISO
  organizationId: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface ServiceOrderItemDto {
  serviceId: string;
}

export interface CreateServiceOrderRequestDto {
  visitId: string;
  patientId: string;
  doctorId: string;
  services: ServiceOrderItemDto[];
  protocolTemplateId?: string;
}

export interface UpdateServiceOrderRequestDto {
  id: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  resultText?: string;
  resultData?: Record<string, unknown>;
  resultFileUrl?: string;
  performedById?: string;
}

export interface ServiceOrderQueryParamsDto extends QueryParamsDto {
  patientId?: string;
  visitId?: string;
  doctorId?: string;
  serviceId?: string;
  departmentId?: string;
  status?: string;
  paymentStatus?: string;
  serviceType?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export type ServiceOrdersListResponseDto =
  PaginatedResponseDto<ServiceOrderResponseDto>;
