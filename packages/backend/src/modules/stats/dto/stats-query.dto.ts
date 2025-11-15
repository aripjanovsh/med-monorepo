import { Expose, Exclude, Type, Transform } from "class-transformer";
import { IsDateString, IsOptional, IsEnum, IsArray } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

export enum StatsType {
  PATIENTS_COUNT = "PATIENTS_COUNT",
  VISITS_COUNT = "VISITS_COUNT",
  APPOINTMENTS_COUNT = "APPOINTMENTS_COUNT",
  REVENUE_TOTAL = "REVENUE_TOTAL",
  UNPAID_INVOICES_COUNT = "UNPAID_INVOICES_COUNT",
  PATIENTS_IN_QUEUE = "PATIENTS_IN_QUEUE",
  COMPLETED_VISITS = "COMPLETED_VISITS",
  CANCELED_APPOINTMENTS = "CANCELED_APPOINTMENTS",
  NO_SHOW_APPOINTMENTS = "NO_SHOW_APPOINTMENTS",
}

@Exclude()
export class StatsQueryDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @ApiPropertyOptional({
    description:
      "Array of stat types to retrieve. If not specified, all stats are returned.",
    enum: StatsType,
    isArray: true,
  })
  @Expose()
  @IsOptional()
  @IsArray()
  @IsEnum(StatsType, { each: true })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.split(",");
    }
    return value;
  })
  types?: StatsType[];

  @ApiPropertyOptional({
    description: "Start date (ISO 8601), defaults to today",
  })
  @Expose()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: "End date (ISO 8601), defaults to today",
  })
  @Expose()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
