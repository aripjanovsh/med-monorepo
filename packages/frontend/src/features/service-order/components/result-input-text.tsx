"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ResultInputTextProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const ResultInputText = ({
  value,
  onChange,
  disabled = false,
}: ResultInputTextProps) => {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="result-text" className="text-base font-semibold">
          📋 Текстовое заключение
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Введите результаты выполнения назначения в свободной форме
        </p>
      </div>

      <Textarea
        id="result-text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Опишите результаты выполнения назначения..."
        className="min-h-[200px] resize-y"
      />

      <div className="text-xs text-muted-foreground">
        Текст будет сохранён как заключение по данному назначению
      </div>
    </div>
  );
};
