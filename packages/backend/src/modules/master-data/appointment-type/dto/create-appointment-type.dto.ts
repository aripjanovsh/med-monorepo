import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
  MinLength,
  Min,
  Matches,
} from "class-validator";
import { Transform, Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { InjectOrganizationId } from "../../../../common/decorators/inject-organization-id.decorator";

export class CreateAppointmentTypeDto {
  @ApiProperty({
    description: "Название типа приёма",
    example: "Первичный приём",
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: "Название должно быть строкой" })
  @MinLength(2, { message: "Название должно содержать минимум 2 символа" })
  @MaxLength(100, { message: "Название не должно превышать 100 символов" })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({
    description: "Код типа приёма",
    example: "PRIMARY",
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: "Код должен быть строкой" })
  @MaxLength(50, { message: "Код не должен превышать 50 символов" })
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  code?: string;

  @ApiPropertyOptional({
    description: "Описание типа приёма",
    example: "Первичный приём нового пациента",
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: "Описание должно быть строкой" })
  @MaxLength(500, { message: "Описание не должно превышать 500 символов" })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({
    description: "Цвет для отображения в календаре (hex формат)",
    example: "#4CAF50",
  })
  @IsOptional()
  @IsString({ message: "Цвет должен быть строкой" })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: "Цвет должен быть в формате hex (#RRGGBB)",
  })
  color?: string;

  @ApiPropertyOptional({
    description: "Длительность по умолчанию в минутах",
    example: 30,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: "Длительность должна быть целым числом" })
  @Min(1, { message: "Длительность должна быть больше 0" })
  durationMin?: number;

  @ApiPropertyOptional({
    description: "Статус активности",
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: "Статус должен быть boolean значением" })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Порядок сортировки",
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: "Порядок должен быть целым числом" })
  order?: number;

  @Expose()
  @InjectOrganizationId()
  organizationId: string;
}
