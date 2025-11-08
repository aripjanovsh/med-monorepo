"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetProtocolTemplatesQuery } from "@/features/protocol-template";
import type {
  FormBuilderContent,
  FormField,
  FormSection,
  FilledFormData,
} from "@/features/form-builder";

export interface ProtocolResultData {
  templateId: string;
  templateName: string;
  formData: FilledFormData;
}

interface ResultInputProtocolProps {
  value: ProtocolResultData | null;
  onChange: (value: ProtocolResultData) => void;
  disabled?: boolean;
}

export const ResultInputProtocol = ({
  value,
  onChange,
  disabled = false,
}: ResultInputProtocolProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    value?.templateId || ""
  );

  const { data: templatesData } = useGetProtocolTemplatesQuery({
    page: 1,
    limit: 100,
  });

  const templates = templatesData?.data || [];
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  let parsedContent: FormBuilderContent | null = null;
  if (selectedTemplate && selectedTemplate.templateType === "formbuilder") {
    try {
      parsedContent = JSON.parse(selectedTemplate.content) as FormBuilderContent;
    } catch (e) {
      console.error("Failed to parse protocol content:", e);
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    setSelectedTemplateId(templateId);

    onChange({
      templateId: template.id,
      templateName: template.name,
      formData: {},
    });
  };

  const handleFieldChange = (fieldId: string, fieldValue: any) => {
    if (!value) return;

    onChange({
      ...value,
      formData: {
        ...value.formData,
        [fieldId]: fieldValue,
      },
    });
  };

  const renderField = (field: FormField) => {
    const fieldValue = value?.formData[field.id];

    switch (field.type) {
      case "text":
      case "number":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              value={(fieldValue as string) || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled || field.readonly}
              required={field.required}
            />
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={(fieldValue as string) || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled || field.readonly}
              required={field.required}
              className="min-h-[100px]"
            />
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={(fieldValue as string) || ""}
              onValueChange={(val) => handleFieldChange(field.id, val)}
              disabled={disabled || field.readonly}
            >
              <SelectTrigger id={field.id}>
                <SelectValue placeholder={field.placeholder || "Выберите значение"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={(fieldValue as string) || ""}
              onValueChange={(val) => handleFieldChange(field.id, val)}
              disabled={disabled || field.readonly}
            >
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                  <Label htmlFor={`${field.id}-${option}`} className="font-normal">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={(fieldValue as boolean) || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              disabled={disabled || field.readonly}
            />
            <Label htmlFor={field.id} className="font-normal">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSection = (section: FormSection) => {
    return (
      <Card key={section.id}>
        <CardHeader>
          <CardTitle className="text-lg">{section.title}</CardTitle>
          {section.description && (
            <p className="text-sm text-muted-foreground">{section.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {section.fields.map((field) => renderField(field))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">
          📋 Протокол по шаблону
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Выберите шаблон протокола и заполните форму
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="protocol-template-select">Шаблон протокола</Label>
        <Select
          value={selectedTemplateId}
          onValueChange={handleTemplateSelect}
          disabled={disabled}
        >
          <SelectTrigger id="protocol-template-select">
            <SelectValue placeholder="Выберите шаблон протокола" />
          </SelectTrigger>
          <SelectContent>
            {templates
              .filter((t) => t.templateType === "formbuilder")
              .map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {parsedContent && parsedContent.sections && (
        <div className="space-y-4">
          <Separator />
          {parsedContent.sections.map((section) => renderSection(section))}
        </div>
      )}

      {!parsedContent && selectedTemplate && (
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 text-center text-yellow-800">
          Выбранный шаблон не поддерживает структурированный ввод
        </div>
      )}

      {!selectedTemplate && (
        <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
          Выберите шаблон протокола для начала заполнения
        </div>
      )}
    </div>
  );
};
