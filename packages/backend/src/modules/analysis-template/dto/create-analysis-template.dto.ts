import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { Exclude, Expose } from "class-transformer";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";

// Reference Range DTO
export class ReferenceRangeDto {
  @Expose()
  @ApiProperty({ description: "Minimum value", example: 130, required: false })
  @IsOptional()
  min?: number;

  @Expose()
  @ApiProperty({ description: "Maximum value", example: 160, required: false })
  @IsOptional()
  max?: number;
}

// Reference Ranges for different demographics
export class ReferenceRangesDto {
  @Expose()
  @ApiProperty({ type: ReferenceRangeDto, required: false })
  @ValidateNested()
  @Type(() => ReferenceRangeDto)
  @IsOptional()
  men?: ReferenceRangeDto;

  @Expose()
  @ApiProperty({ type: ReferenceRangeDto, required: false })
  @ValidateNested()
  @Type(() => ReferenceRangeDto)
  @IsOptional()
  women?: ReferenceRangeDto;

  @Expose()
  @ApiProperty({ type: ReferenceRangeDto, required: false })
  @ValidateNested()
  @Type(() => ReferenceRangeDto)
  @IsOptional()
  children?: ReferenceRangeDto;
}

// Analysis Parameter DTO
export class AnalysisParameterDto {
  @Expose()
  @ApiProperty({ description: "Parameter name", example: "Гемоглобин" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @ApiProperty({ description: "Unit of measurement", example: "г/л", required: false })
  @IsString()
  @IsOptional()
  unit?: string;

  @Expose()
  @ApiProperty({
    description: "Parameter type",
    enum: ["NUMBER", "TEXT", "BOOLEAN"],
    example: "NUMBER",
  })
  @IsString()
  @IsIn(["NUMBER", "TEXT", "BOOLEAN"])
  @IsNotEmpty()
  type: string;

  @Expose()
  @ApiProperty({ type: ReferenceRangesDto, required: false })
  @ValidateNested()
  @Type(() => ReferenceRangesDto)
  @IsOptional()
  referenceRanges?: ReferenceRangesDto;

  @Expose()
  @ApiProperty({ description: "Is this parameter required", example: true })
  @IsNotEmpty()
  isRequired: boolean;
}

@Exclude()
export class CreateAnalysisTemplateDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({
    description: "Template name",
    example: "Общий анализ крови",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @ApiProperty({
    description: "Template code (unique within organization)",
    example: "OAK-001",
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @Expose()
  @ApiProperty({
    description: "Template description",
    example: "Базовый анализ крови для оценки общего состояния здоровья",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @Expose()
  @ApiProperty({
    description: "Analysis template content (JSON string with sections structure)",
    example: '{"version":1,"sections":[{"id":"section-1","title":"Основные показатели","parameters":[...]}]}',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
