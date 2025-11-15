"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatFileSize } from "@/lib/file.utils";
import { FileCategory, FileEntityType, type UploadFileDto } from "../file.dto";
import { useUploadFileMutation } from "../file.api";
import { FILE_CATEGORY_LABELS } from "../file.constants";

type UploadFileSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: FileEntityType;
  entityId: string;
  allowedCategories?: FileCategory[];
  defaultCategory?: FileCategory;
  onSuccess?: () => void;
};

export function UploadFileSheet({
  open,
  onOpenChange,
  entityType,
  entityId,
  allowedCategories,
  defaultCategory = FileCategory.GENERAL,
  onSuccess,
}: UploadFileSheetProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState("");
  const [fileDescription, setFileDescription] = useState("");
  const [fileCategory, setFileCategory] =
    useState<FileCategory>(defaultCategory);

  const [uploadFile, { isLoading }] = useUploadFileMutation();

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setFileTitle("");
        setFileDescription("");
      }
    },
    [],
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      toast.error("Выберите файл для загрузки");
      return;
    }

    try {
      await uploadFile({
        file: selectedFile,
        dto: {
          category: fileCategory,
          title: fileTitle || undefined,
          description: fileDescription || undefined,
          entityType,
          entityId,
        },
      }).unwrap();

      toast.success("Файл успешно загружен");
      onOpenChange(false);

      // Reset form
      setSelectedFile(null);
      setFileTitle("");
      setFileDescription("");
      setFileCategory(defaultCategory);

      onSuccess?.();
    } catch (error) {
      toast.error("Ошибка при загрузке файла");
    }
  }, [
    selectedFile,
    fileCategory,
    fileTitle,
    fileDescription,
    entityType,
    entityId,
    defaultCategory,
    uploadFile,
    onOpenChange,
    onSuccess,
  ]);

  const availableCategories = allowedCategories
    ? Object.entries(FILE_CATEGORY_LABELS).filter(([key]) =>
        allowedCategories.includes(key as FileCategory),
      )
    : Object.entries(FILE_CATEGORY_LABELS);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Загрузить файл</SheetTitle>
          <SheetDescription>
            Выберите файл для загрузки и заполните необходимую информацию
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="file">Файл</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Выбран: {selectedFile.name} (
                  {formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Категория</Label>
              <Select
                value={fileCategory}
                onValueChange={(value) =>
                  setFileCategory(value as FileCategory)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Название (опционально)</Label>
              <Input
                id="title"
                value={fileTitle}
                onChange={(e) => setFileTitle(e.target.value)}
                placeholder="Введите название файла"
              />
            </div>

            <div>
              <Label htmlFor="description">Описание (опционально)</Label>
              <Textarea
                id="description"
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                placeholder="Введите описание файла"
                rows={3}
              />
            </div>
          </div>
        </SheetBody>
        <SheetFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || isLoading}>
            {isLoading ? "Загрузка..." : "Загрузить"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
