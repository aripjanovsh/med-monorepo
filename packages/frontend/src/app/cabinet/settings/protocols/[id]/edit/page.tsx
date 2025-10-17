"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import {
  ProtocolTemplate,
  UpdateProtocolTemplateDto,
} from "@/types/protocol-template";
import {
  useGetProtocolTemplateQuery,
  useUpdateProtocolTemplateMutation,
} from "@/features/protocol-templates/protocol-template.api";

// Динамический импорт редактора для избежания SSR проблем
const ProtocolEditor = dynamic(
  () => import("@/components/editor/ProtocolEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded-lg p-8 text-center text-muted-foreground animate-pulse">
        Загрузка редактора...
      </div>
    ),
  }
);

export default function EditProtocolPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: protocol, isLoading, error } = useGetProtocolTemplateQuery(id);
  const [updateProtocol, { isLoading: isSaving }] = useUpdateProtocolTemplateMutation();
  const [formData, setFormData] = useState<UpdateProtocolTemplateDto>({
    name: "",
    description: "",
    content: "",
  });

  useEffect(() => {
    if (protocol) {
      setFormData({
        name: protocol.name,
        description: protocol.description,
        content: protocol.content,
      });
    }
  }, [protocol]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error("Название протокола обязательно");
      return;
    }

    if (!formData.description?.trim()) {
      toast.error("Описание протокола обязательно");
      return;
    }

    if (!formData.content?.trim()) {
      toast.error("Содержимое протокола обязательно");
      return;
    }

    try {
      // Validate JSON content
      JSON.parse(formData.content);

      await updateProtocol({ id, data: formData }).unwrap();
      toast.success("Протокол успешно обновлен");
      router.push("/cabinet/settings/protocols");
    } catch (error: any) {
      console.error("Error updating protocol:", error);
      
      if (error.data?.message) {
        toast.error(error.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Ошибка при обновлении протокола");
      }
    }
  };

  const handleCancel = () => {
    router.push("/cabinet/settings/protocols");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Загрузка протокола...</p>
        </div>
      </div>
    );
  }

  if (error || !protocol) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-destructive">Ошибка при загрузке протокола</p>
          <Button onClick={() => router.push("/cabinet/settings/protocols")}>
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Редактирование протокола
          </h1>
          <p className="text-muted-foreground">
            Измените шаблон медицинского протокола
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название протокола *</Label>
            <Input
              id="name"
              placeholder="Например: Протокол первичного осмотра"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание *</Label>
            <Textarea
              id="description"
              placeholder="Краткое описание назначения протокола"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label>Содержимое протокола</Label>
            <ProtocolEditor
              initialContent={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Начните вводить текст протокола или добавьте элементы формы..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Сохранить изменения
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
