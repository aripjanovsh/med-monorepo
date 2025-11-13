import { Expose, Exclude } from "class-transformer";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

@Exclude()
export class StartVisitDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;
}
