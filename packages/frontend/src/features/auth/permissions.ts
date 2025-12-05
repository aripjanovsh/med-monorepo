/**
 * Permission constants and utilities for frontend access control
 * These should be kept in sync with backend permissions.constants.ts
 */

// =============================================
// Permission Constants (mirror backend)
// =============================================

export const PERMISSIONS = {
  // Company settings
  MANAGE_COMPANY_SETTINGS: "MANAGE_COMPANY_SETTINGS",

  // User & Role management
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_ROLES: "MANAGE_ROLES",

  // Employee management
  MANAGE_EMPLOYEES: "MANAGE_EMPLOYEES",

  // Patient management
  MANAGE_PATIENTS: "MANAGE_PATIENTS",

  // Medical records
  MANAGE_MEDICAL_RECORDS: "MANAGE_MEDICAL_RECORDS",

  // Appointments
  MANAGE_APPOINTMENTS: "MANAGE_APPOINTMENTS",

  // Visits
  MANAGE_VISITS: "MANAGE_VISITS",

  // Invoices
  MANAGE_INVOICES: "MANAGE_INVOICES",

  // Payments
  MANAGE_PAYMENTS: "MANAGE_PAYMENTS",

  // Queue management
  MANAGE_QUEUE: "MANAGE_QUEUE",

  // Master data
  MANAGE_MASTER_DATA: "MANAGE_MASTER_DATA",

  // Reports & Analytics
  MANAGE_REPORTS: "MANAGE_REPORTS",

  // Templates
  MANAGE_TEMPLATES: "MANAGE_TEMPLATES",

  // Lab orders
  MANAGE_LAB_ORDERS: "MANAGE_LAB_ORDERS",

  // Diagnostic orders
  MANAGE_DIAGNOSTIC_ORDERS: "MANAGE_DIAGNOSTIC_ORDERS",

  // Prescriptions
  MANAGE_PRESCRIPTIONS: "MANAGE_PRESCRIPTIONS",

  // Access permissions for dashboards/features
  ACCESS_DOCTOR_DASHBOARD: "ACCESS_DOCTOR_DASHBOARD",
  ACCESS_RECEPTION_DASHBOARD: "ACCESS_RECEPTION_DASHBOARD",
  ACCESS_LAB_DASHBOARD: "ACCESS_LAB_DASHBOARD",
  ACCESS_ADMIN_PANEL: "ACCESS_ADMIN_PANEL",
  ACCESS_ACCOUNTING: "ACCESS_ACCOUNTING",
  ACCESS_REPORTS: "ACCESS_REPORTS",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// =============================================
// Permission Checking Utilities
// =============================================

/**
 * Check if user has a specific permission
 */
export const hasPermission = (
  userPermissions: string[] | undefined,
  permission: PermissionName
): boolean => {
  if (!userPermissions) return false;
  return userPermissions.includes(permission);
};

/**
 * Check if user has ALL of the specified permissions
 */
export const hasAllPermissions = (
  userPermissions: string[] | undefined,
  permissions: PermissionName[]
): boolean => {
  if (!userPermissions) return false;
  return permissions.every((p) => userPermissions.includes(p));
};

/**
 * Check if user has ANY of the specified permissions
 */
export const hasAnyPermission = (
  userPermissions: string[] | undefined,
  permissions: PermissionName[]
): boolean => {
  if (!userPermissions) return false;
  return permissions.some((p) => userPermissions.includes(p));
};

/**
 * Check if user has a specific role
 */
export const hasRole = (
  userRoles: string[] | undefined,
  role: string
): boolean => {
  if (!userRoles) return false;
  return userRoles.includes(role);
};

/**
 * Check if user has ANY of the specified roles
 */
export const hasAnyRole = (
  userRoles: string[] | undefined,
  roles: string[]
): boolean => {
  if (!userRoles) return false;
  return roles.some((r) => userRoles.includes(r));
};

// =============================================
// Access Control Helpers
// =============================================

/**
 * Check if user can access doctor dashboard
 */
export const canAccessDoctorDashboard = (
  userPermissions: string[] | undefined
): boolean => {
  return hasPermission(userPermissions, PERMISSIONS.ACCESS_DOCTOR_DASHBOARD);
};

/**
 * Check if user can access reception dashboard
 */
export const canAccessReceptionDashboard = (
  userPermissions: string[] | undefined
): boolean => {
  return hasPermission(userPermissions, PERMISSIONS.ACCESS_RECEPTION_DASHBOARD);
};

/**
 * Check if user can access lab dashboard
 */
export const canAccessLabDashboard = (
  userPermissions: string[] | undefined
): boolean => {
  return hasPermission(userPermissions, PERMISSIONS.ACCESS_LAB_DASHBOARD);
};

/**
 * Check if user can access admin panel
 */
export const canAccessAdminPanel = (
  userPermissions: string[] | undefined
): boolean => {
  return hasPermission(userPermissions, PERMISSIONS.ACCESS_ADMIN_PANEL);
};

/**
 * Check if user can access accounting features
 */
export const canAccessAccounting = (
  userPermissions: string[] | undefined
): boolean => {
  return hasPermission(userPermissions, PERMISSIONS.ACCESS_ACCOUNTING);
};

/**
 * Check if user can access reports
 */
export const canAccessReports = (
  userPermissions: string[] | undefined
): boolean => {
  return hasPermission(userPermissions, PERMISSIONS.ACCESS_REPORTS);
};

// =============================================
// Resource Management Helpers
// =============================================

/**
 * Check if user can manage patients
 */
export const canManagePatients = (
  userPermissions: string[] | undefined
): boolean => {
  return hasPermission(userPermissions, PERMISSIONS.MANAGE_PATIENTS);
};

/**
 * Check if user can manage employees
 */
export const canManageEmployees = (
  userPermissions: string[] | undefined
): boolean => {
  return hasPermission(userPermissions, PERMISSIONS.MANAGE_EMPLOYEES);
};

/**
 * Check if user can manage appointments
 */
export const canManageAppointments = (
  userPermissions: string[] | undefined
): boolean => {
  return hasPermission(userPermissions, PERMISSIONS.MANAGE_APPOINTMENTS);
};

/**
 * Check if user can manage visits
 */
export const canManageVisits = (
  userPermissions: string[] | undefined
): boolean => {
  return hasPermission(userPermissions, PERMISSIONS.MANAGE_VISITS);
};

/**
 * Check if user can manage medical records
 */
export const canManageMedicalRecords = (
  userPermissions: string[] | undefined
): boolean => {
  return hasPermission(userPermissions, PERMISSIONS.MANAGE_MEDICAL_RECORDS);
};

/**
 * Check if user can manage invoices
 */
export const canManageInvoices = (
  userPermissions: string[] | undefined
): boolean => {
  return hasPermission(userPermissions, PERMISSIONS.MANAGE_INVOICES);
};

/**
 * Check if user can manage roles
 */
export const canManageRoles = (
  userPermissions: string[] | undefined
): boolean => {
  return hasPermission(userPermissions, PERMISSIONS.MANAGE_ROLES);
};
