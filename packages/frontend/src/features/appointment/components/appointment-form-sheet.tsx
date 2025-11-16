import { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
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
import { EmployeeSelectField } from "@/features/employees/components/employee-select-field";
import { useMe } from "@/features/auth/use-me";
import { PatientAutocompleteField } from "@/features/patients";
import { DatePickerField } from "@/components/fields/date-picker-field";
import { TimePickerField } from "@/components/fields/time-picker-field";
import { EmployeeAutocompleteField } from "@/features/employees";

/**
 * Пропсы для AppointmentFormSheet (без базовых DialogProps)
 */
type AppointmentFormSheetOwnProps = {
  mode: "create" | "edit";
  appointmentId?: string | null;
  onSuccess?: () => void;
  patientId?: string;
  employeeId?: string;
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
  employeeId: prefilledEmployeeId,
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
      employeeId: prefilledEmployeeId || "",
      date: "",
      time: "",
      duration: 30,
      reason: "",
      serviceId: "",
    },
  });

  // Update form when existing appointment loads
  useEffect(() => {
    if (existingAppointment && mode === "edit") {
      const scheduledAt = new Date(existingAppointment.scheduledAt);
      const date = scheduledAt.toISOString().split("T")[0];
      const time = scheduledAt.toTimeString().slice(0, 5);

      form.reset({
        patientId: existingAppointment.patient.id,
        employeeId: existingAppointment.employee.id,
        date,
        time,
        duration: existingAppointment.duration,
        reason: existingAppointment.reason || "",
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

      // Combine date and time into ISO string
      const scheduledAt = new Date(`${data.date}T${data.time}`).toISOString();

      const payload = {
        patientId: data.patientId,
        employeeId: data.employeeId,
        scheduledAt,
        duration: data.duration,
        reason: data.reason,
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col"
          >
            <SheetBody>
              <div className="space-y-4">
                {!prefilledPatientId && (
                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <PatientAutocompleteField label="Пациент*" {...field} />
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <EmployeeAutocompleteField label="Врач" {...field} />
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дата *</FormLabel>
                        <FormControl>
                          <DatePickerField {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Время *</FormLabel>
                        <FormControl>
                          <TimePickerField {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
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
                        <Input
                          placeholder="Профилактический осмотр, жалобы пациента..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </SheetBody>

            <SheetFooter className="flex justify-end gap-2">
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
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
