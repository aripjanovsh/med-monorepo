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
  useCreateAppointmentTypeMutation,
  useUpdateAppointmentTypeMutation,
} from "@/features/master-data/master-data-appointment-types.api";
import type { AppointmentType } from "@/features/master-data/master-data.types";
import { toast } from "sonner";

type AppointmentTypeFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentType?: AppointmentType | null;
  onSuccess?: () => void;
};

type AppointmentTypeFormData = {
  name: string;
  code: string;
  description: string;
  color: string;
  durationMin: number | null;
  isActive: boolean;
  order: number | null;
};

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Название обязательно")
    .min(2, "Название должно содержать минимум 2 символа")
    .max(100, "Название не должно превышать 100 символов"),
  code: yup.string().default("").max(50, "Код не должен превышать 50 символов"),
  description: yup
    .string()
    .default("")
    .max(500, "Описание не должно превышать 500 символов"),
  color: yup
    .string()
    .default("")
    .matches(/^(#[0-9A-Fa-f]{6})?$/, "Неверный формат цвета"),
  durationMin: yup
    .number()
    .nullable()
    .min(1, "Длительность должна быть больше 0")
    .transform((value, original) => (original === "" ? null : value)),
  isActive: yup.boolean().default(true).required(),
  order: yup
    .number()
    .nullable()
    .transform((value, original) => (original === "" ? null : value)),
});

export function AppointmentTypeForm({
  open,
  onOpenChange,
  appointmentType,
  onSuccess,
}: AppointmentTypeFormProps) {
  const [createAppointmentType, { isLoading: isCreating }] =
    useCreateAppointmentTypeMutation();
  const [updateAppointmentType, { isLoading: isUpdating }] =
    useUpdateAppointmentTypeMutation();

  const isEditing = !!appointmentType;
  const isLoading = isCreating || isUpdating;

  const form = useForm<AppointmentTypeFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      color: "#4CAF50",
      durationMin: null,
      isActive: true,
      order: null,
    },
  });

  useEffect(() => {
    if (open && appointmentType) {
      form.reset({
        name: appointmentType.name,
        code: appointmentType.code || "",
        description: appointmentType.description || "",
        color: appointmentType.color || "#4CAF50",
        durationMin: appointmentType.durationMin ?? null,
        isActive: appointmentType.isActive,
        order: appointmentType.order ?? null,
      });
    } else if (open && !appointmentType) {
      form.reset({
        name: "",
        code: "",
        description: "",
        color: "#4CAF50",
        durationMin: null,
        isActive: true,
        order: null,
      });
    }
  }, [open, appointmentType, form]);

  const handleSubmit = async (data: AppointmentTypeFormData) => {
    try {
      const payload = {
        name: data.name,
        code: data.code || undefined,
        description: data.description || undefined,
        color: data.color || undefined,
        durationMin: data.durationMin ?? undefined,
        isActive: data.isActive,
        order: data.order ?? undefined,
      };

      if (isEditing && appointmentType) {
        await updateAppointmentType({
          id: appointmentType.id,
          data: payload,
        }).unwrap();
        toast.success("Тип приёма успешно обновлен");
      } else {
        await createAppointmentType(payload).unwrap();
        toast.success("Тип приёма успешно создан");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const errorMessage = isEditing
        ? "Ошибка при обновлении типа приёма"
        : "Ошибка при создании типа приёма";
      toast.error(errorMessage);
      console.error("Error submitting appointment type:", error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Редактировать тип приёма" : "Создать тип приёма"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Внесите изменения в информацию о типе приёма"
              : "Заполните форму для создания нового типа приёма"}
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
                      placeholder="Введите название"
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
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Код</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="PRIMARY"
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Цвет</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="w-12 p-1 h-10"
                          disabled={isLoading}
                          {...field}
                        />
                        <Input
                          placeholder="#4CAF50"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="durationMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Длительность (мин)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        disabled={isLoading}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Порядок</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        disabled={isLoading}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Введите описание"
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
                  <FormLabel className="!mt-0">Активный тип</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
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
