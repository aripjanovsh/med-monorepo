import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsIn,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { Exclude, Expose } from "class-transformer";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";
import { AnalysisParameterDto } from "./create-analysis-template.dto";

@Exclude()
export class UpdateAnalysisTemplateDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Template name",
    example: "Общий анализ крови",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Template code (unique within organization)",
    example: "OAK-001",
  })
  @IsOptional()
  @IsString()
  code?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Template description",
    example: "Базовый анализ крови для оценки общего состояния здоровья",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Array of analysis parameters",
    type: [AnalysisParameterDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnalysisParameterDto)
  parameters?: AnalysisParameterDto[];

  @Expose()
  @ApiPropertyOptional({
    description: "Is template active",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
