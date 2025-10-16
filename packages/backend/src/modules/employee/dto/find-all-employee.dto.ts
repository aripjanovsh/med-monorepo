import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsEnum, IsUUID } from "class-validator";
import { EmployeeStatus } from "@prisma/client";
import { FindAllQueryDto } from "../../../common/dto/pagination.dto";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";
import { Expose } from "class-transformer";

export class FindAllEmployeeDto extends FindAllQueryDto {
  @Expose()
  @InjectOrganizationId()
  organizationId: string;

  @ApiPropertyOptional({
    description: "Filter by employee status",
    enum: EmployeeStatus,
    example: EmployeeStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;
}
