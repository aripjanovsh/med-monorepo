import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";
import { Expose } from "class-transformer";

export class EmployeeByIdDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;
}
