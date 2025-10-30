import { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from "@/components/ui/sheet";
import { useForm } from "@/hooks/use-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { handleFieldErrors } from "@/lib/api.utils";
import type { DialogProps } from "@/lib/dialog-manager/dialog-manager";

import {
  appointmentFormSchema,
  type AppointmentFormData,
} from "../appointment.schema";
import {
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useGetAppointmentQuery,
} from "../appointment.api";
import { APPOINTMENT_TYPE_OPTIONS } from "../appointment.constants";
import type { AppointmentType } from "../appointment.constants";
import { EmployeeSelectField } from "@/features/employees/components/employee-select-field";
import { useMe } from "@/features/auth/use-me";
import { PatientAutocompleteField } from "@/features/patients";

/**
 * Пропсы для AppointmentFormSheet (без базовых DialogProps)
 */
type AppointmentFormSheetOwnProps = {
  mode: "create" | "edit";
  appointmentId?: string | null;
  onSuccess?: () => void;
  patientId?: string;
};

/**
 * Полные пропсы компонента (с DialogProps)
 */
type AppointmentFormSheetProps = AppointmentFormSheetOwnProps & DialogProps;

export const AppointmentFormSheet = ({
  mode,
  appointmentId,
  open,
  onOpenChange,
  onSuccess,
  patientId: prefilledPatientId,
}: AppointmentFormSheetProps) => {
  const { user } = useMe();
  const [createAppointment, { isLoading: isCreating }] =
    useCreateAppointmentMutation();
  const [updateAppointment, { isLoading: isUpdating }] =
    useUpdateAppointmentMutation();

  const { data: existingAppointment, isLoading: isLoadingAppointment } =
    useGetAppointmentQuery(appointmentId || "", {
      skip: mode !== "edit" || !appointmentId,
    });

  const form = useForm({
    schema: appointmentFormSchema,
    defaultValues: {
      patientId: prefilledPatientId || "",
      employeeId: "",
      scheduledAt: "",
      duration: 30,
      type: "STANDARD",
      notes: "",
      reason: "",
      roomNumber: "",
      serviceId: "",
    },
  });

  // Update form when existing appointment loads
  useEffect(() => {
    if (existingAppointment && mode === "edit") {
      const scheduledAt = new Date(existingAppointment.scheduledAt);
      const formattedDate = scheduledAt.toISOString().slice(0, 16);

      form.reset({
        patientId: existingAppointment.patient.id,
        employeeId: existingAppointment.employee.id,
        scheduledAt: formattedDate,
        duration: existingAppointment.duration,
        type: existingAppointment.type,
        notes: existingAppointment.notes || "",
        reason: existingAppointment.reason || "",
        roomNumber: existingAppointment.roomNumber || "",
        serviceId: existingAppointment.service?.id || "",
      });
    }
  }, [existingAppointment, mode, form]);

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      if (!user?.id) {
        toast.error("Пользователь не авторизован");
        return;
      }

      const payload = {
        patientId: data.patientId,
        employeeId: data.employeeId,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        duration: data.duration,
        type: data.type as AppointmentType | undefined,
        notes: data.notes,
        reason: data.reason,
        roomNumber: data.roomNumber,
        serviceId: data.serviceId || undefined,
        createdById: user.id,
      };

      if (mode === "edit" && appointmentId) {
        await updateAppointment({
          id: appointmentId,
          ...payload,
        }).unwrap();
        toast.success("Запись обновлена");
      } else {
        await createAppointment(payload).unwrap();
        toast.success("Запись создана");
      }

      onOpenChange(false);
      onSuccess?.();
      form.reset();
    } catch (error: any) {
      handleFieldErrors(error, form.setError);
      toast.error(error?.data?.message || "Ошибка при сохранении");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const isLoading = isCreating || isUpdating || isLoadingAppointment;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {mode === "edit" ? "Редактировать запись" : "Создать запись"}
          </SheetTitle>
        </SheetHeader>

        <SheetBody>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!prefilledPatientId && (
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пациент *</FormLabel>
                      <FormControl>
                        <PatientAutocompleteField {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Врач *</FormLabel>
                    <FormControl>
                      <EmployeeSelectField {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дата и время *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Длительность (минуты) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип записи</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {APPOINTMENT_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Номер кабинета</FormLabel>
                    <FormControl>
                      <Input placeholder="101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Причина обращения</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Профилактический осмотр, жалобы пациента..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Примечания</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Дополнительная информация..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? "Сохранение..."
                    : mode === "edit"
                      ? "Обновить запись"
                      : "Создать запись"}
                </Button>
              </div>
            </form>
          </Form>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};
