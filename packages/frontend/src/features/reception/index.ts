// Types
export type {
  QueueItemResponseDto,
  DoctorScheduleResponseDto,
  QuickCreateVisitRequestDto,
  QuickCreateVisitResponseDto,
  DoctorScheduleQueryDto,
} from "./reception.dto";

// Schemas & Types
export type {
  QuickCreateVisitFormData,
  DoctorScheduleQueryData,
} from "./reception.schema";

export {
  quickCreateVisitFormSchema,
  quickCreateVisitRequestSchema,
  doctorScheduleQuerySchema,
} from "./reception.schema";

// Constants
export {
  APPOINTMENT_TYPE,
  APPOINTMENT_TYPE_OPTIONS,
  DOCTOR_STATUS,
  DOCTOR_STATUS_OPTIONS,
  DOCTOR_STATUS_MAP,
  APPOINTMENT_TYPE_MAP,
  WAIT_TIME_THRESHOLDS,
  getWaitTimeColor,
  RECEPTION_API_TAG,
  RECEPTION_QUERY_KEYS,
  REFRESH_INTERVALS,
} from "./reception.constants";

// Queue Dashboard Types
export type {
  QueueDashboard,
  DoctorQueue,
  QueueVisit,
  QueuePatient,
  DoctorStatus,
  VisitStatus,
} from "./types/queue-dashboard";

// API Hooks
export {
  useGetQueueQuery,
  useGetDoctorScheduleQuery,
  useCreateVisitMutation,
  useGetQueueDashboardQuery,
} from "./reception.api";

// API instance (for advanced usage)
export { receptionApi } from "./reception.api";

// Model utilities
export {
  calculateWaitTimeColor,
  isLongWaitTime,
  formatPatientName,
  formatEmployeeShortName,
  getQueuePriority,
  sortQueueByPriority,
} from "./reception.model";

// Components
export { QuickCreateVisitModal } from "../visit/components/quick-create-visit-modal";
export { ReceptionStats } from "./components/reception-stats";
export { WaitingQueue } from "./components/waiting-queue";
export { DoctorSchedule } from "./components/doctor-schedule";
export { DoctorsTodayBoard } from "./components/doctors-today-board";
export { UnpaidServicesPanel } from "./components/unpaid-services-panel";
export { CompletedVisitsPanel } from "./components/completed-visits-panel";
export { PatientQuickSearch } from "./components/patient-quick-search";
export { LiveQueueWidget } from "./components/live-queue-widget";
export { QuickActionsPanel } from "./components/quick-actions-panel";
export { DailyAppointmentsCalendar } from "./components/daily-appointments-calendar";
