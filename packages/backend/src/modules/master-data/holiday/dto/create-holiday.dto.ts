import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform, Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { InjectOrganizationId } from "../../../../common/decorators/inject-organization-id.decorator";

export class CreateHolidayDto {
  @ApiProperty({
    description: "Название праздника",
    example: "Новый год",
    minLength: 2,
    maxLength: 200,
  })
  @IsString({ message: "Название должно быть строкой" })
  @MinLength(2, { message: "Название должно содержать минимум 2 символа" })
  @MaxLength(200, { message: "Название не должно превышать 200 символов" })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: "Дата начала праздника",
    example: "2024-01-01",
  })
  @IsDateString({}, { message: "startsOn должна быть валидной датой" })
  startsOn: string;

  @ApiProperty({
    description: "Дата окончания праздника",
    example: "2024-01-01",
  })
  @IsDateString({}, { message: "until должна быть валидной датой" })
  until: string;

  @ApiPropertyOptional({
    description: "Примечание",
    example: "Нерабочий день",
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: "Примечание должно быть строкой" })
  @MaxLength(500, { message: "Примечание не должно превышать 500 символов" })
  @Transform(({ value }) => value?.trim())
  note?: string;

  @ApiPropertyOptional({
    description: "Статус активности",
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
