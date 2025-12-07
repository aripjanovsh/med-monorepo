import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from "class-validator";
import { Transform, Type, Expose } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { InjectOrganizationId } from "../../../../common/decorators/inject-organization-id.decorator";

export class FindAllHolidaysDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @ApiPropertyOptional({
    description: "Поисковый запрос",
    example: "Новый год",
  })
  @IsOptional()
  @IsString({ message: "Поисковый запрос должен быть строкой" })
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: "Фильтр по статусу активности",
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: "Фильтр по статусу должен быть boolean значением" })
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Фильтр праздников начиная с даты",
    example: "2024-01-01",
  })
  @IsOptional()
  @IsDateString({}, { message: "from должна быть валидной датой" })
  from?: string;

  @ApiPropertyOptional({
    description: "Фильтр праздников до даты",
    example: "2024-12-31",
  })
  @IsOptional()
  @IsDateString({}, { message: "to должна быть валидной датой" })
  to?: string;

  @ApiPropertyOptional({
    description: "Номер страницы",
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Номер страницы должен быть числом" })
  @Min(1, { message: "Номер страницы должен быть больше 0" })
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Количество элементов на странице",
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Размер страницы должен быть числом" })
  @Min(1, { message: "Размер страницы должен быть больше 0" })
  @Max(100, { message: "Размер страницы не должен превышать 100" })
  limit?: number = 10;
}
