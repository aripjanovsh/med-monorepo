import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { EmployeeStatus } from "@prisma/client";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";
import { Expose } from "class-transformer";

export class UpdateEmployeeStatusDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @ApiProperty({
    description: "Employee status",
    enum: EmployeeStatus,
    example: EmployeeStatus.ACTIVE,
  })
  @IsEnum(EmployeeStatus)
  status: EmployeeStatus;
}
