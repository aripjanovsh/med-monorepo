"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Save,
  Code,
  FileText,
  Copy,
  ClipboardPaste,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { CreateProtocolTemplateDto } from "@/types/protocol-template";

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

export default function CreateProtocolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [jsonContent, setJsonContent] = useState("");
  const [formData, setFormData] = useState<CreateProtocolTemplateDto>({
    name: "",
    description: "",
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Название протокола обязательно");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Описание протокола обязательно");
      return;
    }
  };

  const handleCancel = () => {
    router.push("/cabinet/settings/protocols");
  };

  const handleEditorChange = (content: string) => {
    setFormData({ ...formData, content });
    setJsonContent(content);
  };

  const handleJsonChange = (value: string) => {
    setJsonContent(value);
    try {
      // Проверяем, что это валидный JSON
      JSON.parse(value);
      setFormData({ ...formData, content: value });
    } catch (error) {
      // Если JSON невалидный, не обновляем редактор
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
      // Проверяем, что это валидный JSON
      JSON.parse(text);
      setJsonContent(text);
      setFormData({ ...formData, content: text });
      toast.success("JSON вставлен из буфера обмена");
    } catch (error) {
      toast.error("Невалидный JSON в буфере обмена");
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonContent(formatted);
      toast.success("JSON отформатирован");
    } catch (error) {
      toast.error("Невалидный JSON");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Создание протокола
          </h1>
          <p className="text-muted-foreground">
            Создайте новый шаблон медицинского протокола
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Содержимое протокола</Label>
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
                  initialContent={formData.content}
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
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Создать протокол
          </Button>
        </div>
      </form>
    </div>
  );
}
