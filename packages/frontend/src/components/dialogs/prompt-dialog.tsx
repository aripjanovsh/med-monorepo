import { useState, useEffect } from "react";
import type { DialogProps } from "@/lib/dialog-manager/dialog-manager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/**
 * Пропсы для PromptDialog (без базовых DialogProps)
 */
export type PromptDialogOwnProps = {
  title?: string;
  description?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  multiline?: boolean;
  required?: boolean;
  onConfirm: (value: string) => void | Promise<void>;
  onCancel?: () => void;
};

/**
 * Полные пропсы с DialogProps
 */
export type PromptDialogProps = PromptDialogOwnProps & DialogProps;

/**
 * Универсальный диалог ввода текста
 *
 * @example
 * ```tsx
 * const prompt = useDialog(PromptDialog);
 *
 * prompt.open({
 *   title: "Причина отмены",
 *   label: "Укажите причину отмены записи",
 *   multiline: true,
 *   required: true,
 *   onConfirm: async (reason) => {
 *     await cancelAppointment(reason);
 *     prompt.close();
 *   },
 * });
 * ```
 */
export const PromptDialog = ({
  open,
  onOpenChange,
  title = "Введите значение",
  description,
  label,
  placeholder,
  defaultValue = "",
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  multiline = false,
  required = false,
  onConfirm,
  onCancel,
}: PromptDialogProps) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
    }
  }, [open, defaultValue]);

  const handleConfirm = async () => {
    if (required && !value.trim()) {
      return;
    }
    await onConfirm(value);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline && !e.shiftKey) {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-2">
          {label && <Label>{label}</Label>}
          {multiline ? (
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              rows={4}
              autoFocus
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              autoFocus
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button onClick={handleConfirm} disabled={required && !value.trim()}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
