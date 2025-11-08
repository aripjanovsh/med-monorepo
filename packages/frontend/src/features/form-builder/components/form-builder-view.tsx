/**
 * FormBuilderView - режим просмотра заполненной формы
 * 
 * Использование:
 * <FormBuilderView
 *   templateJson={jsonString}  // JSON template от Editor
 *   data={{}}                  // заполненные данные от Interactive
 * />
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type {
  FormBuilderContent,
  FormField,
  FilledFormData,
  FormFieldValue,
} from "../types/form-builder.types";
import { deserializeFormBuilderContent } from "../utils/form-builder.helpers";

type FormBuilderViewProps = {
  templateJson: string;
  data: FilledFormData;
  compact?: boolean; // компактный режим (без карточек)
};

export const FormBuilderView = ({
  templateJson,
  data,
  compact = false,
}: FormBuilderViewProps) => {
  let content: FormBuilderContent;
  let parseError = false;

  try {
    content = deserializeFormBuilderContent(templateJson);
  } catch {
    parseError = true;
    content = { version: 1, sections: [] };
  }

  const checkVisibility = (field: FormField): boolean => {
    if (!field.visibleIf) return true;

    const dependentValue = data[field.visibleIf.fieldId];
    return dependentValue === field.visibleIf.value;
  };

  const formatFieldValue = (field: FormField, value: FormFieldValue): React.ReactNode => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-muted-foreground italic">Не заполнено</span>;
    }

    switch (field.type) {
      case "checkbox":
        return value ? (
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Да
          </span>
        ) : (
          <span className="flex items-center gap-1 text-muted-foreground">
            <XCircle className="h-4 w-4" />
            Нет
          </span>
        );

      case "tags":
        if (!Array.isArray(value) || value.length === 0) {
          return <span className="text-muted-foreground italic">Не выбрано</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {(value as string[]).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        );

      case "date":
        try {
          return new Date(value as string).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        } catch {
          return String(value);
        }

      case "number":
        return <span className="font-mono">{value}</span>;

      default:
        return String(value);
    }
  };

  const renderField = (field: FormField) => {
    if (!checkVisibility(field)) {
      return null;
    }

    const value = data[field.id];

    return (
      <div
        key={field.id}
        className={compact ? "py-2" : "py-3"}
        style={
          field.width && field.width < 100
            ? { 
                flex: `0 0 calc(${field.width}% - 1rem)`,
                minWidth: 0,
              }
            : { flex: 1, minWidth: "100%" }
        }
      >
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
          </div>
          <div className="text-base">{formatFieldValue(field, value)}</div>
        </div>
      </div>
    );
  };

  if (parseError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Ошибка парсинга шаблона формы. Проверьте корректность JSON.
        </AlertDescription>
      </Alert>
    );
  }

  if (compact) {
    return (
      <div className="space-y-4">
        {content.sections.map((section, sectionIndex) => (
          <div key={section.id}>
            <div className="mb-3">
              <h4 className="font-semibold text-lg">{section.title}</h4>
              {section.description && (
                <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
              )}
            </div>
            <div className="space-y-2">
              {section.fields.map((field) => renderField(field))}
            </div>
            {sectionIndex < content.sections.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {content.sections.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Нет доступных секций</p>
          </div>
        ) : (
          content.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                {section.description && (
                  <CardDescription>{section.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {section.fields.map((field) => renderField(field))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );
};
