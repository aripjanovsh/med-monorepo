import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";
import { Expose, Exclude } from "class-transformer";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

@Exclude()
export class PatientDashboardStatsQueryDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({ description: "Patient ID" })
  @IsUUID()
  patientId: string;
}
