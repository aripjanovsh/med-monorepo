import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";

@Exclude()
export class KeyMetricsDto {
  @Expose()
  @ApiProperty({ description: "Total visits count", example: 17 })
  totalVisits: number;

  @Expose()
  @ApiProperty({
    description: "Number of visits in the last month",
    example: 2,
  })
  visitsLastMonth: number;

  @Expose()
  @ApiProperty({ description: "Active orders count", example: 3 })
  activeOrders: number;

  @Expose()
  @ApiProperty({ description: "Total treating doctors count", example: 2 })
  totalDoctors: number;

  @Expose()
  @ApiProperty({ description: "Active doctors count", example: 1 })
  activeDoctors: number;

  @Expose()
  @ApiProperty({
    description: "Last visit date",
    example: "2024-06-28T00:00:00.000Z",
    required: false,
  })
  lastVisitDate?: Date;
}

@Exclude()
export class VisitsByMonthDto {
  @Expose()
  @ApiProperty({ description: "Month name", example: "Янв" })
  month: string;

  @Expose()
  @ApiProperty({ description: "Visits count", example: 5 })
  visits: number;
}

@Exclude()
export class OrdersByStatusDto {
  @Expose()
  @ApiProperty({ description: "Order status", example: "ordered" })
  status: string;

  @Expose()
  @ApiProperty({ description: "Orders count", example: 8 })
  count: number;
}

@Exclude()
export class VisitsByDepartmentDto {
  @Expose()
  @ApiProperty({ description: "Department name", example: "Кардиология" })
  department: string;

  @Expose()
  @ApiProperty({ description: "Visits count", example: 5 })
  visits: number;
}

@Exclude()
export class RecentVisitDto {
  @Expose()
  @ApiProperty({ description: "Visit ID", example: "uuid-visit-id" })
  id: string;

  @Expose()
  @ApiProperty({
    description: "Visit date",
    example: "2024-06-28T00:00:00.000Z",
  })
  date: Date;

  @Expose()
  @ApiProperty({ description: "Doctor name", example: "Др. Иванов А.С." })
  doctor: string;

  @Expose()
  @ApiProperty({ description: "Department name", example: "Кардиология" })
  department: string;

  @Expose()
  @ApiProperty({ description: "Visit status", example: "completed" })
  status: string;
}

@Exclude()
export class ActiveOrderDto {
  @Expose()
  @ApiProperty({ description: "Order ID", example: "uuid-order-id" })
  id: string;

  @Expose()
  @ApiProperty({ description: "Service name", example: "ЭКГ" })
  name: string;

  @Expose()
  @ApiProperty({ description: "Department name", example: "Кардиология" })
  department: string;

  @Expose()
  @ApiProperty({ description: "Order status", example: "ordered" })
  status: string;

  @Expose()
  @ApiProperty({
    description: "Order date",
    example: "2024-06-30T00:00:00.000Z",
  })
  date: Date;
}

@Exclude()
export class TreatingDoctorDto {
  @Expose()
  @ApiProperty({ description: "Assignment ID", example: "uuid-assignment-id" })
  id: string;

  @Expose()
  @ApiProperty({ description: "Doctor name", example: "Др. Иванов А.С." })
  name: string;

  @Expose()
  @ApiProperty({ description: "Specialty", example: "Кардиолог" })
  specialty: string;

  @Expose()
  @ApiProperty({
    description: "Is active assignment",
    example: "active",
  })
  status: string;
}

@Exclude()
export class PatientDashboardStatsResponseDto {
  @Expose()
  @ApiProperty({ description: "Key metrics" })
  @Type(() => KeyMetricsDto)
  metrics: KeyMetricsDto;

  @Expose()
  @ApiProperty({
    description: "Visits by month chart data",
    type: [VisitsByMonthDto],
  })
  @Type(() => VisitsByMonthDto)
  visitsByMonth: VisitsByMonthDto[];

  @Expose()
  @ApiProperty({
    description: "Orders by status chart data",
    type: [OrdersByStatusDto],
  })
  @Type(() => OrdersByStatusDto)
  ordersByStatus: OrdersByStatusDto[];

  @Expose()
  @ApiProperty({
    description: "Visits by department chart data",
    type: [VisitsByDepartmentDto],
  })
  @Type(() => VisitsByDepartmentDto)
  visitsByDepartment: VisitsByDepartmentDto[];

  @Expose()
  @ApiProperty({ description: "Recent visits list", type: [RecentVisitDto] })
  @Type(() => RecentVisitDto)
  recentVisits: RecentVisitDto[];

  @Expose()
  @ApiProperty({ description: "Active orders list", type: [ActiveOrderDto] })
  @Type(() => ActiveOrderDto)
  activeOrders: ActiveOrderDto[];

  @Expose()
  @ApiProperty({
    description: "Treating doctors list",
    type: [TreatingDoctorDto],
  })
  @Type(() => TreatingDoctorDto)
  treatingDoctors: TreatingDoctorDto[];
}
