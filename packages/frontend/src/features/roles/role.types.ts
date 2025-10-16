import { PaginatedResponseDto, QueryParamsDto } from "@/types/api.types";

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: "CREATE" | "READ" | "UPDATE" | "DELETE" | "MANAGE";
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  permission: Permission;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  organizationId: string;
  permissions?: RolePermission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  isActive?: boolean;
  organizationId: string;
  permissionIds?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: string[];
}

export interface AssignRoleDto {
  userId: string;
  roleId: string;
  assignedBy?: string;
  expiresAt?: string;
}

export interface CreatePermissionDto {
  name: string;
  resource: string;
  action: "CREATE" | "READ" | "UPDATE" | "DELETE" | "MANAGE";
  description?: string;
}

export interface GroupedPermissions {
  [resource: string]: Permission[];
}

export type PaginatedResponse<T> = PaginatedResponseDto<T>;

export interface RoleFilters extends QueryParamsDto {
  includeInactive?: boolean;
  isSystem?: boolean;
}

export interface PermissionFilters extends QueryParamsDto {
  resource?: string;
  action?: "CREATE" | "READ" | "UPDATE" | "DELETE" | "MANAGE";
}
