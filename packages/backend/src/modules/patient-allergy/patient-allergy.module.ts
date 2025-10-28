import { Module } from "@nestjs/common";
import { PatientAllergyController } from "./patient-allergy.controller";
import { PatientAllergyService } from "./patient-allergy.service";
import { PrismaModule } from "@/common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [PatientAllergyController],
  providers: [PatientAllergyService],
  exports: [PatientAllergyService],
})
export class PatientAllergyModule {}
