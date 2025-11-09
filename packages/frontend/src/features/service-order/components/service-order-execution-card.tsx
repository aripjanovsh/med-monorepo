"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Play, Save, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getPatientFullName } from "@/features/patients";
import { getEmployeeFullName } from "@/features/employees";

import type { ServiceOrderResponseDto } from "../service-order.dto";
import { SERVICE_TYPE_LABELS } from "../service-order.constants";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "./service-order-status-badge";

import { ResultInputText } from "./result-input-text";
import { ResultInputAnalysis, type AnalysisResultData } from "./result-input-analysis";
import { ResultInputProtocol } from "./result-input-protocol";
import type { SavedProtocolData } from "@/features/visit/visit-protocol.types";
import type { SavedAnalysisData } from "@/features/analysis-form-builder";

type ResultInputMode = "text" | "protocol" | "analysis";

interface ServiceOrderExecutionCardProps {
  order: ServiceOrderResponseDto;
  onStartWork: () => Promise<void>;
  onSaveDraft: (data: {
    resultText?: string;
    resultData?: Record<string, any>;
  }) => Promise<void>;
  onComplete: (data: {
    resultText?: string;
    resultData?: Record<string, any>;
  }) => Promise<void>;
  onCancel: () => Promise<void>;
  isLoading?: boolean;
}

export const ServiceOrderExecutionCard = ({
  order,
  onStartWork,
  onSaveDraft,
  onComplete,
  onCancel,
  isLoading = false,
}: ServiceOrderExecutionCardProps) => {
  const parseResultData = (data: Record<string, any> | null | undefined): {
    analysis: SavedAnalysisData | null;
    protocol: SavedProtocolData | null;
  } => {
    if (!data) return { analysis: null, protocol: null };
    
    // Новая структура SavedAnalysisData
    if ("filledData" in data && "templateContent" in data && "rows" in data.filledData) {
      return { analysis: data as SavedAnalysisData, protocol: null };
    }
    
    // Старая структура FilledAnalysisData (обратная совместимость)
    if ("rows" in data && "templateId" in data && !("filledData" in data)) {
      const oldData = data as any;
      const newData: SavedAnalysisData = {
        templateId: oldData.templateId,
        templateName: oldData.templateName || "",
        templateContent: { version: 1, sections: [] },
        filledData: oldData,
        metadata: {
          filledAt: new Date().toISOString(),
          patientId: "",
          serviceOrderId: "",
        },
      };
      return { analysis: newData, protocol: null };
    }
    
    // Новая структура SavedProtocolData
    if ("filledData" in data && "templateContent" in data && !("rows" in data)) {
      return { analysis: null, protocol: data as SavedProtocolData };
    }
    
    // Старая структура протокола (обратная совместимость)
    if ("formData" in data && "templateId" in data) {
      const oldData = data as any;
      const newData: SavedProtocolData = {
        templateId: oldData.templateId,
        templateName: oldData.templateName || "",
        templateContent: "",
        filledData: oldData.formData,
        metadata: {
          filledAt: new Date().toISOString(),
          patientId: "",
          visitId: "",
        },
      };
      return { analysis: null, protocol: newData };
    }
    
    return { analysis: null, protocol: null };
  };

  const parsedData = parseResultData(order.resultData);
  
  // Определяем начальный режим ввода на основе существующих данных
  const getInitialInputMode = (): ResultInputMode => {
    if (parsedData.analysis) return "analysis";
    if (parsedData.protocol) return "protocol";
    if (order.resultText) return "text";
    return "text";
  };

  const [inputMode, setInputMode] = useState<ResultInputMode>(getInitialInputMode());
  const [textResult, setTextResult] = useState<string>(order.resultText || "");
  const [analysisResult, setAnalysisResult] = useState<SavedAnalysisData | null>(parsedData.analysis);
  const [protocolResult, setProtocolResult] = useState<SavedProtocolData | null>(parsedData.protocol);

  const patientName = getPatientFullName(order.patient);
  const doctorName = getEmployeeFullName(order.doctor);

  const canStartWork = order.status === "ORDERED";
  const canWork = order.status === "IN_PROGRESS" || order.status === "COMPLETED";
  const isCompleted = order.status === "COMPLETED";
  const isCancelled = order.status === "CANCELLED";
  const isReadonly = isCancelled;

  const handleStartWork = async () => {
    try {
      await onStartWork();
      toast.success("Назначение принято в работу");
    } catch (error: any) {
      toast.error(error?.data?.message || "Ошибка при принятии в работу");
    }
  };

  const handleSaveDraft = async () => {
    try {
      const data = prepareResultData();
      await onSaveDraft(data);
      toast.success("Черновик сохранён");
    } catch (error: any) {
      toast.error(error?.data?.message || "Ошибка при сохранении черновика");
    }
  };

  const handleComplete = async () => {
    const confirmMessage = isCompleted 
      ? "Обновить результаты назначения?" 
      : "Завершить выполнение назначения?";
    
    if (!confirm(confirmMessage)) return;

    try {
      const data = prepareResultData();
      await onComplete(data);
      toast.success(isCompleted ? "Результаты обновлены" : "Назначение выполнено");
    } catch (error: any) {
      toast.error(error?.data?.message || "Ошибка при сохранении");
    }
  };

  const handleCancel = async () => {
    if (!confirm("Отменить назначение?")) return;

    try {
      await onCancel();
      toast.success("Назначение отменено");
    } catch (error: any) {
      toast.error(error?.data?.message || "Ошибка при отмене назначения");
    }
  };

  const prepareResultData = (): {
    resultText?: string;
    resultData?: Record<string, any>;
  } => {
    if (inputMode === "text") {
      return { resultText: textResult };
    }
    if (inputMode === "analysis" && analysisResult) {
      return { resultData: analysisResult as Record<string, any> };
    }
    if (inputMode === "protocol" && protocolResult) {
      return { resultData: protocolResult as Record<string, any> };
    }
    return {};
  };

  return (
    <div className="space-y-6">
      {/* Основная информация о назначении */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                🩺 {order.service.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {order.service.code && `Код: ${order.service.code}`}
              </p>
            </div>
            <div className="flex gap-2">
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Пациент</div>
              <div className="font-medium">{patientName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Назначил врач</div>
              <div className="font-medium">{doctorName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Отделение</div>
              <div className="font-medium">{order.department?.name || "—"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Дата назначения</div>
              <div className="font-medium">
                {format(new Date(order.createdAt), "dd.MM.yyyy", { locale: ru })}
              </div>
            </div>
          </div>

          {order.service.type && (
            <div>
              <div className="text-sm text-muted-foreground">Тип услуги</div>
              <div className="font-medium">
                {SERVICE_TYPE_LABELS[order.service.type] || order.service.type}
              </div>
            </div>
          )}

          {/* Кнопки управления статусом */}
          {!isReadonly && (
            <>
              <Separator />
              <div className="flex gap-2">
                {canStartWork && (
                  <Button
                    onClick={handleStartWork}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Принять в работу
                  </Button>
                )}
                {order.status === "ORDERED" && (
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Отменить
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Ввод результатов (доступен только в статусе IN_PROGRESS) */}
      {canWork && (
        <Card>
          <CardHeader>
            <CardTitle>📄 Ввод результатов выполнения</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Выбор способа ввода */}
            <div className="space-y-2">
              <Label htmlFor="input-mode">Режим ввода результата</Label>
              <Select
                value={inputMode}
                onValueChange={(value: ResultInputMode) => setInputMode(value)}
              >
                <SelectTrigger id="input-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Произвольный текст</SelectItem>
                  <SelectItem value="protocol">Шаблон протокола</SelectItem>
                  <SelectItem value="analysis">Шаблон анализа</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Компоненты ввода */}
            {inputMode === "text" && (
              <ResultInputText
                value={textResult}
                onChange={setTextResult}
                disabled={isLoading}
              />
            )}

            {inputMode === "analysis" && (
              <ResultInputAnalysis
                value={analysisResult}
                onChange={setAnalysisResult}
                disabled={isLoading}
                patientId={order.patient.id}
                serviceOrderId={order.id}
              />
            )}

            {inputMode === "protocol" && (
              <ResultInputProtocol
                value={protocolResult}
                onChange={setProtocolResult}
                disabled={isLoading}
                patientId={order.patient.id}
                readonly={isCompleted}
              />
            )}

            <Separator />

            {/* Кнопки действий */}
            <div className="flex justify-end gap-2">
              {!isCompleted && (
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Сохранить черновик
                </Button>
              )}
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                {isCompleted ? "Обновить результат" : "Завершить выполнение"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
