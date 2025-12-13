import { Module } from "@nestjs/common";
import { AppointmentService } from "./appointment.service";
import { AppointmentController } from "./appointment.controller";
import { PrismaModule } from "@/common/prisma/prisma.module";
import { VisitModule } from "@/modules/visit/visit.module";

@Module({
  imports: [PrismaModule, VisitModule],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
