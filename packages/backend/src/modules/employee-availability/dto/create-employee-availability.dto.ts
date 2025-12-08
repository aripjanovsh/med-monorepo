import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
  IsInt,
  ArrayMinSize,
  Min,
  Max,
  MaxLength,
  Matches,
  IsEnum,
  ValidateIf,
} from "class-validator";
import { Transform, Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";

export class CreateEmployeeAvailabilityDto {
  @ApiProperty({
    description: "ID сотрудника",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @IsString({ message: "employeeId должен быть строкой" })
  employeeId: string;

  @ApiProperty({
    description: "Дата начала действия расписания",
    example: "2024-01-01",
  })
  @IsDateString({}, { message: "startsOn должна быть валидной датой" })
  startsOn: string;

  @ApiPropertyOptional({
    description: "Дата окончания действия расписания (null = бессрочно)",
    example: "2024-12-31",
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString({}, { message: "until должна быть валидной датой" })
  @Transform(({ value }) => (value === null ? null : value))
  until?: string | null;

  @ApiProperty({
    description: "Время начала работы (HH:mm)",
    example: "09:00",
  })
  @IsString({ message: "startTime должен быть строкой" })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "startTime должен быть в формате HH:mm",
  })
  startTime: string;

  @ApiProperty({
    description: "Время окончания работы (HH:mm)",
    example: "18:00",
  })
  @IsString({ message: "endTime должен быть строкой" })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "endTime должен быть в формате HH:mm",
  })
  endTime: string;

  @ApiProperty({
    description: "Дни недели",
    example: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    type: [String],
    enum: [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ],
  })
  @IsArray({ message: "repeatOn должен быть массивом" })
  @ArrayMinSize(1, { message: "Должен быть выбран хотя бы один день недели" })
  @IsString({ each: true, message: "Каждый элемент должен быть строкой" })
  @IsEnum(
    [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ],
    {
      each: true,
      message:
        "День недели должен быть одним из: monday, tuesday, wednesday, thursday, friday, saturday, sunday",
    }
  )
  repeatOn: string[];

  @ApiPropertyOptional({
    description: "Примечание",
    example: "Основной график работы",
    maxLength: 500,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString({ message: "Примечание должно быть строкой" })
  @MaxLength(500, { message: "Примечание не должно превышать 500 символов" })
  @Transform(({ value }) => (value === null ? null : value?.trim()))
  note?: string | null;

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
