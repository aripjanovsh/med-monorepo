"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import type { AnalysisResultData } from "./result-input-analysis";
import type {
  ReferenceRangeDto,
  ReferenceRangesDto,
} from "@/features/analysis-template/analysis-template.dto";

type PatientGender = "MALE" | "FEMALE";

type ReferenceStatus = "NORMAL" | "HIGH" | "LOW" | "UNKNOWN";

interface AnalysisResultViewProps {
  data: AnalysisResultData;
  patientGender?: PatientGender;
  patientAge?: number;
}

/**
 * Определяет подходящий референсный диапазон на основе пола и возраста пациента
 */
const getApplicableRange = (
  ranges: ReferenceRangesDto | undefined,
  gender?: PatientGender,
  age?: number
): ReferenceRangeDto | null => {
  if (!ranges) return null;

  // Если возраст указан и пациент ребенок (< 18 лет), используем детские нормы
  if (age !== undefined && age < 18 && ranges.children) {
    return ranges.children;
  }

  // Используем нормы по полу
  if (gender === "MALE" && ranges.men) {
    return ranges.men;
  }

  if (gender === "FEMALE" && ranges.women) {
    return ranges.women;
  }

  // Fallback на мужские нормы, если есть
  if (ranges.men) {
    return ranges.men;
  }

  // Fallback на женские нормы, если есть
  if (ranges.women) {
    return ranges.women;
  }

  // Fallback на детские нормы, если есть
  if (ranges.children) {
    return ranges.children;
  }

  return null;
};

/**
 * Определяет статус значения относительно референсного диапазона
 */
const getReferenceStatus = (
  value: string | number | boolean,
  range: ReferenceRangeDto | null
): ReferenceStatus => {
  if (!range || typeof value !== "number") {
    return "UNKNOWN";
  }

  const numValue = Number(value);

  if (isNaN(numValue)) {
    return "UNKNOWN";
  }

  // Если есть максимум и значение превышает
  if (range.max !== undefined && numValue > range.max) {
    return "HIGH";
  }

  // Если есть минимум и значение ниже
  if (range.min !== undefined && numValue < range.min) {
    return "LOW";
  }

  return "NORMAL";
};

/**
 * Форматирует референсный диапазон для отображения
 */
const formatReferenceRange = (range: ReferenceRangeDto | null): string => {
  if (!range) return "—";

  const { min, max } = range;

  if (min !== undefined && max !== undefined) {
    return `${min}–${max}`;
  }

  if (min !== undefined) {
    return `> ${min}`;
  }

  if (max !== undefined) {
    return `< ${max}`;
  }

  return "—";
};

/**
 * Возвращает компонент индикатора статуса
 */
const getStatusIndicator = (status: ReferenceStatus) => {
  switch (status) {
    case "HIGH":
      return (
        <Badge variant="destructive" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          Повышен
        </Badge>
      );
    case "LOW":
      return (
        <Badge variant="destructive" className="gap-1">
          <TrendingDown className="h-3 w-3" />
          Понижен
        </Badge>
      );
    case "NORMAL":
      return (
        <Badge
          variant="outline"
          className="gap-1 bg-green-50 text-green-700 border-green-200"
        >
          <Minus className="h-3 w-3" />
          Норма
        </Badge>
      );
    default:
      return null;
  }
};

/**
 * Форматирует значение для отображения
 */
const formatValue = (value: string | number | boolean): string => {
  if (typeof value === "boolean") {
    return value ? "Да" : "Нет";
  }
  return String(value);
};

export const AnalysisResultView = ({
  data,
  patientGender,
  patientAge,
}: AnalysisResultViewProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{data.templateName}</h3>
          <p className="text-sm text-muted-foreground">Результаты анализа</p>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Показатель</TableHead>
              <TableHead className="w-[20%]">Результат</TableHead>
              <TableHead className="w-[10%]">Ед. изм.</TableHead>
              <TableHead className="w-[20%]">Референс</TableHead>
              <TableHead className="w-[20%]">Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row, index) => {
              // Получаем подходящий референсный диапазон на основе пола и возраста
              const range = row.referenceRanges
                ? getApplicableRange(
                    row.referenceRanges,
                    patientGender,
                    patientAge
                  )
                : null;

              const status = getReferenceStatus(row.value, range);
              const rangeDisplay = formatReferenceRange(range);

              return (
                <TableRow key={`${row.parameterId}-${index}`}>
                  <TableCell className="font-medium">
                    {row.parameterName}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatValue(row.value)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.unit || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {rangeDisplay}
                  </TableCell>
                  <TableCell>{getStatusIndicator(status)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {(patientGender || patientAge) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>
            Референсные значения учитывают
            {patientGender && ` пол пациента`}
            {patientGender && patientAge && ` и`}
            {patientAge && ` возраст (${patientAge} лет)`}
          </span>
        </div>
      )}
    </div>
  );
};
