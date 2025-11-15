import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID, IsEnum, IsDate } from "class-validator";
import { Expose, Exclude } from "class-transformer";
import { AppointmentStatus } from "@prisma/client";
import { TransformDate } from "@/common/decorators";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

@Exclude()
export class FindAllAppointmentDto extends PaginationDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;
  @Expose()
  @ApiPropertyOptional({
    description: "Filter by patient ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Filter by employee (doctor) ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Filter by service ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Filter by status",
    enum: AppointmentStatus,
    example: AppointmentStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @Expose()
  @ApiPropertyOptional({
    description: "Filter by scheduled date from",
    example: "2024-01-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDate()
  @TransformDate()
  scheduledFrom?: Date;

  @Expose()
  @ApiPropertyOptional({
    description: "Filter by scheduled date to",
    example: "2024-12-31T23:59:59.999Z",
  })
  @IsOptional()
  @IsDate()
  @TransformDate()
  scheduledTo?: Date;
}
