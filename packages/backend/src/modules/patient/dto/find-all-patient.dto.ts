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
    description: "Sort by field",
    required: false,
    example: "firstName",
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Expose()
  @ApiProperty({
    description: "Sort order",
    required: false,
    example: "asc",
    enum: ["asc", "desc"],
  })
  @IsOptional()
  @IsEnum(["asc", "desc"])
  sortOrder?: "asc" | "desc";
}
