/**
 * Analysis Form Interactive
 * 
 * Компонент для заполнения результатов анализа по шаблону.
 * 
 * @example
 * ```tsx
 * <AnalysisFormInteractive
 *   template={analysisTemplate}
 *   value={currentData}
 *   onChange={(data) => {
 *     // Автосохранение или отправка на сервер
 *   }}
 *   disabled={false}
 * />
 * ```
 */

"use client";

import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  AnalysisParameter,
  AnalysisResultRow,
  FilledAnalysisData,
} from "../types/analysis-form.types";

type AnalysisFormInteractiveProps = {
  template: {
    id: string;
    name: string;
    sections: Array<{
      id: string;
      title: string;
      description?: string;
      parameters: AnalysisParameter[];
    }>;
  };
  value: FilledAnalysisData | null;
  onChange: (value: FilledAnalysisData) => void;
  disabled?: boolean;
};

export const AnalysisFormInteractive = ({
  template,
  value,
  onChange,
  disabled = false,
}: AnalysisFormInteractiveProps) => {
  
  // Initialize data if not present
  if (!value || value.templateId !== template.id) {
    const initialRows: AnalysisResultRow[] = [];
    
    // Flatten all parameters from all sections
    template.sections.forEach((section) => {
      section.parameters.forEach((param) => {
        initialRows.push({
          parameterId: param.id,
          parameterName: param.name,
          value: param.type === "BOOLEAN" ? false : "",
          unit: param.unit,
          referenceRanges: param.referenceRanges,
        });
      });
    });

    const initialData: FilledAnalysisData = {
      templateId: template.id,
      templateName: template.name,
      rows: initialRows,
    };

    setTimeout(() => onChange(initialData), 0);
  }

  const handleValueChange = useCallback(
    (parameterId: string, newValue: string | number | boolean) => {
      if (!value) return;

      const rowIndex = value.rows.findIndex((row) => row.parameterId === parameterId);
      if (rowIndex === -1) return;

      const updatedRows = [...value.rows];
      updatedRows[rowIndex] = { ...updatedRows[rowIndex], value: newValue };

      onChange({
        ...value,
        rows: updatedRows,
      });
    },
    [value, onChange]
  );

  if (!value) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">
          📊 {template.name}
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Заполните параметры анализа
        </p>
      </div>

      {template.sections.map((section) => (
        <div key={section.id} className="space-y-3">
          {section.title && (
            <div>
              <h4 className="font-semibold">{section.title}</h4>
              {section.description && (
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              )}
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Показатель</TableHead>
                  <TableHead className="w-[40%]">Результат</TableHead>
                  <TableHead className="w-[30%]">Ед. изм.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.parameters.map((param, index) => {
                  const row = value.rows.find((r) => r.parameterId === param.id);
                  if (!row) return null;

                  return (
                    <TableRow key={`${param.id}-${index}`}>
                      <TableCell className="font-medium">
                        {param.name}
                        {param.isRequired && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {param.type === "NUMBER" && (
                          <Input
                            type="number"
                            value={row.value as string}
                            onChange={(e) =>
                              handleValueChange(param.id, e.target.value)
                            }
                            disabled={disabled}
                            placeholder="Введите значение"
                            className="w-full"
                          />
                        )}
                        {param.type === "TEXT" && (
                          <Input
                            type="text"
                            value={row.value as string}
                            onChange={(e) =>
                              handleValueChange(param.id, e.target.value)
                            }
                            disabled={disabled}
                            placeholder="Введите текст"
                            className="w-full"
                          />
                        )}
                        {param.type === "BOOLEAN" && (
                          <Checkbox
                            checked={row.value as boolean}
                            onCheckedChange={(checked) =>
                              handleValueChange(param.id, checked as boolean)
                            }
                            disabled={disabled}
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {param.unit || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
};
