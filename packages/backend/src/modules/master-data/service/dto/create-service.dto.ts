import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
  IsEnum,
  IsNumber,
  IsUUID,
  Min,
} from "class-validator";
import { Transform, Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { InjectOrganizationId } from "../../../../common/decorators/inject-organization-id.decorator";
import { TransformEmpty } from "@/common/decorators";
import { Type } from "class-transformer";

// Enum будет доступен из @prisma/client после prisma generate
export enum ServiceTypeEnum {
  CONSULTATION = "CONSULTATION",
  LAB = "LAB",
  DIAGNOSTIC = "DIAGNOSTIC",
  PROCEDURE = "PROCEDURE",
  OTHER = "OTHER",
}

export class CreateServiceDto {
  @ApiProperty({
    description: "Код услуги",
    example: "CONS-001",
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: "Код услуги должен быть строкой" })
  @MinLength(2, {
    message: "Код услуги должен содержать минимум 2 символа",
  })
  @MaxLength(50, {
    message: "Код услуги не должен превышать 50 символов",
  })
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  code: string;

  @ApiProperty({
    description: "Название услуги",
    example: "Консультация терапевта",
    minLength: 2,
    maxLength: 200,
  })
  @IsString({ message: "Название услуги должно быть строкой" })
  @MinLength(2, {
    message: "Название услуги должно содержать минимум 2 символа",
  })
  @MaxLength(200, {
    message: "Название услуги не должно превышать 200 символов",
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: "Тип услуги",
    enum: ServiceTypeEnum,
    example: ServiceTypeEnum.CONSULTATION,
  })
  @IsEnum(ServiceTypeEnum, { message: "Неверный тип услуги" })
  type: ServiceTypeEnum;

  @ApiPropertyOptional({
    description: "Описание услуги",
    example: "Первичная консультация врача-терапевта",
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: "Описание должно быть строкой" })
  @MaxLength(1000, { message: "Описание не должно превышать 1000 символов" })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({
    description: "ID отделения",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsOptional()
  @IsUUID("4", { message: "ID отделения должен быть валидным UUID" })
  @TransformEmpty()
  departmentId?: string;

  @ApiPropertyOptional({
    description: "Стоимость услуги",
    example: 150000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: "Стоимость должна быть числом" })
  @Min(0, { message: "Стоимость не может быть отрицательной" })
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({
    description: "Длительность услуги в минутах",
    example: 30,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: "Длительность должна быть числом" })
  @Min(1, { message: "Длительность должна быть минимум 1 минута" })
  @Type(() => Number)
  durationMin?: number;

  @ApiPropertyOptional({
    description: "Статус активности услуги",
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: "Статус должен быть boolean значением" })
  isActive?: boolean;

  @Expose()
  @InjectOrganizationId()
  organizationId: string;
}
