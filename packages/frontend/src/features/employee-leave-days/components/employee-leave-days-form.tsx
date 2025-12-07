"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateEmployeeLeaveDaysMutation,
  useUpdateEmployeeLeaveDaysMutation,
} from "../employee-leave-days.api";
import type { EmployeeLeaveDaysDto } from "../employee-leave-days.dto";
import { useGetLeaveTypesQuery } from "@/features/master-data/master-data-leave-types.api";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

type EmployeeLeaveDaysFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  leaveDays?: EmployeeLeaveDaysDto | null;
  onSuccess?: () => void;
};

type LeaveDaysFormValues = {
  leaveTypeId: string;
  startsOn: string;
  until: string;
  note: string;
};

const schema = yup.object().shape({
  leaveTypeId: yup.string().required("Выберите тип отпуска"),
  startsOn: yup.string().required("Дата начала обязательна"),
  until: yup
    .string()
    .required("Дата окончания обязательна")
    .test(
      "is-after-start",
      "Дата окончания должна быть не раньше даты начала",
      function (value) {
        const { startsOn } = this.parent;
        if (!startsOn || !value) return true;
        return new Date(value) >= new Date(startsOn);
      }
    ),
  note: yup.string().optional(),
});

export function EmployeeLeaveDaysForm({
  open,
  onOpenChange,
  employeeId,
  leaveDays,
  onSuccess,
}: EmployeeLeaveDaysFormProps) {
  const [createLeaveDays, { isLoading: isCreating }] =
    useCreateEmployeeLeaveDaysMutation();
  const [updateLeaveDays, { isLoading: isUpdating }] =
    useUpdateEmployeeLeaveDaysMutation();

  const { data: leaveTypesResponse, isLoading: isLoadingTypes } =
    useGetLeaveTypesQuery({ isActive: true });

  const leaveTypes = leaveTypesResponse?.data || [];

  const isEditing = !!leaveDays;
  const isLoading = isCreating || isUpdating;

  const form = useForm<LeaveDaysFormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      leaveTypeId: "",
      startsOn: "",
      until: "",
      note: "",
    },
  });

  useEffect(() => {
    if (open && leaveDays) {
      form.reset({
        leaveTypeId: leaveDays.leaveTypeId,
        startsOn: format(parseISO(leaveDays.startsOn), "yyyy-MM-dd"),
        until: format(parseISO(leaveDays.until), "yyyy-MM-dd"),
        note: leaveDays.note || "",
      });
    } else if (open && !leaveDays) {
      form.reset({
        leaveTypeId: "",
        startsOn: "",
        until: "",
        note: "",
      });
    }
  }, [open, leaveDays, form]);

  const handleSubmit = async (data: LeaveDaysFormValues) => {
    try {
      const payload = {
        employeeId,
        leaveTypeId: data.leaveTypeId,
        startsOn: data.startsOn,
        until: data.until,
        note: data.note || undefined,
      };

      if (isEditing && leaveDays) {
        await updateLeaveDays({ id: leaveDays.id, data: payload }).unwrap();
        toast.success("Отпуск обновлён");
      } else {
        await createLeaveDays(payload).unwrap();
        toast.success("Отпуск создан");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error(isEditing ? "Ошибка обновления" : "Ошибка создания");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Редактировать отпуск" : "Добавить отпуск"}
          </DialogTitle>
          <DialogDescription>
            Укажите период отпуска или отсутствия сотрудника
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="leaveTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип отпуска *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading || isLoadingTypes}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            {type.color && (
                              <div
                                className="size-3 rounded-full"
                                style={{ backgroundColor: type.color }}
                              />
                            )}
                            {type.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <FormLabel>Дата начала *</FormLabel>
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
                    <FormLabel>Дата окончания *</FormLabel>
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
