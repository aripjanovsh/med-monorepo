// Types
export type {
  PrescriptionResponseDto,
  CreatePrescriptionRequestDto,
  UpdatePrescriptionRequestDto,
  PrescriptionsQueryParamsDto,
  PrescriptionsListResponseDto,
} from "./prescription.dto";
export type { PrescriptionFormData } from "./prescription.schema";

// Constants
export {
  PRESCRIPTION_FREQUENCY_OPTIONS,
  PRESCRIPTION_DURATION_OPTIONS,
  PRESCRIPTION_FREQUENCY_LABELS,
  PRESCRIPTION_DURATION_LABELS,
  getFrequencyLabel,
  getDurationLabel,
} from "./prescription.constants";

// Schemas
export {
  prescriptionFormSchema,
  createPrescriptionRequestSchema,
} from "./prescription.schema";

// Model functions
export {
  getEmployeeFullName,
  formatPrescriptionDisplay,
} from "./prescription.model";

// API hooks
export {
  useGetPrescriptionsQuery,
  useGetPrescriptionQuery,
  useGetPrescriptionsByVisitQuery,
  useCreatePrescriptionMutation,
  useUpdatePrescriptionMutation,
  useDeletePrescriptionMutation,
} from "./prescription.api";

// Components
export { PrescriptionList } from "./components/prescription-list";
export { PatientPrescriptionsHistory } from "./components/patient-prescriptions-history";
export { PrescriptionPreviewDialog } from "./components/prescription-preview-dialog";
