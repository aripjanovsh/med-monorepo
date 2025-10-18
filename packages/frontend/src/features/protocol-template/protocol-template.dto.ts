import type { PaginatedResponseDto, QueryParamsDto } from "@/types/api.types";

export interface ProtocolTemplateResponseDto {
  id: string;
  name: string;
  description: string;
  content: string;
  isActive: boolean;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export interface CreateProtocolTemplateRequestDto {
  name: string;
  description: string;
  content: string;
}

export interface UpdateProtocolTemplateRequestDto {
  name?: string;
  description?: string;
  content?: string;
  isActive?: boolean;
}

export interface ProtocolTemplateQueryDto extends QueryParamsDto {
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type ProtocolTemplatesListResponseDto = PaginatedResponseDto<ProtocolTemplateResponseDto>;

export interface CustomElement {
  type: "text" | "select" | "radio" | "checkbox" | "textarea";
  id: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{
    value: string;
    label: string;
  }>;
  defaultValue?: string | boolean | string[];
}
