import { Expose, Exclude, Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { FileCategory, FileEntityType } from "@prisma/client";

@Exclude()
export class FileResponseDto {
  @Expose()
  @ApiProperty({ description: "ID файла" })
  id: string;

  @Expose()
  @ApiProperty({ description: "Оригинальное имя файла" })
  filename: string;

  @Expose()
  @ApiProperty({ description: "Имя файла на диске" })
  storedName: string;

  @Expose()
  @ApiProperty({ description: "Путь к файлу" })
  path: string;

  @Expose()
  @ApiProperty({ description: "MIME тип файла" })
  mimeType: string;

  @Expose()
  @ApiProperty({ description: "Размер файла в байтах" })
  size: number;

  @Expose()
  @ApiPropertyOptional({ description: "Заголовок файла" })
  title?: string;

  @Expose()
  @ApiPropertyOptional({ description: "Описание файла" })
  description?: string;

  @Expose()
  @ApiProperty({ description: "Категория файла", enum: FileCategory })
  category: FileCategory;

  @Expose()
  @ApiPropertyOptional({ description: "Ширина изображения" })
  width?: number;

  @Expose()
  @ApiPropertyOptional({ description: "Высота изображения" })
  height?: number;

  @Expose()
  @ApiProperty({ description: "ID загрузившего сотрудника" })
  uploadedById: string;

  @Expose()
  @ApiPropertyOptional({ description: "Сотрудник, загрузивший файл" })
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
  };

  @Expose()
  @ApiProperty({ description: "Дата загрузки" })
  @Type(() => Date)
  uploadedAt: Date;

  @Expose()
  @ApiPropertyOptional({ description: "Тип сущности", enum: FileEntityType })
  entityType?: FileEntityType;

  @Expose()
  @ApiPropertyOptional({ description: "ID сущности" })
  entityId?: string;

  @Expose()
  @ApiPropertyOptional({ description: "Дата удаления" })
  @Type(() => Date)
  deletedAt?: Date;

  @Expose()
  @ApiPropertyOptional({ description: "ID удалившего сотрудника" })
  deletedById?: string;
}
