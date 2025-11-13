import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class QueuePatientDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  lastName: string;

  @Expose()
  @ApiProperty()
  middleName?: string;
}

export class QueueVisitDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  queuedAt: Date;

  @Expose()
  @ApiProperty()
  status: string;

  @Expose()
  @ApiProperty({ type: QueuePatientDto })
  patient: QueuePatientDto;

  @Expose()
  @ApiProperty()
  waitingMinutes: number;
}

export class DoctorQueueDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  lastName: string;

  @Expose()
  @ApiProperty()
  middleName?: string;

  @Expose()
  @ApiProperty()
  status: "FREE" | "BUSY" | "FINISHED";

  @Expose()
  @ApiProperty({ type: [QueueVisitDto] })
  queue: QueueVisitDto[];

  @Expose()
  @ApiProperty()
  stats: {
    waiting: number;
    inProgress: number;
    completed: number;
    avgWaitingTime: number;
    avgServiceTime: number;
  };
}

export class QueueDashboardResponseDto {
  @Expose()
  @ApiProperty({ type: [DoctorQueueDto] })
  doctors: DoctorQueueDto[];
}
