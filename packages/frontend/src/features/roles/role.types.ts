import { PaginatedResponseDto, QueryParamsDto } from "@/types/api.types";

export type RolePermission = {
  id: string;
  roleId: string;
  permission: string;
};

export type Role = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  organizationId: string;
  permissions?: RolePermission[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    userAssignments: number;
  };
};

export type CreateRoleDto = {
  name: string;
  description?: string;
  isActive?: boolean;
  permissions?: string[];
};

export type UpdateRoleDto = {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissions?: string[];
};

export type AssignRoleDto = {
  userId: string;
  roleId: string;
  assignedBy?: string;
  expiresAt?: string;
};

export type AvailablePermission = {
  name: string;
  description: string;
};

export type DefaultRoleConfig = {
  key: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
};

export type PaginatedResponse<T> = PaginatedResponseDto<T>;

export type RoleFilters = QueryParamsDto & {
  includeInactive?: boolean;
  isSystem?: boolean;
};
