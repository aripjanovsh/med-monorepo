import { Expose, Exclude, Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BaseResponseDto } from "@/common/dto/response.dto";

@Exclude()
class EmployeeBasicResponseDto extends BaseResponseDto {
  @Expose()
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string;

  @Expose()
  @ApiPropertyOptional({ example: "EMP001" })
  employeeId?: string;

  @Expose()
  @ApiProperty({ example: "Иван" })
  firstName: string;

  @Expose()
  @ApiPropertyOptional({ example: "Иванович" })
  middleName?: string;

  @Expose()
  @ApiProperty({ example: "Иванов" })
  lastName: string;
}

@Exclude()
export class DepartmentResponseDto extends BaseResponseDto {
  @Expose()
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string;

  @Expose()
  @ApiProperty({ example: "Лаборатория" })
  name: string;

  @Expose()
  @ApiPropertyOptional({ example: "LAB" })
  code?: string;

  @Expose()
  @ApiPropertyOptional({ example: "Клинико-диагностическая лаборатория" })
  description?: string;

  @Expose()
  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  headId?: string;

  @Expose()
  @ApiPropertyOptional({ type: EmployeeBasicResponseDto })
  @Type(() => EmployeeBasicResponseDto)
  head?: EmployeeBasicResponseDto;

  @Expose()
  @ApiProperty({ example: true })
  isActive: boolean;

  @Expose()
  @ApiPropertyOptional({ example: 1 })
  order?: number;

  @Expose()
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  organizationId: string;

  @Expose()
  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  updatedAt: Date;
}
