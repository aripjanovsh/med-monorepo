import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsDate,
  IsUUID,
  IsInt,
  IsEnum,
  Min,
} from "class-validator";
import { Expose, Exclude, Type } from "class-transformer";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";
import { TransformEmpty, TransformDate } from "@/common/decorators";
import { AppointmentType } from "@prisma/client";

@Exclude()
export class CreateAppointmentDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({
    description: "Scheduled date and time",
    example: "2024-01-15T10:30:00.000Z",
  })
  @IsDate()
  @TransformDate()
  scheduledAt: Date;

  @Expose()
  @ApiProperty({
    description: "Duration in minutes",
    example: 30,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  duration: number;

  @Expose()
  @ApiPropertyOptional({
    description: "Appointment type",
    enum: AppointmentType,
    example: AppointmentType.STANDARD,
  })
  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @Expose()
  @ApiPropertyOptional({
    description: "Appointment notes",
    example: "Regular checkup",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Reason for appointment",
    example: "Annual health examination",
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Room number",
    example: "101",
  })
  @IsOptional()
  @IsString()
  roomNumber?: string;

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
    description: "Service ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  @TransformEmpty()
  serviceId?: string;

  @Expose()
  @ApiProperty({
    description: "User ID who creates the appointment",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsString()
  createdById: string;
}
