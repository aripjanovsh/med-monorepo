import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class AppointmentTypeResponseDto {
  @ApiProperty({
    description: "Уникальный идентификатор типа приёма",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Название типа приёма",
    example: "Первичный приём",
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: "Код типа приёма",
    example: "PRIMARY",
  })
  @Expose()
  code?: string;

  @ApiPropertyOptional({
    description: "Описание типа приёма",
    example: "Первичный приём нового пациента",
  })
  @Expose()
  description?: string;

  @ApiPropertyOptional({
    description: "Цвет для отображения в календаре",
    example: "#4CAF50",
  })
  @Expose()
  color?: string;

  @ApiPropertyOptional({
    description: "Длительность по умолчанию в минутах",
    example: 30,
  })
  @Expose()
  durationMin?: number;

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
    description: "Дата последнего обновления",
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
