import { Expose, Exclude } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

@Exclude()
export class VisitStatsQueryDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @ApiPropertyOptional({
    description: "Start date for trend analysis (ISO 8601)",
  })
  @Expose()
  startDate?: string;

  @ApiPropertyOptional({
    description: "End date for trend analysis (ISO 8601)",
  })
  @Expose()
  endDate?: string;
}
