import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { ServiceTypeEnum } from "./create-service.dto";
import { TransformDecimal } from "@/common/decorators";
import { SafeDecimal } from "@/common/types";

class DepartmentResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiPropertyOptional()
  @Expose()
  code?: string;
}

export class ServiceResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  code: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiPropertyOptional()
  @Expose()
  description?: string;

  @ApiProperty({ enum: ServiceTypeEnum })
  @Expose()
  type: ServiceTypeEnum;

  @ApiPropertyOptional()
  @Expose()
  @TransformDecimal()
  @Type(() => SafeDecimal)
  price?: number;

  @ApiPropertyOptional()
  @Expose()
  durationMin?: number;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional()
  @Expose()
  departmentId?: string;

  @ApiPropertyOptional({ type: DepartmentResponseDto })
  @Expose()
  @Type(() => DepartmentResponseDto)
  department?: DepartmentResponseDto;

  @ApiProperty()
  @Expose()
  organizationId: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
