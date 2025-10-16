import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform, Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { InjectOrganizationId } from "../../../../common/decorators/inject-organization-id.decorator";

export class CreateServiceTypeDto {
  @ApiProperty({
    description: "Название типа услуги",
    example: "Консультация",
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: "Название типа услуги должно быть строкой" })
  @MinLength(2, {
    message: "Название типа услуги должно содержать минимум 2 символа",
  })
  @MaxLength(100, {
    message: "Название типа услуги не должно превышать 100 символов",
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({
    description: "Код типа услуги",
    example: "CONSULTATION",
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: "Код типа услуги должен быть строкой" })
  @MaxLength(50, { message: "Код типа услуги не должен превышать 50 символов" })
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  code?: string;

  @ApiPropertyOptional({
    description: "Описание типа услуги",
    example: "Врачебная консультация и осмотр пациента",
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: "Описание должно быть строкой" })
  @MaxLength(500, { message: "Описание не должно превышать 500 символов" })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({
    description: "Статус активности типа услуги",
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
