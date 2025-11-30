import { Module } from "@nestjs/common";
import { StatsService } from "./stats.service";
import { PatientStatsService } from "./patient-stats.service";
import { StatsController } from "./stats.controller";
import { PrismaModule } from "@/common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [StatsController],
  providers: [StatsService, PatientStatsService],
  exports: [StatsService, PatientStatsService],
})
export class StatsModule {}
