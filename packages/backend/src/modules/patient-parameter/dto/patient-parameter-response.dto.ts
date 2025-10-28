import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Exclude, Type } from "class-transformer";
import { BaseResponseDto } from "@/common/dto/response.dto";
import { TransformDecimal } from "@/common/decorators";
import { SafeDecimal } from "@/common/types";

@Exclude()
export class PatientParameterResponseDto extends BaseResponseDto {
  @Expose()
  @ApiProperty()
  patientId: string;

  @Expose()
  @ApiPropertyOptional()
  visitId?: string;

  @Expose()
  @ApiPropertyOptional()
  serviceOrderId?: string;

  @Expose()
  @ApiProperty()
  parameterCode: string;

  @Expose()
  @ApiPropertyOptional()
  @TransformDecimal()
  @Type(() => SafeDecimal)
  valueNumeric?: number;

  @Expose()
  @ApiPropertyOptional()
  valueText?: string;

  @Expose()
  @ApiPropertyOptional()
  valueBoolean?: boolean;

  @Expose()
  @ApiPropertyOptional()
  valueJson?: any;

  @Expose()
  @ApiPropertyOptional()
  unit?: string;

  @Expose()
  @ApiProperty()
  measuredAt: Date;

  @Expose()
  @ApiProperty()
  recordedById: string;

  @Expose()
  @ApiProperty()
  source: string;

  @Expose()
  @ApiProperty()
  organizationId: string;
}
