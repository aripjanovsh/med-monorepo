import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from "class-validator";
import { LocationType } from "@prisma/client";

export class FindAllLocationsDto {
  @ApiPropertyOptional({
    description: "Search query for location name",
    example: "Ташкент",
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: "Filter by location type",
    enum: LocationType,
    example: LocationType.REGION,
  })
  @IsOptional()
  @IsEnum(LocationType)
  type?: LocationType;

  @ApiPropertyOptional({
    description: "Filter by parent location ID",
    example: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    description: "Filter by active status",
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description: "Include parent location details",
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  includeParent?: boolean = false;

  @ApiPropertyOptional({
    description: "Include child locations",
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  includeChildren?: boolean = false;

  @ApiPropertyOptional({
    description: "Page number for pagination",
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page",
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: "Sort by field",
    example: "weight",
    enum: ["name", "code", "type", "weight", "createdAt", "updatedAt"],
    default: "weight",
  })
  @IsOptional()
  @IsString()
  sortBy?: "name" | "code" | "type" | "weight" | "createdAt" | "updatedAt" =
    "weight";

  @ApiPropertyOptional({
    description: "Sort order",
    example: "asc",
    enum: ["asc", "desc"],
    default: "asc",
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  sortOrder?: "asc" | "desc" = "asc";
}
