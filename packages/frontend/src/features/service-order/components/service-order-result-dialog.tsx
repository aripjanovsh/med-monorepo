"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { FileText, Calendar, User, Download } from "lucide-react";
import type { DialogProps } from "@/lib/dialog-manager/dialog-manager";
import { toast } from "sonner";

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getEmployeeFullName } from "@/features/employees";
import { useAppSelector } from "@/store/hooks";

import type { ServiceOrderResponseDto } from "../service-order.dto";
import { downloadServiceOrderPdf } from "../service-order.api";
import { OrderStatusBadge } from "./service-order-status-badge";
import { AnalysisResultView } from "./analysis-result-view";
import { ProtocolResultView } from "./protocol-result-view";
import type { SavedAnalysisData } from "@/features/analysis-form-builder";
import type { SavedProtocolData } from "@/features/visit/visit-protocol.types";

type ServiceOrderResultSheetOwnProps = {
  order: ServiceOrderResponseDto;
  onEdit?: () => void;
};

type ServiceOrderResultSheetProps = ServiceOrderResultSheetOwnProps & DialogProps;

export const ServiceOrderResultSheet = ({
  open,
  onOpenChange,
  order,
  onEdit,
}: ServiceOrderResultSheetProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const token = useAppSelector((state) => state.auth.token);

  const performedByName = order.performedBy ? getEmployeeFullName(order.performedBy) : null;
  const hasResults =
    order.resultText || order.resultFileUrl || order.resultData;

  const handleDownloadPdf = async () => {
    if (!token) {
      toast.error("Необходима авторизация");
      return;
    }

    try {
      setIsDownloading(true);
      await downloadServiceOrderPdf(order.id, token);
      toast.success("PDF файл успешно загружен");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Ошибка при загрузке PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  // Определяем тип результата
  const isAnalysisResult =
    order.resultData &&
    "templateId" in order.resultData &&
    (
      // Новый формат SavedAnalysisData
      ("filledData" in order.resultData && "rows" in (order.resultData as any).filledData) ||
      // Старый формат FilledAnalysisData (обратная совместимость)
      ("rows" in order.resultData && !("formData" in order.resultData))
    );

  const isProtocolResult =
    order.resultData &&
    "templateId" in order.resultData &&
    (
      // Новый формат SavedProtocolData
      ("filledData" in order.resultData && !("rows" in (order.resultData as any).filledData)) ||
      // Старый формат (обратная совместимость)
      "formData" in order.resultData
    );

  // Вычисляем возраст пациента
  const patientAge = order.patient.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(order.patient.dateOfBirth).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      )
    : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Результаты назначения
          </SheetTitle>
          <SheetDescription>
            {order.service.name}
            {order.service.code && ` (${order.service.code})`}
          </SheetDescription>
        </SheetHeader>
        <SheetBody>

        <div className="space-y-4">
          {/* Статус и даты */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Статус</div>
                <OrderStatusBadge status={order.status} />
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

            <div className="flex gap-2">
              {hasResults && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isDownloading ? "Загрузка..." : "Скачать PDF"}
                </Button>
              )}
              {onEdit && order.status === "COMPLETED" && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Редактировать
                </Button>
              )}
            </div>
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
                  data={
                    "filledData" in order.resultData
                      ? // Новый формат SavedAnalysisData
                        (order.resultData as unknown as SavedAnalysisData)
                      : // Старый формат FilledAnalysisData - конвертируем в новый
                        ({
                          templateId: (order.resultData as any).templateId,
                          templateName: (order.resultData as any).templateName || "",
                          templateContent: { version: 1, sections: [] },
                          filledData: order.resultData as any,
                          metadata: {
                            filledAt: new Date().toISOString(),
                            patientId: order.patient.id,
                            serviceOrderId: order.id,
                          },
                        } as unknown as SavedAnalysisData)
                  }
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
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};
