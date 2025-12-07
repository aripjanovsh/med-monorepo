import { Module } from "@nestjs/common";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { EmployeeAvailabilityService } from "./employee-availability.service";
import { EmployeeAvailabilityController } from "./employee-availability.controller";

@Module({
  imports: [PrismaModule],
  controllers: [EmployeeAvailabilityController],
  providers: [EmployeeAvailabilityService],
  exports: [EmployeeAvailabilityService],
})
export class EmployeeAvailabilityModule {}
