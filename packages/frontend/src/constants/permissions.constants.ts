/**
 * Simplified Permission Constants for MVP
 * Keep in sync with backend: packages/backend/src/common/constants/permissions.constants.ts
 */

export const PERMISSIONS = {
  MANAGE_COMPANY_SETTINGS: "manage_company_settings",
  MANAGE_ROLES_AND_PERMISSIONS: "manage_roles_and_permissions",
  MANAGE_MASTER_DATA: "manage_master_data",
  MANAGE_EMPLOYEES: "manage_employees",
  MANAGE_PATIENTS: "manage_patients",
  MANAGE_APPOINTMENTS: "manage_appointments",
  MANAGE_VISITS: "manage_visits",
  MANAGE_INVOICES: "manage_invoices",
  MANAGE_SERVICE_ORDERS: "manage_service_orders",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Permission labels for UI
export const PERMISSION_LABELS: Record<PermissionName, string> = {
  [PERMISSIONS.MANAGE_COMPANY_SETTINGS]: "Настройки компании",
  [PERMISSIONS.MANAGE_ROLES_AND_PERMISSIONS]: "Роли и права доступа",
  [PERMISSIONS.MANAGE_MASTER_DATA]: "Справочники",
  [PERMISSIONS.MANAGE_EMPLOYEES]: "Сотрудники",
  [PERMISSIONS.MANAGE_PATIENTS]: "Пациенты",
  [PERMISSIONS.MANAGE_APPOINTMENTS]: "Записи на приём",
  [PERMISSIONS.MANAGE_VISITS]: "Визиты",
  [PERMISSIONS.MANAGE_INVOICES]: "Счета",
  [PERMISSIONS.MANAGE_SERVICE_ORDERS]: "Направления",
};

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS: Record<PermissionName, string> = {
  [PERMISSIONS.MANAGE_COMPANY_SETTINGS]: "Управление настройками организации",
  [PERMISSIONS.MANAGE_ROLES_AND_PERMISSIONS]: "Управление ролями и правами доступа пользователей",
  [PERMISSIONS.MANAGE_MASTER_DATA]: "Управление справочниками (отделы, должности, услуги, кабинеты)",
  [PERMISSIONS.MANAGE_EMPLOYEES]: "Управление данными сотрудников",
  [PERMISSIONS.MANAGE_PATIENTS]: "Управление данными пациентов",
  [PERMISSIONS.MANAGE_APPOINTMENTS]: "Управление записями на приём",
  [PERMISSIONS.MANAGE_VISITS]: "Управление визитами и назначениями",
  [PERMISSIONS.MANAGE_INVOICES]: "Управление счетами и платежами",
  [PERMISSIONS.MANAGE_SERVICE_ORDERS]: "Управление направлениями на услуги",
};

// Helper functions
export const hasPermission = (
  userPermissions: string[],
  requiredPermission: PermissionName,
): boolean => {
  return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (
  userPermissions: string[],
  requiredPermissions: PermissionName[],
): boolean => {
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission),
  );
};

export const hasAllPermissions = (
  userPermissions: string[],
  requiredPermissions: PermissionName[],
): boolean => {
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission),
  );
};

export const getAllPermissions = (): PermissionName[] => {
  return Object.values(PERMISSIONS);
};
