import { Exclude, Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";

@Exclude()
export class GlobalSearchQueryDto {
  @Expose()
  @InjectOrganizationId()
  organizationId!: string;

  @Expose()
  @ApiProperty({
    description: "Search query string",
    example: "Иванов",
  })
  @IsString()
  search: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Maximum number of results per category",
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class GlobalSearchPatientDto {
  @ApiProperty({ description: "Patient ID (UUID)" })
  id: string;

  @ApiProperty({ description: "Patient human-readable ID" })
  patientId: string;

  @ApiProperty({ description: "First name" })
  firstName: string;

  @ApiPropertyOptional({ description: "Middle name" })
  middleName?: string;

  @ApiProperty({ description: "Last name" })
  lastName: string;

  @ApiPropertyOptional({ description: "Phone number" })
  phone?: string;

  @ApiPropertyOptional({ description: "Date of birth" })
  dateOfBirth?: Date;
}

export class GlobalSearchEmployeeDto {
  @ApiProperty({ description: "Employee ID (UUID)" })
  id: string;

  @ApiProperty({ description: "Employee human-readable ID" })
  employeeId: string;

  @ApiProperty({ description: "First name" })
  firstName: string;

  @ApiPropertyOptional({ description: "Middle name" })
  middleName?: string;

  @ApiProperty({ description: "Last name" })
  lastName: string;

  @ApiPropertyOptional({ description: "Title/Position" })
  title?: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional({ description: "Avatar file ID" })
  avatarId?: string;
}

export class GlobalSearchResponseDto {
  @ApiProperty({
    description: "Found patients",
    type: [GlobalSearchPatientDto],
  })
  patients: GlobalSearchPatientDto[];

  @ApiProperty({
    description: "Found employees",
    type: [GlobalSearchEmployeeDto],
  })
  employees: GlobalSearchEmployeeDto[];
}
