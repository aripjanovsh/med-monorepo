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
  useCreateServiceTypeMutation,
  useUpdateServiceTypeMutation,
} from "@/features/master-data/master-data-service-types.api";
import { ServiceType } from "@/features/master-data/master-data.types";
import { toast } from "sonner";

interface ServiceTypeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceType?: ServiceType | null;
  onSuccess?: () => void;
}

type ServiceTypeFormData = {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
};

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Название типа услуги обязательно")
    .min(2, "Название типа услуги должно содержать минимум 2 символа")
    .max(100, "Название типа услуги не должно превышать 100 символов"),
  code: yup.string().default("").max(20, "Код не должен превышать 20 символов"),
  description: yup
    .string()
    .default("")
    .max(500, "Описание не должно превышать 500 символов"),
  isActive: yup.boolean().default(true).required(),
});

export function ServiceTypeForm({
  open,
  onOpenChange,
  serviceType,
  onSuccess,
}: ServiceTypeFormProps) {
  const [createServiceType, { isLoading: isCreating }] =
    useCreateServiceTypeMutation();
  const [updateServiceType, { isLoading: isUpdating }] =
    useUpdateServiceTypeMutation();

  const isEditing = !!serviceType;
  const isLoading = isCreating || isUpdating;

  const form = useForm<ServiceTypeFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      isActive: true,
    },
  });

  // Reset form when dialog opens/closes or serviceType changes
  useEffect(() => {
    if (open && serviceType) {
      form.reset({
        name: serviceType.name,
        code: serviceType.code || "",
        description: serviceType.description || "",
        isActive: serviceType.isActive,
      });
    } else if (open && !serviceType) {
      form.reset({
        name: "",
        code: "",
        description: "",
        isActive: true,
      });
    }
  }, [open, serviceType, form]);

  const handleSubmit = async (data: ServiceTypeFormData) => {
    try {
      const payload = {
        ...data,
        code: data.code || undefined,
        description: data.description || undefined,
      };

      if (isEditing && serviceType) {
        await updateServiceType({
          id: serviceType.id,
          data: payload,
        }).unwrap();
        toast.success("Тип услуги успешно обновлен");
      } else {
        await createServiceType(payload).unwrap();
        toast.success("Тип услуги успешно создан");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const errorMessage = isEditing
        ? "Ошибка при обновлении типа услуги"
        : "Ошибка при создании типа услуги";
      toast.error(errorMessage);
      console.error("Error submitting service type:", error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Редактировать тип услуги"
              : "Создать новый тип услуги"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Внесите изменения в информацию о типе услуги"
              : "Заполните форму для создания нового типа услуги"}
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
                  <FormLabel>Название типа услуги *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите название типа услуги"
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
                  <FormLabel>Код типа услуги</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите код типа услуги (например, CONSULTATION)"
                      disabled={isLoading}
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Введите описание типа услуги"
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
                  <FormLabel className="!mt-0">Активный тип услуги</FormLabel>
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
