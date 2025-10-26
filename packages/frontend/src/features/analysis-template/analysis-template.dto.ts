/**
 * DTO (Data Transfer Objects) types for Analysis Template API communication
 * CamelCase format matching backend API contracts
 */

import type { PaginatedResponseDto, QueryParamsDto } from "@/types/api.types";

// Base enums matching backend
export type ParameterTypeDto = "NUMBER" | "TEXT" | "BOOLEAN";

// Reference range for a single demographic group
export interface ReferenceRangeDto {
  min?: number;
  max?: number;
}

// Reference ranges for different demographic groups
export interface ReferenceRangesDto {
  men?: ReferenceRangeDto;
  women?: ReferenceRangeDto;
  children?: ReferenceRangeDto;
}

// Analysis Parameter
export interface AnalysisParameterDto {
  id: string;
  name: string;
  unit?: string;
  type: ParameterTypeDto;
  referenceRanges?: ReferenceRangesDto;
  isRequired: boolean;
}

// Analysis Template Response DTO from API
export interface AnalysisTemplateResponseDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  parameters: AnalysisParameterDto[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// Create Analysis Template Request DTO
export interface CreateAnalysisTemplateRequestDto {
  name: string;
  code: string;
  description?: string;
  parameters: Omit<AnalysisParameterDto, "id">[];
}

// Update Analysis Template Request DTO
export interface UpdateAnalysisTemplateRequestDto
  extends Partial<CreateAnalysisTemplateRequestDto> {
  id: string;
}

// Query parameters for list endpoint
export interface AnalysisTemplatesQueryParamsDto extends QueryParamsDto {}

// Paginated list response
export type AnalysisTemplatesListResponseDto =
  PaginatedResponseDto<AnalysisTemplateResponseDto>;
