import { IsOptional, IsDateString } from "class-validator";
import { Expose } from "class-transformer";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

export class DoctorQueueQueryDto {
  @Expose()
  @InjectOrganizationId()
  organizationId!: string;

  @Expose()
  @IsOptional()
  @IsDateString()
  date?: string;
}
