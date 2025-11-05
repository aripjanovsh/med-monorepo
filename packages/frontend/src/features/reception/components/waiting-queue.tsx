"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle } from "lucide-react";
import {
  useGetQueueQuery,
  calculateWaitTimeColor,
  isLongWaitTime,
  formatPatientName,
  formatEmployeeShortName,
  WAIT_TIME_THRESHOLDS,
} from "@/features/reception";

export const WaitingQueue = () => {
  const { data: queue, isLoading, error } = useGetQueueQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-3 w-[200px]" />
                </div>
                <Skeleton className="h-8 w-[100px]" />
              </div>
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
            <AlertCircle className="h-5 w-5 text-destructive" />
            Ошибка загрузки очереди
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!queue || queue.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Очередь пациентов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Очередь пуста</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Очередь пациентов</span>
          <Badge variant="secondary">{queue.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {queue.map((item) => {
            const waitTimeColor = calculateWaitTimeColor(item.waitTime);
            const isLongWait = isLongWaitTime(item.waitTime);

            return (
              <div
                key={item.appointment.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {/* Position */}
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                  {item.position}
                </div>

                {/* Patient Info */}
                <div className="flex-1 space-y-1">
                  <div className="font-medium">
                    {formatPatientName(item.patient)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.employee.title?.name || "Врач"}{" "}
                    {formatEmployeeShortName(item.employee)}
                    {item.appointment.roomNumber && (
                      <span className="ml-2">
                        Кабинет {item.appointment.roomNumber}
                      </span>
                    )}
                  </div>
                  {item.employee.department && (
                    <div className="text-xs text-muted-foreground">
                      {item.employee.department.name}
                    </div>
                  )}
                </div>

                {/* Wait Time */}
                <div className="text-right space-y-1">
                  <div
                    className={`flex items-center gap-1 font-semibold ${
                      waitTimeColor === "green"
                        ? "text-green-600"
                        : waitTimeColor === "yellow"
                          ? "text-yellow-600"
                          : waitTimeColor === "orange"
                            ? "text-orange-600"
                            : "text-red-600"
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    <span>{item.waitTime} мин</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Ожидание
                  </div>
                  {isLongWait && (
                    <Badge
                      variant="destructive"
                      className="text-xs"
                    >
                      Долгое ожидание
                    </Badge>
                  )}
                </div>

                {/* Status Badge */}
                <Badge
                  variant={
                    item.appointment.status === "IN_PROGRESS"
                      ? "default"
                      : "secondary"
                  }
                >
                  {item.appointment.status === "IN_PROGRESS"
                    ? "На приеме"
                    : "В очереди"}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-600" />
              <span>{"<"}{WAIT_TIME_THRESHOLDS.NORMAL} мин</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-yellow-600" />
              <span>{WAIT_TIME_THRESHOLDS.NORMAL}-{WAIT_TIME_THRESHOLDS.WARNING} мин</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-orange-600" />
              <span>{WAIT_TIME_THRESHOLDS.WARNING}-{WAIT_TIME_THRESHOLDS.CRITICAL} мин</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-600" />
              <span>{">="}{WAIT_TIME_THRESHOLDS.CRITICAL} мин</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
