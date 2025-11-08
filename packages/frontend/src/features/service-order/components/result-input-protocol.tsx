"use client";

import { useState, useCallback, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileInput, History } from "lucide-react";
import { ProtocolTemplateAutocompleteField } from "@/features/protocol-template";
import type { ProtocolTemplateResponseDto } from "@/features/protocol-template/protocol-template.dto";
import {
  FormBuilderInteractive,
  FormBuilderView,
  isFormBuilderContent,
  type FilledFormData,
} from "@/features/form-builder";
import type { SavedProtocolData } from "@/features/visit/visit-protocol.types";

// Используем SavedProtocolData из visit feature
export type { SavedProtocolData as ProtocolResultData };

interface ResultInputProtocolProps {
  value: SavedProtocolData | null;
  onChange: (value: SavedProtocolData) => void;
  disabled?: boolean;
  patientId?: string; // Опциональный для выбора ранее заполненных
  readonly?: boolean; // Для просмотра завершенных
}

export const ResultInputProtocol = ({
  value,
  onChange,
  disabled = false,
  patientId,
  readonly = false,
}: ResultInputProtocolProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    value?.templateId || ""
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<ProtocolTemplateResponseDto | null>(null);
  const formDataRef = useRef<FilledFormData>(value?.filledData ?? {});
  const [activeTab, setActiveTab] = useState<string>("new");

  const parsedContent = selectedTemplate?.content
    ? (() => {
        try {
          return JSON.parse(selectedTemplate.content);
        } catch {
          return null;
        }
      })()
    : null;

  const isFormBuilder = parsedContent && isFormBuilderContent(parsedContent);

  const handleNewTemplateSelect = useCallback(
    (
      templateId: string | undefined,
      template?: ProtocolTemplateResponseDto
    ) => {
      if (!templateId || disabled) return;

      setSelectedTemplateId(templateId);
      if (template) {
        setSelectedTemplate(template);
        formDataRef.current = {};

        onChange({
          templateId: template.id,
          templateName: template.name,
          templateContent: template.content,
          filledData: {},
          metadata: {
            filledAt: new Date().toISOString(),
            patientId: patientId || "",
            visitId: "",
          },
        });
      }
      setActiveTab("new");
    },
    [onChange, disabled, patientId]
  );

  const handleDataChange = useCallback(
    (data: FilledFormData) => {
      formDataRef.current = data;

      if (selectedTemplate) {
        onChange({
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          templateContent: selectedTemplate.content,
          filledData: data,
          metadata: {
            filledAt: new Date().toISOString(),
            patientId: patientId || "",
            visitId: "",
          },
        });
      }
    },
    [onChange, selectedTemplate, patientId]
  );

  // Инициализация при загрузке существующих данных
  if (value && !selectedTemplate) {
    try {
      const template: ProtocolTemplateResponseDto = {
        id: value.templateId,
        name: value.templateName,
        content: value.templateContent,
        description: "",
        templateType: "formbuilder",
        isActive: true,
        organizationId: "",
        createdAt: "",
        updatedAt: "",
        createdBy: "",
      };
      setSelectedTemplate(template);
      formDataRef.current = value.filledData;
    } catch (error) {
      console.error("Failed to initialize template:", error);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">📋 Протокол по шаблону</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Выберите шаблон протокола и заполните форму
        </p>
      </div>

      {/* Template Selection - только для не readonly режима */}
      {!readonly && (
        <Card>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="new" className="gap-2">
                  <FileInput className="h-4 w-4" />
                  Выбрать шаблон
                </TabsTrigger>
              </TabsList>

              <TabsContent value="new" className="space-y-4">
                <div className="space-y-2">
                  <Label>Выберите шаблон протокола</Label>
                  <ProtocolTemplateAutocompleteField
                    value={selectedTemplateId}
                    onChange={(templateId) => handleNewTemplateSelect(templateId)}
                    onTemplateSelected={(template) =>
                      handleNewTemplateSelect(template.id, template)
                    }
                    placeholder="Выберите шаблон протокола..."
                    searchPlaceholder="Поиск шаблона..."
                    empty="Шаблоны не найдены"
                    disabled={disabled}
                  />
                </div>

                {selectedTemplateId && selectedTemplate && (
                  <div className="rounded-md bg-muted/50 p-3 text-sm">
                    <p className="font-medium">{selectedTemplate.name}</p>
                    {selectedTemplate.description && (
                      <p className="mt-1 text-muted-foreground">
                        {selectedTemplate.description}
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Form Renderer */}
      {selectedTemplateId && selectedTemplate && isFormBuilder && (
        <>
          {readonly ? (
            <FormBuilderView
              templateJson={selectedTemplate.content}
              data={formDataRef.current}
              compact={false}
            />
          ) : (
            <FormBuilderInteractive
              key={selectedTemplateId}
              templateJson={selectedTemplate.content}
              initialData={formDataRef.current}
              onChange={handleDataChange}
              readonly={disabled}
            />
          )}
        </>
      )}

      {/* Empty State */}
      {!selectedTemplateId && (
        <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
          Выберите шаблон протокола для начала заполнения
        </div>
      )}
    </div>
  );
};
