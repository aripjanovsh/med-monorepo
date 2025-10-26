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

// Department types
export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  headId?: string;
  head?: {
    id: string;
    employeeId?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  isActive: boolean;
  order?: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentRequest {
  name: string;
  code?: string;
  description?: string;
  headId?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateDepartmentRequest extends Partial<CreateDepartmentRequest> {
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
// Service types
// ==========================

export enum ServiceTypeEnumFrontend {
  CONSULTATION = "CONSULTATION",
  LAB = "LAB",
  DIAGNOSTIC = "DIAGNOSTIC",
  PROCEDURE = "PROCEDURE",
  OTHER = "OTHER",
}

export interface Service {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: ServiceTypeEnumFrontend;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
    code?: string;
  };
  price?: number;
  durationMin?: number;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  code: string;
  name: string;
  type: ServiceTypeEnumFrontend;
  description?: string;
  departmentId?: string;
  price?: number;
  durationMin?: number;
  isActive?: boolean;
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {
  id?: string;
}

export interface ServiceQueryParams extends MasterDataQueryParams {
  type?: ServiceTypeEnumFrontend;
  departmentId?: string;
}

// ==========================
// Common query parameters
// ==========================
export interface MasterDataQueryParams extends QueryParamsDto {
  organizationId?: string;
  isActive?: boolean;
}
