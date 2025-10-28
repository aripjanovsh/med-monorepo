import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID, IsString } from "class-validator";
import { Expose, Exclude } from "class-transformer";
import { PaginationDto } from "@/common/dto/pagination.dto";

@Exclude()
export class FindAllPatientParameterDto extends PaginationDto {
  @Expose()
  @ApiPropertyOptional({ description: "Patient ID" })
  @IsOptional()
  @IsUUID()
  @IsString()
  patientId?: string;

  @Expose()
  @ApiPropertyOptional({ description: "Parameter code", example: "PULSE" })
  @IsOptional()
  @IsString()
  parameterCode?: string;

  @Expose()
  @ApiPropertyOptional({ description: "Visit ID" })
  @IsOptional()
  @IsUUID()
  @IsString()
  visitId?: string;

  @Expose()
  @ApiPropertyOptional({ description: "Start date" })
  @IsOptional()
  from?: string;

  @Expose()
  @ApiPropertyOptional({ description: "End date" })
  @IsOptional()
  to?: string;
}
