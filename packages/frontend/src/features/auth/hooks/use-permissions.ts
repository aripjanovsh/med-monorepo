/**
 * React hooks for permission checking
 * Use these hooks in components to check user permissions
 */

import { useMemo } from "react";
import { useGetMeQuery } from "@/features/auth/auth.api";
import {
  type PermissionName,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  hasRole,
  hasAnyRole,
  canAccessDoctorDashboard,
  canAccessReceptionDashboard,
  canAccessLabDashboard,
  canAccessAdminPanel,
  canAccessAccounting,
  canAccessReports,
  canManagePatients,
  canManageEmployees,
  canManageAppointments,
  canManageVisits,
  canManageMedicalRecords,
  canManageInvoices,
  canManageRoles,
} from "../permissions";

/**
 * Hook to get current user's permissions and roles
 */
export const useCurrentUserPermissions = () => {
  const { data: user, isLoading } = useGetMeQuery();

  return useMemo(
    () => ({
      permissions: user?.permissions ?? [],
      roles: user?.roles ?? [],
      isLoading,
      user,
    }),
    [user, isLoading]
  );
};

/**
 * Hook to check if current user has a specific permission
 */
export const useHasPermission = (permission: PermissionName): boolean => {
  const { permissions } = useCurrentUserPermissions();
  return useMemo(
    () => hasPermission(permissions, permission),
    [permissions, permission]
  );
};

/**
 * Hook to check if current user has ALL specified permissions
 */
export const useHasAllPermissions = (
  requiredPermissions: PermissionName[]
): boolean => {
  const { permissions } = useCurrentUserPermissions();
  return useMemo(
    () => hasAllPermissions(permissions, requiredPermissions),
    [permissions, requiredPermissions]
  );
};

/**
 * Hook to check if current user has ANY of the specified permissions
 */
export const useHasAnyPermission = (
  requiredPermissions: PermissionName[]
): boolean => {
  const { permissions } = useCurrentUserPermissions();
  return useMemo(
    () => hasAnyPermission(permissions, requiredPermissions),
    [permissions, requiredPermissions]
  );
};

/**
 * Hook to check if current user has a specific role
 */
export const useHasRole = (role: string): boolean => {
  const { roles } = useCurrentUserPermissions();
  return useMemo(() => hasRole(roles, role), [roles, role]);
};

/**
 * Hook to check if current user has ANY of the specified roles
 */
export const useHasAnyRole = (requiredRoles: string[]): boolean => {
  const { roles } = useCurrentUserPermissions();
  return useMemo(
    () => hasAnyRole(roles, requiredRoles),
    [roles, requiredRoles]
  );
};

// =============================================
// Dashboard Access Hooks
// =============================================

/**
 * Hook to check if user can access doctor dashboard
 */
export const useCanAccessDoctorDashboard = (): boolean => {
  const { permissions } = useCurrentUserPermissions();
  return useMemo(() => canAccessDoctorDashboard(permissions), [permissions]);
};

/**
 * Hook to check if user can access reception dashboard
 */
export const useCanAccessReceptionDashboard = (): boolean => {
  const { permissions } = useCurrentUserPermissions();
  return useMemo(() => canAccessReceptionDashboard(permissions), [permissions]);
};

/**
 * Hook to check if user can access lab dashboard
 */
export const useCanAccessLabDashboard = (): boolean => {
  const { permissions } = useCurrentUserPermissions();
  return useMemo(() => canAccessLabDashboard(permissions), [permissions]);
};

/**
 * Hook to check if user can access admin panel
 */
export const useCanAccessAdminPanel = (): boolean => {
  const { permissions } = useCurrentUserPermissions();
  return useMemo(() => canAccessAdminPanel(permissions), [permissions]);
};

/**
 * Hook to check if user can access accounting
 */
export const useCanAccessAccounting = (): boolean => {
  const { permissions } = useCurrentUserPermissions();
  return useMemo(() => canAccessAccounting(permissions), [permissions]);
};

/**
 * Hook to check if user can access reports
 */
export const useCanAccessReports = (): boolean => {
  const { permissions } = useCurrentUserPermissions();
  return useMemo(() => canAccessReports(permissions), [permissions]);
};

// =============================================
// Resource Management Hooks
// =============================================

/**
 * Hook to check if user can manage patients
 */
export const useCanManagePatients = (): boolean => {
  const { permissions } = useCurrentUserPermissions();
  return useMemo(() => canManagePatients(permissions), [permissions]);
};

/**
 * Hook to check if user can manage employees
 */
export const useCanManageEmployees = (): boolean => {
  const { permissions } = useCurrentUserPermissions();
  return useMemo(() => canManageEmployees(permissions), [permissions]);
};

/**
 * Hook to check if user can manage appointments
 */
export const useCanManageAppointments = (): boolean => {
  const { permissions } = useCurrentUserPermissions();
  return useMemo(() => canManageAppointments(permissions), [permissions]);
};

/**
 * Hook to check if user can manage visits
 */
export const useCanManageVisits = (): boolean => {
  const { permissions } = useCurrentUserPermissions();
  return useMemo(() => canManageVisits(permissions), [permissions]);
};

/**
 * Hook to check if user can manage medical records
 */
export const useCanManageMedicalRecords = (): boolean => {
  const { permissions } = useCurrentUserPermissions();
  return useMemo(() => canManageMedicalRecords(permissions), [permissions]);
};

/**
 * Hook to check if user can manage invoices
 */
export const useCanManageInvoices = (): boolean => {
  const { permissions } = useCurrentUserPermissions();
  return useMemo(() => canManageInvoices(permissions), [permissions]);
};

/**
 * Hook to check if user can manage roles
 */
export const useCanManageRoles = (): boolean => {
  const { permissions } = useCurrentUserPermissions();
  return useMemo(() => canManageRoles(permissions), [permissions]);
};
