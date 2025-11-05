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
  stats!: {
    waiting: number;
    completed: number;
    avgWaitingTime: number;
    avgServiceTime: number;
  };
}
