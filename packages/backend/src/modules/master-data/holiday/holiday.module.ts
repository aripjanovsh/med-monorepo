import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../common/prisma/prisma.module";
import { HolidayService } from "./holiday.service";
import { HolidayController } from "./holiday.controller";

@Module({
  imports: [PrismaModule],
  controllers: [HolidayController],
  providers: [HolidayService],
  exports: [HolidayService],
})
export class HolidayModule {}
