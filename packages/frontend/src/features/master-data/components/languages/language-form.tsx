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
  useCreateLanguageMutation,
  useUpdateLanguageMutation,
} from "@/features/master-data/master-data-languages.api";
import { Language } from "@/features/master-data/master-data.types";
import { toast } from "sonner";

interface LanguageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language?: Language | null;
  onSuccess?: () => void;
}

type LanguageFormData = {
  name: string;
  code: string;
  nativeName: string;
  description: string;
  isActive: boolean;
};

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Название языка обязательно")
    .min(2, "Название языка должно содержать минимум 2 символа")
    .max(100, "Название языка не должно превышать 100 символов"),
  code: yup
    .string()
    .default("")
    .max(10, "Код языка не должен превышать 10 символов"),
  nativeName: yup
    .string()
    .default("")
    .max(100, "Название на родном языке не должно превышать 100 символов"),
  description: yup
    .string()
    .default("")
    .max(500, "Описание не должно превышать 500 символов"),
  isActive: yup.boolean().default(true).required(),
});

export function LanguageForm({
  open,
  onOpenChange,
  language,
  onSuccess,
}: LanguageFormProps) {
  const [createLanguage, { isLoading: isCreating }] = useCreateLanguageMutation();
  const [updateLanguage, { isLoading: isUpdating }] = useUpdateLanguageMutation();

  const isEditing = !!language;
  const isLoading = isCreating || isUpdating;

  const form = useForm<LanguageFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      code: "",
      nativeName: "",
      description: "",
      isActive: true,
    },
  });

  // Reset form when dialog opens/closes or language changes
  useEffect(() => {
    if (open && language) {
      form.reset({
        name: language.name,
        code: language.code || "",
        nativeName: language.nativeName || "",
        description: language.description || "",
        isActive: language.isActive,
      });
    } else if (open && !language) {
      form.reset({
        name: "",
        code: "",
        nativeName: "",
        description: "",
        isActive: true,
      });
    }
  }, [open, language, form]);

  const handleSubmit = async (data: LanguageFormData) => {
    try {
      const submitData = {
        name: data.name,
        code: data.code || undefined,
        nativeName: data.nativeName || undefined,
        description: data.description || undefined,
      };

      if (isEditing && language) {
        await updateLanguage({
          id: language.id,
          data: submitData,
        }).unwrap();
        toast.success("Язык успешно обновлен");
      } else {
        await createLanguage(submitData).unwrap();
        toast.success("Язык успешно создан");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const errorMessage = isEditing
        ? "Ошибка при обновлении языка"
        : "Ошибка при создании языка";
      toast.error(errorMessage);
      console.error("Error submitting language:", error);
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
            {isEditing ? "Редактировать язык" : "Создать новый язык"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Внесите изменения в информацию о языке"
              : "Заполните форму для создания нового языка"}
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
                  <FormLabel>Название языка *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Например, Русский"
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
                  <FormLabel>Код языка (ISO)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Например, ru"
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
              name="nativeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название на родном языке</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Например, Русский"
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
                      placeholder="Введите описание языка"
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
                  <FormLabel className="!mt-0">Активный язык</FormLabel>
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
