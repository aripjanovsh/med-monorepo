import {
  IsOptional,
  IsPositive,
  IsInt,
  Min,
  Max,
  IsString,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { Default } from "../decorators/default.decorator";

export class PaginationDto {
  @Expose()
  @ApiPropertyOptional({
    description: "Items per page",
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @Default(10)
  limit?: number;

  @Expose()
  @ApiPropertyOptional({
    description: "Page number",
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Default(1)
  page?: number;

  @Expose()
  @ApiPropertyOptional({
    description: "Search term for filtering",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Field to sort by",
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Sort order",
    enum: ["asc", "desc"],
    example: "desc",
  })
  @IsOptional()
  @Transform(({ value }) => (value === "asc" ? "asc" : "desc"))
  sortOrder?: "asc" | "desc" = "desc";
}

export class FindAllQueryDto extends PaginationDto {}

export class PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;

  constructor(page: number, limit: number, total: number) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
  }
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMetaDto;

  constructor(data: T[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
