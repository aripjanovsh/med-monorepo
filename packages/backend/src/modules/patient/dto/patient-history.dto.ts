import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";
import { VisitStatus } from "@prisma/client";

// Query DTO
@Exclude()
export class PatientHistoryQueryDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;
}

// Response DTOs
@Exclude()
class HistoryDoctorDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiPropertyOptional()
  middleName?: string;

  @Expose()
  @ApiProperty()
  lastName: string;

  @Expose()
  @ApiPropertyOptional()
  specialty?: string;
}

@Exclude()
class HistoryPrescriptionDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiPropertyOptional()
  dosage?: string;

  @Expose()
  @ApiPropertyOptional()
  frequency?: string;

  @Expose()
  @ApiPropertyOptional()
  duration?: string;

  @Expose()
  @ApiPropertyOptional()
  notes?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}

@Exclude()
class HistoryServiceOrderDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  serviceName: string;

  @Expose()
  @ApiProperty()
  serviceType: string;

  @Expose()
  @ApiProperty()
  status: string;

  @Expose()
  @ApiPropertyOptional()
  resultText?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}

@Exclude()
export class HistoryVisitDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  visitDate: Date;

  @Expose()
  @ApiProperty({ enum: VisitStatus })
  status: VisitStatus;

  @Expose()
  @ApiPropertyOptional()
  complaint?: string;

  @Expose()
  @ApiPropertyOptional()
  anamnesis?: string;

  @Expose()
  @ApiPropertyOptional()
  diagnosis?: string;

  @Expose()
  @ApiPropertyOptional()
  conclusion?: string;

  @Expose()
  @ApiPropertyOptional()
  notes?: string;

  @Expose()
  @ApiPropertyOptional()
  aiSummary?: string;

  @Expose()
  @ApiProperty({ type: HistoryDoctorDto })
  @Type(() => HistoryDoctorDto)
  doctor: HistoryDoctorDto;

  @Expose()
  @ApiProperty({ type: [HistoryPrescriptionDto] })
  @Type(() => HistoryPrescriptionDto)
  prescriptions: HistoryPrescriptionDto[];

  @Expose()
  @ApiProperty({ type: [HistoryServiceOrderDto] })
  @Type(() => HistoryServiceOrderDto)
  serviceOrders: HistoryServiceOrderDto[];
}

@Exclude()
export class PatientAllergyHistoryDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  substance: string;

  @Expose()
  @ApiPropertyOptional()
  reaction?: string;

  @Expose()
  @ApiPropertyOptional()
  severity?: string;

  @Expose()
  @ApiPropertyOptional()
  note?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}

@Exclude()
export class PatientParameterHistoryDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  parameterCode: string;

  @Expose()
  @ApiPropertyOptional()
  valueNumeric?: number;

  @Expose()
  @ApiPropertyOptional()
  valueText?: string;

  @Expose()
  @ApiPropertyOptional()
  unit?: string;

  @Expose()
  @ApiProperty()
  measuredAt: Date;
}

@Exclude()
export class PatientDiagnosisDto {
  @Expose()
  @ApiProperty()
  diagnosis: string;

  @Expose()
  @ApiProperty()
  visitDate: Date;

  @Expose()
  @ApiProperty()
  doctorName: string;

  @Expose()
  @ApiProperty()
  visitId: string;
}

@Exclude()
export class ActiveMedicationDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiPropertyOptional()
  dosage?: string;

  @Expose()
  @ApiPropertyOptional()
  frequency?: string;

  @Expose()
  @ApiPropertyOptional()
  duration?: string;

  @Expose()
  @ApiProperty()
  prescribedAt: Date;

  @Expose()
  @ApiProperty()
  doctorName: string;
}

@Exclude()
export class PatientHistoryStatsDto {
  @Expose()
  @ApiProperty()
  totalVisits: number;

  @Expose()
  @ApiProperty()
  completedVisits: number;

  @Expose()
  @ApiProperty()
  totalAllergies: number;

  @Expose()
  @ApiProperty()
  totalDiagnoses: number;

  @Expose()
  @ApiProperty()
  activeMedications: number;

  @Expose()
  @ApiPropertyOptional()
  lastVisitDate?: Date;
}

@Exclude()
export class PatientHistoryResponseDto {
  @Expose()
  @ApiProperty({ type: [HistoryVisitDto] })
  @Type(() => HistoryVisitDto)
  visits: HistoryVisitDto[];

  @Expose()
  @ApiProperty({ type: [PatientAllergyHistoryDto] })
  @Type(() => PatientAllergyHistoryDto)
  allergies: PatientAllergyHistoryDto[];

  @Expose()
  @ApiProperty({ type: [PatientParameterHistoryDto] })
  @Type(() => PatientParameterHistoryDto)
  parameters: PatientParameterHistoryDto[];

  @Expose()
  @ApiProperty({ type: [PatientDiagnosisDto] })
  @Type(() => PatientDiagnosisDto)
  diagnoses: PatientDiagnosisDto[];

  @Expose()
  @ApiProperty({ type: [ActiveMedicationDto] })
  @Type(() => ActiveMedicationDto)
  activeMedications: ActiveMedicationDto[];

  @Expose()
  @ApiProperty({ type: PatientHistoryStatsDto })
  @Type(() => PatientHistoryStatsDto)
  stats: PatientHistoryStatsDto;
}
