import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { AppointmentStatus } from "@prisma/client";
import { BaseResponseDto } from "@/common/dto/response.dto";
import { SafeDecimal } from "@/common/types";
import { TransformDecimal } from "@/common/decorators";

// Simplified response DTOs for nested relations
@Exclude()
class SimplePatientResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  patientId?: string;

  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  middleName?: string;

  @Expose()
  @ApiProperty()
  lastName: string;

  @Expose()
  @ApiProperty()
  dateOfBirth: Date;

  @Expose()
  @ApiProperty()
  gender: string;
}

@Exclude()
class SimpleEmployeeResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  employeeId?: string;

  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  middleName?: string;

  @Expose()
  @ApiProperty()
  lastName: string;
}

@Exclude()
class SimpleServiceResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  code: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  type: string;

  @Expose()
  @ApiProperty()
  @Type(() => SafeDecimal)
  @TransformDecimal()
  price?: number;
}

@Exclude()
class SimpleUserResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  phone: string;

  @Expose()
  @ApiProperty()
  role: string;
}

@Exclude()
class SimpleOrganizationResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  slug: string;
}

@Exclude()
export class AppointmentResponseDto extends BaseResponseDto {
  @Expose()
  @ApiProperty({
    description: "Scheduled date and time",
    example: "2024-01-15T10:30:00.000Z",
  })
  scheduledAt: Date;

  @Expose()
  @ApiProperty({
    description: "Duration in minutes",
    example: 30,
  })
  duration: number;

  @Expose()
  @ApiProperty({
    description: "Appointment status",
    enum: AppointmentStatus,
    example: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @Expose()
  @ApiPropertyOptional({
    description: "Appointment notes",
    example: "Regular checkup",
  })
  notes?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Reason for appointment",
    example: "Annual health examination",
  })
  reason?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Room number",
    example: "101",
  })
  roomNumber?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Confirmed at",
    example: "2024-01-14T15:00:00.000Z",
  })
  confirmedAt?: Date;

  @Expose()
  @ApiPropertyOptional({
    description: "Canceled at",
    example: "2024-01-14T15:00:00.000Z",
  })
  canceledAt?: Date;

  @Expose()
  @ApiPropertyOptional({
    description: "Cancel reason",
    example: "Patient requested cancellation",
  })
  cancelReason?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Check-in time",
    example: "2024-01-15T10:25:00.000Z",
  })
  checkInAt?: Date;

  @Expose()
  @ApiPropertyOptional({
    description: "Check-out time",
    example: "2024-01-15T11:00:00.000Z",
  })
  checkOutAt?: Date;

  @Expose()
  @ApiProperty({
    description: "Patient information",
    type: SimplePatientResponseDto,
  })
  @Type(() => SimplePatientResponseDto)
  patient: SimplePatientResponseDto;

  @Expose()
  @ApiProperty({
    description: "Doctor (Employee) information",
    type: SimpleEmployeeResponseDto,
  })
  @Type(() => SimpleEmployeeResponseDto)
  employee: SimpleEmployeeResponseDto;

  @Expose()
  @ApiPropertyOptional({
    description: "Service information",
    type: SimpleServiceResponseDto,
  })
  @Type(() => SimpleServiceResponseDto)
  service?: SimpleServiceResponseDto;

  @Expose()
  @ApiProperty({
    description: "User who created the appointment",
    type: SimpleUserResponseDto,
  })
  @Type(() => SimpleUserResponseDto)
  createdBy: SimpleUserResponseDto;

  @Expose()
  @ApiPropertyOptional({
    description: "User who confirmed the appointment",
    type: SimpleUserResponseDto,
  })
  @Type(() => SimpleUserResponseDto)
  confirmedBy?: SimpleUserResponseDto;

  @Expose()
  @ApiPropertyOptional({
    description: "User who canceled the appointment",
    type: SimpleUserResponseDto,
  })
  @Type(() => SimpleUserResponseDto)
  canceledBy?: SimpleUserResponseDto;

  @Expose()
  @ApiProperty({
    description: "Organization information",
    type: SimpleOrganizationResponseDto,
  })
  @Type(() => SimpleOrganizationResponseDto)
  organization: SimpleOrganizationResponseDto;

  @Expose()
  @ApiPropertyOptional({
    description: "Appointment type ID",
  })
  appointmentTypeId?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Appointment type information",
  })
  appointmentType?: {
    id: string;
    name: string;
    code?: string;
    color?: string;
    durationMin?: number;
  };
}
