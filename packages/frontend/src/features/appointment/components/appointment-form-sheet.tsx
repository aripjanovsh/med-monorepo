import { useEffect, useMemo } from "react";
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
import { useMe } from "@/features/auth/use-me";
import { PatientAutocompleteField } from "@/features/patients";
import { EmployeeAutocompleteField } from "@/features/employees";
import { useGetAppointmentTypesQuery } from "@/features/master-data/master-data-appointment-types.api";
import { DoctorAvailabilityInfo } from "./doctor-availability-info";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarDays, Clock } from "lucide-react";

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

  // Fetch appointment types
  const { data: appointmentTypesData } = useGetAppointmentTypesQuery({
    isActive: true,
    limit: 100,
  });

  const appointmentTypes = useMemo(
    () => appointmentTypesData?.data || [],
    [appointmentTypesData]
  );

  const form = useForm({
    schema: appointmentFormSchema,
    defaultValues: {
      patientId: prefilledPatientId || "",
      employeeId: prefilledEmployeeId || "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "",
      duration: 30,
      reason: "",
      serviceId: "",
      appointmentTypeId: "",
    },
  });

  const watchedEmployeeId = form.watch("employeeId");
  const watchedDate = form.watch("date");
  const watchedTime = form.watch("time");
  const watchedDuration = form.watch("duration");
  const watchedAppointmentTypeId = form.watch("appointmentTypeId");

  // Auto-set duration when appointment type changes
  useEffect(() => {
    if (watchedAppointmentTypeId) {
      const selectedType = appointmentTypes.find(
        (t) => t.id === watchedAppointmentTypeId
      );
      if (selectedType?.durationMin) {
        form.setValue("duration", selectedType.durationMin);
      }
    }
  }, [watchedAppointmentTypeId, appointmentTypes, form]);

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
        appointmentTypeId: existingAppointment.appointmentTypeId || "",
      });
    }
  }, [existingAppointment, mode, form]);

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      if (!user?.id) {
        toast.error("Пользователь не авторизован");
        return;
      }

      if (!data.time) {
        toast.error("Выберите время приема");
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
        appointmentTypeId: data.appointmentTypeId || undefined,
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

  const handleSlotSelect = (date: string, time: string) => {
    form.setValue("date", date);
    form.setValue("time", time);
  };

  const isLoading = isCreating || isUpdating || isLoadingAppointment;

  // Format selected slot for display
  const selectedSlotDisplay = useMemo(() => {
    if (!watchedDate || !watchedTime) return null;
    try {
      const date = new Date(watchedDate);
      return {
        date: format(date, "d MMMM yyyy, EEEE", { locale: ru }),
        time: watchedTime,
      };
    } catch {
      return null;
    }
  }, [watchedDate, watchedTime]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
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
                      <PatientAutocompleteField label="Пациент *" {...field} />
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <EmployeeAutocompleteField label="Врач *" {...field} />
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Appointment Type */}
                  <FormField
                    control={form.control}
                    name="appointmentTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тип приема</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите тип" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {appointmentTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                <div className="flex items-center gap-2">
                                  {type.color && (
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: type.color }}
                                    />
                                  )}
                                  <span>{type.name}</span>
                                  {type.durationMin && (
                                    <span className="text-muted-foreground text-xs">
                                      ({type.durationMin} мин)
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Duration */}
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Длительность (мин) *</FormLabel>
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
                </div>

                <Separator />

                {/* Selected slot display */}
                {selectedSlotDisplay && (
                  <div className="flex items-center gap-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {selectedSlotDisplay.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {selectedSlotDisplay.time}
                      </span>
                    </div>
                  </div>
                )}

                {/* Doctor Availability with Timeslots */}
                <DoctorAvailabilityInfo
                  employeeId={watchedEmployeeId}
                  selectedDate={watchedDate}
                  selectedTime={watchedTime}
                  onSlotSelect={handleSlotSelect}
                  duration={watchedDuration}
                />

                {/* Hidden fields for date/time validation */}
                <FormField
                  control={form.control}
                  name="date"
                  render={() => <FormMessage />}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={() => <FormMessage />}
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
              <Button type="submit" disabled={isLoading || !watchedTime}>
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
