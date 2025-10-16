import { ServiceType } from "@prisma/client";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class ServiceTypeResponseDto {
  @ApiProperty({
    description: "Уникальный идентификатор типа услуги",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Название типа услуги",
    example: "Консультация",
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: "Код типа услуги",
    example: "CONSULTATION",
  })
  @Expose()
  code?: string;

  @ApiPropertyOptional({
    description: "Описание типа услуги",
    example: "Врачебная консультация и осмотр пациента",
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: "Статус активности типа услуги",
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: "Дата создания типа услуги",
    example: "2023-12-01T10:00:00.000Z",
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: "Дата последнего обновления типа услуги",
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
