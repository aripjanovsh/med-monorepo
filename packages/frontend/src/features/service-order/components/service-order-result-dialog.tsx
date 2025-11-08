"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { FileText, Calendar, User } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getEmployeeFullName } from "@/features/employees";

import type { ServiceOrderResponseDto } from "../service-order.dto";
import { getOrderStatusVariant } from "../service-order.model";
import { ORDER_STATUS_LABELS } from "../service-order.constants";
import { AnalysisResultView } from "./analysis-result-view";
import { ProtocolResultView } from "./protocol-result-view";
import type { AnalysisResultData } from "./result-input-analysis";
import type { SavedProtocolData } from "@/features/visit/visit-protocol.types";

type ServiceOrderResultDialogProps = {
  order: ServiceOrderResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
};

export const ServiceOrderResultDialog = ({
  order,
  open,
  onOpenChange,
  onEdit,
}: ServiceOrderResultDialogProps) => {
  if (!order) return null;

  const performedByName = order.performedBy ? getEmployeeFullName(order.performedBy) : null;
  const hasResults =
    order.resultText || order.resultFileUrl || order.resultData;

  // Определяем тип результата
  const isAnalysisResult =
    order.resultData &&
    "rows" in order.resultData &&
    "templateId" in order.resultData;

  const isProtocolResult =
    order.resultData &&
    "templateId" in order.resultData &&
    ("filledData" in order.resultData || "formData" in order.resultData);

  // Вычисляем возраст пациента
  const patientAge = order.patient.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(order.patient.dateOfBirth).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      )
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Результаты назначения
          </DialogTitle>
          <DialogDescription>
            {order.service.name}
            {order.service.code && ` (${order.service.code})`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Статус и даты */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Статус</div>
                <Badge variant={getOrderStatusVariant(order.status)}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
              </div>

              {order.resultAt && (
                <>
                  <Separator orientation="vertical" className="h-10" />
                  <div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Дата выполнения
                    </div>
                    <div className="font-medium">
                      {format(new Date(order.resultAt), "dd MMMM yyyy, HH:mm", {
                        locale: ru,
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {onEdit && order.status === "COMPLETED" && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Редактировать
              </Button>
            )}
          </div>

          {performedByName && (
            <>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Выполнил
                </div>
                <div className="font-medium">{performedByName}</div>
              </div>
            </>
          )}

          <Separator />

          {/* Результаты */}
          {hasResults ? (
            <div className="space-y-4">
              {/* Результаты анализа */}
              {isAnalysisResult && order.resultData && (
                <AnalysisResultView
                  data={order.resultData as unknown as AnalysisResultData}
                  patientGender={order.patient.gender}
                  patientAge={patientAge}
                />
              )}

              {/* Результаты протокола */}
              {isProtocolResult && order.resultData && (
                <ProtocolResultView
                  data={
                    "filledData" in order.resultData
                      ? (order.resultData as unknown as SavedProtocolData)
                      : // Обратная совместимость со старой структурой
                        ({
                          templateId: (order.resultData as any).templateId,
                          templateName: (order.resultData as any).templateName || "",
                          templateContent: "",
                          filledData: (order.resultData as any).formData || {},
                          metadata: {
                            filledAt: new Date().toISOString(),
                            patientId: order.patient.id,
                            visitId: "",
                          },
                        } as SavedProtocolData)
                  }
                />
              )}

              {/* Текстовый результат (если нет структурированных данных) */}
              {!isAnalysisResult && !isProtocolResult && order.resultText && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Текстовый результат
                  </div>
                  <div className="rounded-md bg-muted p-4 border">
                    <p className="whitespace-pre-wrap text-sm">
                      {order.resultText}
                    </p>
                  </div>
                </div>
              )}

              {/* Файл результата */}
              {order.resultFileUrl && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Файл результата
                    </div>
                    <Button asChild variant="outline">
                      <a
                        href={order.resultFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Открыть файл
                      </a>
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Результаты еще не внесены
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
