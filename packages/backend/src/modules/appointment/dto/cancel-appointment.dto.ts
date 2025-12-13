import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { Expose, Exclude } from "class-transformer";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

@Exclude()
export class CancelAppointmentDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Reason for cancellation",
    example: "Patient cancelled via phone",
  })
  @IsOptional()
  @IsString()
  cancelReason?: string;
}
