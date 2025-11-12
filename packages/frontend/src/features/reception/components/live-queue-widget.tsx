"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User, Stethoscope, AlertCircle } from "lucide-react";
import { useGetQueueQuery } from "@/features/reception";
import { cn } from "@/lib/utils";

const REFRESH_INTERVAL_MS = 30000; // 30 seconds

export const LiveQueueWidget = () => {
  const { data: queue, isLoading, error, refetch } = useGetQueueQuery(undefined, {
    pollingInterval: REFRESH_INTERVAL_MS,
  });

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

  const getWaitTimeColor = (minutes: number) => {
    if (minutes < 15) return "text-green-600";
    if (minutes < 30) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      WAITING: { label: "Ожидает", variant: "secondary" },
      IN_PROGRESS: { label: "На приёме", variant: "default" },
      CHECKED_IN: { label: "Зарегистрирован", variant: "outline" },
    };

    const config = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Активная очередь
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {queue?.length || 0} пациентов
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!queue || queue.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Очередь пуста
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {queue.map((item) => (
                <div
                  key={item.appointment.id}
                  className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {item.position}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">
                            {item.patient.lastName} {item.patient.firstName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Stethoscope className="h-3.5 w-3.5" />
                        <span>
                          {item.employee.lastName} {item.employee.firstName}
                        </span>
                        {item.employee.title && (
                          <span className="text-muted-foreground/70">
                            • {item.employee.title.name}
                          </span>
                        )}
                      </div>

                      {item.appointment.roomNumber && (
                        <div className="text-xs text-muted-foreground">
                          Кабинет: {item.appointment.roomNumber}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(item.appointment.status)}
                      <div
                        className={cn(
                          "flex items-center gap-1 text-xs font-medium",
                          getWaitTimeColor(item.waitTime)
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        {item.waitTime} мин
                      </div>
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
