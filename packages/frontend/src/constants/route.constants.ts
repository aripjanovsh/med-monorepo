export const ROUTES = {
  // Public routes
  HOME: "/",

  // Auth routes
  LOGIN: "/login",
  DASHBOARD: "/cabinet",
  PATIENTS: "/cabinet/patients",
  PATIENT_DETAIL: "/cabinet/patients/[id]",
  DOCTORS: "/cabinet/doctors",
  APPOINTMENTS: "/cabinet/appointments",
  PROFILE: "/cabinet/profile",
  SETTINGS: "/cabinet/settings",
  LOGOUT: "/logout",

  EMPLOYEES: "/cabinet/employees",
  EMPLOYEE_DETAIL: "/cabinet/employees/[id]",
  EMPLOYEE_EDIT: "/cabinet/employees/[id]/edit",
  EMPLOYEE_CREATE: "/cabinet/employees/create",
  DOCTOR_DASHBOARD: "/cabinet/doctor",
  RECEPTION_DASHBOARD: "/cabinet/reception",
  DEPARTMENT_QUEUE: "/cabinet/departments/queue",

  // Visit routes
  VISITS: "/cabinet/visits",
  VISIT_DETAIL: "/cabinet/visits/[id]",

  // Invoice routes
  INVOICES: "/cabinet/invoices",
  INVOICE_DETAIL: "/cabinet/invoices/[id]",
  INVOICE_CREATE: "/cabinet/invoices/create",

  // Service Orders routes
  ORDERS: "/cabinet/orders",
  ORDER_DETAIL: "/cabinet/orders/[id]",

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
  MASTER_DATA_SERVICES: "/cabinet/settings/master-data/services",
  MASTER_DATA_LANGUAGES: "/cabinet/settings/master-data/languages",
  MASTER_DATA_DEPARTMENTS: "/cabinet/settings/master-data/departments",
  MASTER_DATA_GEOLOCATION: "/cabinet/settings/master-data/geolocation",

  // Analysis Templates routes (Settings)
  ANALYSIS_TEMPLATES: "/cabinet/settings/master-data/analysis-templates",
  ANALYSIS_TEMPLATE_DETAIL:
    "/cabinet/settings/master-data/analysis-templates/[id]",
  ANALYSIS_TEMPLATE_CREATE:
    "/cabinet/settings/master-data/analysis-templates/create",
  ANALYSIS_TEMPLATE_EDIT:
    "/cabinet/settings/master-data/analysis-templates/[id]/edit",

  // Protocol Templates routes (Settings)
  PROTOCOL_TEMPLATES: "/cabinet/settings/master-data/protocols",
  PROTOCOL_TEMPLATE_DETAIL: "/cabinet/settings/master-data/protocols/[id]",
  PROTOCOL_TEMPLATE_CREATE: "/cabinet/settings/master-data/protocols/create",
  PROTOCOL_TEMPLATE_EDIT: "/cabinet/settings/master-data/protocols/[id]/edit",
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

/**
 * Universal URL builder for dynamic routes
 * Replaces [id], [slug], etc. with actual values
 *
 * @example
 * url(ROUTES.PATIENT_DETAIL, { id: '123' }) → '/cabinet/patients/123'
 * url(ROUTES.INVOICES) → '/cabinet/invoices'
 */
export const url = (
  route: RouteValues,
  params?: Record<string, any>
): string => {
  if (!params || Object.keys(params).length === 0) {
    return route;
  }

  let resolvedRoute = route as string;

  Object.entries(params).forEach(([key, value]) => {
    const encodedValue = encodeURIComponent(String(value));
    resolvedRoute = resolvedRoute.replace(
      new RegExp(`\\[${key}\\]`, "g"),
      encodedValue
    );
  });

  return resolvedRoute;
};

// Type for all possible routes
export type RouteValues = (typeof ROUTES)[keyof typeof ROUTES];
