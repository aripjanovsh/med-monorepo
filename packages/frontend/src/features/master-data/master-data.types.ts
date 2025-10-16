import { PaginatedResponseDto, QueryParamsDto } from "@/types/api.types";

// Title types
export interface Title {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
}

export interface CreateTitleRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateTitleRequest extends Partial<CreateTitleRequest> {
  id?: string;
}

// Service Type types
export interface ServiceType {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
}

export interface CreateServiceTypeRequest {
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateServiceTypeRequest extends Partial<CreateServiceTypeRequest> {
  id?: string;
}

// Language types
export interface Language {
  id: string;
  name: string;
  code?: string;
  nativeName?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLanguageRequest {
  name: string;
  code?: string;
  nativeName?: string;
  description?: string;
}

export interface UpdateLanguageRequest extends Partial<CreateLanguageRequest> {
  id?: string;
}

// Use global paginated response type
export type MasterDataPaginatedResponse<T> = PaginatedResponseDto<T>;

// ==========================
// Location types (New unified structure)
// ==========================

export type LocationType = 'COUNTRY' | 'REGION' | 'CITY' | 'DISTRICT';

// Main Location interface - unified for all location types
export interface Location {
  id: string;
  name: string;
  code?: string;
  type: LocationType;
  weight: number;
  parentId?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: Location;
  children?: Location[];
}

// Location Tree DTO - for hierarchical display
export interface LocationTreeNode {
  id: string;
  name: string;
  code?: string;
  type: LocationType;
  weight: number;
  parentId?: string;
  description?: string;
  isActive: boolean;
  children?: LocationTreeNode[];
}

// Create Location Request
export interface CreateLocationRequest {
  name: string;
  code?: string;
  type: LocationType;
  weight?: number;
  parentId?: string;
  description?: string;
}

// Update Location Request  
export interface UpdateLocationRequest {
  name?: string;
  code?: string;
  type?: LocationType;
  weight?: number;
  parentId?: string;
  description?: string;
}

// Query parameters for locations
export interface LocationQueryParams extends MasterDataQueryParams {
  type?: LocationType;
  parentId?: string;
  includeRelations?: boolean;
}

// ==========================
// Common query parameters
// ==========================
export interface MasterDataQueryParams extends QueryParamsDto {
  organizationId?: string;
  isActive?: boolean;
}
