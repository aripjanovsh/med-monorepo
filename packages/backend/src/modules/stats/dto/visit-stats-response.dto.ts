import { Expose, Exclude, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
export class VisitStatusDistributionDto {
  @Expose()
  @ApiProperty({ description: "Number of waiting visits" })
  waiting: number;

  @Expose()
  @ApiProperty({ description: "Number of in-progress visits" })
  inProgress: number;

  @Expose()
  @ApiProperty({ description: "Number of completed visits" })
  completed: number;

  @Expose()
  @ApiProperty({ description: "Number of canceled visits" })
  canceled: number;

  @Expose()
  @ApiProperty({ description: "Percentage of waiting visits" })
  waitingPercent: number;

  @Expose()
  @ApiProperty({ description: "Percentage of in-progress visits" })
  inProgressPercent: number;

  @Expose()
  @ApiProperty({ description: "Percentage of completed visits" })
  completedPercent: number;

  @Expose()
  @ApiProperty({ description: "Percentage of canceled visits" })
  canceledPercent: number;
}

@Exclude()
export class VisitMonthlyTrendDto {
  @Expose()
  @ApiProperty({ description: "Month label (e.g., 'Январь')" })
  month: string;

  @Expose()
  @ApiProperty({ description: "Short month label (e.g., 'Янв')" })
  monthShort: string;

  @Expose()
  @ApiProperty({ description: "Year" })
  year: number;

  @Expose()
  @ApiProperty({ description: "Number of visits this month" })
  visitsCount: number;

  @Expose()
  @ApiProperty({ description: "Number of completed visits this month" })
  completedCount: number;
}

@Exclude()
export class VisitStatsResponseDto {
  @Expose()
  @ApiProperty({ description: "Total number of visits" })
  totalVisits: number;

  @Expose()
  @ApiProperty({ description: "Visits this month" })
  visitsThisMonth: number;

  @Expose()
  @ApiProperty({ description: "Visits last month" })
  visitsLastMonth: number;

  @Expose()
  @ApiProperty({
    description: "Visits growth percentage compared to last month",
  })
  growthPercent: number;

  @Expose()
  @ApiProperty({ description: "Total completed visits" })
  completedVisits: number;

  @Expose()
  @ApiProperty({ description: "Completion rate percentage" })
  completionRate: number;

  @Expose()
  @ApiProperty({ description: "Average waiting time in minutes" })
  avgWaitingTimeMinutes: number;

  @Expose()
  @ApiProperty({ description: "Average service time in minutes" })
  avgServiceTimeMinutes: number;

  @Expose()
  @Type(() => VisitStatusDistributionDto)
  @ApiProperty({
    description: "Visit status distribution",
    type: VisitStatusDistributionDto,
  })
  statusDistribution: VisitStatusDistributionDto;

  @Expose()
  @Type(() => VisitMonthlyTrendDto)
  @ApiProperty({
    description: "Monthly visit trends (last 6 months)",
    type: [VisitMonthlyTrendDto],
  })
  monthlyTrends: VisitMonthlyTrendDto[];
}
