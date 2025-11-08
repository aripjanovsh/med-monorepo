"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Save, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { toast } from "sonner";
import {
  useGetProtocolTemplatesQuery,
  useGetProtocolTemplateQuery,
} from "@/features/protocol-template";
import {
  FormBuilderInteractive,
  FormBuilderView,
  isFormBuilderContent,
  type FilledFormData,
} from "@/features/form-builder";
import { useUpdateVisitMutation } from "../visit.api";
import type { VisitStatus } from "../visit.dto";

type VisitProtocolProps = {
  visitId: string;
  initialProtocolId?: string;
  initialProtocolData?: FilledFormData;
  status: VisitStatus;
};

export const VisitProtocol = ({
  visitId,
  initialProtocolId,
  initialProtocolData = {},
  status,
}: VisitProtocolProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialProtocolId ?? ""
  );
  const [showPreview, setShowPreview] = useState(false);
  const formDataRef = useRef<FilledFormData>(initialProtocolData);

  const { data: templatesResponse, isLoading: isLoadingTemplates } =
    useGetProtocolTemplatesQuery({
      page: 1,
      limit: 100,
      isActive: true,
    });

  const { data: selectedTemplate, isLoading: isLoadingTemplate } =
    useGetProtocolTemplateQuery(selectedTemplateId, {
      skip: !selectedTemplateId,
    });

  const [updateVisit, { isLoading: isSaving }] = useUpdateVisitMutation();

  const isEditable = status === "IN_PROGRESS";
  const templates = templatesResponse?.data ?? [];

  const templateOptions = useMemo(
    () =>
      templates.map((template) => ({
        value: template.id,
        label: template.name,
      })),
    [templates]
  );

  useEffect(() => {
    if (initialProtocolId && initialProtocolId !== selectedTemplateId) {
      setSelectedTemplateId(initialProtocolId);
    }
  }, [initialProtocolId, selectedTemplateId]);

  const handleTemplateChange = useCallback(
    (templateId: string) => {
      if (!isEditable) return;

      setSelectedTemplateId(templateId);
      formDataRef.current = {};
      setShowPreview(false);
    },
    [isEditable]
  );

  const handleDataChange = useCallback(
    (data: FilledFormData) => {
      formDataRef.current = data;
    },
    []
  );

  const handleSave = async () => {
    if (!selectedTemplateId) {
      toast.error("Выберите шаблон протокола");
      return;
    }

    try {
      await updateVisit({
        id: visitId,
        protocolId: selectedTemplateId,
        protocolData: JSON.stringify(formDataRef.current),
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

  const isFormBuilder =
    parsedContent && isFormBuilderContent(parsedContent);

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Шаблон протокола
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Выберите шаблон</Label>
            <Combobox
              options={templateOptions}
              value={selectedTemplateId}
              onValueChange={handleTemplateChange}
              placeholder="Выберите шаблон протокола..."
              searchPlaceholder="Поиск шаблона..."
              emptyText="Шаблоны не найдены"
              disabled={!isEditable || isLoadingTemplates}
            />
          </div>

          {selectedTemplateId && selectedTemplate && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">{selectedTemplate.name}</p>
                {selectedTemplate.description && (
                  <p className="mt-1">{selectedTemplate.description}</p>
                )}
              </div>

              {isFormBuilder && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? "Скрыть превью" : "Показать превью"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Preview */}
      {showPreview && selectedTemplate && isFormBuilder && (
        <Card>
          <CardHeader>
            <CardTitle>Предпросмотр шаблона</CardTitle>
          </CardHeader>
          <CardContent>
            <FormBuilderInteractive
              templateJson={selectedTemplate.content}
              readonly={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Form Renderer */}
      {selectedTemplateId && selectedTemplate && isFormBuilder && !showPreview && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Заполнение протокола</CardTitle>
            {isEditable && (
              <Button
                onClick={handleSave}
                disabled={isSaving || !selectedTemplateId}
              >
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Сохранить протокол
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoadingTemplate ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <FormBuilderInteractive
                key={selectedTemplateId}
                templateJson={selectedTemplate.content}
                initialData={initialProtocolData}
                onChange={handleDataChange}
                readonly={!isEditable}
              />
            )}
          </CardContent>
        </Card>
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
