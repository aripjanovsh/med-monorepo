import { Module } from "@nestjs/common";
import { AppointmentCancelTypeService } from "./appointment-cancel-type.service";
import { AppointmentCancelTypeController } from "./appointment-cancel-type.controller";
import { PrismaModule } from "../../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AppointmentCancelTypeController],
  providers: [AppointmentCancelTypeService],
  exports: [AppointmentCancelTypeService],
})
export class AppointmentCancelTypeModule {}
