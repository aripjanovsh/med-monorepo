/**
 * Analysis Form View
 *
 * Компонент для просмотра результатов анализа (read-only).
 * Показывает результаты с индикаторами нормы/отклонений.
 *
 * @example
 * ```tsx
 * <AnalysisFormView
 *   data={filledAnalysisData}
 *   patientGender="MALE"
 *   patientAge={45}
 * />
 * ```
 */

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
import type {
  FilledAnalysisData,
  PatientGender,
} from "../types/analysis-form.types";
import {
  getApplicableRange,
  getReferenceStatus,
  formatReferenceRangeDisplay,
  formatValue,
} from "../utils/analysis-form.helpers";

type AnalysisFormViewProps = {
  data: FilledAnalysisData;
  patientGender?: PatientGender;
  patientAge?: number;
};

const getStatusIndicator = (status: string) => {
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

export const AnalysisFormView = ({
  data,
  patientGender,
  patientAge,
}: AnalysisFormViewProps) => {
  return (
    <div className="space-y-4">
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
              const range = row.referenceRanges
                ? getApplicableRange(
                    row.referenceRanges,
                    patientGender,
                    patientAge,
                  )
                : null;

              const status = getReferenceStatus(row.value, range);
              const rangeDisplay = formatReferenceRangeDisplay(range);

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
