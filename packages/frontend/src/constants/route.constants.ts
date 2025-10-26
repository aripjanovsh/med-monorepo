export const ROUTES = {
  // Public routes
  HOME: "/",

  // Auth routes
  LOGIN: "/login",
  DASHBOARD: "/cabinet",
  PATIENTS: "/cabinet/patients",
  PATIENT_DETAIL: "/cabinet/patients/[id]",
  PATIENT_CREATE: "/cabinet/patients/create",
  PATIENT_EDIT: "/cabinet/patients/[id]/edit",
  DOCTORS: "/cabinet/doctors",
  APPOINTMENTS: "/cabinet/appointments",
  PROFILE: "/cabinet/profile",
  SETTINGS: "/cabinet/settings",
  LOGOUT: "/logout",

  TREATMENTS: "/cabinet/treatments",
  EMPLOYEES: "/cabinet/employees",
  EMPLOYEE_DETAIL: "/cabinet/employees/[id]",
  EMPLOYEE_EDIT: "/cabinet/employees/[id]/edit",
  EMPLOYEE_CREATE: "/cabinet/employees/create",
  DOCTOR_DASHBOARD: "/cabinet/doctor-dashboard",
  ACCOUNTS: "/cabinet/accounts",
  SALES: "/cabinet/sales",
  PURCHASES: "/cabinet/purchases",
  PAYMENT_METHOD: "/cabinet/payment-method",
  STOCKS: "/cabinet/stocks",
  REPORT: "/cabinet/report",
  NOTIFICATIONS: "/cabinet/notifications",
  HELP: "/cabinet/help",

  // Master Data routes (Settings)
  MASTER_DATA: "/cabinet/settings/master-data",
  MASTER_DATA_TITLES: "/cabinet/settings/master-data/titles",
  MASTER_DATA_SERVICE_TYPES: "/cabinet/settings/master-data/service-types",
  MASTER_DATA_LANGUAGES: "/cabinet/settings/master-data/languages",
  MASTER_DATA_GEOLOCATION: "/cabinet/settings/master-data/geolocation",
  
  // Analysis Templates routes (Settings)
  ANALYSIS_TEMPLATES: "/cabinet/settings/analysis-templates",
  ANALYSIS_TEMPLATE_DETAIL: "/cabinet/settings/analysis-templates/[id]",
  ANALYSIS_TEMPLATE_CREATE: "/cabinet/settings/analysis-templates/create",
  ANALYSIS_TEMPLATE_EDIT: "/cabinet/settings/analysis-templates/[id]/edit",
} as const;

// Helper functions for routes with parameters
export const urlWithParams = (
  route: RouteValues,
  params?: Record<string, string | number>
): string => {
  if (!params || Object.keys(params).length === 0) return route;

  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `${route}?${queryString}` as any;
};

// Helper function for patient detail route
export const getPatientDetailRoute = (patientId: string): string => {
  return `/cabinet/patients/${patientId}`;
};

// Helper function for employee detail route
export const getEmployeeDetailRoute = (employeeId: string): string => {
  return `/cabinet/employees/${employeeId}`;
};

// Helper function for patient edit route
export const getPatientEditRoute = (patientId: string): string => {
  return `/cabinet/patients/${patientId}/edit`;
};

// Type for all possible routes
export type RouteValues = (typeof ROUTES)[keyof typeof ROUTES];
