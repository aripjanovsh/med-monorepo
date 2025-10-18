// Types
export type {
  VisitResponseDto,
  CreateVisitRequestDto,
  UpdateVisitRequestDto,
  UpdateVisitStatusRequestDto,
  VisitsQueryParamsDto,
  VisitsListResponseDto,
  SimplePatientDto,
  SimpleEmployeeDto,
} from "./visit.dto";
export type { VisitStatus } from "./visit.constants";
export type { VisitFormData } from "./visit.schema";

// Constants
export { VISIT_STATUS, VISIT_STATUS_OPTIONS, VISIT_STATUS_LABELS, VISIT_STATUS_COLORS } from "./visit.constants";

// Schemas
export { visitFormSchema, createVisitRequestSchema, updateVisitRequestSchema } from "./visit.schema";

// Model functions
export {
  getVisitStatusLabel,
  getPatientFullName,
  getEmployeeFullName,
  isVisitEditable,
  canCompleteVisit,
  canCancelVisit,
} from "./visit.model";

// API hooks
export {
  useGetVisitsQuery,
  useGetVisitQuery,
  useCreateVisitMutation,
  useUpdateVisitMutation,
  useUpdateVisitStatusMutation,
  useDeleteVisitMutation,
} from "./visit.api";

// Components
export { VisitStatusBadge } from "./components/visit-status-badge";
export { createVisitColumns } from "./components/visit-columns";
export { VisitForm } from "./components/visit-form";
