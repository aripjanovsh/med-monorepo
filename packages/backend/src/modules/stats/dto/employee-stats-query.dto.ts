import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsUUID } from "class-validator";
import { Expose, Exclude } from "class-transformer";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

export enum StatsPeriod {
  WEEK = "week",
  MONTH = "month",
  THREE_MONTHS = "3months",
  SIX_MONTHS = "6months",
  YEAR = "year",
}

@Exclude()
export class EmployeeStatsQueryDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({ description: "Employee ID" })
  @IsUUID()
  employeeId: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Period for statistics",
    enum: StatsPeriod,
    default: StatsPeriod.MONTH,
  })
  @IsOptional()
  @IsEnum(StatsPeriod)
  period?: StatsPeriod = StatsPeriod.MONTH;
}
