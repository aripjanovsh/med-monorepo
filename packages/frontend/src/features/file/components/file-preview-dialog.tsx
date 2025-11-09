"use client";

import { useState, useEffect } from "react";
import { Download, FileIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatFileSize } from "@/lib/file.utils";
import { formatDate } from "@/lib/date.utils";
import type { FileResponseDto } from "../file.dto";
import { fileHelpers } from "../file.api";
import { FILE_CATEGORY_LABELS } from "../file.constants";
import { useAppSelector } from "@/store";

type FilePreviewDialogProps = {
  file: FileResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FilePreviewDialog({
  file,
  open,
  onOpenChange,
}: FilePreviewDialogProps) {
  const token = useAppSelector((state) => state.auth.token);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !file || !token) {
      // Очистка при закрытии
      if (blobUrl) {
        fileHelpers.revokeBlobUrl(blobUrl);
        setBlobUrl(null);
      }
      setLoadError(null);
      return;
    }

    // Загрузка файла
    const loadFile = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const url = await fileHelpers.createBlobUrl(file.id, token);
        setBlobUrl(url);
      } catch (error) {
        console.error("Error loading file:", error);
        setLoadError("Ошибка загрузки файла");
      } finally {
        setIsLoading(false);
      }
    };

    loadFile();

    // Cleanup
    return () => {
      if (blobUrl) {
        fileHelpers.revokeBlobUrl(blobUrl);
      }
    };
  }, [open, file, token]);

  const handleDownload = async () => {
    if (!file || !token) return;

    try {
      await fileHelpers.downloadFile(file.id, file.filename, token);
      toast.success("Файл успешно скачан");
    } catch (error) {
      toast.error("Ошибка при скачивании файла");
    }
  };

  if (!file) return null;

  const isImage = file.mimeType.startsWith("image/");
  const isPdf = file.mimeType === "application/pdf";

  const renderPreview = () => {
    // Loading
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg min-h-[300px]">
          <Loader2 className="h-12 w-12 text-muted-foreground animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Загрузка файла...</p>
        </div>
      );
    }

    // Error
    if (loadError || !blobUrl) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg min-h-[300px]">
          <FileIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2 text-destructive">
            {loadError || "Ошибка загрузки"}
          </p>
          <Button onClick={handleDownload} variant="outline" className="mt-4">
            <Download className="h-4 w-4 mr-2" />
            Попробовать скачать
          </Button>
        </div>
      );
    }

    // Изображения
    if (isImage) {
      return (
        <div className="relative w-full h-[500px] bg-muted rounded-lg overflow-hidden">
          <img
            src={blobUrl}
            alt={file.filename}
            className="w-full h-full object-contain"
          />
        </div>
      );
    }

    // PDF
    if (isPdf) {
      return (
        <div className="w-full h-[600px] bg-muted rounded-lg overflow-hidden">
          <iframe
            src={blobUrl}
            className="w-full h-full border-0"
            title={file.filename}
          />
        </div>
      );
    }

    // Другие файлы - показываем информацию
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg min-h-[300px]">
        <FileIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">{file.filename}</p>
        <p className="text-sm text-muted-foreground mb-4">
          Предпросмотр недоступен для этого типа файла
        </p>
        <Button onClick={handleDownload} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Скачать файл
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="truncate">{file.filename}</span>
          </DialogTitle>
          <DialogDescription>
            <div className="flex flex-wrap gap-4 text-sm mt-2">
              <span>
                <strong>Категория:</strong>{" "}
                {FILE_CATEGORY_LABELS[file.category]}
              </span>
              <span>
                <strong>Размер:</strong> {formatFileSize(file.size)}
              </span>
              <span>
                <strong>Загружено:</strong>{" "}
                {formatDate(file.uploadedAt, "dd.MM.yyyy HH:mm")}
              </span>
            </div>
            {file.title && (
              <p className="mt-2">
                <strong>Название:</strong> {file.title}
              </p>
            )}
            {file.description && (
              <p className="mt-2">
                <strong>Описание:</strong> {file.description}
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">{renderPreview()}</div>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Скачать
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="default">
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
