import { Exclude, Expose } from "class-transformer";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

@Exclude()
export class CheckInAppointmentDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;
}
