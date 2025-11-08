import type { Dispatch, SetStateAction } from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { X, Plus } from "lucide-react";
import type { FormField, FieldType } from "../../../types/form-builder.types";
import { FIELD_CONFIGS } from "../../../utils/form-builder.helpers";

type FieldEditorProps = {
  field: FormField | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: FormField) => void;
};

export const FieldEditor = ({
  field,
  isOpen,
  onClose,
  onSave,
}: FieldEditorProps) => {
  const [editedField, setEditedField] = useState<FormField | null>(field);
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    if (field) {
      setEditedField(field);
      setOptions(field.options ?? []);
    }
  }, [field]);

  const handleSave = () => {
    if (!editedField) return;

    const updatedField = {
      ...editedField,
      options:
        ["select", "radio", "tags"].includes(editedField.type) &&
        options.length > 0
          ? options
          : undefined,
    };

    onSave(updatedField);
    // Don't call onClose() here - let the parent handle closing
  };

  const handleTypeChange = (newType: FieldType) => {
    if (!editedField) return;

    const config = FIELD_CONFIGS[newType];
    setEditedField({
      ...editedField,
      type: newType,
      options: config.defaultProps?.options,
      defaultValue: config.defaultProps?.defaultValue,
    });

    if (config.defaultProps?.options) {
      setOptions(config.defaultProps.options);
    } else {
      setOptions([]);
    }
  };

  const addOption = () => {
    setOptions([...options, `Вариант ${options.length + 1}`]);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  if (!editedField) return null;

  const needsOptions = ["select", "radio", "tags"].includes(editedField.type);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Редактирование поля</SheetTitle>
          <SheetDescription>Настройте параметры поля формы</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 p-6">
          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="field-label">Название поля *</Label>
            <Input
              id="field-label"
              value={editedField.label}
              onChange={(e) =>
                setEditedField({ ...editedField, label: e.target.value })
              }
              placeholder="Введите название поля"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="field-type">Тип поля *</Label>
            <Select
              value={editedField.type}
              onValueChange={(value) => handleTypeChange(value as FieldType)}
            >
              <SelectTrigger id="field-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FIELD_CONFIGS).map((config) => (
                  <SelectItem key={config.type} value={config.type}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {FIELD_CONFIGS[editedField.type].description}
            </p>
          </div>

          {/* Placeholder */}
          {!["checkbox", "radio"].includes(editedField.type) && (
            <div className="space-y-2">
              <Label htmlFor="field-placeholder">Подсказка (placeholder)</Label>
              <Input
                id="field-placeholder"
                value={editedField.placeholder ?? ""}
                onChange={(e) =>
                  setEditedField({
                    ...editedField,
                    placeholder: e.target.value,
                  })
                }
                placeholder="Введите подсказку"
              />
            </div>
          )}

          {/* Options for select, radio, tags */}
          {needsOptions && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Варианты выбора *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
              </div>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Вариант ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {options.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Нажмите "Добавить" чтобы добавить варианты
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Default Value for text fields */}
          {["text", "textarea", "number"].includes(editedField.type) && (
            <div className="space-y-2">
              <Label htmlFor="field-default">Значение по умолчанию</Label>
              {editedField.type === "textarea" ? (
                <Textarea
                  id="field-default"
                  value={(editedField.defaultValue as string) ?? ""}
                  onChange={(e) =>
                    setEditedField({
                      ...editedField,
                      defaultValue: e.target.value,
                    })
                  }
                  placeholder="Введите значение по умолчанию"
                />
              ) : (
                <Input
                  id="field-default"
                  type={editedField.type === "number" ? "number" : "text"}
                  value={(editedField.defaultValue as string | number) ?? ""}
                  onChange={(e) =>
                    setEditedField({
                      ...editedField,
                      defaultValue:
                        editedField.type === "number"
                          ? Number.parseFloat(e.target.value)
                          : e.target.value,
                    })
                  }
                  placeholder="Введите значение по умолчанию"
                />
              )}
            </div>
          )}

          {/* Default Value for checkbox */}
          {editedField.type === "checkbox" && (
            <div className="flex items-center justify-between">
              <Label htmlFor="field-default-check">Включено по умолчанию</Label>
              <Switch
                id="field-default-check"
                checked={(editedField.defaultValue as boolean) ?? false}
                onCheckedChange={(checked) =>
                  setEditedField({ ...editedField, defaultValue: checked })
                }
              />
            </div>
          )}

          {/* Required */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="field-required">Обязательное поле</Label>
              <p className="text-xs text-muted-foreground">
                Поле должно быть заполнено
              </p>
            </div>
            <Switch
              id="field-required"
              checked={editedField.required ?? false}
              onCheckedChange={(checked) =>
                setEditedField({ ...editedField, required: checked })
              }
            />
          </div>

          {/* Width */}
          <div className="space-y-2">
            <Label htmlFor="field-width">Ширина поля (%)</Label>
            <Select
              value={editedField.width?.toString() ?? "100"}
              onValueChange={(value) =>
                setEditedField({
                  ...editedField,
                  width: Number.parseInt(value, 10),
                })
              }
            >
              <SelectTrigger id="field-width">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25% (1/4)</SelectItem>
                <SelectItem value="33">33% (1/3)</SelectItem>
                <SelectItem value="50">50% (1/2)</SelectItem>
                <SelectItem value="66">66% (2/3)</SelectItem>
                <SelectItem value="75">75% (3/4)</SelectItem>
                <SelectItem value="100">100% (полная)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Readonly */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="field-readonly">Только для чтения</Label>
              <p className="text-xs text-muted-foreground">
                Поле нельзя изменить
              </p>
            </div>
            <Switch
              id="field-readonly"
              checked={editedField.readonly ?? false}
              onCheckedChange={(checked) =>
                setEditedField({ ...editedField, readonly: checked })
              }
            />
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Отмена
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Сохранить
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
