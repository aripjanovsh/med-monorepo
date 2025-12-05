"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Calendar,
  User,
  Stethoscope,
  FileText,
  ClipboardList,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormBuilderView, isFormBuilderContent } from "@/features/form-builder";
import { VisitStatusBadge } from "../visit-status-badge";
import type { VisitResponseDto } from "../../visit.dto";
import type { SavedProtocolData } from "../../visit-protocol.types";

type VisitPreviewDialogProps = {
  visit: VisitResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const VisitPreviewDialog = ({
  visit,
  open,
  onOpenChange,
}: VisitPreviewDialogProps) => {
  if (!visit) return null;

  const protocolData: SavedProtocolData | null = visit.protocolData
    ? JSON.parse(visit.protocolData)
    : null;

  const parsedContent = protocolData
    ? (() => {
        try {
          return JSON.parse(protocolData.templateContent);
        } catch {
          return null;
        }
      })()
    : null;

  const isFormBuilder = parsedContent && isFormBuilderContent(parsedContent);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy, HH:mm", { locale: ru });
  };

  const patientName = visit.patient
    ? `${visit.patient.lastName} ${visit.patient.firstName} ${visit.patient.middleName ?? ""}`.trim()
    : "—";

  const doctorName = visit.employee
    ? `${visit.employee.lastName} ${visit.employee.firstName?.charAt(0) ?? ""}.`
    : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl">Просмотр визита</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(visit.visitDate)}
              </p>
            </div>
            <VisitStatusBadge status={visit.status} />
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 pt-4 space-y-6">
            {/* Patient & Doctor Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Пациент</p>
                  <p className="font-medium">{patientName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Stethoscope className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Врач</p>
                  <p className="font-medium">{doctorName}</p>
                </div>
              </div>
            </div>

            {/* Clinical Data */}
            {(visit.complaint ||
              visit.anamnesis ||
              visit.diagnosis ||
              visit.conclusion) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Клинические данные
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {visit.complaint && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Жалобы
                      </p>
                      <p className="text-sm whitespace-pre-wrap">
                        {visit.complaint}
                      </p>
                    </div>
                  )}
                  {visit.anamnesis && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Анамнез
                      </p>
                      <p className="text-sm whitespace-pre-wrap">
                        {visit.anamnesis}
                      </p>
                    </div>
                  )}
                  {visit.diagnosis && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Диагноз
                      </p>
                      <p className="text-sm font-medium">{visit.diagnosis}</p>
                    </div>
                  )}
                  {visit.conclusion && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Заключение
                      </p>
                      <p className="text-sm whitespace-pre-wrap">
                        {visit.conclusion}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Protocol Data */}
            {protocolData && isFormBuilder && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Протокол: {protocolData.templateName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormBuilderView
                    templateJson={protocolData.templateContent}
                    data={protocolData.filledData}
                    compact={true}
                  />
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {visit.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Примечания</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{visit.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* No data message */}
            {!visit.complaint &&
              !visit.anamnesis &&
              !visit.diagnosis &&
              !visit.conclusion &&
              !protocolData &&
              !visit.notes && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Нет данных для отображения</p>
                </div>
              )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
