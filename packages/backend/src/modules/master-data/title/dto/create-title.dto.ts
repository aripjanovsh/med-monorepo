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

export class CreateTitleDto {
  @ApiProperty({
    description: "Название должности",
    example: "Врач-терапевт",
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: "Название должности должно быть строкой" })
  @MinLength(2, {
    message: "Название должности должно содержать минимум 2 символа",
  })
  @MaxLength(100, {
    message: "Название должности не должно превышать 100 символов",
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({
    description: "Описание должности",
    example: "Врач общей практики, оказывающий первичную медицинскую помощь",
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: "Описание должно быть строкой" })
  @MaxLength(500, { message: "Описание не должно превышать 500 символов" })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({
    description: "Статус активности должности",
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
