import { Module } from "@nestjs/common";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { EmployeeLeaveDaysService } from "./employee-leave-days.service";
import { EmployeeLeaveDaysController } from "./employee-leave-days.controller";

@Module({
  imports: [PrismaModule],
  controllers: [EmployeeLeaveDaysController],
  providers: [EmployeeLeaveDaysService],
  exports: [EmployeeLeaveDaysService],
})
export class EmployeeLeaveDaysModule {}
