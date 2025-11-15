"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PromptDialog } from "@/components/dialogs/prompt-dialog";
import { useDialog } from "@/lib/dialog-manager/dialog-manager.hook";
import {
  Clock,
  User,
  Stethoscope,
  AlertCircle,
  MoreVertical,
  XCircle,
  Play,
  AlertTriangle,
} from "lucide-react";
import {
  useGetVisitsQuery,
  VisitIncludeRelation,
  useCancelVisitMutation,
  useStartVisitMutation,
} from "@/features/visit";
import { getPatientFullName } from "@/features/patients/patient.model";
import { formatDoctorShortName } from "@/features/visit/visit.model";
import { cn } from "@/lib/utils";
import { useMemo, useCallback } from "react";
import { differenceInMinutes } from "date-fns";
import { toast } from "sonner";

const REFRESH_INTERVAL_MS = 30000;

const getWaitTimeColor = (minutes: number) => {
  if (minutes < 15) return "text-green-600";
  if (minutes < 30) return "text-yellow-600";
  return "text-red-600";
};

const getStatusBadge = (status: string) => {
  const statusMap: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    WAITING: { label: "Ожидает", variant: "secondary" },
    IN_PROGRESS: { label: "На приёме", variant: "default" },
    CHECKED_IN: { label: "Зарегистрирован", variant: "outline" },
  };

  const config = statusMap[status] || { label: status, variant: "outline" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const QueueWidget = () => {
  const { data, isLoading, error } = useGetVisitsQuery(
    {
      status: "WAITING",
      sortBy: "queuedAt",
      sortOrder: "asc",
      include: [
        VisitIncludeRelation.PATIENT,
        VisitIncludeRelation.EMPLOYEE,
        VisitIncludeRelation.APPOINTMENT,
      ],
      limit: 50,
    },
    {
      pollingInterval: REFRESH_INTERVAL_MS,
    },
  );

  const [cancelVisit] = useCancelVisitMutation();
  const [startVisit] = useStartVisitMutation();
  const cancelPrompt = useDialog(PromptDialog);

  const handleStartVisit = useCallback(
    async (visitId: string, patientName: string) => {
      try {
        await startVisit({
          id: visitId,
        }).unwrap();
        toast.success(`Приём пациента ${patientName} начат`);
      } catch (error) {
        toast.error("Не удалось начать приём");
      }
    },
    [startVisit],
  );

  const handleCancelVisit = useCallback(
    (visitId: string, patientName: string) => {
      cancelPrompt.open({
        title: "Отменить визит",
        description: `Вы действительно хотите отменить визит пациента ${patientName}?`,
        label: "Причина отмены (опционально)",
        placeholder: "Укажите причину отмены...",
        confirmText: "Отменить визит",
        cancelText: "Отмена",
        multiline: true,
        required: false,
        onConfirm: async (cancelReason: string) => {
          try {
            await cancelVisit({
              id: visitId,
              cancelReason: cancelReason.trim() || undefined,
            }).unwrap();
            toast.success(`Визит пациента ${patientName} отменён`);
            cancelPrompt.close();
          } catch (error) {
            toast.error("Не удалось отменить визит");
          }
        },
      });
    },
    [cancelVisit, cancelPrompt],
  );

  const getAppointmentTypeBadge = (type?: string) => {
    if (!type) return null;

    if (type === "EMERGENCY") {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Экстренный
        </Badge>
      );
    }

    if (type === "WITHOUT_QUEUE") {
      return (
        <Badge variant="secondary" className="text-xs">
          Вне очереди
        </Badge>
      );
    }

    return null;
  };

  const queue = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((visit, index) => ({
      visit,
      waitTime: visit.queuedAt
        ? differenceInMinutes(new Date(), new Date(visit.queuedAt))
        : 0,
    }));
  }, [data?.data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Активная очередь
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Активная очередь
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Ошибка загрузки очереди
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {!queue || queue.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Очередь пуста
          </div>
        ) : (
          <ScrollArea className="max-h-[400px] md:max-h-[600px] px-4">
            <div className="space-y-3">
              {queue.map((item) => (
                <div
                  key={item.visit.id}
                  className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium truncate">
                            {getPatientFullName(item.visit.patient)}
                          </span>
                        </div>
                        {getAppointmentTypeBadge(item.visit.appointment?.type)}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Stethoscope className="h-3.5 w-3.5" />
                        <span>
                          {formatDoctorShortName(item.visit.employee)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(item.visit.status)}
                        <div
                          className={cn(
                            "flex items-center gap-1 text-xs font-medium",
                            getWaitTimeColor(item.waitTime),
                          )}
                        >
                          <Clock className="h-3 w-3" />
                          {item.waitTime} мин
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleStartVisit(
                                item.visit.id,
                                getPatientFullName(item.visit.patient),
                              )
                            }
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Начать приём
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              handleCancelVisit(
                                item.visit.id,
                                getPatientFullName(item.visit.patient),
                              )
                            }
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Отменить визит
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
