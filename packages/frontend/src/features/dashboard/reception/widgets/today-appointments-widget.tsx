"use client";

import { useCallback, useMemo, useState } from "react";
import { format, startOfDay, endOfDay } from "date-fns";
import { toast } from "sonner";
import { Calendar, CheckCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState, LoadingState } from "@/components/states";

import { getTodayAppointmentsColumns } from "./today-appointments-columns";

import { useGetAppointmentsQuery } from "@/features/appointment";
import { APPOINTMENT_STATUS } from "@/features/appointment/appointment.constants";
import type { AppointmentResponseDto } from "@/features/appointment/appointment.dto";
import { useCreateVisitMutation } from "@/features/visit/visit.api";

export const TodayAppointmentsWidget = () => {
  const today = new Date();
  const startDate = format(startOfDay(today), "yyyy-MM-dd'T'HH:mm:ss");
  const endDate = format(endOfDay(today), "yyyy-MM-dd'T'HH:mm:ss");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useGetAppointmentsQuery({
    scheduledFrom: startDate,
    scheduledTo: endDate,
    sortBy: "scheduledAt",
    sortOrder: "asc",
    limit: 50,
  });

  const [createVisit] = useCreateVisitMutation();

  const appointments = data?.data ?? [];

  // Filter to show only SCHEDULED and CONFIRMED appointments
  const pendingAppointments = useMemo(() => appointments, [appointments]);

  const handleArrived = useCallback(
    async (appointment: AppointmentResponseDto) => {
      setProcessingId(appointment.id);
      try {
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

  const columns = useMemo(
    () =>
      getTodayAppointmentsColumns({
        onArrived: handleArrived,
        processingId,
      }),
    [handleArrived, processingId]
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Записи на сегодня
        </h2>
        <Badge variant="outline" className="font-normal">
          {pendingAppointments.length} ожидают
        </Badge>
      </div>

      <DataTable
        columns={columns}
        data={pendingAppointments}
        hidePagination
        emptyState={
          <EmptyState
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            title="Нет ожидающих записей"
            description="Все записанные пациенты уже пришли"
          />
        }
      />
    </div>
  );
};
