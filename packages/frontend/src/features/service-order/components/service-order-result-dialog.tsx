"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  FileText,
  Calendar,
  User,
  Download,
  File,
  Image as ImageIcon,
  Eye,
} from "lucide-react";
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
import type { SavedFileData } from "./result-input-file";
import {
  fileHelpers,
  FilePreviewDialog,
  type FileResponseDto,
} from "@/features/file";

type ServiceOrderResultSheetOwnProps = {
  order: ServiceOrderResponseDto;
  onEdit?: () => void;
};

type ServiceOrderResultSheetProps = ServiceOrderResultSheetOwnProps &
  DialogProps;

export const ServiceOrderResultSheet = ({
  open,
  onOpenChange,
  order,
  onEdit,
}: ServiceOrderResultSheetProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileResponseDto | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const token = useAppSelector((state) => state.auth.token);

  const performedByName = order.performedBy
    ? getEmployeeFullName(order.performedBy)
    : null;
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
    // Новый формат SavedAnalysisData
    (("filledData" in order.resultData &&
      "rows" in (order.resultData as any).filledData) ||
      // Старый формат FilledAnalysisData (обратная совместимость)
      ("rows" in order.resultData && !("formData" in order.resultData)));

  const isProtocolResult =
    order.resultData &&
    "templateId" in order.resultData &&
    // Новый формат SavedProtocolData
    (("filledData" in order.resultData &&
      !("rows" in (order.resultData as any).filledData)) ||
      // Старый формат (обратная совместимость)
      "formData" in order.resultData);

  const isFileResult =
    order.resultData &&
    "fileId" in order.resultData &&
    "filename" in order.resultData;

  // Вычисляем возраст пациента
  const patientAge = order.patient.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(order.patient.dateOfBirth).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25),
      )
    : undefined;

  const handleDownloadFile = async () => {
    if (!isFileResult || !token) return;

    const fileData = order.resultData as SavedFileData;
    try {
      await fileHelpers.downloadFile(fileData.fileId, fileData.filename, token);
      toast.success("Файл успешно загружен");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Ошибка при загрузке файла");
    }
  };

  const handlePreviewFile = () => {
    if (!isFileResult) return;

    const fileData = order.resultData as SavedFileData;
    // Создаем FileResponseDto объект для предпросмотра
    const fileForPreview: FileResponseDto = {
      id: fileData.fileId,
      filename: fileData.filename,
      storedName: fileData.fileId,
      path: "",
      mimeType: fileData.mimeType,
      size: fileData.size,
      category: "ANALYSIS_RESULT" as any,
      uploadedById: "",
      uploadedAt: fileData.uploadedAt,
      description: fileData.description,
    };

    setPreviewFile(fileForPreview);
    setPreviewOpen(true);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5" />;
    }
    if (mimeType === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

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
                        {format(
                          new Date(order.resultAt),
                          "dd MMMM yyyy, HH:mm",
                          {
                            locale: ru,
                          },
                        )}
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
                            templateName:
                              (order.resultData as any).templateName || "",
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
                            templateName:
                              (order.resultData as any).templateName || "",
                            templateContent: "",
                            filledData:
                              (order.resultData as any).formData || {},
                            metadata: {
                              filledAt: new Date().toISOString(),
                              patientId: order.patient.id,
                              visitId: "",
                            },
                          } as SavedProtocolData)
                    }
                  />
                )}

                {/* Результаты файла */}
                {isFileResult && order.resultData && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Файл результата
                    </div>
                    {(() => {
                      const fileData = order.resultData as SavedFileData;
                      return (
                        <div className="space-y-3">
                          {fileData.description && (
                            <div className="rounded-md bg-muted/50 p-3 border">
                              <p className="text-sm text-muted-foreground mb-1">
                                Описание:
                              </p>
                              <p className="text-sm whitespace-pre-wrap">
                                {fileData.description}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {getFileIcon(fileData.mimeType)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {fileData.filename}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(fileData.size)} •{" "}
                                  {format(
                                    new Date(fileData.uploadedAt),
                                    "dd.MM.yyyy HH:mm",
                                    { locale: ru },
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreviewFile}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Просмотр
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadFile}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Скачать
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Текстовый результат (если нет структурированных данных) */}
                {!isAnalysisResult &&
                  !isProtocolResult &&
                  !isFileResult &&
                  order.resultText && (
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

      <FilePreviewDialog
        file={previewFile}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </Sheet>
  );
};
