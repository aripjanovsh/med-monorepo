import { IsOptional, IsString, IsBoolean, IsEnum, IsUUID } from "class-validator";
import { Transform, Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { InjectOrganizationId } from "../../../../common/decorators/inject-organization-id.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { ServiceTypeEnum } from "./create-service.dto";

export class FindAllServicesDto extends PaginationDto {
  @ApiPropertyOptional({
    description: "ID организации для фильтрации",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsOptional()
  @IsUUID("4", { message: "ID организации должен быть валидным UUID" })
  @InjectOrganizationId()
  organizationId?: string;

  @ApiPropertyOptional({
    description: "Поиск по названию или коду услуги",
    example: "консультация",
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
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean({ message: "Статус должен быть boolean значением" })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Фильтр по типу услуги",
    enum: ServiceTypeEnum,
    example: ServiceTypeEnum.CONSULTATION,
  })
  @IsOptional()
  @IsEnum(ServiceTypeEnum, { message: "Неверный тип услуги" })
  type?: ServiceTypeEnum;

  @ApiPropertyOptional({
    description: "Фильтр по ID отделения",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsOptional()
  @IsUUID("4", { message: "ID отделения должен быть валидным UUID" })
  departmentId?: string;
}
