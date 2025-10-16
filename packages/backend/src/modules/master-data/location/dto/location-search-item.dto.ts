import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class LocationSearchItemDto {
  @ApiProperty({
    description: "Display label combining location hierarchy (e.g., 'город Ташкент, Учтепинский район')",
    example: "город Ташкент, Чиланзарский район",
  })
  @Expose()
  label!: string;

  @ApiPropertyOptional({
    description: "Region ID when applicable",
    example: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  })
  @Expose()
  regionId?: string;

  @ApiPropertyOptional({
    description: "City ID when applicable",
    example: "bbbbbbbb-cccc-dddd-eeee-ffffffffffff",
  })
  @Expose()
  cityId?: string;

  @ApiPropertyOptional({
    description: "District ID when applicable",
    example: "cccccccc-dddd-eeee-ffff-111111111111",
  })
  @Expose()
  districtId?: string;
}
