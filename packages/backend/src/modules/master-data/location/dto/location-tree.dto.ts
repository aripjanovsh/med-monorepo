import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { LocationType } from "@prisma/client";

export class LocationTreeDto {
  @ApiProperty({
    description: "Location ID",
    example: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Location name",
    example: "Узбекистан",
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: "Location code",
    example: "UZ",
  })
  @Expose()
  code?: string;

  @ApiProperty({
    description: "Type of location",
    enum: LocationType,
    example: LocationType.COUNTRY,
  })
  @Expose()
  type: LocationType;

  @ApiProperty({
    description: "Weight for sorting",
    example: 1,
  })
  @Expose()
  weight: number;

  @ApiPropertyOptional({
    description: "Parent location ID",
    example: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  })
  @Expose()
  parentId?: string;

  @ApiPropertyOptional({
    description: "Location description",
    example: "Республика Узбекистан - государство в Центральной Азии",
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: "Whether the location is active",
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({
    description: "Child locations in tree structure",
    type: [LocationTreeDto],
  })
  @Expose()
  @Type(() => LocationTreeDto)
  children?: LocationTreeDto[];
}
