import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsBoolean } from "class-validator";
import { Transform } from "class-transformer";
import { FindAllQueryDto } from "../../../common/dto/pagination.dto";

export class FindAllOrganizationDto extends FindAllQueryDto {
  @ApiPropertyOptional({
    description: "Filter by active status",
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  isActive?: boolean;
}
