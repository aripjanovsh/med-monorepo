/**
 * FormBuilderInteractive - режим заполнения формы
 *
 * Использование:
 * <FormBuilderInteractive
 *   templateJson={jsonString}  // JSON template от Editor
 *   initialData={{}}           // начальные значения (опционально)
 *   onChange={(data) => {}}    // возвращает FilledFormData
 *   readonly={false}           // опционально, по умолчанию false
 * />
 */

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type {
  FormBuilderContent,
  FormField,
  FilledFormData,
} from "../types/form-builder.types";
import {
  deserializeFormBuilderContent,
  getInitialFormData,
} from "../utils/form-builder.helpers";
import { cn } from "@/lib/utils";

type FormBuilderInteractiveProps = {
  templateJson: string;
  initialData?: FilledFormData;
  onChange?: (data: FilledFormData) => void;
  readonly?: boolean;
};

export const FormBuilderInteractive = ({
  templateJson,
  initialData = {},
  onChange,
  readonly = false,
}: FormBuilderInteractiveProps) => {
  let content: FormBuilderContent;
  let parseError = false;

  try {
    content = deserializeFormBuilderContent(templateJson);
  } catch {
    parseError = true;
    content = { version: 1, sections: [] };
  }

  const defaultValues = { ...getInitialFormData(content), ...initialData };

  const { control, watch } = useForm<FilledFormData>({
    defaultValues,
  });

  const formData = watch();

  // Отправляем изменения с дебаунсом
  useEffect(() => {
    if (!onChange || parseError) return;

    const timeoutId = setTimeout(() => {
      onChange(formData);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData, onChange, parseError]);

  const checkVisibility = (field: FormField): boolean => {
    if (!field.visibleIf) return true;

    const dependentValue = formData[field.visibleIf.fieldId];
    return dependentValue === field.visibleIf.value;
  };

  const renderField = (field: FormField) => {
    if (!checkVisibility(field)) {
      return null;
    }

    const isDisabled = readonly || field.readonly;

    switch (field.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Controller
              name={field.id}
              control={control}
              rules={{ required: field.required }}
              render={({ field: formField }) => (
                <Input
                  id={field.id}
                  type="text"
                  placeholder={field.placeholder}
                  {...formField}
                  value={(formField.value as string) ?? ""}
                  disabled={isDisabled}
                />
              )}
            />
          </div>
        );

      case "textarea":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Controller
              name={field.id}
              control={control}
              rules={{ required: field.required }}
              render={({ field: formField }) => (
                <Textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  {...formField}
                  value={(formField.value as string) ?? ""}
                  disabled={isDisabled}
                  rows={4}
                />
              )}
            />
          </div>
        );

      case "number":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Controller
              name={field.id}
              control={control}
              rules={{ required: field.required }}
              render={({ field: formField }) => (
                <Input
                  id={field.id}
                  type="number"
                  className="max-w-[200px]"
                  placeholder={field.placeholder}
                  {...formField}
                  value={(formField.value as number) ?? ""}
                  onChange={(e) =>
                    formField.onChange(
                      Number.parseFloat(e.target.value) || null
                    )
                  }
                  disabled={isDisabled}
                />
              )}
            />
          </div>
        );

      case "date":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Controller
              name={field.id}
              control={control}
              rules={{ required: field.required }}
              render={({ field: formField }) => (
                <Input
                  id={field.id}
                  type="date"
                  {...formField}
                  value={(formField.value as string) ?? ""}
                  disabled={isDisabled}
                />
              )}
            />
          </div>
        );

      case "select":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Controller
              name={field.id}
              control={control}
              rules={{ required: field.required }}
              render={({ field: formField }) => (
                <Select
                  value={(formField.value as string) ?? ""}
                  onValueChange={formField.onChange}
                  disabled={isDisabled}
                >
                  <SelectTrigger id={field.id}>
                    <SelectValue
                      placeholder={field.placeholder ?? "Выберите значение"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2">
            <Label>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Controller
              name={field.id}
              control={control}
              rules={{ required: field.required }}
              render={({ field: formField }) => (
                <RadioGroup
                  value={(formField.value as string) ?? ""}
                  onValueChange={formField.onChange}
                  disabled={isDisabled}
                >
                  {field.options?.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={option}
                        id={`${field.id}-${option}`}
                      />
                      <Label
                        htmlFor={`${field.id}-${option}`}
                        className="font-normal"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            <Controller
              name={field.id}
              control={control}
              rules={{ required: field.required }}
              render={({ field: formField }) => (
                <div className="flex flex-row items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={(formField.value as boolean) ?? false}
                    onCheckedChange={formField.onChange}
                    disabled={isDisabled}
                  />
                  <Label htmlFor={field.id} className="font-normal">
                    {field.label}
                    {field.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Label>
                </div>
              )}
            />
          </div>
        );

      case "tags":
        return (
          <div className="space-y-2 w-full">
            <Label>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Controller
              name={field.id}
              control={control}
              rules={{ required: field.required }}
              render={({ field: formField }) => {
                const selectedTags = (formField.value as string[]) ?? [];
                return (
                  <div className="flex flex-wrap gap-2">
                    {field.options?.map((option) => {
                      const isSelected = selectedTags.includes(option);
                      return (
                        <Badge
                          key={option}
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer transition-colors",
                            !isDisabled &&
                              "hover:bg-primary hover:text-primary-foreground"
                          )}
                          onClick={() => {
                            if (isDisabled) return;
                            const newTags = isSelected
                              ? selectedTags.filter((t) => t !== option)
                              : [...selectedTags, option];
                            formField.onChange(newTags);
                          }}
                        >
                          {option}
                        </Badge>
                      );
                    })}
                  </div>
                );
              }}
            />
          </div>
        );

      default:
        return null;
    }
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

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6">
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
                  {section.fields.map((field) => (
                    <div
                      key={field.id}
                      className="min-w-0"
                      style={
                        field.width && field.width < 100
                          ? {
                              flex: `0 0 calc(${field.width}% - 1rem)`,
                            }
                          : { flex: 1, minWidth: "100%" }
                      }
                    >
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );
};
