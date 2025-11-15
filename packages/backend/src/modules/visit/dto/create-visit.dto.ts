import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsDate, IsUUID, IsEnum } from "class-validator";
import { Expose, Exclude } from "class-transformer";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";
import { TransformEmpty, TransformDate } from "@/common/decorators";
import { VisitType } from "@prisma/client";

@Exclude()
export class CreateVisitDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiPropertyOptional({
    description:
      "Appointment ID (optional, can create visit without appointment)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  @TransformEmpty()
  appointmentId?: string;

  @Expose()
  @ApiProperty({
    description: "Patient ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsString()
  patientId: string;

  @Expose()
  @ApiProperty({
    description: "Doctor (Employee) ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsString()
  employeeId: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Visit date and time",
    example: "2024-01-15T10:30:00.000Z",
  })
  @IsOptional()
  @IsDate()
  @TransformDate()
  visitDate?: Date;

  @Expose()
  @ApiPropertyOptional({
    description: "Visit notes",
    example: "Patient came for regular checkup",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Service ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  @TransformEmpty()
  serviceId?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Room number",
    example: "101",
  })
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Visit type",
    enum: VisitType,
    example: VisitType.STANDARD,
  })
  @IsOptional()
  @IsEnum(VisitType)
  type?: VisitType;
}
