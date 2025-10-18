"use client";

import { useForm } from "@/hooks/use-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { handleFieldErrors } from "@/lib/api.utils";
import { labOrderFormSchema, type LabOrderFormData } from "../lab-order.schema";
import { useCreateLabOrderMutation, useUpdateLabOrderMutation } from "../lab-order.api";

type LabOrderFormProps = {
  visitId: string;
  employeeId: string;
  initialData?: LabOrderFormData & { id?: string };
  onSuccess?: () => void;
  onCancel?: () => void;
};

export const LabOrderForm = ({
  visitId,
  employeeId,
  initialData,
  onSuccess,
  onCancel,
}: LabOrderFormProps) => {
  const [createLabOrder, { isLoading: isCreating }] =
    useCreateLabOrderMutation();
  const [updateLabOrder, { isLoading: isUpdating }] =
    useUpdateLabOrderMutation();

  const form = useForm({
    schema: labOrderFormSchema,
    defaultValues: initialData || {
      testName: "",
      notes: "",
    },
  });

  const onSubmit = async (data: LabOrderFormData) => {
    try {
      if (initialData?.id) {
        await updateLabOrder({
          id: initialData.id,
          ...data,
          visitId,
          createdById: employeeId,
        }).unwrap();
        toast.success("Направление обновлено");
      } else {
        await createLabOrder({
          ...data,
          visitId,
          createdById: employeeId,
        }).unwrap();
        toast.success("Направление добавлено");
      }
      onSuccess?.();
    } catch (error: any) {
      handleFieldErrors(error, form.setError);
      toast.error(error?.data?.message || "Ошибка при сохранении");
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="testName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название анализа *</FormLabel>
              <FormControl>
                <Input placeholder="Общий анализ крови" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Примечания</FormLabel>
              <FormControl>
                <Textarea placeholder="Дополнительные указания" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
