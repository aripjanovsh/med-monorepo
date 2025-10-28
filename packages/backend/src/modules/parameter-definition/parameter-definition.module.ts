import { Module } from "@nestjs/common";
import { ParameterDefinitionController } from "./parameter-definition.controller";
import { ParameterDefinitionService } from "./parameter-definition.service";
import { PrismaModule } from "@/common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ParameterDefinitionController],
  providers: [ParameterDefinitionService],
  exports: [ParameterDefinitionService],
})
export class ParameterDefinitionModule {}
