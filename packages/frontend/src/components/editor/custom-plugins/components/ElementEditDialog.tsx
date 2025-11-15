import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { CustomElementData } from "../base/CustomElementNode";

interface ElementEditDialogProps {
  open: boolean;
  onClose: () => void;
  data: CustomElementData;
  onSave: (data: CustomElementData) => void;
}

interface Option {
  value: string;
  label: string;
}

export function ElementEditDialog({
  open,
  onClose,
  data,
  onSave,
}: ElementEditDialogProps) {
  const [elementData, setElementData] = useState<CustomElementData>(data);
  const [newOption, setNewOption] = useState({ value: "", label: "" });

  useEffect(() => {
    setElementData(data);
  }, [data]);

  const handleSave = () => {
    onSave(elementData);
    onClose();
  };

  const addOption = () => {
    if (newOption.value && newOption.label) {
      setElementData({
        ...elementData,
        options: [...(elementData.options || []), newOption],
      });
      setNewOption({ value: "", label: "" });
    }
  };

  const removeOption = (index: number) => {
    setElementData({
      ...elementData,
      options: elementData.options?.filter((_, i) => i !== index),
    });
  };

  const needsOptions = ["select", "radio", "checkbox"].includes(
    elementData.type,
  );
  const supportsWidth = elementData.type !== "textarea";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Редактировать {elementData.type === "text" && "текстовое поле"}
            {elementData.type === "select" && "выпадающий список"}
            {elementData.type === "radio" && "радио-кнопки"}
            {elementData.type === "checkbox" && "чекбокс"}
            {elementData.type === "textarea" && "текстовую область"}
          </DialogTitle>
          <DialogDescription>
            Измените параметры элемента формы
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="element-label">Метка</Label>
            <Input
              id="element-label"
              value={elementData.label || ""}
              onChange={(e) =>
                setElementData({ ...elementData, label: e.target.value })
              }
              placeholder="Отображаемая метка"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display-mode">Режим отображения</Label>
            <Select
              value={elementData.displayMode || "inline"}
              onValueChange={(value: "inline" | "block") =>
                setElementData({ ...elementData, displayMode: value })
              }
            >
              <SelectTrigger id="display-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inline">
                  Inline (в строке с текстом)
                </SelectItem>
                <SelectItem value="block">Block (отдельный блок)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {elementData.displayMode === "inline" && supportsWidth && (
            <div className="space-y-2">
              <Label htmlFor="element-width">Ширина (для inline режима)</Label>
              <Input
                id="element-width"
                value={elementData.width || "150px"}
                onChange={(e) =>
                  setElementData({ ...elementData, width: e.target.value })
                }
                placeholder="например: 150px, 50%, 10rem"
              />
            </div>
          )}

          {elementData.type !== "checkbox" && elementData.type !== "radio" && (
            <div className="space-y-2">
              <Label htmlFor="element-placeholder">Placeholder</Label>
              <Input
                id="element-placeholder"
                value={elementData.placeholder || ""}
                onChange={(e) =>
                  setElementData({
                    ...elementData,
                    placeholder: e.target.value,
                  })
                }
                placeholder="Подсказка"
              />
            </div>
          )}

          {elementData.type === "textarea" && (
            <div className="space-y-2">
              <Label htmlFor="element-rows">Количество строк</Label>
              <Input
                id="element-rows"
                type="number"
                min="1"
                max="20"
                value={elementData.rows || 4}
                onChange={(e) =>
                  setElementData({
                    ...elementData,
                    rows: parseInt(e.target.value) || 4,
                  })
                }
              />
            </div>
          )}

          {needsOptions && (
            <div className="space-y-2">
              <Label>Опции</Label>
              <div className="space-y-2">
                {elementData.options?.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={option.value} disabled className="flex-1" />
                    <Input value={option.label} disabled className="flex-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Значение"
                    value={newOption.value}
                    onChange={(e) =>
                      setNewOption({ ...newOption, value: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Input
                    placeholder="Текст"
                    value={newOption.label}
                    onChange={(e) =>
                      setNewOption({ ...newOption, label: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="element-required"
              checked={elementData.required || false}
              onCheckedChange={(checked) =>
                setElementData({ ...elementData, required: checked })
              }
            />
            <Label htmlFor="element-required">Обязательное поле</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
