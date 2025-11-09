"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAnalysisTemplatesQuery } from "@/features/analysis-template";
import {
  AnalysisFormInteractive,
  type FilledAnalysisData,
  type SavedAnalysisData,
  type AnalysisResultRow,
  normalizeAnalysisTemplate,
} from "@/features/analysis-form-builder";

// Re-export types for backward compatibility
export type AnalysisResultData = SavedAnalysisData;

interface ResultInputAnalysisProps {
  value: SavedAnalysisData | null;
  onChange: (value: SavedAnalysisData) => void;
  disabled?: boolean;
  patientId?: string;
  serviceOrderId?: string;
}

export const ResultInputAnalysis = ({
  value,
  onChange,
  disabled = false,
  patientId = "",
  serviceOrderId = "",
}: ResultInputAnalysisProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    value?.templateId || ""
  );

  // Sync selectedTemplateId with value prop
  useEffect(() => {
    if (value?.templateId !== selectedTemplateId) {
      setSelectedTemplateId(value?.templateId || "");
    }
  }, [value?.templateId, selectedTemplateId]);

  const { data: templatesData } = useGetAnalysisTemplatesQuery({
    page: 1,
    limit: 100,
  });

  const templates = templatesData?.data || [];
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);

    // При выборе нового шаблона, сбросить данные
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      // Парсим content (JSON string) и нормализуем
      const contentData = JSON.parse(template.content);
      const normalizedTemplate = normalizeAnalysisTemplate(contentData);

      // Инициализируем rows из всех параметров всех секций
      const initialRows = normalizedTemplate.sections.flatMap((section) =>
        section.parameters.map((param) => ({
          parameterId: param.id,
          parameterName: param.name,
          value: param.type === "BOOLEAN" ? false : "",
          unit: param.unit,
          referenceRanges: param.referenceRanges,
        }))
      );

      onChange({
        templateId: template.id,
        templateName: template.name,
        templateContent: normalizedTemplate,
        filledData: {
          templateId: template.id,
          templateName: template.name,
          rows: initialRows,
        },
        metadata: {
          filledAt: new Date().toISOString(),
          patientId,
          serviceOrderId,
        },
      });
    }
  };

  const handleFilledDataChange = (filledData: FilledAnalysisData) => {
    if (!selectedTemplate) return;

    // Парсим content (JSON string) и нормализуем
    const contentData = JSON.parse(selectedTemplate.content);
    const normalizedTemplate = normalizeAnalysisTemplate(contentData);

    onChange({
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      templateContent: normalizedTemplate,
      filledData,
      metadata: {
        filledAt: new Date().toISOString(),
        patientId,
        serviceOrderId,
      },
    });
  };

  console.log("selectedTemplate", selectedTemplate);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">📊 Анализ по шаблону</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Выберите шаблон анализа и заполните параметры
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-select">Шаблон анализа</Label>
        <Select
          value={selectedTemplateId}
          onValueChange={handleTemplateSelect}
          disabled={disabled}
        >
          <SelectTrigger id="template-select">
            <SelectValue placeholder="Выберите шаблон анализа" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name} ({template.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTemplate ? (
        <AnalysisFormInteractive
          template={{
            id: selectedTemplate.id,
            name: selectedTemplate.name,
            sections: normalizeAnalysisTemplate(
              JSON.parse(selectedTemplate.content)
            ).sections,
          }}
          value={value?.filledData || null}
          onChange={handleFilledDataChange}
          disabled={disabled}
        />
      ) : (
        <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
          Выберите шаблон анализа для начала заполнения
        </div>
      )}
    </div>
  );
};
