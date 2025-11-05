import { Module } from "@nestjs/common";
import { ReceptionService } from "./reception.service";
import { ReceptionController } from "./reception.controller";
import { PrismaModule } from "@/common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ReceptionController],
  providers: [ReceptionService],
  exports: [ReceptionService],
})
export class ReceptionModule {}
