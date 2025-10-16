"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Play,
  Code,
  FileText,
  Copy,
  ClipboardPaste,
  Download,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Динамический импорт компонента рендеринга формы
const InteractiveFormRenderer = dynamic(
  () => import("@/components/protocols/InteractiveFormRenderer"),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded-lg p-8 text-center text-muted-foreground animate-pulse">
        Загрузка формы...
      </div>
    ),
  }
);

export default function InteractiveProtocolPage() {
  const router = useRouter();
  const [jsonContent, setJsonContent] = useState("");
  const [parsedContent, setParsedContent] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState("input");

  const handleBack = () => {
    router.push("/cabinet/settings/protocols");
  };

  const handleJsonChange = (value: string) => {
    setJsonContent(value);
  };

  const parseAndRender = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      setParsedContent(parsed);
      setActiveTab("form");
      toast.success("JSON успешно распарсен");
    } catch (error) {
      toast.error("Невалидный JSON");
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

  const clearForm = () => {
    setJsonContent("");
    setParsedContent(null);
    setFormData({});
    setActiveTab("input");
    toast.success("Форма очищена");
  };

  const exportFormData = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `protocol-data-${Date.now()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("Данные формы экспортированы");
  };

  const loadExample = () => {
    const exampleJson = {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Протокол осмотра пациента",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "heading",
            version: 1,
            tag: "h1",
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "ФИО пациента: ",
                type: "text",
                version: 1,
              },
              {
                type: "text-input",
                version: 1,
                data: {
                  type: "text",
                  id: "patient-name",
                  label: "",
                  placeholder: "Введите ФИО",
                  required: true,
                  displayMode: "inline",
                  width: "250px",
                },
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Возраст: ",
                type: "text",
                version: 1,
              },
              {
                type: "text-input",
                version: 1,
                data: {
                  type: "text",
                  id: "patient-age",
                  label: "",
                  placeholder: "00",
                  required: true,
                  displayMode: "inline",
                  width: "60px",
                },
              },
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: " лет",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Жалобы:",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
          {
            type: "textarea-input",
            version: 1,
            data: {
              type: "textarea",
              id: "complaints",
              label: "",
              placeholder: "Опишите жалобы пациента...",
              required: false,
              displayMode: "block",
              rows: 4,
            },
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    };

    setJsonContent(JSON.stringify(exampleJson, null, 2));
    toast.success("Пример загружен");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Интерактивная форма
            </h1>
            <p className="text-muted-foreground">
              Вставьте JSON протокола для создания интерактивной формы
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadExample}>
            Загрузить пример
          </Button>
          <Button variant="outline" onClick={clearForm}>
            <Trash2 className="mr-2 h-4 w-4" />
            Очистить
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="input">
            <Code className="mr-2 h-4 w-4" />
            JSON ввод
          </TabsTrigger>
          <TabsTrigger value="form" disabled={!parsedContent}>
            <FileText className="mr-2 h-4 w-4" />
            Форма
          </TabsTrigger>
          <TabsTrigger value="result" disabled={!parsedContent}>
            <Download className="mr-2 h-4 w-4" />
            Результат
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON редактор</CardTitle>
              <CardDescription>
                Вставьте JSON из редактора протоколов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  Копировать
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pasteFromClipboard}
                >
                  <ClipboardPaste className="mr-2 h-4 w-4" />
                  Вставить
                </Button>
                <Button variant="outline" size="sm" onClick={formatJson}>
                  Форматировать
                </Button>
              </div>
              <Textarea
                value={jsonContent}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="font-mono text-sm min-h-[400px]"
                placeholder='{"root": {"children": [...]}}'
              />
              <Button
                onClick={parseAndRender}
                className="w-full"
                disabled={!jsonContent}
              >
                <Play className="mr-2 h-4 w-4" />
                Создать форму
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Интерактивная форма</CardTitle>
              <CardDescription>Заполните поля формы</CardDescription>
            </CardHeader>
            <CardContent>
              {parsedContent && (
                <InteractiveFormRenderer
                  content={parsedContent}
                  onFormDataChange={setFormData}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="result" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Результат заполнения</CardTitle>
              <CardDescription>Данные, введенные в форму</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportFormData}>
                  <Download className="mr-2 h-4 w-4" />
                  Экспортировать
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[500px]">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
