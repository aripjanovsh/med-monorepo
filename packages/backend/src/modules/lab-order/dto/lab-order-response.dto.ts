import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { LabStatus } from "@prisma/client";
import { BaseResponseDto } from "@/common/dto/response.dto";

@Exclude()
class SimpleVisitResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  visitDate: Date;

  @Expose()
  @ApiProperty()
  status: string;
}

@Exclude()
class SimpleEmployeeResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  employeeId?: string;

  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  middleName?: string;

  @Expose()
  @ApiProperty()
  lastName: string;
}

@Exclude()
export class LabOrderResponseDto extends BaseResponseDto {
  @Expose()
  @ApiProperty({
    description: "Test/Analysis name",
    example: "Complete Blood Count (CBC)",
  })
  testName: string;

  @Expose()
  @ApiProperty({
    description: "Lab order status",
    enum: LabStatus,
    example: LabStatus.PENDING,
  })
  status: LabStatus;

  @Expose()
  @ApiPropertyOptional({
    description: "Additional notes",
    example: "Fasting required",
  })
  notes?: string;

  @Expose()
  @ApiProperty({
    description: "Visit information",
    type: SimpleVisitResponseDto,
  })
  @Type(() => SimpleVisitResponseDto)
  visit: SimpleVisitResponseDto;

  @Expose()
  @ApiProperty({
    description: "Doctor who created the lab order",
    type: SimpleEmployeeResponseDto,
  })
  @Type(() => SimpleEmployeeResponseDto)
  createdBy: SimpleEmployeeResponseDto;
}
