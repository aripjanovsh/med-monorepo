// Domain Types exports
export type {
  Employee,
  EmployeeStats,
  EmergencyContact,
  Education,
  Certification,
  PerformanceRating,
  Schedule,
  EmployeeAppointment,
  EmployeeNote,
  Achievement,
  EmployeesListResponse,
  EmployeesQueryParams,
} from "./employee.types";

// DTO Types exports
export type {
  EmployeeDto,
  CreateEmployeeRequestDto,
  UpdateEmployeeRequestDto,
  UpdateEmployeeStatusRequestDto,
  EmployeesQueryParamsDto,
  EmployeesListResponseDto,
  EmployeeStatsDto,
} from "./employee.dto";

// Form Types exports
export type {
  EmployeeFormData,
  CreateEmployeeFormData,
  UpdateEmployeeFormData,
  UpdateEmployeeStatusFormData,
  EmployeesQueryParamsFormData,
  WorkingDayFormData,
} from "./employee.schema";

// Form Schemas exports
export {
  employeeFormSchema,
  createEmployeeRequestSchema,
  updateEmployeeRequestSchema,
  updateEmployeeStatusRequestSchema,
  employeesQueryParamsSchema,
  workingDaySchema,
} from "./employee.schema";

// Constants exports
export {
  EMPLOYEE_STATUS_OPTIONS,
  GENDER_OPTIONS,
  USER_ROLE_OPTIONS,
  EMPLOYEE_STATUS,
  GENDER,
  USER_ROLE,
  WORKING_DAYS,
  FORM_STEPS,
} from "./employee.constants";

// Model/Utility exports
export {
  getEmployeeFullName,
  isEmployeeActive,
  getEmployeeDisplayStatus,
  calculateEmployeeExperience,
} from "./employee.model";

// API exports
export {
  employeeApi,
  useGetEmployeesQuery,
  useGetEmployeeQuery,
  useGetEmployeeStatsQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useUpdateEmployeeStatusMutation,
  useDeleteEmployeeMutation,
} from "./employee.api";

// Component exports
export { EmployeeForm } from "./components/employee-form";
export { PageEmployeeForm } from "./components/page-employee-form";
export { default as WorkScheduleField } from "./components/work-schedule-field";
