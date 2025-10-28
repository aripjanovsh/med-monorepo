import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Exclude } from "class-transformer";
import { BaseResponseDto } from "@/common/dto/response.dto";

@Exclude()
export class PatientAllergyResponseDto extends BaseResponseDto {
  @Expose()
  @ApiProperty()
  patientId: string;

  @Expose()
  @ApiPropertyOptional()
  visitId?: string;

  @Expose()
  @ApiProperty()
  recordedById: string;

  @Expose()
  @ApiProperty()
  substance: string;

  @Expose()
  @ApiPropertyOptional()
  reaction?: string;

  @Expose()
  @ApiPropertyOptional()
  severity?: string;

  @Expose()
  @ApiPropertyOptional()
  note?: string;

  @Expose()
  @ApiProperty()
  organizationId: string;
}
