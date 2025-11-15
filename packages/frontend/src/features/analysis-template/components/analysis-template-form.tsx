"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { Copy, Wand2, Code, Eye, Blocks, ClipboardPaste } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useCreateAnalysisTemplateMutation,
  useUpdateAnalysisTemplateMutation,
} from "../analysis-template.api";
import type { AnalysisTemplateFormData } from "../analysis-template.schema";
import { analysisTemplateFormSchema } from "../analysis-template.schema";
import { PRESET_TEMPLATES } from "../analysis-template.constants";
import {
  AnalysisFormEditor,
  AnalysisFormInteractive,
} from "@/features/analysis-form-builder";
import type { FilledAnalysisData } from "@/features/analysis-form-builder";
import { convertFormDataToDto } from "../utils/template.helpers";
import { formatTemplateContent } from "../analysis-template.model";

type AnalysisTemplateFormProps = {
  mode: "create" | "edit";
  initialData?: AnalysisTemplateFormData;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export const AnalysisTemplateForm = ({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: AnalysisTemplateFormProps) => {
  const [createTemplate, { isLoading: isCreating }] =
    useCreateAnalysisTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] =
    useUpdateAnalysisTemplateMutation();

  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [activeTab, setActiveTab] = useState("editor");
  const [jsonContent, setJsonContent] = useState("");
  const [previewData, setPreviewData] = useState<FilledAnalysisData | null>(
    null,
  );

  const form = useForm<AnalysisTemplateFormData>({
    resolver: yupResolver(analysisTemplateFormSchema) as any,
    defaultValues: initialData ?? {
      id: undefined,
      name: "",
      code: "",
      description: "",
      template: {
        version: 1,
        sections: [],
      },
    },
  });

  const { watch, setValue, reset } = form;
  const template = watch("template") ?? { version: 1, sections: [] };
  const name = watch("name") ?? "";

  // Sync jsonContent when template changes
  useEffect(() => {
    setJsonContent(JSON.stringify(template, null, 2));
  }, [template]);

  // Reset form when initialData changes (important for edit mode)
  useEffect(() => {
    if (initialData) {
      console.log("Resetting form with initialData:", initialData);
      reset(initialData);
    }
  }, [initialData, reset]);

  const loadPreset = (presetName: string) => {
    const preset = PRESET_TEMPLATES.find((p) => p.name === presetName);
    if (preset) {
      setValue("name", preset.name);
      setValue("code", preset.code);
      setValue("description", preset.description);

      // Convert old flat parameters to new section structure
      const newParameters = preset.parameters.map((param, index) => ({
        ...param,
        id: (Date.now() + index).toString(),
      }));

      const newTemplate = {
        version: 1,
        sections: [
          {
            id: Date.now().toString(),
            title: "Основные показатели",
            description: "",
            parameters: newParameters,
          },
        ],
      };

      setValue("template", newTemplate);
      setJsonContent(JSON.stringify(newTemplate, null, 2));
    }
  };

  const onSubmit = async (data: AnalysisTemplateFormData) => {
    try {
      const requestData = convertFormDataToDto(data);

      if (mode === "create") {
        await createTemplate(requestData as any).unwrap();
        toast.success("Шаблон анализа успешно создан");
      } else {
        if (!data.id) {
          throw new Error("ID шаблона не найден");
        }
        await updateTemplate({
          id: data.id,
          ...requestData,
        } as any).unwrap();
        toast.success("Шаблон анализа успешно обновлен");
      }

      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error?.data?.message ??
          `Ошибка при ${mode === "create" ? "создании" : "обновлении"} шаблона`,
      );
    }
  };

  const handleEditorChange = (newTemplate: any) => {
    setValue("template", newTemplate);
    setJsonContent(JSON.stringify(newTemplate, null, 2));
  };

  const handleJsonChange = (value: string) => {
    setJsonContent(value);
    try {
      const parsed = JSON.parse(value);
      setValue("template", parsed);
      form.clearErrors("template");
    } catch {
      form.setError("template", {
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
      setValue("template", JSON.parse(text));
      toast.success("JSON вставлен из буфера обмена");
    } catch (error) {
      toast.error("Невалидный JSON в буфере обмена");
    }
  };

  const formatJson = () => {
    try {
      const formatted = formatTemplateContent(jsonContent);
      setJsonContent(formatted);
      toast.success("JSON отформатирован");
    } catch (error) {
      toast.error("Невалидный JSON");
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Preset Templates */}
      {mode === "create" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Быстрое создание
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {PRESET_TEMPLATES.map((preset) => (
                <Button
                  key={preset.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPreset(preset.name);
                    loadPreset(preset.name);
                  }}
                  className={
                    selectedPreset === preset.name ? "border-primary" : ""
                  }
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {preset.name}
                </Button>
              ))}
            </div>
            {selectedPreset && (
              <p className="text-sm text-muted-foreground mt-2">
                Загружен шаблон &quot;{selectedPreset}&quot;. Вы можете изменить
                его по необходимости.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название анализа *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Например: Общий анализ крови"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Код анализа *</Label>
              <Input
                id="code"
                {...form.register("code")}
                placeholder="Например: OAK-001"
              />
              {form.formState.errors.code && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.code.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Описание анализа и его назначение"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Параметры анализа</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">
                <Blocks className="mr-2 h-4 w-4" />
                Редактор
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="mr-2 h-4 w-4" />
                Предпросмотр
              </TabsTrigger>
              <TabsTrigger value="json">
                <Code className="mr-2 h-4 w-4" />
                JSON
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="mt-4">
              <AnalysisFormEditor
                template={template}
                onChange={handleEditorChange}
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <div className="border rounded-lg p-4 min-h-[500px]">
                {template.sections && template.sections.length > 0 ? (
                  <AnalysisFormInteractive
                    template={{
                      id: "preview",
                      name: name || "Предпросмотр",
                      sections: template.sections,
                    }}
                    value={previewData}
                    onChange={setPreviewData}
                    disabled={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    Добавьте параметры в редакторе для предпросмотра
                  </div>
                )}
              </div>
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
                  className="font-mono text-sm min-h-[500px]"
                  placeholder="JSON представление шаблона анализа..."
                />
              </div>
            </TabsContent>
          </Tabs>
          {form.formState.errors.template && (
            <p className="text-sm text-destructive mt-2">
              {form.formState.errors.template.message ?? "Ошибка в шаблоне"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? mode === "create"
              ? "Создание..."
              : "Обновление..."
            : mode === "create"
              ? "Создать шаблон"
              : "Сохранить изменения"}
        </Button>
      </div>
    </form>
  );
};
