export type DoctorQueuePatient = {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
};

export type DoctorQueueVisit = {
  id: string;
  queueNumber: number;
  queuedAt: string;
  status: string;
  patient: DoctorQueuePatient;
  waitingMinutes: number;
  notes?: string;
};

export type DoctorQueueStats = {
  waiting: number;
  completed: number;
  avgWaitingTime: number;
  avgServiceTime: number;
};

export type DoctorQueueResponse = {
  employeeId: string;
  employeeName: string;
  waiting: DoctorQueueVisit[];
  inProgress?: DoctorQueueVisit;
  stats: DoctorQueueStats;
};
