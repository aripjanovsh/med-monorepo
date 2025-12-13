import { Exclude, Expose } from "class-transformer";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

@Exclude()
export class ConfirmAppointmentDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;
}
