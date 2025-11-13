import { Expose } from "class-transformer";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

export class DepartmentQueueDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;
}
