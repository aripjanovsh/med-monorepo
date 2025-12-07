// Domain Types exports
export type {
  EmployeeResponseDto,
  EmployeeStatsDto,
  EmployeesListResponseDto,
  EmployeesQueryParamsDto,
  CreateEmployeeRequestDto,
  UpdateEmployeeRequestDto,
  UpdateEmployeeStatusRequestDto,
  GenderDto,
  EmployeeStatusDto,
  WorkScheduleDto,
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
  FORM_STEPS,
} from "./employee.constants";

// Date constants exports
export {
  WORKING_DAYS,
  WEEK_DAYS,
  WEEK_DAYS_SHORT,
  WEEK_DAYS_LONG,
  WEEK_DAYS_BY_INDEX,
} from "@/lib/date.utils";

// Model/Utility exports
export {
  getEmployeeFullName,
  getEmployeeShortName,
  getEmployeeInitials,
  getEmployeePhone,
  getEmployeeTitle,
  isEmployeeActive,
  getEmployeeDisplayStatus,
  calculateEmployeeExperience,
  formatEmployeeDateTime,
  formatEmployeeDate,
  getGenderDisplay,
  getEmployeeStatusDisplay,
  getNotificationStatusDisplay,
  getPassportSeriesNumber,
  hasPassportInfo,
  getEmployeeDisplayId,
  formatSalary,
  getWorkScheduleForDay,
  hasWorkSchedule,
} from "./employee.model";

// API exports
export {
  employeeApi,
  useGetEmployeesQuery,
  useGetEmployeeQuery,
  useGetEmployeeListStatsQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useUpdateEmployeeStatusMutation,
  useDeleteEmployeeMutation,
} from "./employee.api";

// Component exports
export { PageEmployeeForm } from "./components/page-employee-form";
export { default as WorkScheduleField } from "./components/work-schedule-field";
export { EmployeeSelectField } from "./components/employee-select-field";
export { EmployeeSelect } from "./components/employee-select";
export { EmployeeAutocompleteField } from "./components/employee-autocomplete-field";
export {
  employeeColumns,
  patientDoctorColumns,
} from "./components/employee-columns";
