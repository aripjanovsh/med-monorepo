import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { VisitStatus } from "@prisma/client";
import { BaseResponseDto } from "@/common/dto/response.dto";
import { TransformDecimal } from "@/common/decorators";
import { Decimal } from "@/common/utils/transform.util";
import { SafeDecimal } from "@/common/types";

// Simplified response DTOs for nested relations
// These will be imported from their respective modules
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
  userId: string;

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
class SimpleProtocolTemplateResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  description: string;
}

@Exclude()
class SimpleAppointmentResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  scheduledAt: Date;

  @Expose()
  @ApiProperty()
  status: string;

  @Expose()
  @ApiProperty()
  type: string;
}

@Exclude()
class SimplePrescriptionResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  dosage?: string;

  @Expose()
  @ApiProperty()
  frequency?: string;

  @Expose()
  @ApiProperty()
  duration?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;
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
class SimpleServiceDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  @TransformDecimal()
  @Type(() => SafeDecimal)
  price: number;
}

@Exclude()
class SimpleServiceOrderResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  status: string;

  @Expose()
  @ApiProperty()
  paymentStatus: string;

  @Expose()
  @ApiProperty({ type: SimpleServiceDto })
  @Type(() => SimpleServiceDto)
  service: SimpleServiceDto;
}

@Exclude()
export class VisitResponseDto extends BaseResponseDto {
  @Expose()
  @ApiProperty({
    description: "Visit date and time",
    example: "2024-01-15T10:30:00.000Z",
  })
  visitDate: Date;

  @Expose()
  @ApiProperty({
    description: "Visit status",
    enum: VisitStatus,
    example: VisitStatus.IN_PROGRESS,
  })
  status: VisitStatus;

  @Expose()
  @ApiPropertyOptional({
    description: "Visit notes",
    example: "Patient came for regular checkup",
  })
  notes?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Queue number",
    example: 1,
  })
  queueNumber?: number;

  @Expose()
  @ApiPropertyOptional({
    description: "Time when patient was queued",
    example: "2024-01-15T10:00:00.000Z",
  })
  queuedAt?: Date;

  @Expose()
  @ApiPropertyOptional({
    description: "Time when visit started",
    example: "2024-01-15T10:15:00.000Z",
  })
  startedAt?: Date;

  @Expose()
  @ApiPropertyOptional({
    description: "Time when visit completed",
    example: "2024-01-15T10:45:00.000Z",
  })
  completedAt?: Date;

  @Expose()
  @ApiPropertyOptional({
    description: "Waiting time in minutes",
    example: 15,
  })
  waitingTimeMinutes?: number;

  @Expose()
  @ApiPropertyOptional({
    description: "Service time in minutes",
    example: 30,
  })
  serviceTimeMinutes?: number;

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
    description: "Appointment information",
    type: SimpleAppointmentResponseDto,
  })
  @Type(() => SimpleAppointmentResponseDto)
  appointment?: SimpleAppointmentResponseDto;

  @Expose()
  @ApiPropertyOptional({
    description: "Protocol template information",
    type: SimpleProtocolTemplateResponseDto,
  })
  @Type(() => SimpleProtocolTemplateResponseDto)
  protocol?: SimpleProtocolTemplateResponseDto;

  @Expose()
  @ApiPropertyOptional({
    description: "Protocol filled data (JSON string)",
    example: '{"field1": "value1", "field2": "value2"}',
  })
  protocolData?: string;

  @Expose()
  @ApiProperty({
    description: "Prescriptions",
    type: [SimplePrescriptionResponseDto],
  })
  @Type(() => SimplePrescriptionResponseDto)
  prescriptions: SimplePrescriptionResponseDto[];

  @Expose()
  @ApiProperty({
    description: "Organization information",
    type: SimpleOrganizationResponseDto,
  })
  @Type(() => SimpleOrganizationResponseDto)
  organization: SimpleOrganizationResponseDto;

  @Expose()
  @ApiPropertyOptional({
    description: "Service orders",
    type: [SimpleServiceOrderResponseDto],
  })
  @Type(() => SimpleServiceOrderResponseDto)
  serviceOrders?: SimpleServiceOrderResponseDto[];

  @Expose()
  @ApiPropertyOptional({
    description: "Diagnosis",
    example: "ОРВИ",
  })
  diagnosis?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Time when visit finished",
    example: "2024-01-15T11:00:00.000Z",
  })
  finishedAt?: Date;

  @Expose()
  @ApiPropertyOptional({
    description: "AI-generated summary of the visit",
    example: "Пациент обратился с жалобами на головную боль...",
  })
  aiSummary?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Time when AI summary was generated",
    example: "2024-01-15T11:00:00.000Z",
  })
  aiSummaryGeneratedAt?: Date;
}
