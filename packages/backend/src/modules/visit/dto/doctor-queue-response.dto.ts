import { Expose, Type } from "class-transformer";

export class DoctorQueuePatientDto {
  @Expose()
  id!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;

  @Expose()
  middleName?: string;
}

export class DoctorQueueVisitDto {
  @Expose()
  id!: string;

  @Expose()
  queueNumber!: number;

  @Expose()
  queuedAt!: Date;

  @Expose()
  status!: string;

  @Expose()
  @Type(() => DoctorQueuePatientDto)
  patient!: DoctorQueuePatientDto;

  @Expose()
  waitingMinutes!: number;

  @Expose()
  notes?: string;

  @Expose()
  appointmentType?: string;

  @Expose()
  appointmentId?: string;
}

export class CompletedVisitDto {
  @Expose()
  id!: string;

  @Expose()
  @Type(() => DoctorQueuePatientDto)
  patient!: DoctorQueuePatientDto;

  @Expose()
  completedAt!: Date;

  @Expose()
  waitingTimeMinutes!: number;

  @Expose()
  serviceTimeMinutes!: number;

  @Expose()
  notes?: string;
}

export class DoctorQueueStatsDto {
  @Expose()
  waiting!: number;

  @Expose()
  inProgress!: number;

  @Expose()
  completed!: number;

  @Expose()
  canceled!: number;

  @Expose()
  totalPatients!: number;

  @Expose()
  avgWaitingTime!: number;

  @Expose()
  avgServiceTime!: number;
}

export class DoctorQueueResponseDto {
  @Expose()
  employeeId!: string;

  @Expose()
  employeeName!: string;

  @Expose()
  @Type(() => DoctorQueueVisitDto)
  waiting!: DoctorQueueVisitDto[];

  @Expose()
  @Type(() => DoctorQueueVisitDto)
  inProgress?: DoctorQueueVisitDto;

  @Expose()
  @Type(() => CompletedVisitDto)
  completed!: CompletedVisitDto[];

  @Expose()
  @Type(() => DoctorQueueStatsDto)
  stats!: DoctorQueueStatsDto;
}
