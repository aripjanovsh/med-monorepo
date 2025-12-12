"use client";

import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, User, CheckCircle, UserCheck, Loader2 } from "lucide-react";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import { useGetAppointmentsQuery } from "@/features/appointment";
import {
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
  type AppointmentStatus,
} from "@/features/appointment/appointment.constants";
import { useCreateVisitMutation } from "@/features/visit/visit.api";
import { toast } from "sonner";

export const TodayAppointmentsWidget = () => {
  const today = new Date();
  const startDate = format(startOfDay(today), "yyyy-MM-dd'T'HH:mm:ss");
  const endDate = format(endOfDay(today), "yyyy-MM-dd'T'HH:mm:ss");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetAppointmentsQuery({
    scheduledFrom: startDate,
    scheduledTo: endDate,
    sortBy: "scheduledAt",
    sortOrder: "asc",
    limit: 50,
  });

  const [createVisit] = useCreateVisitMutation();

  const appointments = data?.data ?? [];

  // Filter to show only SCHEDULED and CONFIRMED appointments
  const pendingAppointments = appointments.filter(
    (apt) =>
      apt.status === APPOINTMENT_STATUS.SCHEDULED ||
      apt.status === APPOINTMENT_STATUS.CONFIRMED
  );

  const handleArrived = useCallback(
    async (appointment: (typeof appointments)[0]) => {
      setProcessingId(appointment.id);
      try {
        // Create visit from appointment - this will add patient to queue
        await createVisit({
          appointmentId: appointment.id,
          patientId: appointment.patient.id,
          employeeId: appointment.employee.id,
        }).unwrap();
        toast.success("Визит создан, пациент добавлен в очередь");
        refetch();
      } catch {
        toast.error("Ошибка при создании визита");
      } finally {
        setProcessingId(null);
      }
    },
    [createVisit, refetch]
  );

  const getStatusBadge = (status: AppointmentStatus) => {
    return (
      <Badge className={APPOINTMENT_STATUS_COLORS[status]} variant="secondary">
        {APPOINTMENT_STATUS_LABELS[status]}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Записи на сегодня
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Записи на сегодня
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            {pendingAppointments.length} ожидают
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {pendingAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="h-10 w-10 text-green-500/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Нет ожидающих записей
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[320px]">
            <div className="space-y-2">
              {pendingAppointments.map((appointment) => {
                const scheduledTime = parseISO(appointment.scheduledAt);
                const isProcessing = processingId === appointment.id;
                const isUpcoming =
                  appointment.status === APPOINTMENT_STATUS.SCHEDULED ||
                  appointment.status === APPOINTMENT_STATUS.CONFIRMED;

                return (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-primary/10 shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {format(scheduledTime, "HH:mm")}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {appointment.patient.lastName}{" "}
                          {appointment.patient.firstName}
                        </p>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {appointment.employee.lastName}{" "}
                          {appointment.employee.firstName.charAt(0)}.
                        </span>
                        {appointment.service && (
                          <span className="truncate">
                            {appointment.service.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {isUpcoming && (
                      <Button
                        size="sm"
                        onClick={() => handleArrived(appointment)}
                        disabled={isProcessing || processingId !== null}
                        className="shrink-0 gap-1.5"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">Пришёл</span>
                      </Button>
                    )}
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
