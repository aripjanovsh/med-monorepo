import type { PaginatedResponseDto, QueryParamsDto } from "@/types/api.types";

export interface PrescriptionResponseDto {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  notes?: string;
  visit: {
    id: string;
    visitDate: string;
    status: string;
  };
  createdBy: {
    id: string;
    employeeId?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface CreatePrescriptionRequestDto {
  visitId: string;
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  notes?: string;
  createdById: string;
}

export interface UpdatePrescriptionRequestDto
  extends Partial<CreatePrescriptionRequestDto> {
  id: string;
}

export interface PrescriptionsQueryParamsDto extends QueryParamsDto {
  visitId?: string;
  patientId?: string;
  employeeId?: string;
}

export type PrescriptionsListResponseDto =
  PaginatedResponseDto<PrescriptionResponseDto>;
