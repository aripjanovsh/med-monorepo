import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class HolidayResponseDto {
  @ApiProperty({
    description: "Уникальный идентификатор",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Название праздника",
    example: "Новый год",
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: "Дата начала праздника",
    example: "2024-01-01",
  })
  @Expose()
  startsOn: Date;

  @ApiProperty({
    description: "Дата окончания праздника",
    example: "2024-01-01",
  })
  @Expose()
  until: Date;

  @ApiPropertyOptional({
    description: "Примечание",
    example: "Нерабочий день",
  })
  @Expose()
  note?: string;

  @ApiProperty({
    description: "Статус активности",
    example: true,
  })
  @Expose()
  isActive: boolean;

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
