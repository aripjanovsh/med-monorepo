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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useCreateServiceMutation,
  useUpdateServiceMutation,
} from "@/features/master-data/master-data-services.api";
import { useGetDepartmentsQuery } from "@/features/master-data/master-data-departments.api";
import { Service, ServiceTypeEnumFrontend } from "@/features/master-data/master-data.types";
import { toast } from "sonner";

interface ServiceFormProps {
  open: boolean;
  onClose: () => void;
  service?: Service | null;
  onSuccess?: () => void;
}

type ServiceFormData = {
  code: string;
  name: string;
  type: ServiceTypeEnumFrontend;
  description: string;
  departmentId: string;
  price: number | null;
  durationMin: number | null;
  isActive: boolean;
};

const SERVICE_TYPE_OPTIONS = [
  { value: ServiceTypeEnumFrontend.CONSULTATION, label: "Консультация" },
  { value: ServiceTypeEnumFrontend.LAB, label: "Лабораторные анализы" },
  { value: ServiceTypeEnumFrontend.DIAGNOSTIC, label: "Диагностика" },
  { value: ServiceTypeEnumFrontend.PROCEDURE, label: "Процедура" },
  { value: ServiceTypeEnumFrontend.OTHER, label: "Прочее" },
];

const validationSchema = yup.object().shape({
  code: yup
    .string()
    .required("Код услуги обязателен")
    .min(2, "Код услуги должен содержать минимум 2 символа")
    .max(50, "Код услуги не должен превышать 50 символов"),
  name: yup
    .string()
    .required("Название услуги обязательно")
    .min(2, "Название услуги должно содержать минимум 2 символа")
    .max(200, "Название услуги не должно превышать 200 символов"),
  type: yup
    .string()
    .oneOf(Object.values(ServiceTypeEnumFrontend), "Выберите тип услуги")
    .required("Тип услуги обязателен"),
  description: yup
    .string()
    .default("")
    .max(1000, "Описание не должно превышать 1000 символов"),
  departmentId: yup.string().default(""),
  price: yup
    .number()
    .nullable()
    .min(0, "Цена не может быть отрицательной")
    .transform((value, originalValue) => 
      originalValue === "" || originalValue === null ? null : value
    ),
  durationMin: yup
    .number()
    .nullable()
    .min(1, "Длительность должна быть минимум 1 минута")
    .transform((value, originalValue) => 
      originalValue === "" || originalValue === null ? null : value
    ),
  isActive: yup.boolean().default(true).required(),
});

export function ServiceForm({
  open,
  onClose,
  service,
  onSuccess,
}: ServiceFormProps) {
  const [createService, { isLoading: isCreating }] =
    useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] =
    useUpdateServiceMutation();

  // Fetch departments for select
  const { data: departmentsResponse, isLoading: isLoadingDepartments } =
    useGetDepartmentsQuery({ page: 1, limit: 100 });

  const departments = departmentsResponse?.data || [];

  const isEditing = !!service;
  const isLoading = isCreating || isUpdating;

  const form = useForm<ServiceFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      code: "",
      name: "",
      type: ServiceTypeEnumFrontend.CONSULTATION,
      description: "",
      departmentId: "",
      price: null,
      durationMin: null,
      isActive: true,
    },
  });

  // Reset form when dialog opens/closes or service changes
  useEffect(() => {
    if (open && service) {
      form.reset({
        code: service.code,
        name: service.name,
        type: service.type,
        description: service.description || "",
        departmentId: service.departmentId || "",
        price: service.price ?? null,
        durationMin: service.durationMin ?? null,
        isActive: service.isActive,
      });
    } else if (open && !service) {
      form.reset({
        code: "",
        name: "",
        type: ServiceTypeEnumFrontend.CONSULTATION,
        description: "",
        departmentId: "",
        price: null,
        durationMin: null,
        isActive: true,
      });
    }
  }, [open, service, form]);

  const handleSubmit = async (data: ServiceFormData) => {
    try {
      // Clean up empty strings for optional fields
      const payload = {
        ...data,
        description: data.description || undefined,
        departmentId: data.departmentId || undefined,
        price: data.price ?? undefined,
        durationMin: data.durationMin ?? undefined,
      };

      if (isEditing && service) {
        await updateService({
          id: service.id,
          data: payload,
        }).unwrap();
        toast.success("Услуга успешно обновлена");
      } else {
        await createService(payload).unwrap();
        toast.success("Услуга успешно создана");
      }

      onClose();
      onSuccess?.();
    } catch (error) {
      const errorMessage = isEditing
        ? "Ошибка при обновлении услуги"
        : "Ошибка при создании услуги";
      toast.error(errorMessage);
      console.error("Error submitting service:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Редактировать услугу" : "Создать новую услугу"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Внесите изменения в информацию об услуге"
              : "Заполните форму для создания новой услуги"}
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
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Код услуги *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="CONS-001"
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип услуги *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тип услуги" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SERVICE_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название услуги *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Консультация терапевта"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Введите описание услуги"
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
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Отделение</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                    disabled={isLoading || isLoadingDepartments}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите отделение (опционально)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Цена (сум)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="150000"
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
                  <FormLabel className="!mt-0">Активная услуга</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
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
