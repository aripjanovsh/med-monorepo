import { type ImageTransformOptions } from "@/features/file/file.dto";
import {
  MIME_TYPE_ICONS,
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_DOCUMENT_TYPES,
} from "@/features/file/file.constants";

/**
 * Форматирует размер файла в человекочитаемый формат
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Получает иконку для типа файла
 */
export const getFileIcon = (mimeType: string): string => {
  return MIME_TYPE_ICONS[mimeType] || "📁";
};

/**
 * Проверяет является ли файл изображением
 */
export const isImageFile = (mimeType: string): boolean => {
  return ACCEPTED_IMAGE_TYPES.includes(mimeType);
};

/**
 * Проверяет является ли файл документом
 */
export const isDocumentFile = (mimeType: string): boolean => {
  return ACCEPTED_DOCUMENT_TYPES.includes(mimeType);
};

/**
 * Генерирует URL для получения изображения с трансформацией
 */
export const getImageUrl = (
  storedName: string,
  options?: ImageTransformOptions,
): string => {
  const params = new URLSearchParams();

  if (options?.width) {
    params.set("width", options.width.toString());
  }

  if (options?.height) {
    params.set("height", options.height.toString());
  }

  if (options?.fit) {
    params.set("fit", options.fit);
  }

  if (options?.quality) {
    params.set("quality", options.quality.toString());
  }

  const query = params.toString();
  const baseUrl = `/api/v1/files/img/${storedName}`;

  return query ? `${baseUrl}?${query}` : baseUrl;
};

/**
 * Валидирует тип файла
 */
export const validateFileType = (
  file: File,
  acceptedTypes: string[],
): boolean => {
  return acceptedTypes.includes(file.type);
};

/**
 * Валидирует размер файла
 */
export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

/**
 * Получает расширение файла
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
};

/**
 * Создает превью для изображения
 */
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
};
