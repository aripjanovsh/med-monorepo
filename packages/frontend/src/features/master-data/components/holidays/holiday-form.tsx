"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  useCreateHolidayMutation,
  useUpdateHolidayMutation,
} from "@/features/master-data/master-data-holidays.api";
import type { Holiday } from "@/features/master-data/master-data.types";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

type HolidayFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday?: Holiday | null;
  onSuccess?: () => void;
};

type HolidayFormData = {
  name: string;
  startsOn: string;
  until: string;
  note: string;
  isActive: boolean;
};

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Название обязательно")
    .min(2, "Минимум 2 символа")
    .max(200, "Максимум 200 символов"),
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
  note: yup.string().default("").max(500, "Максимум 500 символов"),
  isActive: yup.boolean().default(true).required(),
});

export function HolidayForm({
  open,
  onOpenChange,
  holiday,
  onSuccess,
}: HolidayFormProps) {
  const [createHoliday, { isLoading: isCreating }] = useCreateHolidayMutation();
  const [updateHoliday, { isLoading: isUpdating }] = useUpdateHolidayMutation();

  const isEditing = !!holiday;
  const isLoading = isCreating || isUpdating;

  const form = useForm<HolidayFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      startsOn: "",
      until: "",
      note: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open && holiday) {
      form.reset({
        name: holiday.name,
        startsOn: format(parseISO(holiday.startsOn), "yyyy-MM-dd"),
        until: format(parseISO(holiday.until), "yyyy-MM-dd"),
        note: holiday.note || "",
        isActive: holiday.isActive,
      });
    } else if (open && !holiday) {
      form.reset({
        name: "",
        startsOn: "",
        until: "",
        note: "",
        isActive: true,
      });
    }
  }, [open, holiday, form]);

  const handleSubmit = async (data: HolidayFormData) => {
    try {
      const payload = {
        name: data.name,
        startsOn: data.startsOn,
        until: data.until,
        note: data.note || undefined,
        isActive: data.isActive,
      };

      if (isEditing && holiday) {
        await updateHoliday({ id: holiday.id, data: payload }).unwrap();
        toast.success("Праздник успешно обновлён");
      } else {
        await createHoliday(payload).unwrap();
        toast.success("Праздник успешно создан");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        isEditing
          ? "Ошибка при обновлении праздника"
          : "Ошибка при создании праздника"
      );
      console.error("Error submitting holiday:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Редактировать праздник" : "Создать праздник"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Внесите изменения в информацию о празднике"
              : "Заполните форму для создания нового праздника"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Например: Новый год"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
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
                      placeholder="Дополнительная информация о празднике"
                      rows={3}
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
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Активный</FormLabel>
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
                  ? isEditing
                    ? "Сохранение..."
                    : "Создание..."
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
