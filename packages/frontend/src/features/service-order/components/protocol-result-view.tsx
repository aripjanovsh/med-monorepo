"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import type { ProtocolResultData } from "./result-input-protocol";

interface ProtocolResultViewProps {
  data: ProtocolResultData;
}

/**
 * Форматирует значение поля для отображения
 */
const formatFieldValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Да" : "Нет";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value);
};

/**
 * Возвращает компонент для отображения булевого значения
 */
const BooleanValue = ({ value }: { value: boolean }) => {
  return value ? (
    <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
      <CheckCircle2 className="h-3 w-3" />
      Да
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1">
      <XCircle className="h-3 w-3" />
      Нет
    </Badge>
  );
};

export const ProtocolResultView = ({ data }: ProtocolResultViewProps) => {
  const { templateName, formData } = data;

  // Группируем поля по смыслу (можно улучшить если добавить информацию о секциях)
  const fields = Object.entries(formData);

  if (fields.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Данные протокола отсутствуют
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{templateName}</h3>
        <p className="text-sm text-muted-foreground">Результаты протокола</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Данные протокола</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {fields.map(([fieldId, value]) => {
              // Преобразуем ID поля в читаемое название
              const fieldLabel = fieldId
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())
                .trim();

              const isBooleanValue = typeof value === "boolean";

              return (
                <div
                  key={fieldId}
                  className="grid grid-cols-[200px_1fr] gap-4 items-start py-2 border-b last:border-0"
                >
                  <div className="text-sm font-medium text-muted-foreground">
                    {fieldLabel}
                  </div>
                  <div className="text-sm">
                    {isBooleanValue ? (
                      <BooleanValue value={value as boolean} />
                    ) : (
                      <span className="whitespace-pre-wrap">
                        {formatFieldValue(value)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
