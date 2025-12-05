"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Save, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ProtocolTemplateAutocompleteField } from "@/features/protocol-template";
import {
  FormBuilderInteractive,
  FormBuilderView,
  isFormBuilderContent,
  type FilledFormData,
} from "@/features/form-builder";
import { useUpdateVisitMutation } from "../visit.api";
import type { VisitStatus } from "../visit.constants";
import type { SavedProtocolData } from "../visit-protocol.types";
import type { ProtocolTemplateResponseDto } from "@/features/protocol-template/protocol-template.dto";

type VisitProtocolProps = {
  visitId: string;
  patientId: string;
  initialProtocolId?: string;
  initialProtocolData?: SavedProtocolData | null;
  status: VisitStatus;
  // External protocol data (e.g., copied from history)
  externalProtocolData?: SavedProtocolData | null;
  onExternalProtocolApplied?: () => void;
};

export const VisitProtocol = ({
  visitId,
  patientId,
  initialProtocolId,
  initialProtocolData,
  status,
  externalProtocolData,
  onExternalProtocolApplied,
}: VisitProtocolProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialProtocolId ?? ""
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<ProtocolTemplateResponseDto | null>(null);
  const formDataRef = useRef<FilledFormData>(
    initialProtocolData?.filledData ?? {}
  );
  const [formKey, setFormKey] = useState(0); // Force re-render when data changes

  const [updateVisit, { isLoading: isSaving }] = useUpdateVisitMutation();

  const isEditable = status === "IN_PROGRESS";

  useEffect(() => {
    if (initialProtocolData) {
      // Восстановить состояние из сохраненных данных
      setSelectedTemplateId(initialProtocolData.templateId);
      setSelectedTemplate({
        id: initialProtocolData.templateId,
        name: initialProtocolData.templateName,
        content: initialProtocolData.templateContent,
        description: "",
        templateType: "formbuilder",
        isActive: true,
        organizationId: "",
        createdAt: "",
        updatedAt: "",
        createdBy: "",
      });
      formDataRef.current = initialProtocolData.filledData;
    }
  }, [initialProtocolData]);

  // Handle external protocol data (copied from history)
  useEffect(() => {
    if (externalProtocolData && isEditable) {
      setSelectedTemplateId(externalProtocolData.templateId);
      setSelectedTemplate({
        id: externalProtocolData.templateId,
        name: externalProtocolData.templateName,
        content: externalProtocolData.templateContent,
        description: "",
        templateType: "formbuilder",
        isActive: true,
        organizationId: "",
        createdAt: "",
        updatedAt: "",
        createdBy: "",
      });
      formDataRef.current = externalProtocolData.filledData;
      setFormKey((prev) => prev + 1); // Force re-render
      onExternalProtocolApplied?.();
    }
  }, [externalProtocolData, isEditable, onExternalProtocolApplied]);

  const handleNewTemplateSelect = useCallback(
    (
      templateId: string | undefined,
      template?: ProtocolTemplateResponseDto
    ) => {
      if (!isEditable || !templateId) return;

      setSelectedTemplateId(templateId);
      if (template) {
        setSelectedTemplate(template);
      }
      formDataRef.current = {};
      setFormKey((prev) => prev + 1);
    },
    [isEditable]
  );

  const handleDataChange = useCallback((data: FilledFormData) => {
    formDataRef.current = data;
  }, []);

  const handleSave = async () => {
    if (!selectedTemplateId || !selectedTemplate) {
      toast.error("Выберите шаблон протокола");
      return;
    }

    try {
      const savedData: SavedProtocolData = {
        templateId: selectedTemplateId,
        templateName: selectedTemplate.name,
        templateContent: selectedTemplate.content,
        filledData: formDataRef.current,
        metadata: {
          filledAt: new Date().toISOString(),
          patientId,
          visitId,
        },
      };

      await updateVisit({
        id: visitId,
        protocolId: selectedTemplateId,
        protocolData: JSON.stringify(savedData),
      }).unwrap();

      toast.success("Протокол сохранен");
    } catch (error: any) {
      toast.error(error?.data?.message || "Ошибка при сохранении протокола");
    }
  };

  const parsedContent = selectedTemplate
    ? (() => {
        try {
          return JSON.parse(selectedTemplate.content);
        } catch {
          return null;
        }
      })()
    : null;

  const isFormBuilder = parsedContent && isFormBuilderContent(parsedContent);

  return (
    <div className="space-y-6">
      {/* Template Selection - Only show for editable visits */}
      {isEditable && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Шаблон протокола
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">Выберите шаблон</Label>
                <ProtocolTemplateAutocompleteField
                  value={selectedTemplateId}
                  onChange={(templateId) => handleNewTemplateSelect(templateId)}
                  onTemplateSelected={(template) =>
                    handleNewTemplateSelect(template.id, template)
                  }
                  placeholder="Выберите шаблон протокола..."
                  searchPlaceholder="Поиск шаблона..."
                  empty="Шаблоны не найдены"
                  disabled={!isEditable}
                />
              </div>

              {selectedTemplateId && selectedTemplate && (
                <div className="rounded-md bg-muted/50 p-2.5 text-sm">
                  <p className="font-medium">{selectedTemplate.name}</p>
                  {selectedTemplate.description && (
                    <p className="mt-1 text-muted-foreground text-xs">
                      {selectedTemplate.description}
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                💡 Вы можете скопировать протокол из истории визитов слева
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Renderer */}
      {selectedTemplateId && selectedTemplate && isFormBuilder && (
        <>
          {isEditable ? (
            <>
              <FormBuilderInteractive
                key={`${selectedTemplateId}-${formKey}`}
                templateJson={selectedTemplate.content}
                initialData={formDataRef.current}
                onChange={handleDataChange}
                readonly={false}
              />

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !selectedTemplateId}
                >
                  {isSaving && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <Save className="h-4 w-4" />
                  Сохранить
                </Button>
              </div>
            </>
          ) : (
            <FormBuilderView
              templateJson={selectedTemplate.content}
              data={formDataRef.current}
              compact={false}
            />
          )}
        </>
      )}

      {/* Empty State */}
      {!selectedTemplateId && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Выберите шаблон протокола для начала работы</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
