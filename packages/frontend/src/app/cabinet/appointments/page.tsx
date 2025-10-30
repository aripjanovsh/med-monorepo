"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { startOfWeek } from "date-fns";
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
  ListView,
  ViewSwitcher,
  AppointmentViewSheet,
  AppointmentFormSheet,
  createAppointmentColumns,
} from "@/features/appointment";

type ViewMode = "calendar" | "list";

export default function AppointmentsPage() {
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

  const { data, isLoading, refetch } = useGetAppointmentsQuery({
    page: viewMode === "list" ? page : 1,
    limit: viewMode === "list" ? pageSize : 1000,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
  });

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

  const columns = createAppointmentColumns(
    handleEdit,
    handleView,
    handleDelete,
    handleConfirm,
    handleCheckIn,
    handleCancel
  );

  const appointments = useMemo(() => data?.data || [], [data?.data]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Записи на прием</h1>
          <p className="text-muted-foreground">
            Управление записями пациентов на прием к врачам
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus />
          Создать запись
        </Button>
      </div>

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
          <CalendarView.Navigation
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
    </div>
  );
}
