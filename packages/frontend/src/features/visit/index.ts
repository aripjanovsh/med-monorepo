// Types
export type {
  VisitResponseDto,
  CreateVisitRequestDto,
  UpdateVisitRequestDto,
  StartVisitRequestDto,
  CompleteVisitRequestDto,
  VisitsQueryParamsDto,
  VisitsListResponseDto,
  SimplePatientDto,
  SimpleEmployeeDto,
} from "./visit.dto";
export { VisitIncludeRelation } from "./visit.dto";
export type { VisitStatus, VisitType } from "./visit.constants";
export type { VisitFormData } from "./visit.schema";
export type {
  SavedProtocolData,
  FilledProtocolOption,
} from "./visit-protocol.types";

// Constants
export {
  VISIT_STATUS,
  VISIT_STATUS_OPTIONS,
  VISIT_STATUS_LABELS,
  VISIT_STATUS_COLORS,
  VISIT_TYPE,
  VISIT_TYPE_LABELS,
  VISIT_TYPE_OPTIONS,
} from "./visit.constants";

// Schemas
export {
  visitFormSchema,
  createVisitRequestSchema,
  updateVisitRequestSchema,
} from "./visit.schema";

// Model functions
export {
  getVisitStatusLabel,
  isVisitEditable,
  canCompleteVisit,
  canCancelVisit,
  formatVisitDate,
  getVisitUnpaidTotal,
  hasVisitUnpaidServices,
  formatDoctorShortName,
} from "./visit.model";

// API hooks
export {
  useGetVisitsQuery,
  useGetVisitQuery,
  useCreateVisitMutation,
  useUpdateVisitMutation,
  useStartVisitMutation,
  useCompleteVisitMutation,
  useCancelVisitMutation,
  useDeleteVisitMutation,
} from "./visit.api";

// Components
export { VisitStatusBadge } from "./components/visit-status-badge";
export { visitColumns, patientVisitColumns } from "./components/visit-columns";
export { VisitForm } from "./components/visit-form";
export { VisitFormDialog } from "./components/visit-form-dialog";
export { VisitProtocol } from "./components/visit-protocol";
export { VisitDetailHeader, VisitInfoCards } from "./components/detail";
