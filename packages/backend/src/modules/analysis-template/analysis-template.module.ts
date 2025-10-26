import { Module } from "@nestjs/common";
import { AnalysisTemplateService } from "./analysis-template.service";
import { AnalysisTemplateController } from "./analysis-template.controller";

@Module({
  controllers: [AnalysisTemplateController],
  providers: [AnalysisTemplateService],
  exports: [AnalysisTemplateService],
})
export class AnalysisTemplateModule {}
