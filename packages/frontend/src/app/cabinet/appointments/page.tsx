"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { startOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | "all">("all");
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  // Sheet states
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

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
    setSelectedAppointmentId(appointment.id);
    setViewSheetOpen(true);
  };

  const handleEdit = (appointment: AppointmentResponseDto) => {
    setSelectedAppointmentId(appointment.id);
    setFormMode("edit");
    setFormSheetOpen(true);
  };

  const handleCreate = () => {
    setSelectedAppointmentId(null);
    setFormMode("create");
    setFormSheetOpen(true);
  };

  const handleEditFromView = (appointmentId: string) => {
    setViewSheetOpen(false);
    setSelectedAppointmentId(appointmentId);
    setFormMode("edit");
    setFormSheetOpen(true);
  };

  const handleDelete = async (appointment: AppointmentResponseDto) => {
    if (!confirm("Удалить запись?")) return;

    try {
      await deleteAppointment(appointment.id).unwrap();
      toast.success("Запись удалена");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Ошибка при удалении");
    }
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
    const reason = prompt("Причина отмены:");
    if (!reason) return;

    try {
      await cancelAppointment({ id: appointment.id, cancelReason: reason }).unwrap();
      toast.success("Запись отменена");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Ошибка при отмене");
    }
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
          <Plus className="h-4 w-4 mr-2" />
          Создать запись
        </Button>
      </div>

      <ViewSwitcher
        view={viewMode}
        onViewChange={setViewMode}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {viewMode === "calendar" ? (
        <CalendarView
          appointments={appointments}
          currentWeekStart={currentWeekStart}
          onWeekChange={setCurrentWeekStart}
          onGoToToday={handleGoToToday}
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

      {/* View Sheet */}
      <AppointmentViewSheet
        appointmentId={selectedAppointmentId}
        open={viewSheetOpen}
        onOpenChange={setViewSheetOpen}
        onEdit={handleEditFromView}
        onDeleted={refetch}
      />

      {/* Form Sheet */}
      <AppointmentFormSheet
        mode={formMode}
        appointmentId={formMode === "edit" ? selectedAppointmentId : null}
        open={formSheetOpen}
        onOpenChange={setFormSheetOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
