import { Expose, Exclude, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
export class EmployeeStatusDistributionDto {
  @Expose()
  @ApiProperty({ description: "Number of active employees" })
  active: number;

  @Expose()
  @ApiProperty({ description: "Number of inactive employees" })
  inactive: number;

  @Expose()
  @ApiProperty({ description: "Number of employees on leave" })
  onLeave: number;

  @Expose()
  @ApiProperty({ description: "Number of terminated employees" })
  terminated: number;
}

@Exclude()
export class EmployeeDepartmentStatsDto {
  @Expose()
  @ApiProperty({ description: "Department ID" })
  departmentId: string;

  @Expose()
  @ApiProperty({ description: "Department name" })
  departmentName: string;

  @Expose()
  @ApiProperty({ description: "Number of employees in this department" })
  count: number;
}

@Exclude()
export class EmployeeMonthlyTrendDto {
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
  @ApiProperty({ description: "Number of new employees hired this month" })
  newEmployees: number;

  @Expose()
  @ApiProperty({ description: "Number of employees terminated this month" })
  terminatedEmployees: number;
}

@Exclude()
export class EmployeeQuickStatsResponseDto {
  @Expose()
  @ApiProperty({ description: "Total number of employees" })
  total: number;

  @Expose()
  @ApiProperty({ description: "Number of active employees" })
  activeCount: number;

  @Expose()
  @ApiProperty({ description: "Number of new employees this month" })
  newEmployeesThisMonth: number;

  @Expose()
  @ApiProperty({ description: "Number of new employees last month" })
  newEmployeesLastMonth: number;

  @Expose()
  @ApiProperty({ description: "Growth percentage compared to last month" })
  growthPercent: number;

  @Expose()
  @Type(() => EmployeeStatusDistributionDto)
  @ApiProperty({
    description: "Status distribution statistics",
    type: EmployeeStatusDistributionDto,
  })
  statusDistribution: EmployeeStatusDistributionDto;

  @Expose()
  @Type(() => EmployeeDepartmentStatsDto)
  @ApiProperty({
    description: "Employee count by department",
    type: [EmployeeDepartmentStatsDto],
  })
  byDepartment: EmployeeDepartmentStatsDto[];

  @Expose()
  @Type(() => EmployeeMonthlyTrendDto)
  @ApiProperty({
    description: "Monthly hiring trends (last 6 months)",
    type: [EmployeeMonthlyTrendDto],
  })
  monthlyTrends: EmployeeMonthlyTrendDto[];
}
