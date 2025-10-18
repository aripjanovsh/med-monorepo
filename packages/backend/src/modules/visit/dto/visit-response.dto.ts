import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { VisitStatus } from "@prisma/client";
import { BaseResponseDto } from "@/common/dto/response.dto";

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
class SimpleMedicalRecordResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  type: string;

  @Expose()
  @ApiProperty()
  content: unknown;

  @Expose()
  @ApiProperty()
  createdAt: Date;
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
class SimpleLabOrderResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  testName: string;

  @Expose()
  @ApiProperty()
  status: string;

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
  @ApiProperty({
    description: "Medical records",
    type: [SimpleMedicalRecordResponseDto],
  })
  @Type(() => SimpleMedicalRecordResponseDto)
  medicalRecords: SimpleMedicalRecordResponseDto[];

  @Expose()
  @ApiProperty({
    description: "Prescriptions",
    type: [SimplePrescriptionResponseDto],
  })
  @Type(() => SimplePrescriptionResponseDto)
  prescriptions: SimplePrescriptionResponseDto[];

  @Expose()
  @ApiProperty({
    description: "Lab orders",
    type: [SimpleLabOrderResponseDto],
  })
  @Type(() => SimpleLabOrderResponseDto)
  labOrders: SimpleLabOrderResponseDto[];

  @Expose()
  @ApiProperty({
    description: "Organization information",
    type: SimpleOrganizationResponseDto,
  })
  @Type(() => SimpleOrganizationResponseDto)
  organization: SimpleOrganizationResponseDto;
}
