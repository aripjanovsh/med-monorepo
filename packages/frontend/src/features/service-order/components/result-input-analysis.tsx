"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAnalysisTemplatesQuery } from "@/features/analysis-template";
import type { AnalysisTemplateResponseDto } from "@/features/analysis-template/analysis-template.dto";

export interface AnalysisResultRow {
  parameterId: string;
  parameterName: string;
  value: string | number | boolean;
  unit?: string;
  normalRange?: string;
}

export interface AnalysisResultData {
  templateId: string;
  templateName: string;
  rows: AnalysisResultRow[];
}

interface ResultInputAnalysisProps {
  value: AnalysisResultData | null;
  onChange: (value: AnalysisResultData) => void;
  disabled?: boolean;
}

export const ResultInputAnalysis = ({
  value,
  onChange,
  disabled = false,
}: ResultInputAnalysisProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    value?.templateId || ""
  );

  const { data: templatesData } = useGetAnalysisTemplatesQuery({
    page: 1,
    limit: 100,
  });

  const templates = templatesData?.data || [];
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    setSelectedTemplateId(templateId);

    const rows: AnalysisResultRow[] = template.parameters.map((param) => ({
      parameterId: param.id,
      parameterName: param.name,
      value: param.type === "BOOLEAN" ? false : "",
      unit: param.unit,
      normalRange: formatNormalRange(param.referenceRanges),
    }));

    onChange({
      templateId: template.id,
      templateName: template.name,
      rows,
    });
  };

  const handleValueChange = (parameterId: string, newValue: string | number | boolean) => {
    if (!value) return;

    const updatedRows = value.rows.map((row) =>
      row.parameterId === parameterId ? { ...row, value: newValue } : row
    );

    onChange({
      ...value,
      rows: updatedRows,
    });
  };

  const formatNormalRange = (ranges?: any): string => {
    if (!ranges) return "—";
    
    if (ranges.men && ranges.men.min !== undefined && ranges.men.max !== undefined) {
      return `${ranges.men.min}–${ranges.men.max}`;
    }
    
    return "—";
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">
          📊 Анализ по шаблону
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Выберите шаблон анализа и заполните параметры
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-select">Шаблон анализа</Label>
        <Select
          value={selectedTemplateId}
          onValueChange={handleTemplateSelect}
          disabled={disabled}
        >
          <SelectTrigger id="template-select">
            <SelectValue placeholder="Выберите шаблон анализа" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name} ({template.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTemplate && value && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Показатель</TableHead>
                <TableHead className="w-[30%]">Результат</TableHead>
                <TableHead className="w-[15%]">Ед. изм.</TableHead>
                <TableHead className="w-[25%]">Норма</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedTemplate.parameters.map((param, index) => {
                const row = value.rows.find((r) => r.parameterId === param.id);
                if (!row) return null;

                return (
                  <TableRow key={param.id}>
                    <TableCell className="font-medium">
                      {param.name}
                      {param.isRequired && <span className="text-red-500 ml-1">*</span>}
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
                    <TableCell className="text-sm text-muted-foreground">
                      {row.normalRange}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {!selectedTemplate && (
        <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
          Выберите шаблон анализа для начала заполнения
        </div>
      )}
    </div>
  );
};
