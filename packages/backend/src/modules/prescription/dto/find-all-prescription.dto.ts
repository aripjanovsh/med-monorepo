import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";
import { Expose, Exclude } from "class-transformer";
import { PaginationDto } from "@/common/dto/pagination.dto";

@Exclude()
export class FindAllPrescriptionDto extends PaginationDto {
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
