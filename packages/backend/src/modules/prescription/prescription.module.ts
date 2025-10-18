import { Module } from "@nestjs/common";
import { PrescriptionService } from "./prescription.service";
import { PrescriptionController } from "./prescription.controller";
import { PrismaModule } from "@/common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [PrescriptionController],
  providers: [PrescriptionService],
  exports: [PrescriptionService],
})
export class PrescriptionModule {}
