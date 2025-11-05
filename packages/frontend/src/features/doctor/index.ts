// Components
export { DoctorQueuePanel } from "./components/doctor-queue-panel";
export { DoctorStatsCard } from "./components/doctor-stats-card";
export { CurrentPatientCard } from "./components/current-patient-card";
export { CompletedVisitsList } from "./components/completed-visits-list";

// API
export {
  useGetDoctorQueueQuery,
  useStartVisitMutation,
  useCompleteVisitMutation,
} from "./api/doctor.api";

// Types
export type {
  DoctorQueueResponse,
  DoctorQueueVisit,
  DoctorQueuePatient,
  DoctorQueueStats,
} from "./types/doctor-queue";
