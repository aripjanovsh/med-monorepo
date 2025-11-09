import { IsEnum, IsOptional, IsUUID } from "class-validator";
import { Expose, Exclude } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { FileCategory, FileEntityType } from "@prisma/client";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

@Exclude()
export class FileQueryDto extends PaginationDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Тип сущности",
    enum: FileEntityType,
  })
  @IsEnum(FileEntityType)
  @IsOptional()
  entityType?: FileEntityType;

  @Expose()
  @ApiPropertyOptional({ description: "ID сущности" })
  @IsUUID()
  @IsOptional()
  entityId?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Категория файла",
    enum: FileCategory,
  })
  @IsEnum(FileCategory)
  @IsOptional()
  category?: FileCategory;

  @Expose()
  @ApiPropertyOptional({ description: "ID загрузившего сотрудника" })
  @IsOptional()
  @IsUUID()
  uploadedById?: string;
}
