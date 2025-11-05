import { Expose, Type } from "class-transformer";

export class QueuePatientDto {
  @Expose()
  id!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;

  @Expose()
  middleName?: string;
}

export class QueueServiceDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  type!: string;
}

export class QueueDoctorDto {
  @Expose()
  id!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;
}

export class QueueItemDto {
  @Expose()
  id!: string;

  @Expose()
  queueNumber!: number;

  @Expose()
  queueStatus!: string;

  @Expose()
  queuedAt!: Date;

  @Expose()
  startedAt?: Date;

  @Expose()
  @Type(() => QueuePatientDto)
  patient!: QueuePatientDto;

  @Expose()
  @Type(() => QueueServiceDto)
  service!: QueueServiceDto;

  @Expose()
  @Type(() => QueueDoctorDto)
  doctor!: QueueDoctorDto;

  @Expose()
  waitingMinutes!: number;
}

export class DepartmentQueueResponseDto {
  @Expose()
  departmentId!: string;

  @Expose()
  @Type(() => QueueItemDto)
  waiting!: QueueItemDto[];

  @Expose()
  @Type(() => QueueItemDto)
  inProgress?: QueueItemDto;

  @Expose()
  @Type(() => QueueItemDto)
  skipped!: QueueItemDto[];

  @Expose()
  stats!: {
    waiting: number;
    inProgress: number;
    completed: number;
    skipped: number;
  };
}
