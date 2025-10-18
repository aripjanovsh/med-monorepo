import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsEnum, IsUUID } from "class-validator";
import { Expose, Exclude } from "class-transformer";
import { LabStatus } from "@prisma/client";
import { PaginationDto } from "@/common/dto/pagination.dto";

@Exclude()
export class FindAllLabOrderDto extends PaginationDto {
  @Expose()
  @ApiPropertyOptional({
    description: "Filter by lab order status",
    enum: LabStatus,
    example: LabStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(LabStatus)
  status?: LabStatus;

  @Expose()
  @ApiPropertyOptional({
    description: "Filter by visit ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  visitId?: string;

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
    description: "Filter by doctor (employee) ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  employeeId?: string;
}
