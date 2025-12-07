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

export class EmployeeAvailabilityResponseDto {
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
    description: "Дата начала действия расписания",
    example: "2024-01-01",
  })
  @Expose()
  startsOn: Date;

  @ApiPropertyOptional({
    description: "Дата окончания действия расписания",
    example: "2024-12-31",
  })
  @Expose()
  until?: Date;

  @ApiProperty({
    description: "Время начала работы",
    example: "09:00",
  })
  @Expose()
  startTime: string;

  @ApiProperty({
    description: "Время окончания работы",
    example: "18:00",
  })
  @Expose()
  endTime: string;

  @ApiProperty({
    description: "Дни недели",
    example: [1, 2, 3, 4, 5],
    type: [Number],
  })
  @Expose()
  repeatOn: number[];

  @ApiPropertyOptional({
    description: "Примечание",
    example: "Основной график работы",
  })
  @Expose()
  note?: string;

  @ApiProperty({
    description: "Статус активности",
    example: true,
  })
  @Expose()
  isActive: boolean;

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
}
