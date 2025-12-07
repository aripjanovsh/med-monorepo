import { Module } from "@nestjs/common";
import { AppointmentTypeService } from "./appointment-type.service";
import { AppointmentTypeController } from "./appointment-type.controller";
import { PrismaModule } from "../../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AppointmentTypeController],
  providers: [AppointmentTypeService],
  exports: [AppointmentTypeService],
})
export class AppointmentTypeModule {}
