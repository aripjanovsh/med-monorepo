import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsBoolean } from "class-validator";
import { Expose, Exclude, Transform } from "class-transformer";
import { PaginationDto } from "@/common/dto/pagination.dto";

@Exclude()
export class FindAllParameterDefinitionDto extends PaginationDto {
  @Expose()
  @ApiPropertyOptional({ description: "Filter by category" })
  @IsOptional()
  @IsString()
  category?: string;

  @Expose()
  @ApiPropertyOptional({ description: "Filter by active status" })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @Expose()
  @ApiPropertyOptional({ description: "Search by name or code" })
  @IsOptional()
  @IsString()
  search?: string;
}
