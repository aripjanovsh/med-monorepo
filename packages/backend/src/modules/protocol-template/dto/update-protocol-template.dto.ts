import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsBoolean, IsIn } from "class-validator";
import { Exclude, Expose } from "class-transformer";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";

@Exclude()
export class UpdateProtocolTemplateDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Protocol template name",
    example: "Протокол первичного осмотра",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Protocol template description",
    example: "Шаблон протокола для первичного осмотра пациента",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Protocol content in JSON format",
    example:
      '{"type":"root","children":[{"type":"paragraph","children":[{"type":"text","text":"Sample protocol"}]}]}',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Template type",
    enum: ["formbuilder"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["formbuilder"])
  templateType?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Is protocol template active",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
