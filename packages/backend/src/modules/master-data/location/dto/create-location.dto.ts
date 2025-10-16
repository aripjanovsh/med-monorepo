import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  MinLength,
  MaxLength,
  IsInt,
  Min,
} from "class-validator";
import { LocationType } from "@prisma/client";

export class CreateLocationDto {
  @ApiProperty({
    description: "Location name",
    example: "Узбекистан",
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: "Location code (ISO code for countries, region codes, etc.)",
    example: "UZ",
    required: false,
    minLength: 2,
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  code?: string;

  @ApiProperty({
    description: "Type of location",
    enum: LocationType,
    example: LocationType.COUNTRY,
  })
  @IsEnum(LocationType)
  type: LocationType;

  @ApiProperty({
    description: "Weight for sorting within the same level",
    example: 1,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  weight?: number = 0;

  @ApiProperty({
    description: "Parent location ID (null for root locations like countries)",
    example: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({
    description: "Location description",
    example: "Республика Узбекистан - государство в Центральной Азии",
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  description?: string;
}
