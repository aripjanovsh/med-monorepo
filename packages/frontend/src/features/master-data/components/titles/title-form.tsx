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
  useCreateTitleMutation,
  useUpdateTitleMutation,
} from "@/features/master-data/master-data-titles.api";
import { Title } from "@/features/master-data/master-data.types";
import { toast } from "sonner";

interface TitleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: Title | null;
  onSuccess?: () => void;
}

type TitleFormData = {
  name: string;
  description: string;
  isActive: boolean;
};

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Название должности обязательно")
    .min(2, "Название должности должно содержать минимум 2 символа")
    .max(100, "Название должности не должно превышать 100 символов"),
  description: yup
    .string()
    .default("")
    .max(500, "Описание не должно превышать 500 символов"),
  isActive: yup.boolean().default(true).required(),
});

export function TitleForm({
  open,
  onOpenChange,
  title,
  onSuccess,
}: TitleFormProps) {
  const [createTitle, { isLoading: isCreating }] = useCreateTitleMutation();
  const [updateTitle, { isLoading: isUpdating }] = useUpdateTitleMutation();

  const isEditing = !!title;
  const isLoading = isCreating || isUpdating;

  const form = useForm<TitleFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  // Reset form when dialog opens/closes or title changes
  useEffect(() => {
    if (open && title) {
      form.reset({
        name: title.name,
        description: title.description || "",
        isActive: title.isActive,
      });
    } else if (open && !title) {
      form.reset({
        name: "",
        description: "",
        isActive: true,
      });
    }
  }, [open, title, form]);

  const handleSubmit = async (data: TitleFormData) => {
    try {
      if (isEditing && title) {
        await updateTitle({
          id: title.id,
          data,
        }).unwrap();
        toast.success("Должность успешно обновлена");
      } else {
        await createTitle(data).unwrap();
        toast.success("Должность успешно создана");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const errorMessage = isEditing
        ? "Ошибка при обновлении должности"
        : "Ошибка при создании должности";
      toast.error(errorMessage);
      console.error("Error submitting title:", error);
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
            {isEditing ? "Редактировать должность" : "Создать новую должность"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Внесите изменения в информацию о должности"
              : "Заполните форму для создания новой должности"}
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
                  <FormLabel>Название должности *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите название должности"
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
                      placeholder="Введите описание должности"
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
                  <FormLabel className="!mt-0">Активная должность</FormLabel>
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
