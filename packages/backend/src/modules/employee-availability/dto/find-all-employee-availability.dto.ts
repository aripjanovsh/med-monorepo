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
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";

export class FindAllEmployeeAvailabilityDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @ApiPropertyOptional({
    description: "Фильтр по ID сотрудника",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @IsOptional()
  @IsString({ message: "employeeId должен быть строкой" })
  employeeId?: string;

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
    description: "Фильтр расписаний, действующих на дату",
    example: "2024-06-15",
  })
  @IsOptional()
  @IsDateString({}, { message: "date должна быть валидной датой" })
  date?: string;

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
