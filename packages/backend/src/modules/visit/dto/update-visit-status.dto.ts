import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { Expose, Exclude } from "class-transformer";
import { VisitStatus } from "@prisma/client";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

@Exclude()
export class UpdateVisitStatusDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiProperty({
    description: "Visit status",
    enum: VisitStatus,
    example: VisitStatus.COMPLETED,
  })
  @IsEnum(VisitStatus)
  status: VisitStatus;
}
