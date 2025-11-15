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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { handleFieldErrors } from "@/lib/api.utils";
import {
  prescriptionFormSchema,
  type PrescriptionFormData,
} from "../prescription.schema";
import {
  useCreatePrescriptionMutation,
  useUpdatePrescriptionMutation,
} from "../prescription.api";
import {
  PRESCRIPTION_FREQUENCY_OPTIONS,
  PRESCRIPTION_DURATION_OPTIONS,
} from "../prescription.constants";

type PrescriptionFormProps = {
  visitId: string;
  employeeId: string;
  initialData?: PrescriptionFormData & { id?: string };
  onSuccess?: () => void;
  onCancel?: () => void;
};

export const PrescriptionForm = ({
  visitId,
  employeeId,
  initialData,
  onSuccess,
  onCancel,
}: PrescriptionFormProps) => {
  const [createPrescription, { isLoading: isCreating }] =
    useCreatePrescriptionMutation();
  const [updatePrescription, { isLoading: isUpdating }] =
    useUpdatePrescriptionMutation();

  const form = useForm({
    schema: prescriptionFormSchema,
    defaultValues: initialData || {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      notes: "",
    },
  });

  const onSubmit = async (data: PrescriptionFormData) => {
    try {
      if (initialData?.id) {
        await updatePrescription({
          id: initialData.id,
          ...data,
          visitId,
          createdById: employeeId,
        }).unwrap();
        toast.success("Назначение обновлено");
      } else {
        await createPrescription({
          ...data,
          visitId,
          createdById: employeeId,
        }).unwrap();
        toast.success("Назначение добавлено");
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название препарата *</FormLabel>
              <FormControl>
                <Input placeholder="Аспирин" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dosage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Дозировка</FormLabel>
              <FormControl>
                <Input placeholder="500мг" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Частота приема</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите частоту" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PRESCRIPTION_FREQUENCY_OPTIONS.map((option) => (
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

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Длительность</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите длительность" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PRESCRIPTION_DURATION_OPTIONS.map((option) => (
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

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Примечания</FormLabel>
              <FormControl>
                <Textarea placeholder="Принимать после еды" {...field} />
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
