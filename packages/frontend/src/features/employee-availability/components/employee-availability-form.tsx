"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useCreateEmployeeAvailabilityMutation,
  useUpdateEmployeeAvailabilityMutation,
} from "../employee-availability.api";
import type { EmployeeAvailabilityDto } from "../employee-availability.dto";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

const WEEKDAYS = [
  { value: 0, label: "Воскресенье" },
  { value: 1, label: "Понедельник" },
  { value: 2, label: "Вторник" },
  { value: 3, label: "Среда" },
  { value: 4, label: "Четверг" },
  { value: 5, label: "Пятница" },
  { value: 6, label: "Суббота" },
];

type EmployeeAvailabilityFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  availability?: EmployeeAvailabilityDto | null;
  onSuccess?: () => void;
};

type AvailabilityFormValues = {
  startsOn: string;
  until: string;
  startTime: string;
  endTime: string;
  repeatOn: number[];
  note: string;
  isActive: boolean;
};

const schema = yup.object().shape({
  startsOn: yup.string().required("Дата начала обязательна"),
  until: yup.string().optional(),
  startTime: yup
    .string()
    .required("Время начала обязательно")
    .matches(/^\d{2}:\d{2}$/, "Формат: ЧЧ:ММ"),
  endTime: yup
    .string()
    .required("Время окончания обязательно")
    .matches(/^\d{2}:\d{2}$/, "Формат: ЧЧ:ММ"),
  repeatOn: yup
    .array()
    .of(yup.number().required())
    .min(1, "Выберите хотя бы один день")
    .required(),
  note: yup.string().optional(),
  isActive: yup.boolean().default(true),
});

export function EmployeeAvailabilityForm({
  open,
  onOpenChange,
  employeeId,
  availability,
  onSuccess,
}: EmployeeAvailabilityFormProps) {
  const [createAvailability, { isLoading: isCreating }] =
    useCreateEmployeeAvailabilityMutation();
  const [updateAvailability, { isLoading: isUpdating }] =
    useUpdateEmployeeAvailabilityMutation();

  const isEditing = !!availability;
  const isLoading = isCreating || isUpdating;

  const form = useForm<AvailabilityFormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      startsOn: "",
      until: "",
      startTime: "09:00",
      endTime: "18:00",
      repeatOn: [1, 2, 3, 4, 5],
      note: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open && availability) {
      form.reset({
        startsOn: format(parseISO(availability.startsOn), "yyyy-MM-dd"),
        until: availability.until
          ? format(parseISO(availability.until), "yyyy-MM-dd")
          : "",
        startTime: availability.startTime,
        endTime: availability.endTime,
        repeatOn: availability.repeatOn,
        note: availability.note || "",
        isActive: availability.isActive,
      });
    } else if (open && !availability) {
      form.reset({
        startsOn: format(new Date(), "yyyy-MM-dd"),
        until: "",
        startTime: "09:00",
        endTime: "18:00",
        repeatOn: [1, 2, 3, 4, 5],
        note: "",
        isActive: true,
      });
    }
  }, [open, availability, form]);

  const handleSubmit = async (data: AvailabilityFormValues) => {
    try {
      const payload = {
        employeeId,
        startsOn: data.startsOn,
        until: data.until || undefined,
        startTime: data.startTime,
        endTime: data.endTime,
        repeatOn: data.repeatOn,
        note: data.note || undefined,
        isActive: data.isActive,
      };

      if (isEditing && availability) {
        await updateAvailability({
          id: availability.id,
          data: payload,
        }).unwrap();
        toast.success("Расписание обновлено");
      } else {
        await createAvailability(payload).unwrap();
        toast.success("Расписание создано");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error(isEditing ? "Ошибка обновления" : "Ошибка создания");
    }
  };

  const repeatOn = form.watch("repeatOn");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Редактировать расписание" : "Добавить расписание"}
          </DialogTitle>
          <DialogDescription>
            Укажите рабочее время сотрудника
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Начало *</FormLabel>
                    <FormControl>
                      <Input type="time" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Окончание *</FormLabel>
                    <FormControl>
                      <Input type="time" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="repeatOn"
              render={() => (
                <FormItem>
                  <FormLabel>Дни недели *</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {WEEKDAYS.map((day) => (
                      <div
                        key={day.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`day-${day.value}`}
                          checked={repeatOn.includes(day.value)}
                          onCheckedChange={(checked) => {
                            const current = form.getValues("repeatOn");
                            if (checked) {
                              form.setValue("repeatOn", [
                                ...current,
                                day.value,
                              ]);
                            } else {
                              form.setValue(
                                "repeatOn",
                                current.filter((d) => d !== day.value)
                              );
                            }
                          }}
                          disabled={isLoading}
                        />
                        <label
                          htmlFor={`day-${day.value}`}
                          className="text-sm cursor-pointer"
                        >
                          {day.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startsOn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Действует с *</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="until"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>До (необязательно)</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Примечание</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Дополнительная информация"
                      rows={2}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Активно</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Сохранение..."
                  : isEditing
                    ? "Сохранить"
                    : "Создать"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
