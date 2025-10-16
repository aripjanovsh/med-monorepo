import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsBoolean } from "class-validator";
import { Transform } from "class-transformer";
import { FindAllQueryDto } from "../../../common/dto/pagination.dto";

export class FindAllRoleDto extends FindAllQueryDto {
  @ApiPropertyOptional({
    description: "Include inactive roles",
  })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  includeInactive?: boolean;

  @ApiPropertyOptional({
    description: "Filter by system roles only",
  })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  isSystem?: boolean;
}
