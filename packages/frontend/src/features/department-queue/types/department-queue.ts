export type QueueStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";

export type QueuePatient = {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
};

export type QueueService = {
  id: string;
  name: string;
  type: string;
};

export type QueueDoctor = {
  id: string;
  firstName: string;
  lastName: string;
};

export type QueueItem = {
  id: string;
  queueNumber: number;
  queueStatus: QueueStatus;
  queuedAt: string;
  startedAt?: string;
  patient: QueuePatient;
  service: QueueService;
  doctor: QueueDoctor;
  waitingMinutes: number;
};

export type DepartmentQueueStats = {
  waiting: number;
  inProgress: number;
  completed: number;
  skipped: number;
};

export type DepartmentQueueResponse = {
  departmentId: string;
  waiting: QueueItem[];
  inProgress?: QueueItem;
  skipped: QueueItem[];
  stats: DepartmentQueueStats;
};
