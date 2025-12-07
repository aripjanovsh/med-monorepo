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
  useCreateLeaveTypeMutation,
  useUpdateLeaveTypeMutation,
} from "@/features/master-data/master-data-leave-types.api";
import type { LeaveType } from "@/features/master-data/master-data.types";
import { toast } from "sonner";

type LeaveTypeFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveType?: LeaveType | null;
  onSuccess?: () => void;
};

type LeaveTypeFormData = {
  name: string;
  code: string;
  description: string;
  color: string;
  isPaid: boolean;
  isActive: boolean;
};

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Название обязательно")
    .min(2, "Минимум 2 символа")
    .max(100, "Максимум 100 символов"),
  code: yup.string().default("").max(50, "Максимум 50 символов"),
  description: yup.string().default("").max(500, "Максимум 500 символов"),
  color: yup
    .string()
    .default("")
    .matches(/^(#[0-9A-Fa-f]{6})?$/, "Цвет должен быть в формате HEX"),
  isPaid: yup.boolean().default(true).required(),
  isActive: yup.boolean().default(true).required(),
});

export function LeaveTypeForm({
  open,
  onOpenChange,
  leaveType,
  onSuccess,
}: LeaveTypeFormProps) {
  const [createLeaveType, { isLoading: isCreating }] =
    useCreateLeaveTypeMutation();
  const [updateLeaveType, { isLoading: isUpdating }] =
    useUpdateLeaveTypeMutation();

  const isEditing = !!leaveType;
  const isLoading = isCreating || isUpdating;

  const form = useForm<LeaveTypeFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      color: "#4CAF50",
      isPaid: true,
      isActive: true,
    },
  });

  useEffect(() => {
    if (open && leaveType) {
      form.reset({
        name: leaveType.name,
        code: leaveType.code || "",
        description: leaveType.description || "",
        color: leaveType.color || "#4CAF50",
        isPaid: leaveType.isPaid,
        isActive: leaveType.isActive,
      });
    } else if (open && !leaveType) {
      form.reset({
        name: "",
        code: "",
        description: "",
        color: "#4CAF50",
        isPaid: true,
        isActive: true,
      });
    }
  }, [open, leaveType, form]);

  const handleSubmit = async (data: LeaveTypeFormData) => {
    try {
      const payload = {
        ...data,
        code: data.code || undefined,
        description: data.description || undefined,
        color: data.color || undefined,
      };

      if (isEditing && leaveType) {
        await updateLeaveType({ id: leaveType.id, data: payload }).unwrap();
        toast.success("Тип отпуска успешно обновлён");
      } else {
        await createLeaveType(payload).unwrap();
        toast.success("Тип отпуска успешно создан");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        isEditing
          ? "Ошибка при обновлении типа отпуска"
          : "Ошибка при создании типа отпуска"
      );
      console.error("Error submitting leave type:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Редактировать тип отпуска" : "Создать тип отпуска"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Внесите изменения в информацию о типе отпуска"
              : "Заполните форму для создания нового типа отпуска"}
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
                      placeholder="Например: Ежегодный отпуск"
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
                        placeholder="ANNUAL"
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
                          className="w-12 h-10 p-1 cursor-pointer"
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Описание типа отпуска"
                      rows={3}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="isPaid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Оплачиваемый</FormLabel>
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
            </div>

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
