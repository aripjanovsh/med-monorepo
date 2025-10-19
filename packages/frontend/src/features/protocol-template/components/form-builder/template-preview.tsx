import { useState } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye } from "lucide-react";
import type {
  FormBuilderContent,
  FormField,
  FilledFormData,
} from "../../types/form-builder.types";
import { cn } from "@/lib/utils";

type TemplatePreviewProps = {
  content: FormBuilderContent;
  showTitle?: boolean;
};

export const TemplatePreview = ({
  content,
  showTitle = true,
}: TemplatePreviewProps) => {
  const [formData, setFormData] = useState<FilledFormData>({});

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value as string | boolean | string[] | number | null,
    }));
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id];

    switch (field.type) {
      case "text":
        return (
          <div className="space-y-2" style={{ width: field.width ? `${field.width}%` : "100%" }}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="text"
              placeholder={field.placeholder}
              value={(value as string) ?? ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={field.readonly}
              required={field.required}
            />
          </div>
        );

      case "textarea":
        return (
          <div className="space-y-2" style={{ width: field.width ? `${field.width}%` : "100%" }}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={(value as string) ?? ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={field.readonly}
              required={field.required}
              rows={4}
            />
          </div>
        );

      case "number":
        return (
          <div className="space-y-2" style={{ width: field.width ? `${field.width}%` : "100%" }}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="number"
              placeholder={field.placeholder}
              value={(value as number) ?? ""}
              onChange={(e) => handleFieldChange(field.id, Number.parseFloat(e.target.value))}
              disabled={field.readonly}
              required={field.required}
            />
          </div>
        );

      case "date":
        return (
          <div className="space-y-2" style={{ width: field.width ? `${field.width}%` : "100%" }}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={(value as string) ?? ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={field.readonly}
              required={field.required}
            />
          </div>
        );

      case "select":
        return (
          <div className="space-y-2" style={{ width: field.width ? `${field.width}%` : "100%" }}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={(value as string) ?? ""}
              onValueChange={(val) => handleFieldChange(field.id, val)}
              disabled={field.readonly}
            >
              <SelectTrigger id={field.id}>
                <SelectValue placeholder={field.placeholder ?? "Выберите значение"} />
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
          <div className="space-y-2" style={{ width: field.width ? `${field.width}%` : "100%" }}>
            <Label>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <RadioGroup
              value={(value as string) ?? ""}
              onValueChange={(val) => handleFieldChange(field.id, val)}
              disabled={field.readonly}
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
          <div className="space-y-2" style={{ width: field.width ? `${field.width}%` : "100%" }}>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.id}
                checked={(value as boolean) ?? false}
                onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
                disabled={field.readonly}
              />
              <Label htmlFor={field.id} className="font-normal">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            </div>
          </div>
        );

      case "tags":
        return (
          <div className="space-y-2" style={{ width: field.width ? `${field.width}%` : "100%" }}>
            <Label>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="flex flex-wrap gap-2">
              {field.options?.map((option) => {
                const selectedTags = (value as string[]) ?? [];
                const isSelected = selectedTags.includes(option);
                return (
                  <Badge
                    key={option}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      !field.readonly && "hover:bg-primary hover:text-primary-foreground"
                    )}
                    onClick={() => {
                      if (field.readonly) return;
                      const newTags = isSelected
                        ? selectedTags.filter((t) => t !== option)
                        : [...selectedTags, option];
                      handleFieldChange(field.id, newTags);
                    }}
                  >
                    {option}
                  </Badge>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {showTitle && (
        <div className="flex items-center gap-2 p-4 border-b bg-muted/30">
          <Eye className="h-4 w-4" />
          <h3 className="font-semibold">Предпросмотр формы</h3>
        </div>
      )}
      
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {content.sections.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Добавьте секции и поля для предпросмотра формы</p>
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
                        className={cn(
                          field.width && field.width < 100
                            ? `flex-[0_0_calc(${field.width}%-1rem)]`
                            : "flex-1 min-w-full"
                        )}
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
    </div>
  );
};
