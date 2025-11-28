import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  Res,
  StreamableFile,
  ParseUUIDPipe,
  BadRequestException,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiConsumes } from "@nestjs/swagger";
import { Response } from "express";
import { FileService } from "./file.service";
import {
  UploadFileDto,
  FileQueryDto,
  UpdateFileDto,
  ImageTransformDto,
  FileResponseDto,
} from "./dto";
import {
  CurrentUser,
  CurrentUserData,
} from "@/common/decorators/current-user.decorator";
import { AuthGuard } from "@nestjs/passport";
import { PermissionGuard } from "@/common/guards/permission.guard";
import { ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Files")
@Controller("files")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@ApiBearerAuth()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  /**
   * Загрузить файл
   */
  @Post("upload")
  @ApiOperation({ summary: "Загрузить файл" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @CurrentUser() user: CurrentUserData
  ): Promise<FileResponseDto> {
    if (!file) {
      throw new BadRequestException("File is required");
    }

    if (!user.employeeId) {
      throw new BadRequestException("Employee ID is required");
    }

    return await this.fileService.uploadFile(file, dto, user.employeeId);
  }

  /**
   * Получить список файлов
   */
  @Get()
  @ApiOperation({ summary: "Получить список файлов" })
  async getFiles(
    @Query() query: FileQueryDto
  ): Promise<{ data: FileResponseDto[]; total: number }> {
    return await this.fileService.getFiles(query);
  }

  /**
   * Получить файл по ID
   */
  @Get(":id")
  @ApiOperation({ summary: "Получить файл по ID" })
  async getFileById(
    @Param("id", ParseUUIDPipe) id: string,
    @Query("organizationId") organizationId: string
  ): Promise<FileResponseDto> {
    return await this.fileService.getFileById(id, organizationId);
  }

  /**
   * Скачать файл
   */
  @Get(":id/download")
  @ApiOperation({ summary: "Скачать файл" })
  async downloadFile(
    @Param("id", ParseUUIDPipe) id: string,
    @Query("organizationId") organizationId: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const { buffer, mimeType, filename } =
      await this.fileService.getFileContent(id, organizationId);

    res.set({
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    });

    return new StreamableFile(buffer);
  }

  /**
   * Получить изображение с трансформацией
   */
  @Get("img/:storedName")
  @ApiOperation({ summary: "Получить изображение с трансформацией" })
  async getImage(
    @Param("storedName") storedName: string,
    @Query() transform: ImageTransformDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const { buffer, mimeType } = await this.fileService.getImageWithTransform(
      storedName,
      transform
    );

    res.set({
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000",
    });

    return new StreamableFile(buffer);
  }

  /**
   * Обновить метаданные файла
   */
  @Patch(":id")
  @ApiOperation({ summary: "Обновить метаданные файла" })
  async updateFile(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateFileDto
  ): Promise<FileResponseDto> {
    return await this.fileService.updateFile(id, dto);
  }

  /**
   * Удалить файл (мягкое удаление)
   */
  @Delete(":id")
  @ApiOperation({ summary: "Удалить файл" })
  async deleteFile(
    @Param("id", ParseUUIDPipe) id: string,
    @Query("organizationId") organizationId: string,
    @CurrentUser() user: CurrentUserData
  ): Promise<{ success: boolean }> {
    if (!user.employeeId) {
      throw new BadRequestException("Employee ID is required");
    }

    await this.fileService.deleteFile(id, organizationId, user.employeeId);

    return { success: true };
  }
}
