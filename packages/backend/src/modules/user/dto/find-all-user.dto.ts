import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsBoolean, IsUUID } from "class-validator";
import { Transform } from "class-transformer";
import { FindAllQueryDto } from "../../../common/dto/pagination.dto";

export class FindAllUserDto extends FindAllQueryDto {
  @ApiPropertyOptional({
    description: "Filter by role ID",
    type: String,
  })
  @IsOptional()
  @IsUUID("4")
  roleId?: string;

  @ApiPropertyOptional({
    description: "Filter by active status",
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  isActive?: boolean;
}
