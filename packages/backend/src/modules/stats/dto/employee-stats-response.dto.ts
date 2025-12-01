import { ApiProperty } from "@nestjs/swagger";
import { StatsPeriod } from "./employee-stats-query.dto";

export class VisitStatsDto {
  @ApiProperty({ description: "Total visits" })
  total: number;

  @ApiProperty({ description: "Completed visits" })
  completed: number;

  @ApiProperty({ description: "Canceled visits" })
  canceled: number;

  @ApiProperty({ description: "In progress visits" })
  inProgress: number;

  @ApiProperty({ description: "Waiting visits" })
  waiting: number;
}

export class TimeStatsDto {
  @ApiProperty({ description: "Average service time in minutes" })
  avgServiceTimeMinutes: number;

  @ApiProperty({ description: "Average waiting time in minutes" })
  avgWaitingTimeMinutes: number;
}

export class ActivityStatsDto {
  @ApiProperty({ description: "Total service orders created" })
  totalServiceOrders: number;

  @ApiProperty({ description: "Completed service orders" })
  completedServiceOrders: number;

  @ApiProperty({ description: "Total prescriptions written" })
  totalPrescriptions: number;

  @ApiProperty({ description: "Total assigned patients" })
  assignedPatients: number;

  @ApiProperty({ description: "New patients this period" })
  newPatientsThisPeriod: number;
}

export class FinancialStatsDto {
  @ApiProperty({ description: "Total revenue generated" })
  totalRevenue: number;

  @ApiProperty({ description: "Average revenue per visit" })
  avgRevenuePerVisit: number;
}

export class EfficiencyStatsDto {
  @ApiProperty({ description: "Completion rate percentage" })
  completionRate: number;
}

export class ChartDataPointDto {
  @ApiProperty({ description: "Period label (e.g., month name)" })
  label: string;

  @ApiProperty({ description: "Completed count" })
  completed: number;

  @ApiProperty({ description: "Canceled count" })
  canceled: number;
}

export class RevenueChartDataPointDto {
  @ApiProperty({ description: "Period label" })
  label: string;

  @ApiProperty({ description: "Revenue amount" })
  revenue: number;
}

export class GenderChartDataPointDto {
  @ApiProperty({ description: "Period label" })
  label: string;

  @ApiProperty({ description: "Male patients count" })
  male: number;

  @ApiProperty({ description: "Female patients count" })
  female: number;
}

export class EmployeeStatsResponseDto {
  @ApiProperty({ description: "Selected period" })
  period: StatsPeriod;

  @ApiProperty({ description: "Period start date" })
  periodStart: Date;

  @ApiProperty({ description: "Period end date" })
  periodEnd: Date;

  @ApiProperty({ description: "Visit statistics", type: VisitStatsDto })
  visits: VisitStatsDto;

  @ApiProperty({ description: "Time statistics", type: TimeStatsDto })
  time: TimeStatsDto;

  @ApiProperty({ description: "Activity statistics", type: ActivityStatsDto })
  activity: ActivityStatsDto;

  @ApiProperty({ description: "Financial statistics", type: FinancialStatsDto })
  financial: FinancialStatsDto;

  @ApiProperty({
    description: "Efficiency statistics",
    type: EfficiencyStatsDto,
  })
  efficiency: EfficiencyStatsDto;

  @ApiProperty({
    description: "Visits chart data",
    type: [ChartDataPointDto],
  })
  visitsChart: ChartDataPointDto[];

  @ApiProperty({
    description: "Revenue chart data",
    type: [RevenueChartDataPointDto],
  })
  revenueChart: RevenueChartDataPointDto[];

  @ApiProperty({
    description: "Patient gender chart data",
    type: [GenderChartDataPointDto],
  })
  genderChart: GenderChartDataPointDto[];

  @ApiProperty({ description: "Visits trend percentage vs previous period" })
  visitsTrend: number;

  @ApiProperty({ description: "Revenue trend percentage vs previous period" })
  revenueTrend: number;

  @ApiProperty({
    description: "Efficiency trend percentage vs previous period",
  })
  efficiencyTrend: number;
}
