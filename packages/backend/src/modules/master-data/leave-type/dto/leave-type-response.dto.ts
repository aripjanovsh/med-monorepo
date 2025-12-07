import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class LeaveTypeResponseDto {
  @ApiProperty({
    description: "Уникальный идентификатор",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Название типа отпуска",
    example: "Ежегодный отпуск",
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: "Код типа отпуска",
    example: "ANNUAL",
  })
  @Expose()
  code?: string;

  @ApiPropertyOptional({
    description: "Описание",
    example: "Ежегодный оплачиваемый отпуск",
  })
  @Expose()
  description?: string;

  @ApiPropertyOptional({
    description: "Цвет для отображения",
    example: "#4CAF50",
  })
  @Expose()
  color?: string;

  @ApiProperty({
    description: "Оплачиваемый отпуск",
    example: true,
  })
  @Expose()
  isPaid: boolean;

  @ApiProperty({
    description: "Статус активности",
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({
    description: "Порядок сортировки",
    example: 1,
  })
  @Expose()
  order?: number;

  @ApiProperty({
    description: "Дата создания",
    example: "2023-12-01T10:00:00.000Z",
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: "Дата обновления",
    example: "2023-12-01T10:00:00.000Z",
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    description: "Идентификатор организации",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @Expose()
  organizationId: string;
}
