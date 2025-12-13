import { Exclude, Expose } from "class-transformer";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

@Exclude()
export class MarkNoShowAppointmentDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;
}
