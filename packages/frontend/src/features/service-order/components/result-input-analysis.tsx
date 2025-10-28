"use client";

import { useState, useEffect, useCallback } from "react";
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

  // Sync selectedTemplateId with value prop
  useEffect(() => {
    if (value?.templateId !== selectedTemplateId) {
      setSelectedTemplateId(value?.templateId || "");
    }
  }, [value?.templateId, selectedTemplateId]);

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

    console.log('Template selected:', { templateId, template: template.name, parameters: template.parameters.map(p => ({ id: p.id, name: p.name })) });

    const rows: AnalysisResultRow[] = template.parameters.map((param, index) => ({
      parameterId: param.id || `param-${index}`, // Fallback to generated ID if param.id is undefined
      parameterName: param.name,
      value: param.type === "BOOLEAN" ? false : "",
      unit: param.unit,
      normalRange: formatNormalRange(param.referenceRanges),
    }));

    console.log('Created rows:', rows.map(r => ({ id: r.parameterId, name: r.parameterName })));

    onChange({
      templateId: template.id,
      templateName: template.name,
      rows,
    });
  };

  const handleValueChange = useCallback((parameterId: string, newValue: string | number | boolean) => {
    if (!value) return;

    console.log('handleValueChange called:', { 
      parameterId, 
      newValue, 
      currentRows: value.rows.map(r => ({ id: r.parameterId, name: r.parameterName, value: r.value }))
    });

    // Find the specific row to update and create a new array
    const rowIndex = value.rows.findIndex((row) => row.parameterId === parameterId);
    if (rowIndex === -1) {
      console.log('Row not found for parameterId:', parameterId);
      return;
    }

    const updatedRows = [...value.rows];
    updatedRows[rowIndex] = { ...updatedRows[rowIndex], value: newValue };

    console.log('Updated rows:', updatedRows.map(r => ({ id: r.parameterId, name: r.parameterName, value: r.value })));

    onChange({
      ...value,
      rows: updatedRows,
    });
  }, [value, onChange]);

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
                const paramId = param.id || `param-${index}`; // Use same fallback logic
                const row = value.rows.find((r) => r.parameterId === paramId);
                if (!row) return null;

                return (
                  <TableRow key={`${paramId}-${index}`}>
                    <TableCell className="font-medium">
                      {param.name}
                      {param.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </TableCell>
                    <TableCell>
                      {param.type === "NUMBER" && (
                        <Input
                          key={`number-input-${paramId}-${index}`}
                          id={`number-${paramId}-${index}`}
                          type="number"
                          value={row.value as string}
                          onChange={(e) => {
                            console.log(`Number input changed for param ${paramId} (${param.name}):`, e.target.value);
                            handleValueChange(paramId, e.target.value);
                          }}
                          disabled={disabled}
                          placeholder="Введите значение"
                          className="w-full"
                        />
                      )}
                      {param.type === "TEXT" && (
                        <Input
                          key={`text-input-${paramId}-${index}`}
                          id={`text-${paramId}-${index}`}
                          type="text"
                          value={row.value as string}
                          onChange={(e) => {
                            console.log(`Text input changed for param ${paramId} (${param.name}):`, e.target.value);
                            handleValueChange(paramId, e.target.value);
                          }}
                          disabled={disabled}
                          placeholder="Введите текст"
                          className="w-full"
                        />
                      )}
                      {param.type === "BOOLEAN" && (
                        <Checkbox
                          key={`boolean-input-${paramId}-${index}`}
                          id={`boolean-${paramId}-${index}`}
                          checked={row.value as boolean}
                          onCheckedChange={(checked) => {
                            console.log(`Checkbox changed for param ${paramId} (${param.name}):`, checked);
                            handleValueChange(paramId, checked as boolean);
                          }}
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
