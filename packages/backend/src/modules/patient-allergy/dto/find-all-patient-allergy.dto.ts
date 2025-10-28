import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID, IsString } from "class-validator";
import { Expose, Exclude } from "class-transformer";
import { PaginationDto } from "@/common/dto/pagination.dto";

@Exclude()
export class FindAllPatientAllergyDto extends PaginationDto {
  @Expose()
  @ApiPropertyOptional({ description: "Patient ID" })
  @IsOptional()
  @IsUUID()
  @IsString()
  patientId?: string;

  @Expose()
  @ApiPropertyOptional({ description: "Visit ID" })
  @IsOptional()
  @IsUUID()
  @IsString()
  visitId?: string;
}
