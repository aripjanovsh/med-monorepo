import { Module } from "@nestjs/common";
import { VisitService } from "./visit.service";
import { VisitAiService } from "./visit-ai.service";
import { VisitController } from "./visit.controller";
import { PrismaModule } from "@/common/prisma/prisma.module";
import { AiModule } from "@/modules/ai/ai.module";

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [VisitController],
  providers: [VisitService, VisitAiService],
  exports: [VisitService, VisitAiService],
})
export class VisitModule {}
