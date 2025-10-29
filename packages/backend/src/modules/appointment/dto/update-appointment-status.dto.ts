import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { Expose, Exclude } from "class-transformer";
import { AppointmentStatus } from "@prisma/client";

@Exclude()
export class UpdateAppointmentStatusDto {
  @Expose()
  @ApiProperty({
    description: "Appointment status",
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED,
  })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @Expose()
  @ApiPropertyOptional({
    description: "User ID who updates the status",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Cancel reason (required for CANCELLED status)",
    example: "Patient requested cancellation",
  })
  @IsOptional()
  @IsString()
  cancelReason?: string;
}
