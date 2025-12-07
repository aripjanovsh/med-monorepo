import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

class EmployeeShortDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiPropertyOptional()
  @Expose()
  middleName?: string;

  @ApiProperty()
  @Expose()
  lastName: string;
}

class LeaveTypeShortDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiPropertyOptional()
  @Expose()
  code?: string;

  @ApiPropertyOptional()
  @Expose()
  color?: string;

  @ApiProperty()
  @Expose()
  isPaid: boolean;
}

export class EmployeeLeaveDaysResponseDto {
  @ApiProperty({
    description: "Уникальный идентификатор",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "ID сотрудника",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @Expose()
  employeeId: string;

  @ApiProperty({
    description: "ID типа отпуска",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @Expose()
  leaveTypeId: string;

  @ApiProperty({
    description: "Дата начала отпуска",
    example: "2024-07-01",
  })
  @Expose()
  startsOn: Date;

  @ApiProperty({
    description: "Дата окончания отпуска",
    example: "2024-07-14",
  })
  @Expose()
  until: Date;

  @ApiPropertyOptional({
    description: "Примечание",
    example: "Ежегодный отпуск",
  })
  @Expose()
  note?: string;

  @ApiProperty({
    description: "Дата создания",
    example: "2023-12-01T10:00:00.000Z",
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: "Дата обновления",
    example: "2023-12-01T10:00:00.000Z",
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    description: "Идентификатор организации",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @Expose()
  organizationId: string;

  @ApiPropertyOptional({
    description: "Данные сотрудника",
    type: EmployeeShortDto,
  })
  @Expose()
  @Type(() => EmployeeShortDto)
  employee?: EmployeeShortDto;

  @ApiPropertyOptional({
    description: "Данные типа отпуска",
    type: LeaveTypeShortDto,
  })
  @Expose()
  @Type(() => LeaveTypeShortDto)
  leaveType?: LeaveTypeShortDto;
}
