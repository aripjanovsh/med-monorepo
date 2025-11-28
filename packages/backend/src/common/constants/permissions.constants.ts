/**
 * Simplified Permission Constants for MVP
 * These constants define all available permissions in the system.
 * Used for permission seeding, validation, and frontend permission checks.
 */

// Permission definition interface
export type PermissionDefinition = {
  name: string;
  description: string;
};

/**
 * Simplified permissions for MVP
 * All permissions are "manage" level - full CRUD access to the resource
 */
export const PERMISSIONS = {
  // Company settings - organization configuration
  MANAGE_COMPANY_SETTINGS: "manage_company_settings",

  // Roles and permissions management
  MANAGE_ROLES_AND_PERMISSIONS: "manage_roles_and_permissions",

  // Master data - departments, titles, services, service types, locations, languages
  MANAGE_MASTER_DATA: "manage_master_data",

  // Employees management
  MANAGE_EMPLOYEES: "manage_employees",

  // Patients management
  MANAGE_PATIENTS: "manage_patients",

  // Appointments management - scheduling
  MANAGE_APPOINTMENTS: "manage_appointments",

  // Visits management - visits, prescriptions
  MANAGE_VISITS: "manage_visits",

  // Invoices management
  MANAGE_INVOICES: "manage_invoices",

  // Service orders management
  MANAGE_SERVICE_ORDERS: "manage_service_orders",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// All default permissions with descriptions
export const DEFAULT_PERMISSIONS: PermissionDefinition[] = [
  {
    name: PERMISSIONS.MANAGE_COMPANY_SETTINGS,
    description: "Управление настройками компании",
  },
  {
    name: PERMISSIONS.MANAGE_ROLES_AND_PERMISSIONS,
    description: "Управление ролями и правами доступа",
  },
  {
    name: PERMISSIONS.MANAGE_MASTER_DATA,
    description:
      "Управление справочниками (отделы, должности, услуги, кабинеты, языки)",
  },
  {
    name: PERMISSIONS.MANAGE_EMPLOYEES,
    description: "Управление сотрудниками",
  },
  {
    name: PERMISSIONS.MANAGE_PATIENTS,
    description: "Управление пациентами",
  },
  {
    name: PERMISSIONS.MANAGE_APPOINTMENTS,
    description: "Управление записями на приём",
  },
  {
    name: PERMISSIONS.MANAGE_VISITS,
    description: "Управление визитами (приёмы, назначения)",
  },
  {
    name: PERMISSIONS.MANAGE_INVOICES,
    description: "Управление счетами",
  },
  {
    name: PERMISSIONS.MANAGE_SERVICE_ORDERS,
    description: "Управление направлениями на услуги",
  },
];

// Helper function to get all permission names
export const getAllPermissionNames = (): string[] => {
  return Object.values(PERMISSIONS);
};

// Default role configuration type
type DefaultRoleConfig = {
  name: string;
  description: string;
  isSystem: boolean;
  permissions: PermissionName[];
};

// Default role configurations for seeding
export const DEFAULT_ROLES: Record<string, DefaultRoleConfig> = {
  ADMINISTRATOR: {
    name: "Администратор",
    description: "Полный доступ ко всем функциям системы",
    isSystem: true,
    permissions: Object.values(PERMISSIONS) as PermissionName[],
  },
  MANAGER: {
    name: "Менеджер",
    description: "Управление сотрудниками, пациентами и финансами",
    isSystem: true,
    permissions: [
      PERMISSIONS.MANAGE_EMPLOYEES,
      PERMISSIONS.MANAGE_PATIENTS,
      PERMISSIONS.MANAGE_VISITS,
      PERMISSIONS.MANAGE_INVOICES,
      PERMISSIONS.MANAGE_SERVICE_ORDERS,
    ],
  },
  DOCTOR: {
    name: "Врач",
    description: "Работа с пациентами и визитами",
    isSystem: true,
    permissions: [
      PERMISSIONS.MANAGE_PATIENTS,
      PERMISSIONS.MANAGE_VISITS,
      PERMISSIONS.MANAGE_SERVICE_ORDERS,
    ],
  },
  RECEPTIONIST: {
    name: "Регистратура",
    description: "Регистрация пациентов и запись на приём",
    isSystem: true,
    permissions: [
      PERMISSIONS.MANAGE_PATIENTS,
      PERMISSIONS.MANAGE_APPOINTMENTS,
      PERMISSIONS.MANAGE_VISITS,
    ],
  },
  ACCOUNTANT: {
    name: "Бухгалтер",
    description: "Управление счетами и финансами",
    isSystem: true,
    permissions: [PERMISSIONS.MANAGE_INVOICES],
  },
};

export type DefaultRoleName = keyof typeof DEFAULT_ROLES;
