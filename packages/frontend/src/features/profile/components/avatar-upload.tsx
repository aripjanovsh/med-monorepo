"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  useUploadFileMutation,
  useDeleteFileMutation,
  fileHelpers,
} from "@/features/file/file.api";
import { FileCategory } from "@/features/file/file.dto";
import { Camera, Loader2, Trash2 } from "lucide-react";

type AvatarUploadProps = {
  currentAvatarId?: string;
  onAvatarChange: (fileId: string | undefined) => void;
  userName?: string;
};

export function AvatarUpload({
  currentAvatarId,
  onAvatarChange,
  userName = "",
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadFile] = useUploadFileMutation();
  const [deleteFile] = useDeleteFileMutation();

  // Generate initials from user name
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Get avatar URL
  const avatarUrl = currentAvatarId
    ? fileHelpers.getImageUrl(currentAvatarId)
    : null;

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
            category: FileCategory.AVATAR,
            title: "Аватар профиля",
          },
        }).unwrap();

        onAvatarChange(result.id);
        toast.success("Фото профиля обновлено");
      } catch {
        toast.error("Ошибка при загрузке фото");
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
        // Reset input to allow selecting the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [uploadFile, onAvatarChange]
  );

  const handleRemoveAvatar = useCallback(async () => {
    if (!currentAvatarId) return;

    try {
      await deleteFile(currentAvatarId).unwrap();
      onAvatarChange(undefined);
      setPreviewUrl(null);
      toast.success("Фото профиля удалено");
    } catch {
      toast.error("Ошибка при удалении фото");
    }
  }, [deleteFile, onAvatarChange, currentAvatarId]);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Determine which image to show
  const displayUrl = previewUrl ?? avatarUrl;
  // Use unoptimized for blob URLs (preview), optimized for server URLs
  const isPreview = !!previewUrl;

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Avatar className="h-24 w-24 rounded-full border-2 border-muted overflow-hidden">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt={userName}
              fill
              sizes="96px"
              className="object-cover"
              unoptimized={isPreview}
            />
          ) : (
            <AvatarFallback className="text-2xl font-medium">
              {initials || "?"}
            </AvatarFallback>
          )}
        </Avatar>
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
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
            {currentAvatarId ? "Изменить фото" : "Загрузить фото"}
          </Button>

          {currentAvatarId && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveAvatar}
              disabled={isUploading}
            >
              <Trash2 />
              Удалить
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          JPG, PNG или GIF. Максимум 5 МБ.
        </p>
      </div>
    </div>
  );
}
