import { IsOptional, IsString, IsEnum } from "class-validator";
import { Expose, Exclude } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { FileCategory } from "@prisma/client";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

@Exclude()
export class UpdateFileDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiPropertyOptional({ description: "Заголовок файла" })
  @IsOptional()
  @IsString()
  title?: string;

  @Expose()
  @ApiPropertyOptional({ description: "Описание файла" })
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Категория файла",
    enum: FileCategory,
  })
  @IsOptional()
  @IsEnum(FileCategory)
  category?: FileCategory;
}
