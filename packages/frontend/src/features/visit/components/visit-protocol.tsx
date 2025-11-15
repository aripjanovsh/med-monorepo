"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Save, FileText, Loader2, History, FileInput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import type {
  SavedProtocolData,
  FilledProtocolOption,
} from "../visit-protocol.types";
import { PatientFilledProtocolAutocompleteField } from "./patient-filled-protocol-autocomplete";
import type { ProtocolTemplateResponseDto } from "@/features/protocol-template/protocol-template.dto";

type VisitProtocolProps = {
  visitId: string;
  patientId: string;
  initialProtocolId?: string;
  initialProtocolData?: SavedProtocolData | null;
  status: VisitStatus;
};

export const VisitProtocol = ({
  visitId,
  patientId,
  initialProtocolId,
  initialProtocolData,
  status,
}: VisitProtocolProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialProtocolId ?? "",
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<ProtocolTemplateResponseDto | null>(null);
  const [selectedFilledProtocol, setSelectedFilledProtocol] =
    useState<string>("");
  const formDataRef = useRef<FilledFormData>(
    initialProtocolData?.filledData ?? {},
  );
  const [activeTab, setActiveTab] = useState<string>("new");

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

  const handleNewTemplateSelect = useCallback(
    (
      templateId: string | undefined,
      template?: ProtocolTemplateResponseDto,
    ) => {
      if (!isEditable || !templateId) return;

      setSelectedTemplateId(templateId);
      if (template) {
        setSelectedTemplate(template);
      }
      formDataRef.current = {};
      setActiveTab("new");
    },
    [isEditable],
  );

  const handleFilledProtocolSelect = useCallback(
    (option: FilledProtocolOption) => {
      if (!isEditable) return;

      const { protocolData } = option;
      setSelectedTemplateId(protocolData.templateId);
      setSelectedTemplate({
        id: protocolData.templateId,
        name: protocolData.templateName,
        content: protocolData.templateContent,
        description: "",
        templateType: "formbuilder",
        isActive: true,
        organizationId: "",
        createdAt: "",
        updatedAt: "",
        createdBy: "",
      });
      formDataRef.current = protocolData.filledData;
      setActiveTab("new");
    },
    [isEditable],
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Выбор протокола
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="new" className="gap-2">
                  <FileInput className="h-4 w-4" />
                  Новый шаблон
                </TabsTrigger>
                <TabsTrigger value="previous" className="gap-2">
                  <History className="h-4 w-4" />
                  Ранее заполненные
                </TabsTrigger>
              </TabsList>

              <TabsContent value="new" className="space-y-4">
                <div className="space-y-2">
                  <Label>Выберите шаблон протокола</Label>
                  <ProtocolTemplateAutocompleteField
                    value={selectedTemplateId}
                    onChange={(templateId) =>
                      handleNewTemplateSelect(templateId)
                    }
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

              <TabsContent value="previous" className="space-y-4">
                <div className="space-y-2">
                  <Label>Выберите ранее заполненный протокол</Label>
                  <PatientFilledProtocolAutocompleteField
                    patientId={patientId}
                    value={selectedFilledProtocol}
                    onChange={(value) => setSelectedFilledProtocol(value ?? "")}
                    onProtocolSelected={handleFilledProtocolSelect}
                    placeholder="Выберите ранее заполненный протокол..."
                    searchPlaceholder="Поиск протокола..."
                    empty="Заполненные протоколы не найдены"
                    disabled={!isEditable}
                  />
                </div>

                <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 p-3 text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-medium">💡 Подсказка</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-300">
                    Выберите ранее заполненный протокол чтобы скопировать его
                    данные в текущий визит. Вы сможете отредактировать
                    скопированные данные.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Form Renderer */}
      {selectedTemplateId && selectedTemplate && isFormBuilder && (
        <>
          {isEditable ? (
            <>
              <FormBuilderInteractive
                key={selectedTemplateId}
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
