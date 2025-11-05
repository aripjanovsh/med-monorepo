import { Type, Expose, Exclude } from "class-transformer";
import { IsOptional, IsDateString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

@Exclude()
export class DashboardStatsDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @ApiPropertyOptional({ description: "Date (ISO 8601), defaults to today" })
  @Expose()
  @IsOptional()
  @IsDateString()
  date?: string;
}
