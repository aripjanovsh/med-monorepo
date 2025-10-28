import { Module } from "@nestjs/common";
import { PatientParameterController } from "./patient-parameter.controller";
import { PatientParameterService } from "./patient-parameter.service";
import { PrismaModule } from "@/common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [PatientParameterController],
  providers: [PatientParameterService],
  exports: [PatientParameterService],
})
export class PatientParameterModule {}
