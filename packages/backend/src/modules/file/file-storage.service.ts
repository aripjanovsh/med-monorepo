import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs/promises";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly uploadPath: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadPath =
      this.configService.get<string>("FILE_STORAGE_PATH") || "uploads";
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

    const filePath = path.join(companyId, year, month, fileId);

    return { filePath, fileId };
  }

  /**
   * Получает полный путь к файлу на диске
   * @param relativePath Относительный путь файла
   * @returns Абсолютный путь к файлу
   */
  getFullPath(relativePath: string): string {
    return path.join(process.cwd(), this.uploadPath, relativePath);
  }

  /**
   * Создает директорию если она не существует
   * @param dirPath Путь к директории
   */
  async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create directory: ${dirPath}`, error);
      throw error;
    }
  }

  /**
   * Сохраняет файл на диск
   * @param buffer Буфер с содержимым файла
   * @param relativePath Относительный путь для сохранения
   * @param filename Имя файла
   * @returns Полный путь к сохраненному файлу
   */
  async saveFile(
    buffer: Buffer,
    relativePath: string,
    filename: string
  ): Promise<string> {
    const fullPath = this.getFullPath(relativePath);

    // Создаем директорию включая сам fullPath
    await this.ensureDirectory(fullPath);

    const filePath = path.join(fullPath, filename);
    await fs.writeFile(filePath, buffer);

    this.logger.log(`File saved: ${filePath}`);
    return filePath;
  }

  /**
   * Удаляет файл с диска
   * @param relativePath Относительный путь к файлу
   * @param filename Имя файла
   */
  async deleteFile(relativePath: string, filename: string): Promise<void> {
    try {
      const fullPath = this.getFullPath(relativePath);
      const filePath = path.join(fullPath, filename);

      await fs.unlink(filePath);
      this.logger.log(`File deleted: ${filePath}`);

      // Попытка удалить пустые директории
      await this.cleanupEmptyDirectories(fullPath);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${relativePath}/${filename}`, error);
      // Не бросаем ошибку, так как файл может уже быть удален
    }
  }

  /**
   * Читает файл с диска
   * @param relativePath Относительный путь к файлу
   * @param filename Имя файла
   * @returns Буфер с содержимым файла
   */
  async readFile(relativePath: string, filename: string): Promise<Buffer> {
    const fullPath = this.getFullPath(relativePath);
    const filePath = path.join(fullPath, filename);

    return await fs.readFile(filePath);
  }

  /**
   * Проверяет существование файла
   * @param relativePath Относительный путь к файлу
   * @param filename Имя файла
   * @returns true если файл существует
   */
  async fileExists(relativePath: string, filename: string): Promise<boolean> {
    try {
      const fullPath = this.getFullPath(relativePath);
      const filePath = path.join(fullPath, filename);

      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Удаляет пустые директории рекурсивно
   * @param dirPath Путь к директории
   */
  private async cleanupEmptyDirectories(dirPath: string): Promise<void> {
    try {
      const files = await fs.readdir(dirPath);

      if (files.length === 0) {
        await fs.rmdir(dirPath);
        this.logger.log(`Empty directory removed: ${dirPath}`);

        // Рекурсивно проверяем родительскую директорию
        const parentDir = path.dirname(dirPath);
        await this.cleanupEmptyDirectories(parentDir);
      }
    } catch (error) {
      // Игнорируем ошибки - директория может быть не пустой или это корневая директория
    }
  }
}
