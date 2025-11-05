"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Clock, AlertCircle } from "lucide-react";
import {
  useGetDoctorScheduleQuery,
  formatEmployeeShortName,
  DOCTOR_STATUS_MAP,
} from "@/features/reception";
import type { DoctorScheduleQueryDto } from "@/features/reception";

interface DoctorScheduleProps {
  query?: DoctorScheduleQueryDto;
}

export const DoctorSchedule = ({ query }: DoctorScheduleProps) => {
  const { data: schedules, isLoading, error } = useGetDoctorScheduleQuery(query);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20" />
                </CardContent>
              </Card>
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
            Ошибка загрузки расписания
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!schedules || schedules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Расписание врачей</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Нет врачей на смене</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Расписание врачей</span>
          <Badge variant="secondary">{schedules.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule) => {
            const statusInfo = DOCTOR_STATUS_MAP[schedule.status];
            const completionRate =
              schedule.appointments.total > 0
                ? (schedule.appointments.completed /
                    schedule.appointments.total) *
                  100
                : 0;

            return (
              <Card
                key={schedule.employee.id}
                className={`border-l-4 ${
                  schedule.status === "FREE"
                    ? "border-l-green-600"
                    : schedule.status === "BUSY"
                      ? "border-l-red-600"
                      : schedule.status === "BREAK"
                        ? "border-l-orange-600"
                        : "border-l-gray-600"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="font-semibold">
                        {schedule.employee.title?.name || "Врач"}{" "}
                        {schedule.employee.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatEmployeeShortName(schedule.employee)}
                      </div>
                      {schedule.department && (
                        <div className="text-xs text-muted-foreground">
                          {schedule.department.name}
                        </div>
                      )}
                    </div>
                    <Badge
                      variant={
                        schedule.status === "FREE"
                          ? "default"
                          : schedule.status === "BUSY"
                            ? "destructive"
                            : "secondary"
                      }
                      className="ml-2"
                    >
                      <span className="mr-1">{statusInfo.icon}</span>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Schedule Time */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {schedule.schedule.startTime} -{" "}
                      {schedule.schedule.endTime}
                    </span>
                  </div>

                  {/* Current Visit */}
                  {schedule.currentVisit && (
                    <div className="rounded-md bg-muted p-2 text-sm">
                      <div className="font-medium text-xs text-muted-foreground mb-1">
                        Текущий прием:
                      </div>
                      <div>
                        {formatEmployeeShortName(schedule.currentVisit.patient)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Начало:{" "}
                        {new Date(
                          schedule.currentVisit.startedAt
                        ).toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  )}

                  {/* Appointments Stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Прогресс:</span>
                      <span className="font-medium">
                        {schedule.appointments.completed} /{" "}
                        {schedule.appointments.total}
                      </span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>

                  {/* Detailed Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        В процессе:
                      </span>
                      <span className="font-medium">
                        {schedule.appointments.inProgress}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ожидают:</span>
                      <span className="font-medium">
                        {schedule.appointments.pending}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Отменено:</span>
                      <span className="font-medium text-red-600">
                        {schedule.appointments.canceled}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Завершено:</span>
                      <span className="font-medium text-green-600">
                        {schedule.appointments.completed}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
