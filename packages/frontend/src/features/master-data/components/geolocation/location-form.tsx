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
import { toast } from "sonner";
import {
  useCreateLocationMutation,
  useUpdateLocationMutation,
} from "@/features/master-data";
import type {
  LocationTreeNode,
  LocationType,
  CreateLocationRequest,
  UpdateLocationRequest,
} from "@/features/master-data";

// Типы локаций с метками
const LOCATION_TYPES = [
  { value: "COUNTRY" as LocationType, label: "Страна" },
  { value: "REGION" as LocationType, label: "Регион" },
  { value: "CITY" as LocationType, label: "Город" },
  { value: "DISTRICT" as LocationType, label: "Район" },
];

// Схема валидации
const schema = yup.object({
  name: yup
    .string()
    .required("Название обязательно")
    .min(2, "Минимум 2 символа")
    .max(100, "Максимум 100 символов"),
  code: yup
    .string()
    .optional()
    .min(2, "Минимум 2 символа")
    .max(10, "Максимум 10 символов"),
  type: yup
    .mixed<LocationType>()
    .oneOf(["COUNTRY", "REGION", "CITY", "DISTRICT"])
    .required("Тип обязателен"),
  weight: yup
    .number()
    .min(0, "Вес не может быть отрицательным")
    .integer("Вес должен быть целым числом")
    .default(0),
  description: yup.string().optional().max(500, "Максимум 500 символов"),
});

type FormData = yup.InferType<typeof schema>;

interface LocationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  location?: LocationTreeNode;
  parentId?: string;
  onSuccess?: () => void;
}

export function LocationForm({
  open,
  onOpenChange,
  mode,
  location,
  parentId,
  onSuccess,
}: LocationFormProps) {
  const [createLocation, { isLoading: isCreating }] =
    useCreateLocationMutation();
  const [updateLocation, { isLoading: isUpdating }] =
    useUpdateLocationMutation();

  const form = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      type: "COUNTRY",
      weight: 0,
      description: "",
    },
  });

  // Сброс формы при открытии/закрытии
  useEffect(() => {
    if (open) {
      if (mode === "edit" && location) {
        form.reset({
          name: location.name,
          code: location.code || "",
          type: location.type,
          weight: location.weight,
          description: location.description || "",
        });
      } else {
        form.reset({
          name: "",
          code: "",
          type: "COUNTRY",
          weight: 0,
          description: "",
        });
      }
    }
  }, [open, mode, location, form]);

  const handleSubmit = async (data: FormData) => {
    try {
      if (mode === "create") {
        const payload: CreateLocationRequest = {
          name: data.name,
          type: data.type,
          weight: data.weight || 0,
          ...(data.code && { code: data.code }),
          ...(parentId && { parentId }),
          ...(data.description && { description: data.description }),
        };

        await createLocation(payload).unwrap();
        toast.success("Локация создана");
      } else if (location) {
        const payload: UpdateLocationRequest = {
          name: data.name,
          type: data.type,
          weight: data.weight || 0,
          ...(data.code && { code: data.code }),
          ...(data.description && { description: data.description }),
        };

        await updateLocation({ id: location.id, data: payload }).unwrap();
        toast.success("Локация обновлена");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Произошла ошибка");
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-gilroy">
            {mode === "create" ? "Создать локацию" : "Редактировать локацию"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Название */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите название" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Код */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Код (опционально)</FormLabel>
                  <FormControl>
                    <Input placeholder="Например: UZ, NY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Тип */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип локации</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Вес */}
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Вес (для сортировки)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Описание */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание (опционально)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Введите описание"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Действия */}
            <div className="flex justify-end gap-2 pt-4">
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
                  : mode === "create"
                    ? "Создать"
                    : "Сохранить"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
