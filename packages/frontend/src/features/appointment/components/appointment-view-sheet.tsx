import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Edit,
  Trash,
  CheckCircle,
  UserCheck,
  XCircle,
  Clock,
  User,
  Stethoscope,
  Calendar,
  MapPin,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import type { DialogProps } from "@/lib/dialog-manager/dialog-manager";
import { useConfirmDialog, usePromptDialog } from "@/components/dialogs";
import {
  useGetAppointmentQuery,
  useDeleteAppointmentMutation,
  useConfirmAppointmentMutation,
  useCheckInAppointmentMutation,
  useCancelAppointmentMutation,
} from "../appointment.api";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import {
  getPatientFullName,
  getEmployeeFullName,
  formatAppointmentDateTime,
  canConfirmAppointment,
  canCheckInAppointment,
  canCancelAppointment,
  isAppointmentEditable,
} from "../appointment.model";

/**
 * Пропсы для AppointmentViewSheet (без базовых DialogProps)
 */
type AppointmentViewSheetOwnProps = {
  appointmentId: string | null;
  onEdit?: (appointmentId: string) => void;
  onDeleted?: () => void;
};

/**
 * Полные пропсы с DialogProps
 */
type AppointmentViewSheetProps = AppointmentViewSheetOwnProps & DialogProps;

export const AppointmentViewSheet = ({
  appointmentId,
  open,
  onOpenChange,
  onEdit,
  onDeleted,
}: AppointmentViewSheetProps) => {
  const {
    data: appointment,
    isLoading,
    error,
    refetch,
  } = useGetAppointmentQuery(appointmentId || "", { skip: !appointmentId });
  const [deleteAppointment] = useDeleteAppointmentMutation();
  const [confirmAppointment] = useConfirmAppointmentMutation();
  const [checkInAppointment] = useCheckInAppointmentMutation();
  const [cancelAppointment] = useCancelAppointmentMutation();

  const confirm = useConfirmDialog();
  const prompt = usePromptDialog();

  const handleDelete = async () => {
    if (!appointmentId) return;

    confirm({
      title: "Удалить запись?",
      description:
        "Это действие нельзя отменить. Запись будет удалена безвозвратно.",
      variant: "destructive",
      confirmText: "Удалить",
      onConfirm: async () => {
        try {
          await deleteAppointment(appointmentId).unwrap();
          toast.success("Запись удалена");
          onOpenChange(false);
          onDeleted?.();
        } catch (error: any) {
          toast.error(error?.data?.message || "Ошибка при удалении");
        }
      },
    });
  };

  const handleConfirm = async () => {
    if (!appointmentId) return;

    try {
      await confirmAppointment(appointmentId).unwrap();
      toast.success("Запись подтверждена");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Ошибка при подтверждении");
    }
  };

  const handleCheckIn = async () => {
    if (!appointmentId) return;

    try {
      await checkInAppointment(appointmentId).unwrap();
      toast.success("Пациент отмечен");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Ошибка при отметке прибытия");
    }
  };

  const handleCancel = async () => {
    if (!appointmentId) return;

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
            id: appointmentId,
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

  const handleEdit = () => {
    if (appointmentId && onEdit) {
      onEdit(appointmentId);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Запись на прием</SheetTitle>
        </SheetHeader>

        <SheetBody>
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Запись не найдена или произошла ошибка при загрузке
              </AlertDescription>
            </Alert>
          )}

          {appointment && !isLoading && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="text-sm text-muted-foreground">
                  {formatAppointmentDateTime(appointment.scheduledAt)}
                </div>
                <AppointmentStatusBadge status={appointment.status} />
              </div>

              {/* Main Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Пациент</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {getPatientFullName(appointment.patient)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Врач</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {getEmployeeFullName(appointment.employee)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Дата и время</p>
                    <p className="text-sm text-muted-foreground">
                      {formatAppointmentDateTime(appointment.scheduledAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Длительность</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.duration} минут
                    </p>
                  </div>
                </div>

                {appointment.roomNumber && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Кабинет</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.roomNumber}
                      </p>
                    </div>
                  </div>
                )}

                {appointment.service && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Услуга</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {appointment.service.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              {appointment.reason && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Причина обращения</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {appointment.reason}
                  </p>
                </div>
              )}

              {appointment.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Примечания</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {appointment.notes}
                  </p>
                </div>
              )}

              {appointment.cancelReason && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2 text-red-600">
                    Причина отмены
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {appointment.cancelReason}
                  </p>
                </div>
              )}
            </div>
          )}
        </SheetBody>

        {appointment && (
          <SheetFooter>
            <div className="flex flex-col gap-2 w-full">
              {/* Primary Actions */}
              <div className="flex gap-2">
                {canConfirmAppointment(appointment) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleConfirm}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Подтвердить
                  </Button>
                )}
                {canCheckInAppointment(appointment) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCheckIn}
                    className="flex-1"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Прибытие
                  </Button>
                )}
              </div>

              {/* Edit/Cancel Actions */}
              <div className="flex gap-2">
                {isAppointmentEditable(appointment) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                )}
                {canCancelAppointment(appointment) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Отменить
                  </Button>
                )}
              </div>

              {/* Delete Action */}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="w-full"
              >
                <Trash className="h-4 w-4 mr-2" />
                Удалить
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
