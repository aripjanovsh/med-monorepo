import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
  IsInt,
  IsUUID,
} from "class-validator";
import { Transform, Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { InjectOrganizationId } from "../../../../common/decorators/inject-organization-id.decorator";
import { TransformEmpty } from "@/common/decorators";

export class CreateDepartmentDto {
  @ApiProperty({
    description: "Название отделения",
    example: "Лаборатория",
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: "Название отделения должно быть строкой" })
  @MinLength(2, {
    message: "Название отделения должно содержать минимум 2 символа",
  })
  @MaxLength(100, {
    message: "Название отделения не должно превышать 100 символов",
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({
    description: "Код отделения",
    example: "LAB",
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: "Код отделения должен быть строкой" })
  @MaxLength(20, { message: "Код отделения не должен превышать 20 символов" })
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  code?: string;

  @ApiPropertyOptional({
    description: "Описание отделения",
    example: "Клинико-диагностическая лаборатория",
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: "Описание должно быть строкой" })
  @MaxLength(500, { message: "Описание не должно превышать 500 символов" })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({
    description: "ID заведующего отделением",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsOptional()
  @IsUUID("4", { message: "ID заведующего должен быть валидным UUID" })
  @TransformEmpty()
  headId?: string;

  @ApiPropertyOptional({
    description: "Порядок сортировки",
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: "Порядок должен быть целым числом" })
  @Transform(({ value }) => (value ? Number.parseInt(value, 10) : undefined))
  order?: number;

  @ApiPropertyOptional({
    description: "Статус активности отделения",
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
