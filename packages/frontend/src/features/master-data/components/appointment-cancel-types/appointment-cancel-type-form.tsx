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
  useCreateAppointmentCancelTypeMutation,
  useUpdateAppointmentCancelTypeMutation,
} from "@/features/master-data/master-data-appointment-cancel-types.api";
import type { AppointmentCancelType } from "@/features/master-data/master-data.types";
import { toast } from "sonner";

type AppointmentCancelTypeFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentCancelType?: AppointmentCancelType | null;
  onSuccess?: () => void;
};

type AppointmentCancelTypeFormData = {
  name: string;
  code: string;
  description: string;
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
  isActive: yup.boolean().default(true).required(),
  order: yup
    .number()
    .nullable()
    .transform((value, original) => (original === "" ? null : value)),
});

export function AppointmentCancelTypeForm({
  open,
  onOpenChange,
  appointmentCancelType,
  onSuccess,
}: AppointmentCancelTypeFormProps) {
  const [createCancelType, { isLoading: isCreating }] =
    useCreateAppointmentCancelTypeMutation();
  const [updateCancelType, { isLoading: isUpdating }] =
    useUpdateAppointmentCancelTypeMutation();

  const isEditing = !!appointmentCancelType;
  const isLoading = isCreating || isUpdating;

  const form = useForm<AppointmentCancelTypeFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      isActive: true,
      order: null,
    },
  });

  useEffect(() => {
    if (open && appointmentCancelType) {
      form.reset({
        name: appointmentCancelType.name,
        code: appointmentCancelType.code || "",
        description: appointmentCancelType.description || "",
        isActive: appointmentCancelType.isActive,
        order: appointmentCancelType.order ?? null,
      });
    } else if (open && !appointmentCancelType) {
      form.reset({
        name: "",
        code: "",
        description: "",
        isActive: true,
        order: null,
      });
    }
  }, [open, appointmentCancelType, form]);

  const handleSubmit = async (data: AppointmentCancelTypeFormData) => {
    try {
      const payload = {
        name: data.name,
        code: data.code || undefined,
        description: data.description || undefined,
        isActive: data.isActive,
        order: data.order ?? undefined,
      };

      if (isEditing && appointmentCancelType) {
        await updateCancelType({
          id: appointmentCancelType.id,
          data: payload,
        }).unwrap();
        toast.success("Причина отмены успешно обновлена");
      } else {
        await createCancelType(payload).unwrap();
        toast.success("Причина отмены успешно создана");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const errorMessage = isEditing
        ? "Ошибка при обновлении причины отмены"
        : "Ошибка при создании причины отмены";
      toast.error(errorMessage);
      console.error("Error submitting appointment cancel type:", error);
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
            {isEditing
              ? "Редактировать причину отмены"
              : "Создать причину отмены"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Внесите изменения в информацию о причине отмены"
              : "Заполните форму для создания новой причины отмены"}
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
                        placeholder="PATIENT_SICK"
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
                  <FormLabel className="!mt-0">Активная причина</FormLabel>
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
