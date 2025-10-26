import {
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsString,
} from "class-validator";
import { Transform, Expose } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { InjectOrganizationId } from "../../../../common/decorators/inject-organization-id.decorator";

export class FindAllDepartmentsDto {
  @ApiPropertyOptional({
    description: "Поисковый запрос (название, код, описание)",
    example: "Лаборатория",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Фильтр по статусу активности",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === "true" || value === true) {
      return true;
    }
    if (value === "false" || value === false) {
      return false;
    }
    return undefined;
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Номер страницы",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number.parseInt(value, 10) || 1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Количество записей на странице",
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => Number.parseInt(value, 10) || 10)
  limit?: number = 10;

  @Expose()
  @InjectOrganizationId()
  organizationId: string;
}
