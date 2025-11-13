import { IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { InjectOrganizationId } from "@/common/decorators/inject-organization-id.decorator";

export class StartServiceDto {
  @Expose()
  @InjectOrganizationId()
  organizationId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  performedById?: string;
}
