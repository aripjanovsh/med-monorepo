import { Module } from "@nestjs/common";
import { StatsService } from "./stats.service";
import { PatientStatsService } from "./patient-stats.service";
import { InvoiceStatsService } from "./invoice-stats.service";
import { EmployeeStatsService } from "./employee-stats.service";
import { PatientDashboardStatsService } from "./patient-dashboard-stats.service";
import { StatsController } from "./stats.controller";
import { PrismaModule } from "@/common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [StatsController],
  providers: [
    StatsService,
    PatientStatsService,
    InvoiceStatsService,
    EmployeeStatsService,
    PatientDashboardStatsService,
  ],
  exports: [
    StatsService,
    PatientStatsService,
    InvoiceStatsService,
    EmployeeStatsService,
    PatientDashboardStatsService,
  ],
})
export class StatsModule {}
