import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class UpdatePatientStatusDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({
    description: "Patient status",
    example: "ACTIVE",
    enum: ["ACTIVE", "INACTIVE", "DECEASED"],
  })
  @IsEnum(["ACTIVE", "INACTIVE", "DECEASED"])
  status: string;
}
