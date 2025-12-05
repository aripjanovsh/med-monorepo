/**
 * Permission Constants
 * These constants define all available permissions in the system.
 * Used for permission seeding, validation, and frontend permission checks.
 *
 * Two types of permissions:
 * 1. MANAGE_* - CRUD access to resources
 * 2. ACCESS_* - Access to specific features/dashboards
 */

// Permission definition interface
export type PermissionDefinition = {
  name: string;
  description: string;
  category: "manage" | "access";
};

/**
 * All permissions in the system
 */
export const PERMISSIONS = {
  // ==========================================
  // MANAGE PERMISSIONS - CRUD access to resources
  // ==========================================

  // Company settings - organization configuration
  MANAGE_COMPANY_SETTINGS: "manage_company_settings",

  // Roles and permissions management
  MANAGE_ROLES_AND_PERMISSIONS: "manage_roles_and_permissions",

  // Master data - departments, titles, services, locations, languages
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

  // Reports management
  MANAGE_REPORTS: "manage_reports",

  // ==========================================
  // ACCESS PERMISSIONS - Feature/Dashboard access
  // ==========================================

  // Access to doctor dashboard (queue, current patient, etc.)
  ACCESS_DOCTOR_DASHBOARD: "access_doctor_dashboard",

  // Access to reception dashboard (patient registration, queue management)
  ACCESS_RECEPTION_DASHBOARD: "access_reception_dashboard",

  // Access to laboratory dashboard
  ACCESS_LAB_DASHBOARD: "access_lab_dashboard",

  // Access to department queue management
  ACCESS_DEPARTMENT_QUEUE: "access_department_queue",

  // Access to finance module (invoices, payments, reports)
  ACCESS_FINANCE_MODULE: "access_finance_module",

  // Access to reports module
  ACCESS_REPORTS: "access_reports",

  // Access to settings/admin panel
  ACCESS_SETTINGS: "access_settings",

  // Access to stocks/inventory module
  ACCESS_STOCKS: "access_stocks",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// All default permissions with descriptions
export const DEFAULT_PERMISSIONS: PermissionDefinition[] = [
  // Manage permissions
  {
    name: PERMISSIONS.MANAGE_COMPANY_SETTINGS,
    description: "Управление настройками компании",
    category: "manage",
  },
  {
    name: PERMISSIONS.MANAGE_ROLES_AND_PERMISSIONS,
    description: "Управление ролями и правами доступа",
    category: "manage",
  },
  {
    name: PERMISSIONS.MANAGE_MASTER_DATA,
    description: "Управление справочниками (отделы, должности, услуги, языки)",
    category: "manage",
  },
  {
    name: PERMISSIONS.MANAGE_EMPLOYEES,
    description: "Управление сотрудниками",
    category: "manage",
  },
  {
    name: PERMISSIONS.MANAGE_PATIENTS,
    description: "Управление пациентами",
    category: "manage",
  },
  {
    name: PERMISSIONS.MANAGE_APPOINTMENTS,
    description: "Управление записями на приём",
    category: "manage",
  },
  {
    name: PERMISSIONS.MANAGE_VISITS,
    description: "Управление визитами (приёмы, назначения)",
    category: "manage",
  },
  {
    name: PERMISSIONS.MANAGE_INVOICES,
    description: "Управление счетами",
    category: "manage",
  },
  {
    name: PERMISSIONS.MANAGE_SERVICE_ORDERS,
    description: "Управление направлениями на услуги",
    category: "manage",
  },
  {
    name: PERMISSIONS.MANAGE_REPORTS,
    description: "Управление отчётами",
    category: "manage",
  },

  // Access permissions
  {
    name: PERMISSIONS.ACCESS_DOCTOR_DASHBOARD,
    description: "Доступ к панели врача",
    category: "access",
  },
  {
    name: PERMISSIONS.ACCESS_RECEPTION_DASHBOARD,
    description: "Доступ к панели регистратуры",
    category: "access",
  },
  {
    name: PERMISSIONS.ACCESS_LAB_DASHBOARD,
    description: "Доступ к панели лаборатории",
    category: "access",
  },
  {
    name: PERMISSIONS.ACCESS_DEPARTMENT_QUEUE,
    description: "Доступ к очереди отделений",
    category: "access",
  },
  {
    name: PERMISSIONS.ACCESS_FINANCE_MODULE,
    description: "Доступ к финансовому модулю",
    category: "access",
  },
  {
    name: PERMISSIONS.ACCESS_REPORTS,
    description: "Доступ к отчётам",
    category: "access",
  },
  {
    name: PERMISSIONS.ACCESS_SETTINGS,
    description: "Доступ к настройкам системы",
    category: "access",
  },
  {
    name: PERMISSIONS.ACCESS_STOCKS,
    description: "Доступ к складам и материальным активам",
    category: "access",
  },
];

// Helper function to get all permission names
export const getAllPermissionNames = (): string[] => {
  return Object.values(PERMISSIONS);
};

// Helper function to get permissions by category
export const getPermissionsByCategory = (
  category: "manage" | "access"
): PermissionDefinition[] => {
  return DEFAULT_PERMISSIONS.filter((p) => p.category === category);
};

// Default role configuration type
export type DefaultRoleConfig = {
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
    description:
      "Управление сотрудниками, пациентами и операционной деятельностью",
    isSystem: true,
    permissions: [
      // Manage permissions
      PERMISSIONS.MANAGE_EMPLOYEES,
      PERMISSIONS.MANAGE_PATIENTS,
      PERMISSIONS.MANAGE_VISITS,
      PERMISSIONS.MANAGE_INVOICES,
      PERMISSIONS.MANAGE_SERVICE_ORDERS,
      PERMISSIONS.MANAGE_REPORTS,
      // Access permissions
      PERMISSIONS.ACCESS_RECEPTION_DASHBOARD,
      PERMISSIONS.ACCESS_DEPARTMENT_QUEUE,
      PERMISSIONS.ACCESS_FINANCE_MODULE,
      PERMISSIONS.ACCESS_REPORTS,
    ],
  },
  DOCTOR: {
    name: "Врач",
    description: "Работа с пациентами, визитами и назначениями",
    isSystem: true,
    permissions: [
      // Manage permissions
      PERMISSIONS.MANAGE_PATIENTS,
      PERMISSIONS.MANAGE_VISITS,
      PERMISSIONS.MANAGE_SERVICE_ORDERS,
      // Access permissions
      PERMISSIONS.ACCESS_DOCTOR_DASHBOARD,
      PERMISSIONS.ACCESS_DEPARTMENT_QUEUE,
    ],
  },
  RECEPTIONIST: {
    name: "Регистратура",
    description: "Регистрация пациентов, запись на приём, управление очередью",
    isSystem: true,
    permissions: [
      // Manage permissions
      PERMISSIONS.MANAGE_PATIENTS,
      PERMISSIONS.MANAGE_APPOINTMENTS,
      PERMISSIONS.MANAGE_VISITS,
      PERMISSIONS.MANAGE_INVOICES,
      // Access permissions
      PERMISSIONS.ACCESS_RECEPTION_DASHBOARD,
      PERMISSIONS.ACCESS_DEPARTMENT_QUEUE,
      PERMISSIONS.ACCESS_FINANCE_MODULE,
    ],
  },
  LAB_TECHNICIAN: {
    name: "Лаборант",
    description: "Работа с лабораторными исследованиями",
    isSystem: true,
    permissions: [
      // Manage permissions
      PERMISSIONS.MANAGE_SERVICE_ORDERS,
      // Access permissions
      PERMISSIONS.ACCESS_LAB_DASHBOARD,
      PERMISSIONS.ACCESS_DEPARTMENT_QUEUE,
    ],
  },
  NURSE: {
    name: "Медсестра",
    description: "Помощь врачу, работа с пациентами",
    isSystem: true,
    permissions: [
      // Manage permissions
      PERMISSIONS.MANAGE_PATIENTS,
      PERMISSIONS.MANAGE_VISITS,
      PERMISSIONS.MANAGE_SERVICE_ORDERS,
      // Access permissions
      PERMISSIONS.ACCESS_DOCTOR_DASHBOARD,
      PERMISSIONS.ACCESS_DEPARTMENT_QUEUE,
    ],
  },
  ACCOUNTANT: {
    name: "Бухгалтер",
    description: "Управление счетами, платежами и финансовыми отчётами",
    isSystem: true,
    permissions: [
      // Manage permissions
      PERMISSIONS.MANAGE_INVOICES,
      PERMISSIONS.MANAGE_REPORTS,
      // Access permissions
      PERMISSIONS.ACCESS_FINANCE_MODULE,
      PERMISSIONS.ACCESS_REPORTS,
    ],
  },
};

export type DefaultRoleName = keyof typeof DEFAULT_ROLES;
