"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, User, AlertCircle, Zap, Play } from "lucide-react";
import { useGetDoctorQueueQuery } from "@/features/doctor/api/doctor.api";
import type { DoctorQueueVisit, AppointmentType } from "@/features/doctor/types/doctor-queue";

type QueueWidgetProps = {
  employeeId: string;
  onStartVisit?: (visitId: string) => void;
};

const APPOINTMENT_TYPE_CONFIG: Record<AppointmentType, { label: string; variant: "default" | "destructive" | "outline" | "secondary"; icon: typeof Clock }> = {
  STANDARD: { label: "Обычная", variant: "outline", icon: Clock },
  EMERGENCY: { label: "Экстренная", variant: "destructive", icon: AlertCircle },
  WITHOUT_QUEUE: { label: "Без очереди", variant: "secondary", icon: Zap },
};

export const QueueWidget = ({ employeeId, onStartVisit }: QueueWidgetProps) => {
  const { data } = useGetDoctorQueueQuery(
    { employeeId },
    { skip: !employeeId }
  );

  const queue = data?.waiting || [];
  const hasCurrentPatient = !!data?.inProgress;
  const nextPatient = queue[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Очередь
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {queue.length} пациентов
            </Badge>
            {nextPatient && !hasCurrentPatient && onStartVisit && (
              <Button
                size="sm"
                onClick={() => onStartVisit(nextPatient.id)}
                className="h-7"
              >
                <Play className="mr-1 h-3 w-3" />
                Принять
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {queue.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Очередь пуста
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {queue.map((item: DoctorQueueVisit, index: number) => {
                const typeConfig = item.appointmentType ? APPOINTMENT_TYPE_CONFIG[item.appointmentType] : null;
                const TypeIcon = typeConfig?.icon;
                
                return (
                  <div
                    key={item.id}
                    className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {item.queueNumber}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">
                            {item.patient.lastName} {item.patient.firstName}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {typeConfig && (
                          <Badge variant={typeConfig.variant} className="flex items-center gap-1 text-xs">
                            {TypeIcon && <TypeIcon className="h-3 w-3" />}
                            {typeConfig.label}
                          </Badge>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {item.waitingMinutes} мин
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
