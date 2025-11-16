import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsEnum,
  IsString,
  IsUUID,
  IsBoolean,
} from "class-validator";
import { AuditAction } from "@prisma/client";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";
import { Exclude, Expose, Transform } from "class-transformer";
import { FindAllQueryDto } from "@/common/dto/pagination.dto";
import { IsDateOrDateTimeString, TransformDate } from "@/common/decorators";

@Exclude()
export class FindAllAuditLogDto extends FindAllQueryDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({
    description: "Filter by action",
    required: false,
    enum: AuditAction,
  })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @Expose()
  @ApiProperty({
    description: "Filter by resource type",
    required: false,
    example: "Patient",
  })
  @IsOptional()
  @IsString()
  resource?: string;

  @Expose()
  @ApiProperty({
    description: "Filter by resource ID",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  resourceId?: string;

  @Expose()
  @ApiProperty({
    description: "Filter by user ID",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Expose()
  @ApiProperty({
    description: "Filter by employee ID",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @Expose()
  @ApiProperty({
    description: "Filter by date from",
    required: false,
    example: "2024-01-01",
  })
  @IsOptional()
  @IsDateOrDateTimeString()
  @TransformDate()
  dateFrom?: Date;

  @Expose()
  @ApiProperty({
    description: "Filter by date to",
    required: false,
    example: "2024-12-31",
  })
  @IsOptional()
  @IsDateOrDateTimeString()
  @TransformDate()
  dateTo?: Date;

  @Expose()
  @ApiProperty({
    description: "Include related resource data (Patient, Employee, etc.)",
    required: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  includeResource?: boolean;
}
