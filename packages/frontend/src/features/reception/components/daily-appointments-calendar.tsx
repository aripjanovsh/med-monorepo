"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Stethoscope,
} from "lucide-react";
import { useGetDoctorScheduleQuery } from "@/features/reception";
import { cn } from "@/lib/utils";
import { format, addDays, subDays } from "date-fns";
import { ru } from "date-fns/locale";

export const DailyAppointmentsCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: schedules, isLoading } = useGetDoctorScheduleQuery({
    date: format(selectedDate, "yyyy-MM-dd"),
  });

  const handlePreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      FREE: "bg-green-100 text-green-800 border-green-200",
      BUSY: "bg-blue-100 text-blue-800 border-blue-200",
      BREAK: "bg-yellow-100 text-yellow-800 border-yellow-200",
      FINISHED: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      FREE: "Свободен",
      BUSY: "Занят",
      BREAK: "Перерыв",
      FINISHED: "Закончил",
    };
    return statusLabels[status] || status;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Расписание врачей
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousDay}
              title="Предыдущий день"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Сегодня
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextDay}
              title="Следующий день"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {format(selectedDate, "d MMMM yyyy, EEEE", { locale: ru })}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : !schedules || schedules.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Нет запланированных приёмов на этот день
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.employee.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {schedule.employee.lastName}{" "}
                          {schedule.employee.firstName}
                        </span>
                        {schedule.employee.title && (
                          <span className="text-sm text-muted-foreground">
                            • {schedule.employee.title.name}
                          </span>
                        )}
                      </div>

                      {schedule.department && (
                        <div className="text-xs text-muted-foreground">
                          {schedule.department.name}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>
                            {schedule.schedule.startTime} -{" "}
                            {schedule.schedule.endTime}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(getStatusColor(schedule.status))}
                        >
                          {getStatusLabel(schedule.status)}
                        </Badge>
                      </div>

                      {schedule.currentVisit && (
                        <div className="rounded-md bg-blue-50 p-2 text-sm">
                          <div className="flex items-center gap-1.5 font-medium text-blue-900">
                            <User className="h-3.5 w-3.5" />
                            Сейчас на приёме:
                          </div>
                          <div className="ml-5 text-blue-800">
                            {schedule.currentVisit.patient.lastName}{" "}
                            {schedule.currentVisit.patient.firstName}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 text-right">
                      <div className="text-xs text-muted-foreground">
                        Записей
                      </div>
                      <div className="text-2xl font-bold">
                        {schedule.appointments.total}
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="text-green-600">
                          ✓ {schedule.appointments.completed}
                        </span>
                        <span className="text-blue-600">
                          ⏳ {schedule.appointments.inProgress}
                        </span>
                        <span className="text-gray-600">
                          ⏱ {schedule.appointments.pending}
                        </span>
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
