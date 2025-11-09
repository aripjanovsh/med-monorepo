import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsBoolean,
} from "class-validator";
import { Exclude, Expose } from "class-transformer";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";

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
    description: "Analysis template content (JSON string with sections structure)",
    example: '{"version":1,"sections":[{"id":"section-1","title":"Основные показатели","parameters":[...]}]}',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Is template active",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
