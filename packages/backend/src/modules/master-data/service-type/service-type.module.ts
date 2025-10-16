import { Module } from "@nestjs/common";
import { ServiceTypeService } from "./service-type.service";
import { ServiceTypeController } from "./service-type.controller";
import { PrismaModule } from "../../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ServiceTypeController],
  providers: [ServiceTypeService],
  exports: [ServiceTypeService],
})
export class ServiceTypeModule {}
