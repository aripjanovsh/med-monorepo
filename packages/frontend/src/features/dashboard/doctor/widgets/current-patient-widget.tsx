"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Play, CheckCircle, Clock, AlertCircle, Zap } from "lucide-react";
import { useGetDoctorQueueQuery } from "@/features/visit/visit.api";
import type { AppointmentType } from "@/features/doctor/types/doctor-queue";

type CurrentPatientWidgetProps = {
  employeeId: string;
  onStartVisit?: (visitId: string) => void;
  onCompleteVisit?: (visitId: string) => void;
};

const APPOINTMENT_TYPE_CONFIG: Record<
  AppointmentType,
  {
    label: string;
    variant: "default" | "destructive" | "outline" | "secondary";
    icon: typeof Clock;
  }
> = {
  STANDARD: { label: "Обычная", variant: "outline", icon: Clock },
  EMERGENCY: { label: "Экстренная", variant: "destructive", icon: AlertCircle },
  WITHOUT_QUEUE: { label: "Без очереди", variant: "secondary", icon: Zap },
};

export const CurrentPatientWidget = ({
  employeeId,
  onStartVisit,
  onCompleteVisit,
}: CurrentPatientWidgetProps) => {
  const { data } = useGetDoctorQueueQuery(
    { employeeId },
    { skip: !employeeId },
  );

  const currentPatient = data?.inProgress;
  const typeConfig = currentPatient?.appointmentType
    ? APPOINTMENT_TYPE_CONFIG[currentPatient.appointmentType]
    : null;
  const TypeIcon = typeConfig?.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Текущий пациент
          </CardTitle>
          {typeConfig && (
            <Badge
              variant={typeConfig.variant}
              className="flex items-center gap-1"
            >
              {TypeIcon && <TypeIcon className="h-3.5 w-3.5" />}
              {typeConfig.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!currentPatient ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Нет пациента на приёме
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Пациент</span>
                  <span className="font-semibold">
                    {currentPatient.patient.lastName}{" "}
                    {currentPatient.patient.firstName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Номер в очереди
                  </span>
                  <span className="font-semibold">
                    {currentPatient.queueNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Время ожидания
                  </span>
                  <span className="font-semibold">
                    {currentPatient.waitingMinutes} мин
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {currentPatient.status === "WAITING" && onStartVisit && (
                <Button
                  className="flex-1"
                  onClick={() => onStartVisit(currentPatient.id)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Начать приём
                </Button>
              )}
              {currentPatient.status === "IN_PROGRESS" && onCompleteVisit && (
                <Button
                  className="flex-1"
                  onClick={() => onCompleteVisit(currentPatient.id)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Завершить приём
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
