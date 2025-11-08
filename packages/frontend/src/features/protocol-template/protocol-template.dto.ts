import type { PaginatedResponseDto, QueryParamsDto } from "@/types/api.types";

export type TemplateType = "formbuilder";

export interface ProtocolTemplateResponseDto {
  id: string;
  name: string;
  description: string;
  content: string;
  templateType: TemplateType;
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
  templateType: TemplateType;
}

export interface UpdateProtocolTemplateRequestDto {
  name?: string;
  description?: string;
  content?: string;
  templateType?: TemplateType;
  isActive?: boolean;
}

export interface ProtocolTemplateQueryDto extends QueryParamsDto {
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type ProtocolTemplatesListResponseDto = PaginatedResponseDto<ProtocolTemplateResponseDto>;

