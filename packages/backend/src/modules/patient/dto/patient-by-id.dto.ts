import { ApiProperty } from "@nestjs/swagger";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class PatientByIdDto {
  @Expose()
  @InjectOrganizationId()
  @ApiProperty({
    description: "Organization ID",
    example: "uuid-organization-id",
  })
  organizationId: string;
}
