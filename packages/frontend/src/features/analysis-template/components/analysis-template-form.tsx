"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { Copy, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  useCreateAnalysisTemplateMutation,
  useUpdateAnalysisTemplateMutation,
} from "../analysis-template.api";
import type { AnalysisTemplateFormData } from "../analysis-template.schema";
import { analysisTemplateFormSchema } from "../analysis-template.schema";
import { PRESET_TEMPLATES } from "../analysis-template.constants";
import { ParametersTable } from "./parameters-table";

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

  const form = useForm<AnalysisTemplateFormData>({
    resolver: yupResolver(analysisTemplateFormSchema) as any,
    defaultValues: initialData ?? {
      id: undefined,
      name: "",
      code: "",
      description: "",
      parameters: [],
    },
  });

  const { watch, setValue, reset } = form;
  const parameters = watch("parameters") ?? [];

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

      const newParameters = preset.parameters.map((param, index) => ({
        ...param,
        id: (Date.now() + index).toString(),
      }));
      setValue("parameters", newParameters);
    }
  };

  const onSubmit = async (data: AnalysisTemplateFormData) => {
    try {
      const requestData = {
        ...data,
        parameters: data.parameters.map(({ id, ...param }) => param as any),
      };

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
          `Ошибка при ${mode === "create" ? "создании" : "обновлении"} шаблона`
      );
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
          <ParametersTable
            parameters={parameters as any}
            onParametersChange={(newParameters) =>
              setValue("parameters", newParameters as any)
            }
          />
          {form.formState.errors.parameters && (
            <p className="text-sm text-destructive mt-2">
              {form.formState.errors.parameters.message}
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
