"use client";

import { useState, useMemo } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { startOfWeek, endOfWeek } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDialog } from "@/lib/dialog-manager/dialog-manager";
import { useConfirmDialog, usePromptDialog } from "@/components/dialogs";

import {
  useGetAppointmentsQuery,
  useDeleteAppointmentMutation,
  useConfirmAppointmentMutation,
  useCheckInAppointmentMutation,
  useCancelAppointmentMutation,
  type AppointmentResponseDto,
  type AppointmentStatus,
  CalendarView,
  Navigation,
  ListView,
  ViewSwitcher,
  AppointmentViewSheet,
  AppointmentFormSheet,
  createAppointmentColumns,
} from "./index";
import { useGetEmployeeAvailabilitiesQuery } from "@/features/employee-availability";
import { useGetEmployeeLeaveDaysQuery } from "@/features/employee-leave-days";
import { useGetHolidaysQuery } from "@/features/master-data/master-data-holidays.api";
import PageHeader from "@/components/layouts/page-header";
import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";

type ViewMode = "calendar" | "list";

interface FilteredAppointmentsPageProps {
  patientId?: string;
  employeeId?: string;
  patientName?: string;
  employeeName?: string;
}

export const FilteredAppointmentsPage = ({
  patientId,
  employeeId,
  patientName,
  employeeName,
}: FilteredAppointmentsPageProps) => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedStatus, setSelectedStatus] = useState<
    AppointmentStatus | "all"
  >("all");
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  // Dialog Manager для управления sheets и dialogs
  const viewSheet = useDialog(AppointmentViewSheet);
  const formSheet = useDialog(AppointmentFormSheet);
  const confirm = useConfirmDialog();
  const prompt = usePromptDialog();

  // Вычисляем начало и конец текущей недели для фильтрации
  const weekStart = useMemo(
    () => currentWeekStart.toISOString(),
    [currentWeekStart]
  );
  const weekEnd = useMemo(
    () => endOfWeek(currentWeekStart, { weekStartsOn: 1 }).toISOString(),
    [currentWeekStart]
  );

  const { data, isLoading, refetch } = useGetAppointmentsQuery({
    page: viewMode === "list" ? page : 1,
    limit: viewMode === "list" ? pageSize : 1000,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    patientId,
    employeeId,
  });

  // Fetch employee availability and leave days for calendar view (only when employeeId is set)
  const { data: availabilityData } = useGetEmployeeAvailabilitiesQuery(
    { employeeId: employeeId!, limit: 100 },
    { skip: !employeeId }
  );

  const { data: leaveDaysData } = useGetEmployeeLeaveDaysQuery(
    { employeeId: employeeId!, from: weekStart, to: weekEnd, limit: 100 },
    { skip: !employeeId }
  );

  // Fetch holidays for the current week
  const { data: holidaysData } = useGetHolidaysQuery(
    { from: weekStart, to: weekEnd, isActive: true, limit: 100 },
    { skip: !employeeId }
  );

  const availabilities = useMemo(
    () => availabilityData?.data ?? [],
    [availabilityData?.data]
  );
  const leaveDays = useMemo(
    () => leaveDaysData?.data ?? [],
    [leaveDaysData?.data]
  );
  const holidays = useMemo(
    () => holidaysData?.data ?? [],
    [holidaysData?.data]
  );

  const [deleteAppointment] = useDeleteAppointmentMutation();
  const [confirmAppointment] = useConfirmAppointmentMutation();
  const [checkInAppointment] = useCheckInAppointmentMutation();
  const [cancelAppointment] = useCancelAppointmentMutation();

  const handleView = (appointment: AppointmentResponseDto) => {
    viewSheet.open({
      appointmentId: appointment.id,
      onEdit: (id) => {
        viewSheet.close();
        handleEdit({ id } as AppointmentResponseDto);
      },
      onDeleted: refetch,
    });
  };

  const handleEdit = (appointment: AppointmentResponseDto) => {
    formSheet.open({
      mode: "edit",
      appointmentId: appointment.id,
      onSuccess: () => {
        refetch();
        formSheet.close();
      },
    });
  };

  const handleCreate = () => {
    formSheet.open({
      mode: "create",
      appointmentId: null,
      onSuccess: () => {
        refetch();
        formSheet.close();
      },
    });
  };

  const handleDelete = async (appointment: AppointmentResponseDto) => {
    confirm({
      title: "Удалить запись?",
      description:
        "Это действие нельзя отменить. Запись будет удалена безвозвратно.",
      variant: "destructive",
      confirmText: "Удалить",
      onConfirm: async () => {
        try {
          await deleteAppointment(appointment.id).unwrap();
          toast.success("Запись удалена");
          refetch();
        } catch (error: any) {
          toast.error(error?.data?.message || "Ошибка при удалении");
        }
      },
    });
  };

  const handleConfirm = async (appointment: AppointmentResponseDto) => {
    try {
      await confirmAppointment(appointment.id).unwrap();
      toast.success("Запись подтверждена");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Ошибка при подтверждении");
    }
  };

  const handleCheckIn = async (appointment: AppointmentResponseDto) => {
    try {
      await checkInAppointment(appointment.id).unwrap();
      toast.success("Пациент отмечен");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Ошибка при отметке прибытия");
    }
  };

  const handleCancel = async (appointment: AppointmentResponseDto) => {
    prompt({
      title: "Отменить запись",
      description: "Укажите причину отмены записи на прием",
      label: "Причина отмены *",
      placeholder: "Например: Пациент отказался, изменились планы...",
      multiline: true,
      required: true,
      confirmText: "Отменить запись",
      onConfirm: async (reason) => {
        try {
          await cancelAppointment({
            id: appointment.id,
            cancelReason: reason,
          }).unwrap();
          toast.success("Запись отменена");
          refetch();
        } catch (error: any) {
          toast.error(error?.data?.message || "Ошибка при отмене");
        }
      },
    });
  };

  const handleGoToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const handleBack = () => {
    router.push("/cabinet/appointments");
  };

  const columns = createAppointmentColumns(
    handleEdit,
    handleView,
    handleDelete,
    handleConfirm,
    handleCheckIn,
    handleCancel,
    !employeeId // showEmployee: false if employeeId is set (show patient instead)
  );

  const appointments = useMemo(() => data?.data || [], [data?.data]);

  const title = patientName
    ? `Записи: ${patientName}`
    : employeeName
      ? `Записи: ${employeeName}`
      : "Записи на прием";

  return (
    <>
      <LayoutHeader
        title={title}
        left={
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        }
        right={
          <Button onClick={handleCreate}>
            <Plus />
            Создать запись
          </Button>
        }
      />
      <CabinetContent className="space-y-6">
        {/* Single Row: Add new + Filters + Navigation */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ViewSwitcher
              view={viewMode}
              onViewChange={setViewMode}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />
          </div>

          {viewMode === "calendar" && (
            <Navigation
              currentWeekStart={currentWeekStart}
              onWeekChange={setCurrentWeekStart}
              onGoToToday={handleGoToToday}
            />
          )}
        </div>

        {viewMode === "calendar" ? (
          <CalendarView
            appointments={appointments}
            currentWeekStart={currentWeekStart}
            onAppointmentClick={handleView}
            showEmployee={!employeeId}
            availabilities={employeeId ? availabilities : undefined}
            leaveDays={employeeId ? leaveDays : undefined}
            holidays={employeeId ? holidays : undefined}
            bodyClassName="h-[calc(100vh-240px)]"
          />
        ) : (
          <ListView
            columns={columns}
            appointments={appointments}
            isLoading={isLoading}
            pagination={{
              page,
              limit: pageSize,
              total: data?.meta?.total || 0,
              onChangePage: setPage,
              onChangeLimit: setPageSize,
            }}
          />
        )}
      </CabinetContent>
    </>
  );
};
