import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
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
export class PrescriptionResponseDto extends BaseResponseDto {
  @Expose()
  @ApiProperty({
    description: "Medication name",
    example: "Aspirin",
  })
  name: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Dosage information",
    example: "500mg",
  })
  dosage?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Frequency of intake",
    example: "2 times per day",
  })
  frequency?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Duration of treatment",
    example: "7 days",
  })
  duration?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Additional notes",
    example: "Take with food",
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
    description: "Doctor who created the prescription",
    type: SimpleEmployeeResponseDto,
  })
  @Type(() => SimpleEmployeeResponseDto)
  createdBy: SimpleEmployeeResponseDto;
}
