import type { PaginatedResponseDto, QueryParamsDto } from "@/types/api.types";

export type LabStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface LabOrderResponseDto {
  id: string;
  testName: string;
  status: LabStatus;
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

export interface CreateLabOrderRequestDto {
  visitId: string;
  testName: string;
  notes?: string;
  createdById: string;
}

export interface UpdateLabOrderRequestDto
  extends Partial<CreateLabOrderRequestDto> {
  id: string;
}

export interface UpdateLabOrderStatusRequestDto {
  status: LabStatus;
}

export interface LabOrdersQueryParamsDto extends QueryParamsDto {
  status?: LabStatus;
  visitId?: string;
  patientId?: string;
  employeeId?: string;
}

export type LabOrdersListResponseDto = PaginatedResponseDto<LabOrderResponseDto>;
