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

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import {
  useCheckInAppointmentMutation,
  useGetAppointmentsQuery,
  useMarkAppointmentNoShowMutation,
} from "@/features/appointment";
import type { AppointmentResponseDto } from "@/features/appointment/appointment.dto";
import { useCreateVisitMutation } from "@/features/visit/visit.api";
import { getPatientShortName } from "@/features/patients/patient.model";
import { getEmployeeShortName } from "@/features/employees/employee.model";

export const TodayAppointmentsWidget = () => {
  const today = new Date();
  const startDate = format(startOfDay(today), "yyyy-MM-dd'T'HH:mm:ss");
  const endDate = format(endOfDay(today), "yyyy-MM-dd'T'HH:mm:ss");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [markNoShow] = useMarkAppointmentNoShowMutation();
  const [checkIn] = useCheckInAppointmentMutation();

  const { data, isLoading, error, refetch } = useGetAppointmentsQuery({
    scheduledFrom: startDate,
    scheduledTo: endDate,
    sortBy: "scheduledAt",
    sortOrder: "asc",
    limit: 50,
  });

  const appointments = data?.data ?? [];
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAppointments = useMemo(() => {
    let result = appointments;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((a) => {
        const patientName = getPatientShortName(a.patient as any).toLowerCase();
        const doctorName = getEmployeeShortName(
          a.employee as any
        ).toLowerCase();
        return patientName.includes(query) || doctorName.includes(query);
      });
    }

    return result;
  }, [appointments, searchQuery]);

  const handleArrived = useCallback(
    async (appointment: AppointmentResponseDto) => {
      setProcessingId(appointment.id);
      try {
        await checkIn(appointment.id).unwrap();
        toast.success("Визит создан, пациент добавлен в очередь");
        refetch();
      } catch (error: any) {
        toast.error(error?.data?.message || "Ошибка при создании визита");
      } finally {
        setProcessingId(null);
      }
    },
    [refetch]
  );

  const handleNoShow = useCallback(
    async (appointment: AppointmentResponseDto) => {
      setProcessingId(appointment.id);
      try {
        await markNoShow(appointment.id).unwrap();
        toast.success("Запись отмечена как 'Не пришёл'");
        refetch();
      } catch (error: any) {
        toast.error(
          error?.data?.message || "Не удалось обновить статус записи"
        );
      } finally {
        setProcessingId(null);
      }
    },
    [markNoShow, refetch]
  );

  const columns = useMemo(
    () =>
      getTodayAppointmentsColumns({
        onArrived: handleArrived,
        onNoShow: handleNoShow,
        processingId,
      }),
    [handleArrived, handleNoShow, processingId]
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Записи на сегодня
        </h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по пациенту или врачу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full sm:w-[280px]"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredAppointments}
        hidePagination
        emptyState={
          <EmptyState
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            title="Нет ожидающих записей"
            description={
              searchQuery
                ? "Попробуйте изменить параметры поиска"
                : "Все записанные пациенты уже пришли"
            }
          />
        }
      />
    </div>
  );
};
