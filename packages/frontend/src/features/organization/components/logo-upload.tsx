"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/dialogs";
import {
  useUploadFileMutation,
  useDeleteFileMutation,
  fileHelpers,
} from "@/features/file/file.api";
import { FileCategory } from "@/features/file/file.dto";
import { Building2, Camera, Loader2, Trash2 } from "lucide-react";

type LogoUploadProps = {
  currentLogoId?: string;
  onLogoChange: (fileId: string | undefined) => void;
  companyName?: string;
};

export function LogoUpload({
  currentLogoId,
  onLogoChange,
  companyName = "",
}: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadFile] = useUploadFileMutation();
  const [deleteFile] = useDeleteFileMutation();
  const confirm = useConfirmDialog();

  // Get logo URL
  const logoUrl = currentLogoId ? fileHelpers.getImageUrl(currentLogoId) : null;

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Пожалуйста, выберите изображение");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Размер файла не должен превышать 5 МБ");
        return;
      }

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setIsUploading(true);

      try {
        const result = await uploadFile({
          file,
          dto: {
            category: FileCategory.LOGO,
            title: "Логотип компании",
          },
        }).unwrap();

        onLogoChange(result.id);
        toast.success("Логотип обновлен");
      } catch {
        toast.error("Ошибка при загрузке логотипа");
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [uploadFile, onLogoChange]
  );

  const handleRemoveLogo = useCallback(async () => {
    if (!currentLogoId) return;

    confirm({
      title: "Удалить логотип?",
      description:
        "Это действие удалит логотип компании. Вы сможете загрузить новый логотип в любое время.",
      variant: "destructive",
      confirmText: "Удалить",
      cancelText: "Отмена",
      onConfirm: async () => {
        setIsDeleting(true);

        try {
          // First, nullify the reference by updating the organization
          onLogoChange(undefined);
          setPreviewUrl(null);

          // Then soft delete the file
          await deleteFile(currentLogoId).unwrap();

          toast.success("Логотип удален");
        } catch {
          toast.error("Ошибка при удалении логотипа");
        } finally {
          setIsDeleting(false);
        }
      },
    });
  }, [confirm, deleteFile, onLogoChange, currentLogoId]);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Determine which image to show
  const displayUrl = previewUrl ?? logoUrl;
  const isPreview = !!previewUrl;

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <div className="h-24 w-24 rounded-2xl border-2 border-muted  flex items-center justify-center overflow-hidden">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt={companyName || "Логотип компании"}
              fill
              sizes="96px"
              className="object-contain p-2"
              unoptimized={isPreview}
            />
          ) : (
            <Building2 className="h-10 w-10 text-blue-600" />
          )}
        </div>
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleButtonClick}
            disabled={isUploading}
          >
            <Camera />
            {currentLogoId ? "Изменить логотип" : "Загрузить логотип"}
          </Button>

          {currentLogoId && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveLogo}
              disabled={isUploading || isDeleting}
            >
              <Trash2 />
              Удалить
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          PNG, JPG или SVG. Максимум 5 МБ.
        </p>
      </div>
    </div>
  );
}
