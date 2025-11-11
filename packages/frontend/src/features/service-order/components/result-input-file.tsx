"use client";

import { useState, useCallback } from "react";
import { Upload, X, FileText, Image, File, Download, Eye } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useUploadFileMutation,
  useDeleteFileMutation,
  FileCategory,
  FileEntityType,
  type FileResponseDto,
  FilePreviewDialog,
} from "@/features/file";
import { fileHelpers } from "@/features/file/file.api";
import { useAppSelector } from "@/store/hooks";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export type SavedFileData = {
  fileId: string;
  filename: string;
  mimeType: string;
  size: number;
  description?: string;
  uploadedAt: string;
};

type ResultInputFileProps = {
  value: SavedFileData | null;
  onChange: (value: SavedFileData | null) => void;
  disabled?: boolean;
  patientId: string;
  serviceOrderId: string;
};

export const ResultInputFile = ({
  value,
  onChange,
  disabled = false,
  patientId,
  serviceOrderId,
}: ResultInputFileProps) => {
  const token = useAppSelector((state) => state.auth.token);
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [deleteFile] = useDeleteFileMutation();
  const [description, setDescription] = useState(value?.description ?? "");
  const [dragActive, setDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileResponseDto | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    },
    [disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();

      if (disabled) return;

      if (e.target.files && e.target.files[0]) {
        handleFileUpload(e.target.files[0]);
      }
    },
    [disabled]
  );

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`Тип файла ${file.type} не поддерживается`);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Файл ${file.name} слишком большой. Максимальный размер 10МБ`);
      return;
    }

    try {
      const result = await uploadFile({
        file,
        dto: {
          category: FileCategory.ANALYSIS_RESULT,
          title: file.name,
          description: description || undefined,
          entityType: FileEntityType.SERVICE_ORDER,
          entityId: serviceOrderId,
        },
      }).unwrap();

      const savedData: SavedFileData = {
        fileId: result.id,
        filename: result.filename,
        mimeType: result.mimeType,
        size: result.size,
        description: description || undefined,
        uploadedAt: result.uploadedAt,
      };

      onChange(savedData);
      toast.success("Файл успешно загружен");
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : undefined;
      toast.error(errorMessage ?? "Ошибка при загрузке файла");
    }
  };

  const handleRemoveFile = async () => {
    if (!value) return;

    try {
      await deleteFile(value.fileId).unwrap();
      onChange(null);
      toast.success("Файл удален");
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : undefined;
      toast.error(errorMessage ?? "Ошибка при удалении файла");
    }
  };

  const handleDownloadFile = async () => {
    if (!value || !token) return;

    try {
      await fileHelpers.downloadFile(value.fileId, value.filename, token);
      toast.success("Файл успешно загружен");
    } catch (error) {
      toast.error("Ошибка при скачивании файла");
    }
  };

  const handlePreviewFile = () => {
    if (!value) return;

    // Создаем FileResponseDto объект для предпросмотра
    const fileForPreview: FileResponseDto = {
      id: value.fileId,
      filename: value.filename,
      storedName: value.fileId,
      path: '',
      mimeType: value.mimeType,
      size: value.size,
      category: FileCategory.ANALYSIS_RESULT,
      uploadedById: '',
      uploadedAt: value.uploadedAt,
      description: value.description,
    };

    setPreviewFile(fileForPreview);
    setPreviewOpen(true);
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    if (value) {
      onChange({
        ...value,
        description: newDescription || undefined,
      });
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <Image className="h-5 w-5" />;
    }
    if (mimeType === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="description">Описание результата (опционально)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Краткое описание результата..."
          className="min-h-[80px] mt-2"
          disabled={disabled}
        />
      </div>

      {!value ? (
        <div className="space-y-2">
          <Label>Загрузить файл результата</Label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
              disabled={disabled || isUploading}
            />

            <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {isUploading ? "Загрузка..." : "Загрузить файл"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Перетащите файл сюда или нажмите для выбора
            </p>
            <p className="text-xs text-muted-foreground">
              Поддерживаются PDF, DOC, DOCX, JPG, PNG, GIF, TXT файлы до 10МБ
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Загруженный файл</Label>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {getFileIcon(value.mimeType)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{value.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(value.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePreviewFile}
                disabled={disabled}
                title="Просмотреть файл"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadFile}
                disabled={disabled}
                title="Скачать файл"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={disabled}
                title="Удалить файл"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2 text-sm">Требования к файлу</h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <div>• Поддерживаемые форматы: PDF, DOC, DOCX, JPG, PNG, GIF, TXT</div>
          <div>• Максимальный размер файла: 10МБ</div>
          <div>• Файл будет надежно сохранен и зашифрован</div>
        </div>
      </div>

      <FilePreviewDialog
        file={previewFile}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
};
