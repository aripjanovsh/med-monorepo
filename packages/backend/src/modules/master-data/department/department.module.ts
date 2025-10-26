import { Module } from "@nestjs/common";
import { DepartmentService } from "./department.service";
import { DepartmentController } from "./department.controller";
import { PrismaModule } from "../../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
