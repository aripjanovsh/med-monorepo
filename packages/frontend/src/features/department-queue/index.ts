// Components
export { DepartmentQueuePanel } from "./components/department-queue-panel";

// API
export {
  useGetDepartmentQueueQuery,
  useStartServiceMutation,
  useCompleteServiceMutation,
  useSkipPatientMutation,
  useReturnToQueueMutation,
} from "./api/department-queue.api";

// Types
export type {
  DepartmentQueueResponse,
  QueueItem,
  QueuePatient,
  QueueService,
  QueueDoctor,
  DepartmentQueueStats,
  QueueStatus,
} from "./types/department-queue";
