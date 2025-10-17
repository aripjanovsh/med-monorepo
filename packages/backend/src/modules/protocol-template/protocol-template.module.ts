import { Module } from "@nestjs/common";
import { ProtocolTemplateService } from "./protocol-template.service";
import { ProtocolTemplateController } from "./protocol-template.controller";

@Module({
  controllers: [ProtocolTemplateController],
  providers: [ProtocolTemplateService],
  exports: [ProtocolTemplateService],
})
export class ProtocolTemplateModule {}
