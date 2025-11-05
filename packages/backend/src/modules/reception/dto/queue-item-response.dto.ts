import { Expose, Exclude, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
class QueuePatientDto {
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
  @ApiProperty({ required: false })
  middleName?: string;
}

@Exclude()
class QueueEmployeeTitleDto {
  @Expose()
  @ApiProperty()
  name: string;
}

@Exclude()
class QueueDepartmentDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  code: string;
}

@Exclude()
class QueueEmployeeDto {
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
  @ApiProperty({ required: false })
  middleName?: string;

  @Expose()
  @ApiProperty({ type: QueueEmployeeTitleDto, required: false })
  @Type(() => QueueEmployeeTitleDto)
  title?: QueueEmployeeTitleDto;

  @Expose()
  @ApiProperty({ type: QueueDepartmentDto, required: false })
  @Type(() => QueueDepartmentDto)
  department?: QueueDepartmentDto;
}

@Exclude()
class QueueAppointmentDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty({ description: "Scheduled time (ISO 8601)" })
  scheduledAt: string;

  @Expose()
  @ApiProperty({ description: "Check-in time (ISO 8601)", required: false })
  checkInAt?: string;

  @Expose()
  @ApiProperty({ description: "Appointment status" })
  status: string;

  @Expose()
  @ApiProperty({ required: false })
  roomNumber?: string;
}

@Exclude()
export class QueueItemResponseDto {
  @Expose()
  @ApiProperty({ description: "Position in queue" })
  @Type(() => Number)
  position: number;

  @Expose()
  @ApiProperty({ type: QueueAppointmentDto })
  @Type(() => QueueAppointmentDto)
  appointment: QueueAppointmentDto;

  @Expose()
  @ApiProperty({ type: QueuePatientDto })
  @Type(() => QueuePatientDto)
  patient: QueuePatientDto;

  @Expose()
  @ApiProperty({ type: QueueEmployeeDto })
  @Type(() => QueueEmployeeDto)
  employee: QueueEmployeeDto;

  @Expose()
  @ApiProperty({ description: "Wait time in minutes" })
  @Type(() => Number)
  waitTime: number;

  @Expose()
  @ApiProperty({ description: "Estimated wait time in minutes" })
  @Type(() => Number)
  estimatedWaitTime: number;
}
