import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class AppointmentCancelTypeResponseDto {
  @ApiProperty({
    description: "Уникальный идентификатор причины отмены",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Название причины отмены",
    example: "Болезнь пациента",
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: "Код причины отмены",
    example: "PATIENT_SICK",
  })
  @Expose()
  code?: string;

  @ApiPropertyOptional({
    description: "Описание причины отмены",
    example: "Пациент отменил приём по причине болезни",
  })
  @Expose()
  description?: string;

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
