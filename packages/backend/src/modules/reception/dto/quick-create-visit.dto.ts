import { Transform, Expose, Exclude } from "class-transformer";
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AppointmentType } from "@prisma/client";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

@Exclude()
export class QuickCreateVisitDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @ApiProperty({ description: "Patient ID" })
  @Expose()
  @IsString()
  patientId: string;

  @ApiProperty({ description: "Employee ID (doctor)" })
  @Expose()
  @IsString()
  employeeId: string;

  @ApiProperty({ description: "Service ID" })
  @Expose()
  @IsString()
  serviceId: string;

  @ApiProperty({ enum: AppointmentType, description: "Appointment type", default: "WITHOUT_QUEUE" })
  @Expose()
  @IsEnum(AppointmentType)
  type: AppointmentType;

  @ApiPropertyOptional({ description: "Room number" })
  @Expose()
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiPropertyOptional({ description: "Notes" })
  @Expose()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: "Create invoice automatically", default: false })
  @Expose()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true" || value === true) return true;
    if (value === "false" || value === false) return false;
    return value;
  })
  @IsBoolean()
  createInvoice?: boolean;
}
