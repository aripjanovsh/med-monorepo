import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  MinLength,
  MaxLength,
  IsBoolean,
  IsInt,
  Min,
} from "class-validator";
import { LocationType } from "@prisma/client";
import { CreateLocationDto } from "./create-location.dto";

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
  @ApiPropertyOptional({
    description: "Location name",
    example: "Узбекистан",
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    description: "Location code (ISO code for countries, region codes, etc.)",
    example: "UZ",
    minLength: 2,
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  code?: string;

  @ApiPropertyOptional({
    description: "Type of location",
    enum: LocationType,
    example: LocationType.COUNTRY,
  })
  @IsOptional()
  @IsEnum(LocationType)
  type?: LocationType;

  @ApiPropertyOptional({
    description: "Weight for sorting within the same level",
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({
    description: "Parent location ID (null for root locations like countries)",
    example: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    description: "Location description",
    example: "Республика Узбекистан - государство в Центральной Азии",
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({
    description: "Whether the location is active",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
