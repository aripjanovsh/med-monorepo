import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsUUID, IsEnum, IsNumber, IsBoolean } from "class-validator";
import { Expose, Exclude, Type, Transform } from "class-transformer";
import { ParameterSource } from "@prisma/client";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";
import { TransformDecimal } from "@/common/decorators";
import { SafeDecimal } from "@/common/types";

@Exclude()
export class CreatePatientParameterDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({ description: "Patient ID" })
  @IsUUID()
  @IsString()
  patientId: string;

  @Expose()
  @ApiPropertyOptional({ description: "Visit ID" })
  @IsOptional()
  @IsUUID()
  @IsString()
  visitId?: string;

  @Expose()
  @ApiPropertyOptional({ description: "Service Order ID" })
  @IsOptional()
  @IsUUID()
  @IsString()
  serviceOrderId?: string;

  @Expose()
  @ApiProperty({ description: "Parameter code", example: "PULSE" })
  @IsString()
  parameterCode: string;

  @Expose()
  @ApiPropertyOptional({ description: "Numeric value", example: 72 })
  @IsOptional()
  @TransformDecimal()
  @Type(() => SafeDecimal)
  @IsNumber()
  valueNumeric?: number;

  @Expose()
  @ApiPropertyOptional({ description: "Text value" })
  @IsOptional()
  @IsString()
  valueText?: string;

  @Expose()
  @ApiPropertyOptional({ description: "Boolean value" })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  valueBoolean?: boolean;

  @Expose()
  @ApiPropertyOptional({ description: "JSON value" })
  @IsOptional()
  valueJson?: any;

  @Expose()
  @ApiPropertyOptional({ description: "Unit", example: "bpm" })
  @IsOptional()
  @IsString()
  unit?: string;

  @Expose()
  @ApiPropertyOptional({ description: "Measurement date" })
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  measuredAt?: Date;

  @Expose()
  @ApiProperty({ description: "Employee ID who recorded" })
  @IsUUID()
  @IsString()
  recordedById: string;

  @Expose()
  @ApiPropertyOptional({ description: "Source", enum: ParameterSource })
  @IsOptional()
  @IsEnum(ParameterSource)
  source?: ParameterSource;
}
