import { Expose, Exclude, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
class DoctorScheduleEmployeeTitleDto {
  @Expose()
  @ApiProperty()
  name: string;
}

@Exclude()
class DoctorScheduleEmployeeDto {
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
  @ApiProperty({ type: DoctorScheduleEmployeeTitleDto, required: false })
  @Type(() => DoctorScheduleEmployeeTitleDto)
  title?: DoctorScheduleEmployeeTitleDto;
}

@Exclude()
class DoctorScheduleDepartmentDto {
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
class DoctorScheduleTimeDto {
  @Expose()
  @ApiProperty({ description: "Start time (HH:mm)" })
  startTime: string;

  @Expose()
  @ApiProperty({ description: "End time (HH:mm)" })
  endTime: string;
}

@Exclude()
class DoctorAppointmentsStatsDto {
  @Expose()
  @ApiProperty()
  @Type(() => Number)
  total: number;

  @Expose()
  @ApiProperty()
  @Type(() => Number)
  completed: number;

  @Expose()
  @ApiProperty()
  @Type(() => Number)
  inProgress: number;

  @Expose()
  @ApiProperty()
  @Type(() => Number)
  pending: number;

  @Expose()
  @ApiProperty()
  @Type(() => Number)
  canceled: number;
}

@Exclude()
class CurrentVisitPatientDto {
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
class CurrentVisitDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty({ type: CurrentVisitPatientDto })
  @Type(() => CurrentVisitPatientDto)
  patient: CurrentVisitPatientDto;

  @Expose()
  @ApiProperty({ description: "Visit started at (ISO 8601)" })
  startedAt: string;
}

@Exclude()
export class DoctorScheduleResponseDto {
  @Expose()
  @ApiProperty({ type: DoctorScheduleEmployeeDto })
  @Type(() => DoctorScheduleEmployeeDto)
  employee: DoctorScheduleEmployeeDto;

  @Expose()
  @ApiProperty({ type: DoctorScheduleDepartmentDto, required: false })
  @Type(() => DoctorScheduleDepartmentDto)
  department?: DoctorScheduleDepartmentDto;

  @Expose()
  @ApiProperty({ type: DoctorScheduleTimeDto })
  @Type(() => DoctorScheduleTimeDto)
  schedule: DoctorScheduleTimeDto;

  @Expose()
  @ApiProperty({ type: DoctorAppointmentsStatsDto })
  @Type(() => DoctorAppointmentsStatsDto)
  appointments: DoctorAppointmentsStatsDto;

  @Expose()
  @ApiProperty({ type: CurrentVisitDto, required: false })
  @Type(() => CurrentVisitDto)
  currentVisit?: CurrentVisitDto;

  @Expose()
  @ApiProperty({ enum: ["FREE", "BUSY", "BREAK", "FINISHED"] })
  status: "FREE" | "BUSY" | "BREAK" | "FINISHED";
}
