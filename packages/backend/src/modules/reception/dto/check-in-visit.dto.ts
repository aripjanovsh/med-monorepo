import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { AppointmentType } from "@prisma/client";

export class CheckInVisitDto {
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @IsNotEmpty()
  @IsUUID()
  employeeId: string;

  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @IsOptional()
  @IsString()
  roomNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
