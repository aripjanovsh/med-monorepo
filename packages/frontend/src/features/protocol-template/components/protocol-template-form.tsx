"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  Code,
  FileText,
  Copy,
  ClipboardPaste,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import type { ProtocolTemplateFormData } from "../protocol-template.schema";
import { protocolTemplateFormSchema } from "../protocol-template.schema";
import { formatProtocolContent } from "../protocol-template.model";

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

type ProtocolTemplateFormProps = {
  mode: "create" | "edit";
  initialData?: ProtocolTemplateFormData;
  onSuccess?: () => void;
  isLoading?: boolean;
  onSubmit: (data: ProtocolTemplateFormData) => Promise<void>;
  onCancel: () => void;
};

export const ProtocolTemplateForm = ({
  mode,
  initialData,
  onSuccess,
  isLoading = false,
  onSubmit,
  onCancel,
}: ProtocolTemplateFormProps) => {
  const [activeTab, setActiveTab] = useState("editor");
  const [jsonContent, setJsonContent] = useState(initialData?.content ?? "");

  const form = useForm<ProtocolTemplateFormData>({
    resolver: yupResolver(protocolTemplateFormSchema),
    defaultValues: initialData ?? {
      name: "",
      description: "",
      content: "",
      isActive: true,
    },
  });

  const handleFormSubmit = async (data: ProtocolTemplateFormData) => {
    try {
      await onSubmit(data);
      toast.success(
        mode === "create"
          ? "Протокол успешно создан"
          : "Протокол успешно обновлен"
      );
      onSuccess?.();
    } catch (error: any) {
      console.error("Error submitting protocol:", error);

      if (error.data?.message) {
        toast.error(error.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error(
          mode === "create"
            ? "Ошибка при создании протокола"
            : "Ошибка при обновлении протокола"
        );
      }
    }
  };

  const handleEditorChange = (content: string) => {
    form.setValue("content", content);
    setJsonContent(content);
  };

  const handleJsonChange = (value: string) => {
    setJsonContent(value);
    try {
      JSON.parse(value);
      form.setValue("content", value);
      form.clearErrors("content");
    } catch {
      form.setError("content", {
        type: "manual",
        message: "Невалидный JSON",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonContent);
      toast.success("JSON скопирован в буфер обмена");
    } catch (error) {
      toast.error("Ошибка при копировании");
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      JSON.parse(text);
      setJsonContent(text);
      form.setValue("content", text);
      toast.success("JSON вставлен из буфера обмена");
    } catch (error) {
      toast.error("Невалидный JSON в буфере обмена");
    }
  };

  const formatJson = () => {
    try {
      const formatted = formatProtocolContent(jsonContent);
      setJsonContent(formatted);
      toast.success("JSON отформатирован");
    } catch (error) {
      toast.error("Невалидный JSON");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Название протокола *</Label>
          <Input
            id="name"
            placeholder="Например: Протокол первичного осмотра"
            {...form.register("name")}
            disabled={isLoading}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Описание *</Label>
          <Textarea
            id="description"
            placeholder="Краткое описание назначения протокола"
            rows={3}
            {...form.register("description")}
            disabled={isLoading}
          />
          {form.formState.errors.description && (
            <p className="text-sm text-destructive">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Содержимое протокола *</Label>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="editor">
                <FileText className="mr-2 h-4 w-4" />
                Редактор
              </TabsTrigger>
              <TabsTrigger value="json">
                <Code className="mr-2 h-4 w-4" />
                JSON
              </TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="mt-4">
              <ProtocolEditor
                initialContent={form.watch("content")}
                onChange={handleEditorChange}
                placeholder="Начните вводить текст протокола или добавьте элементы формы..."
              />
            </TabsContent>
            <TabsContent value="json" className="mt-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Копировать
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={pasteFromClipboard}
                  >
                    <ClipboardPaste className="mr-2 h-4 w-4" />
                    Вставить
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={formatJson}
                  >
                    Форматировать
                  </Button>
                </div>
                <Textarea
                  value={jsonContent}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  className="font-mono text-sm min-h-[400px]"
                  placeholder="JSON представление протокола..."
                />
              </div>
            </TabsContent>
          </Tabs>
          {form.formState.errors.content && (
            <p className="text-sm text-destructive">
              {form.formState.errors.content.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Отмена
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "create" ? "Создание..." : "Сохранение..."}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {mode === "create" ? "Создать протокол" : "Сохранить изменения"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
