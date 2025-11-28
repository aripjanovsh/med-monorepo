import {
  Controller,
  Get,
  Param,
  Res,
  StreamableFile,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Response } from "express";
import { FileService } from "./file.service";

/**
 * Публичный контроллер для доступа к изображениям без авторизации.
 * Используется для Next.js Image оптимизации.
 */
@ApiTags("Files (Public)")
@Controller("files")
export class FilePublicController {
  constructor(private readonly fileService: FileService) {}

  /**
   * Получить изображение по ID (публичный доступ для Next.js Image)
   */
  @Get("image/:id")
  @ApiOperation({ summary: "Получить изображение по ID (публичный)" })
  async getImageById(
    @Param("id", ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const { buffer, mimeType } = await this.fileService.getImageById(id);

    res.set({
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    });

    return new StreamableFile(buffer);
  }
}
