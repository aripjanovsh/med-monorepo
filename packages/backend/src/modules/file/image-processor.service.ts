import { Injectable, Logger } from "@nestjs/common";
import * as sharp from "sharp";
import { ImageTransformDto } from "./dto";

@Injectable()
export class ImageProcessorService {
  private readonly logger = new Logger(ImageProcessorService.name);

  /**
   * Проверяет является ли файл изображением
   * @param mimeType MIME тип файла
   * @returns true если это изображение
   */
  isImage(mimeType: string): boolean {
    return mimeType.startsWith("image/");
  }

  /**
   * Получает метаданные изображения
   * @param buffer Буфер с изображением
   * @returns Метаданные изображения
   */
  async getImageMetadata(buffer: Buffer): Promise<{
    width: number;
    height: number;
    format: string;
  }> {
    const metadata = await sharp(buffer).metadata();

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || "unknown",
    };
  }

  /**
   * Трансформирует изображение согласно параметрам
   * @param buffer Буфер с изображением
   * @param transform Параметры трансформации
   * @returns Буфер с трансформированным изображением
   */
  async transformImage(
    buffer: Buffer,
    transform: ImageTransformDto
  ): Promise<Buffer> {
    let image = sharp(buffer);

    // Resize если указаны размеры
    if (transform.width || transform.height) {
      const resizeOptions: sharp.ResizeOptions = {
        fit: transform.fit || "cover",
        withoutEnlargement: false,
      };

      image = image.resize(transform.width, transform.height, resizeOptions);
    }

    // Качество для JPEG/WebP
    if (transform.quality) {
      image = image.jpeg({ quality: transform.quality });
    }

    return await image.toBuffer();
  }

  /**
   * Оптимизирует изображение
   * @param buffer Буфер с изображением
   * @param mimeType MIME тип
   * @returns Буфер с оптимизированным изображением
   */
  async optimizeImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
    let image = sharp(buffer);

    // Автоматическая оптимизация в зависимости от формата
    if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
      image = image.jpeg({ quality: 85, progressive: true });
    } else if (mimeType === "image/png") {
      image = image.png({ compressionLevel: 9 });
    } else if (mimeType === "image/webp") {
      image = image.webp({ quality: 85 });
    }

    return await image.toBuffer();
  }

  /**
   * Создает thumbnail изображения
   * @param buffer Буфер с изображением
   * @param width Ширина thumbnail
   * @param height Высота thumbnail
   * @returns Буфер с thumbnail
   */
  async createThumbnail(
    buffer: Buffer,
    width: number = 200,
    height: number = 200
  ): Promise<Buffer> {
    return await sharp(buffer)
      .resize(width, height, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 80 })
      .toBuffer();
  }
}
