import { Module } from "@nestjs/common";
import { TitleService } from "./title.service";
import { TitleController } from "./title.controller";
import { PrismaModule } from "../../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [TitleController],
  providers: [TitleService],
  exports: [TitleService],
})
export class TitleModule {}
