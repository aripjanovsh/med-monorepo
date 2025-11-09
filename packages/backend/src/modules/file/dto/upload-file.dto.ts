import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { Expose, Exclude } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { FileCategory, FileEntityType } from "@prisma/client";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

@Exclude()
export class UploadFileDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({
    description: "Категория файла",
    enum: FileCategory,
    example: FileCategory.DOCUMENT,
  })
  @IsEnum(FileCategory)
  category: FileCategory;

  @Expose()
  @ApiPropertyOptional({ description: "Заголовок файла", example: "Результат анализа" })
  @IsOptional()
  @IsString()
  title?: string;

  @Expose()
  @ApiPropertyOptional({ description: "Описание файла", example: "Анализ крови от 01.11.2024" })
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Тип сущности к которой привязан файл",
    enum: FileEntityType,
    example: FileEntityType.PATIENT,
  })
  @IsEnum(FileEntityType)
  @IsOptional()
  entityType?: FileEntityType;

  @Expose()
  @ApiPropertyOptional({ description: "ID сущности к которой привязан файл" })
  @IsUUID()
  @IsOptional()
  entityId?: string;
}
