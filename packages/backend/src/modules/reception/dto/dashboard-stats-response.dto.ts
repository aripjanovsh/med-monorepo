import { Expose, Exclude, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
export class DashboardStatsResponseDto {
  @Expose()
  @ApiProperty({ description: "Date of statistics (ISO 8601)" })
  date: string;

  @Expose()
  @ApiProperty({ description: "Total unique patients today" })
  @Type(() => Number)
  totalPatientsToday: number;

  @Expose()
  @ApiProperty({ description: "Total appointments today" })
  @Type(() => Number)
  totalAppointmentsToday: number;

  @Expose()
  @ApiProperty({ description: "Patients currently in queue" })
  @Type(() => Number)
  patientsInQueue: number;

  @Expose()
  @ApiProperty({ description: "Completed visits today" })
  @Type(() => Number)
  completedVisits: number;

  @Expose()
  @ApiProperty({ description: "Canceled appointments today" })
  @Type(() => Number)
  canceledAppointments: number;

  @Expose()
  @ApiProperty({ description: "No-show appointments today" })
  @Type(() => Number)
  noShowAppointments: number;

  @Expose()
  @ApiProperty({ description: "Total revenue today" })
  @Type(() => Number)
  totalRevenueToday: number;

  @Expose()
  @ApiProperty({ description: "Unpaid invoices count" })
  @Type(() => Number)
  unpaidInvoicesCount: number;
}
