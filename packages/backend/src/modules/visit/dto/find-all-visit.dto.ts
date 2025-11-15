import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsArray,
} from "class-validator";
import { Expose, Exclude, Type, Transform } from "class-transformer";
import { VisitStatus } from "@prisma/client";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { TransformDate } from "@/common/decorators";

export enum VisitIncludeRelation {
  PATIENT = "patient",
  EMPLOYEE = "employee",
  APPOINTMENT = "appointment",
  PROTOCOL = "protocol",
  ORGANIZATION = "organization",
  PRESCRIPTIONS = "prescriptions",
  SERVICE_ORDERS = "serviceOrders",
}

@Exclude()
export class FindAllVisitDto extends PaginationDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Filter by visit status",
    enum: VisitStatus,
    example: VisitStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(VisitStatus)
  status?: VisitStatus;

  @Expose()
  @ApiPropertyOptional({
    description: "Filter by patient ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Filter by doctor (employee) ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Filter by date from",
    example: "2024-01-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  @TransformDate()
  dateFrom?: Date;

  @Expose()
  @ApiPropertyOptional({
    description: "Filter by date to",
    example: "2024-12-31T23:59:59.999Z",
  })
  @IsOptional()
  @IsDateString()
  @TransformDate()
  dateTo?: Date;

  @Expose()
  @ApiPropertyOptional({
    description: "Relations to include in the response",
    enum: VisitIncludeRelation,
    isArray: true,
    example: [VisitIncludeRelation.PATIENT, VisitIncludeRelation.EMPLOYEE],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(VisitIncludeRelation, { each: true })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.split(",").map((v) => v.trim());
    }
    return value;
  })
  include?: VisitIncludeRelation[];
}
