import {
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { Transform, Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";

export class CreateEmployeeLeaveDaysDto {
  @ApiProperty({
    description: "ID сотрудника",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @IsString({ message: "employeeId должен быть строкой" })
  employeeId: string;

  @ApiProperty({
    description: "ID типа отпуска",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @IsString({ message: "leaveTypeId должен быть строкой" })
  leaveTypeId: string;

  @ApiProperty({
    description: "Дата начала отпуска",
    example: "2024-07-01",
  })
  @IsDateString({}, { message: "startsOn должна быть валидной датой" })
  startsOn: string;

  @ApiProperty({
    description: "Дата окончания отпуска",
    example: "2024-07-14",
  })
  @IsDateString({}, { message: "until должна быть валидной датой" })
  until: string;

  @ApiPropertyOptional({
    description: "Примечание",
    example: "Ежегодный отпуск",
    maxLength: 500,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString({ message: "Примечание должно быть строкой" })
  @MaxLength(500, { message: "Примечание не должно превышать 500 символов" })
  @Transform(({ value }) => (value === null ? null : value?.trim()))
  note?: string | null;

  @Expose()
  @InjectOrganizationId()
  organizationId: string;
}
