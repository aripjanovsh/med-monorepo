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
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from "@/features/master-data/master-data-departments.api";
import { Department } from "@/features/master-data/master-data.types";
import { toast } from "sonner";
import { EmployeeSelectField } from "@/features/employees/components/employee-select-field";

interface DepartmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
  onSuccess?: () => void;
}

type DepartmentFormData = {
  name: string;
  code: string;
  description: string;
  headId: string;
  order: number | null;
  isActive: boolean;
};

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Название отделения обязательно")
    .min(2, "Название отделения должно содержать минимум 2 символа")
    .max(100, "Название отделения не должно превышать 100 символов"),
  code: yup
    .string()
    .default("")
    .max(20, "Код отделения не должен превышать 20 символов"),
  description: yup
    .string()
    .default("")
    .max(500, "Описание не должно превышать 500 символов"),
  headId: yup.string().default(""),
  order: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? null : value,
    ),
  isActive: yup.boolean().default(true).required(),
});

export function DepartmentForm({
  open,
  onOpenChange,
  department,
  onSuccess,
}: DepartmentFormProps) {
  const [createDepartment, { isLoading: isCreating }] =
    useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] =
    useUpdateDepartmentMutation();

  const isEditing = !!department;
  const isLoading = isCreating || isUpdating;

  const form = useForm<DepartmentFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      headId: "",
      order: null,
      isActive: true,
    },
  });

  // Reset form when dialog opens/closes or department changes
  useEffect(() => {
    if (open && department) {
      form.reset({
        name: department.name,
        code: department.code || "",
        description: department.description || "",
        headId: department.headId || "",
        order: department.order ?? null,
        isActive: department.isActive,
      });
    } else if (open && !department) {
      form.reset({
        name: "",
        code: "",
        description: "",
        headId: "",
        order: null,
        isActive: true,
      });
    }
  }, [open, department, form]);

  const handleSubmit = async (data: DepartmentFormData) => {
    try {
      // Clean up empty strings for optional fields
      const payload = {
        ...data,
        code: data.code || undefined,
        description: data.description || undefined,
        headId: data.headId || undefined,
        order: data.order ?? undefined,
      };

      if (isEditing && department) {
        await updateDepartment({
          id: department.id,
          data: payload,
        }).unwrap();
        toast.success("Отделение успешно обновлено");
      } else {
        await createDepartment(payload).unwrap();
        toast.success("Отделение успешно создано");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const errorMessage = isEditing
        ? "Ошибка при обновлении отделения"
        : "Ошибка при создании отделения";
      toast.error(errorMessage);
      console.error("Error submitting department:", error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Редактировать отделение" : "Создать новое отделение"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Внесите изменения в информацию об отделении"
              : "Заполните форму для создания нового отделения"}
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название отделения *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Введите название отделения"
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
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Код отделения</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Например: LAB, USG"
                        disabled={isLoading}
                        {...field}
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
                      placeholder="Введите описание отделения"
                      rows={3}
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
                name="headId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Заведующий (необязательно)</FormLabel>
                    <FormControl>
                      <EmployeeSelectField
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isLoading}
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
                    <FormLabel>Порядок сортировки</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        disabled={isLoading}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? null : Number(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                  <FormLabel className="!mt-0">Активное отделение</FormLabel>
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
