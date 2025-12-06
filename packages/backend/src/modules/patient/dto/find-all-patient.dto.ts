import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsEnum, IsString } from "class-validator";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";
import { Exclude, Expose } from "class-transformer";
import { FindAllQueryDto } from "../../../common/dto/pagination.dto";

@Exclude()
export class FindAllPatientDto extends FindAllQueryDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({
    description: "Search by patient name, patient ID, or phone",
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @Expose()
  @ApiProperty({
    description: "Filter by patient status",
    required: false,
    example: "ACTIVE",
  })
  @IsOptional()
  @IsString()
  status?: string;

  @Expose()
  @ApiProperty({
    description: "Filter by gender",
    required: false,
    example: "MALE",
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @Expose()
  @ApiProperty({
    description: "Filter by doctor/employee ID",
    required: false,
  })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @Expose()
  @ApiProperty({
    description: "Filter patients by visit date from (inclusive, ISO)",
    required: false,
    example: "2025-01-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsString()
  visitDateFrom?: string;

  @Expose()
  @ApiProperty({
    description: "Filter patients by visit date to (inclusive, ISO)",
    required: false,
    example: "2025-01-31T23:59:59.999Z",
  })
  @IsOptional()
  @IsString()
  visitDateTo?: string;
}
