import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { Expose, Exclude } from "class-transformer";
import { AppointmentStatus } from "@prisma/client";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

@Exclude()
export class UpdateAppointmentStatusDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({
    description: "New status of the appointment",
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED,
  })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @Expose()
  @ApiPropertyOptional({
    description: "ID of user performing the update",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Reason for cancellation (required if status is CANCELLED)",
    example: "Patient requested cancellation",
  })
  @IsOptional()
  @IsString()
  cancelReason?: string;
}
