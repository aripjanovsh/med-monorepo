import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsEnum, IsString } from "class-validator";
import { PermissionAction } from "@prisma/client";
import { FindAllQueryDto } from "../../../common/dto/pagination.dto";

export class FindAllPermissionDto extends FindAllQueryDto {
  @ApiPropertyOptional({
    description: "Filter by resource",
  })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiPropertyOptional({
    description: "Filter by permission action",
    enum: PermissionAction,
  })
  @IsOptional()
  @IsEnum(PermissionAction)
  action?: PermissionAction;
}
