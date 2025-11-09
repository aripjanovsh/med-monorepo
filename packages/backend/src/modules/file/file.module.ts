import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { FileController } from "./file.controller";
import { FileService } from "./file.service";
import { FileStorageService } from "./file-storage.service";
import { ImageProcessorService } from "./image-processor.service";
import { PrismaModule } from "@/common/prisma/prisma.module";

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [FileController],
  providers: [FileService, FileStorageService, ImageProcessorService],
  exports: [FileService],
})
export class FileModule {}
