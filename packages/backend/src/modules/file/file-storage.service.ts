import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.configService.get<string>(
      "CLOUDFLARE_R2_ACCOUNT_ID"
    );
    const secretAccessKey = this.configService.get<string>(
      "CLOUDFLARE_R2_SECRET_ACCESS_KEY"
    );
    const customEndpoint = this.configService.get<string>(
      "CLOUDFLARE_R2_S3_API"
    );
    this.bucketName =
      this.configService.get<string>("CLOUDFLARE_R2_BUCKET_NAME") || "";

    // Use custom endpoint if provided, otherwise use default Cloudflare R2 format
    const endpoint =
      customEndpoint || `https://${accessKeyId}.r2.cloudflarestorage.com`;

    this.s3Client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.logger.log(
      `Initialized Cloudflare R2 storage with bucket: ${this.bucketName}`
    );
  }

  /**
   * Генерирует путь для сохранения файла
   * @param companyId ID организации
   * @returns Относительный путь: companyId/YYYY/MM/fileId
   */
  generateFilePath(companyId: string): { filePath: string; fileId: string } {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const fileId = uuidv4();

    const filePath = `${companyId}/${year}/${month}/${fileId}`;

    return { filePath, fileId };
  }

  /**
   * Получает полный ключ S3 объекта
   * @param relativePath Относительный путь файла
   * @param filename Имя файла
   * @returns S3 key
   */
  private getS3Key(relativePath: string, filename: string): string {
    return `${relativePath}/${filename}`;
  }

  /**
   * Сохраняет файл в R2
   * @param buffer Буфер с содержимым файла
   * @param relativePath Относительный путь для сохранения
   * @param filename Имя файла
   * @returns S3 key сохраненного файла
   */
  async saveFile(
    buffer: Buffer,
    relativePath: string,
    filename: string
  ): Promise<string> {
    const key = this.getS3Key(relativePath, filename);

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
        })
      );

      this.logger.log(`File saved to R2: ${key}`);
      return key;
    } catch (error) {
      this.logger.error(`Failed to save file to R2: ${key}`, error);
      throw error;
    }
  }

  /**
   * Удаляет файл из R2
   * @param relativePath Относительный путь к файлу
   * @param filename Имя файла
   */
  async deleteFile(relativePath: string, filename: string): Promise<void> {
    const key = this.getS3Key(relativePath, filename);

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );

      this.logger.log(`File deleted from R2: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from R2: ${key}`, error);
      // Не бросаем ошибку, так как файл может уже быть удален
    }
  }

  /**
   * Читает файл из R2
   * @param relativePath Относительный путь к файлу
   * @param filename Имя файла
   * @returns Буфер с содержимым файла
   */
  async readFile(relativePath: string, filename: string): Promise<Buffer> {
    const key = this.getS3Key(relativePath, filename);

    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );

      if (!response.Body) {
        throw new Error("Empty response body");
      }

      // Конвертируем ReadableStream в Buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(`Failed to read file from R2: ${key}`, error);
      throw error;
    }
  }

  /**
   * Проверяет существование файла в R2
   * @param relativePath Относительный путь к файлу
   * @param filename Имя файла
   * @returns true если файл существует
   */
  async fileExists(relativePath: string, filename: string): Promise<boolean> {
    const key = this.getS3Key(relativePath, filename);

    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );
      return true;
    } catch {
      return false;
    }
  }
}
