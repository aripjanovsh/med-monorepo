// Types
export type {
  AppointmentResponseDto,
  CreateAppointmentRequestDto,
  UpdateAppointmentRequestDto,
  UpdateAppointmentStatusRequestDto,
  AppointmentsQueryParamsDto,
  AppointmentsListResponseDto,
  SimplePatientDto,
  SimpleEmployeeDto,
  SimpleServiceDto,
  SimpleUserDto,
} from "./appointment.dto";
export type { AppointmentStatus } from "./appointment.constants";
export type { AppointmentFormData } from "./appointment.schema";

// Constants
export {
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUS_OPTIONS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
} from "./appointment.constants";

// Schemas
export {
  appointmentFormSchema,
  createAppointmentRequestSchema,
  updateAppointmentRequestSchema,
} from "./appointment.schema";

// Model functions
export {
  getAppointmentStatusLabel,
  getPatientFullName,
  getEmployeeFullName,
  isAppointmentEditable,
  canConfirmAppointment,
  canCheckInAppointment,
  canStartAppointment,
  canCompleteAppointment,
  canCancelAppointment,
  canMarkNoShow,
  formatAppointmentDateTime,
  formatAppointmentDate,
  formatAppointmentTime,
} from "./appointment.model";

// API hooks
export {
  useGetAppointmentsQuery,
  useGetAppointmentQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useUpdateAppointmentStatusMutation,
  useConfirmAppointmentMutation,
  useCheckInAppointmentMutation,
  useCancelAppointmentMutation,
  useMarkAppointmentNoShowMutation,
  useDeleteAppointmentMutation,
} from "./appointment.api";

// Components
export { AppointmentStatusBadge } from "./components/appointment-status-badge";
export { createAppointmentColumns } from "./components/appointment-columns";
export { CalendarView, Navigation } from "./components/calendar-view";
export { ListView } from "./components/list-view";
export { ViewSwitcher } from "./components/view-switcher";
export { AppointmentViewSheet } from "./components/appointment-view-sheet";
export { AppointmentFormSheet } from "./components/appointment-form-sheet";
export { AppointmentsPage } from "./appointments-page";
export { FilteredAppointmentsPage } from "./filtered-appointments-page";
