import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { FileStorageService } from "./file-storage.service";
import { ImageProcessorService } from "./image-processor.service";
import {
  UploadFileDto,
  FileQueryDto,
  UpdateFileDto,
  ImageTransformDto,
  FileResponseDto,
} from "./dto";
import { plainToInstance } from "class-transformer";
import { Prisma } from "@prisma/client";
import * as path from "path";

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorage: FileStorageService,
    private readonly imageProcessor: ImageProcessorService
  ) {}

  /**
   * Загружает файл
   */
  async uploadFile(
    file: Express.Multer.File,
    dto: UploadFileDto,
    uploadedById: string
  ): Promise<FileResponseDto> {
    const { filePath, fileId } = this.fileStorage.generateFilePath(dto.organizationId);
    const extension = path.extname(file.originalname);
    const storedName = `${fileId}${extension}`;

    let buffer = file.buffer;
    let width: number | undefined;
    let height: number | undefined;

    // Обработка изображений
    if (this.imageProcessor.isImage(file.mimetype)) {
      try {
        const metadata = await this.imageProcessor.getImageMetadata(buffer);
        width = metadata.width;
        height = metadata.height;

        // Оптимизация изображения
        buffer = await this.imageProcessor.optimizeImage(buffer, file.mimetype);
      } catch (error) {
        this.logger.error("Failed to process image", error);
      }
    }

    // Сохранение на диск
    await this.fileStorage.saveFile(buffer, filePath, storedName);

    // Сохранение в БД
    const fileRecord = await this.prisma.file.create({
      data: {
        filename: file.originalname,
        storedName,
        path: filePath,
        mimeType: file.mimetype,
        size: buffer.length,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        width,
        height,
        uploadedById,
        entityType: dto.entityType,
        entityId: dto.entityId,
      },
    });

    this.logger.log(`File uploaded: ${fileRecord.id}`);
    return plainToInstance(FileResponseDto, fileRecord, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Получает список файлов
   */
  async getFiles(
    query: FileQueryDto
  ): Promise<{ data: FileResponseDto[]; total: number }> {
    const where: Prisma.FileWhereInput = {
      deletedAt: null,
      path: { startsWith: query.organizationId },
    };

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.uploadedById) {
      where.uploadedById = query.uploadedById;
    }

    const skip = ((query.page || 1) - 1) * (query.limit || 10);
    const take = query.limit || 10;

    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        where,
        skip,
        take,
        orderBy: { uploadedAt: "desc" },
        include: {
          uploadedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              middleName: true,
            },
          },
        },
      }),
      this.prisma.file.count({ where }),
    ]);

    return {
      data: files.map((file) =>
        plainToInstance(FileResponseDto, file, {
          excludeExtraneousValues: true,
        })
      ),
      total,
    };
  }

  /**
   * Получает файл по ID
   */
  async getFileById(id: string, organizationId: string): Promise<FileResponseDto> {
    const file = await this.prisma.file.findFirst({
      where: {
        id,
        path: { startsWith: organizationId },
        deletedAt: null,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException(`File not found: ${id}`);
    }

    return plainToInstance(FileResponseDto, file, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Получает содержимое файла
   */
  async getFileContent(id: string, organizationId: string): Promise<{
    buffer: Buffer;
    mimeType: string;
    filename: string;
  }> {
    const file = await this.getFileById(id, organizationId);

    const exists = await this.fileStorage.fileExists(file.path, file.storedName);
    if (!exists) {
      throw new NotFoundException(`File content not found: ${id}`);
    }

    const buffer = await this.fileStorage.readFile(file.path, file.storedName);

    return {
      buffer,
      mimeType: file.mimeType,
      filename: file.filename,
    };
  }

  /**
   * Получает изображение с трансформацией
   */
  async getImageWithTransform(
    storedName: string,
    transform: ImageTransformDto
  ): Promise<{ buffer: Buffer; mimeType: string }> {
    // Найти файл по storedName (без organizationId - публичный доступ)
    const file = await this.prisma.file.findFirst({
      where: {
        storedName,
        deletedAt: null,
      },
    });

    if (!file) {
      throw new NotFoundException(`Image not found: ${storedName}`);
    }

    if (!this.imageProcessor.isImage(file.mimeType)) {
      throw new BadRequestException(`File is not an image: ${storedName}`);
    }

    const buffer = await this.fileStorage.readFile(file.path, file.storedName);
    const transformedBuffer = await this.imageProcessor.transformImage(
      buffer,
      transform
    );

    return {
      buffer: transformedBuffer,
      mimeType: file.mimeType,
    };
  }

  /**
   * Обновляет метаданные файла
   */
  async updateFile(
    id: string,
    dto: UpdateFileDto
  ): Promise<FileResponseDto> {
    await this.getFileById(id, dto.organizationId); // Проверка существования

    const updated = await this.prisma.file.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
      },
    });

    this.logger.log(`File updated: ${id}`);
    return plainToInstance(FileResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Удаляет файл (мягкое удаление)
   */
  async deleteFile(
    id: string,
    organizationId: string,
    deletedById: string
  ): Promise<void> {
    const file = await this.getFileById(id, organizationId);

    // Мягкое удаление в БД
    await this.prisma.file.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById,
      },
    });

    // Физическое удаление файла
    await this.fileStorage.deleteFile(file.path, file.storedName);

    this.logger.log(`File deleted: ${id}`);
  }

  /**
   * Жесткое удаление файла (только для администраторов)
   */
  async hardDeleteFile(id: string, organizationId: string): Promise<void> {
    const file = await this.prisma.file.findFirst({
      where: {
        id,
        path: { startsWith: organizationId },
      },
    });

    if (!file) {
      throw new NotFoundException(`File not found: ${id}`);
    }

    // Удаление из БД
    await this.prisma.file.delete({ where: { id } });

    // Физическое удаление файла
    if (!file.deletedAt) {
      await this.fileStorage.deleteFile(file.path, file.storedName);
    }

    this.logger.log(`File hard deleted: ${id}`);
  }
}
