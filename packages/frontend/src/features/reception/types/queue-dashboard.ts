export type VisitStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";

export type QueuePatient = {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
};

export type QueueVisit = {
  id: string;
  queueNumber: number;
  queuedAt: string;
  status: VisitStatus;
  patient: QueuePatient;
  waitingMinutes: number;
};

export type DoctorStatus = "FREE" | "BUSY" | "FINISHED";

export type DoctorQueue = {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  status: DoctorStatus;
  queue: QueueVisit[];
  stats: {
    waiting: number;
    inProgress: number;
    completed: number;
    avgWaitingTime: number;
    avgServiceTime: number;
  };
};

export type QueueDashboard = {
  doctors: DoctorQueue[];
};
