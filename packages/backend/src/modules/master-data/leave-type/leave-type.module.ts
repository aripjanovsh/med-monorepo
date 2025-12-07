import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../common/prisma/prisma.module";
import { LeaveTypeService } from "./leave-type.service";
import { LeaveTypeController } from "./leave-type.controller";

@Module({
  imports: [PrismaModule],
  controllers: [LeaveTypeController],
  providers: [LeaveTypeService],
  exports: [LeaveTypeService],
})
export class LeaveTypeModule {}
