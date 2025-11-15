import { Expose, Exclude } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
export class StatsResponseDto {
  @Expose()
  @ApiProperty({ description: "Start date of statistics period (ISO 8601)" })
  startDate: string;

  @Expose()
  @ApiProperty({ description: "End date of statistics period (ISO 8601)" })
  endDate: string;

  @Expose()
  @ApiProperty({
    description: "Statistics values by type",
    type: "object",
    additionalProperties: { type: "number" },
  })
  stats: Record<string, number>;
}
