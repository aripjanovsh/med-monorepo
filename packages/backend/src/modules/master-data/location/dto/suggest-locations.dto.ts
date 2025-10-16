import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { LocationType } from "@prisma/client";

export class SuggestLocationsDto {
  @ApiPropertyOptional({
    description: "Search query (supports Cyrillic and Latin)",
    example: "таш",
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toString()?.trim())
  q?: string;

  @ApiPropertyOptional({
    description: "Limit number of suggestions",
    example: 10,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: "Type of location",
    enum: LocationType,
    example: LocationType.REGION,
  })
  @IsOptional()
  @IsEnum(LocationType)
  type?: LocationType;
}
