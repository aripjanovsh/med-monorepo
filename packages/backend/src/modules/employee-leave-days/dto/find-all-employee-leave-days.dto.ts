import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from "class-validator";
import { Type, Expose } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";

export class FindAllEmployeeLeaveDaysDto {
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
    description: "Фильтр по типу отпуска",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @IsOptional()
  @IsString({ message: "leaveTypeId должен быть строкой" })
  leaveTypeId?: string;

  @ApiPropertyOptional({
    description: "Фильтр отпусков начиная с даты",
    example: "2024-01-01",
  })
  @IsOptional()
  @IsDateString({}, { message: "from должна быть валидной датой" })
  from?: string;

  @ApiPropertyOptional({
    description: "Фильтр отпусков до даты",
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
