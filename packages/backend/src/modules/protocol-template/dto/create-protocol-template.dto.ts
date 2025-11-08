import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsIn } from "class-validator";
import { Exclude, Expose } from "class-transformer";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";

@Exclude()
export class CreateProtocolTemplateDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({
    description: "Protocol template name",
    example: "Протокол первичного осмотра",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @ApiProperty({
    description: "Protocol template description",
    example: "Шаблон протокола для первичного осмотра пациента",
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @Expose()
  @ApiProperty({
    description: "Protocol content in JSON format",
    example:
      '{"type":"root","children":[{"type":"paragraph","children":[{"type":"text","text":"Sample protocol"}]}]}',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @Expose()
  @ApiProperty({
    description: "Template type",
    enum: ["formbuilder"],
    example: "formbuilder",
  })
  @IsString()
  @IsIn(["formbuilder"])
  @IsNotEmpty()
  templateType: string;
}
