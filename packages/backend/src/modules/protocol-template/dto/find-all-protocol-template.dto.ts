import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsBoolean } from "class-validator";
import { Expose, Type } from "class-transformer";
import { FindAllQueryDto } from "../../../common/dto/pagination.dto";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";

export class FindAllProtocolTemplateDto extends FindAllQueryDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @ApiPropertyOptional({
    description: "Filter by active status",
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
