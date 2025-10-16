import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class TitleResponseDto {
  @ApiProperty({
    description: "Уникальный идентификатор должности",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Название должности",
    example: "Врач-терапевт",
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: "Описание должности",
    example: "Врач общей практики, оказывающий первичную медицинскую помощь",
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: "Статус активности должности",
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: "Дата создания должности",
    example: "2023-12-01T10:00:00.000Z",
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: "Дата последнего обновления должности",
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
