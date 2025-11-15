"use client";

import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { handleFieldErrors } from "@/lib/api.utils";

import { visitFormSchema, type VisitFormData } from "../visit.schema";
import { useCreateVisitMutation, useUpdateVisitMutation } from "../visit.api";
import { PatientSelectField } from "@/features/patients/components/patient-select-field";
import { EmployeeSelectField } from "@/features/employees/components/employee-select-field";
import { DatePickerField } from "@/components/fields/date-picker-field";

type VisitFormProps = {
  mode: "create" | "edit";
  initialData?: VisitFormData & { id?: string };
  patientId?: string; // Предзаполненный patientId (для создания из карточки пациента)
  onSuccess?: () => void;
};

export const VisitForm = ({
  mode,
  initialData,
  patientId: prefilledPatientId,
  onSuccess,
}: VisitFormProps) => {
  const router = useRouter();
  const [createVisit, { isLoading: isCreating }] = useCreateVisitMutation();
  const [updateVisit, { isLoading: isUpdating }] = useUpdateVisitMutation();

  const form = useForm({
    schema: visitFormSchema,
    defaultValues: initialData || {
      patientId: prefilledPatientId || "",
      employeeId: "",
      visitDate: new Date().toISOString().split("T")[0], // yyyy-MM-dd format for DatePickerField
      notes: "",
    },
  });

  const onSubmit = async (data: VisitFormData) => {
    try {
      // DatePickerField returns date in "yyyy-MM-dd" format
      // Convert to full ISO 8601 format with current time
      let visitDate: string;
      if (data.visitDate) {
        // If date is in yyyy-MM-dd format, add time
        if (data.visitDate.length === 10) {
          // Add current time to the date
          const [year, month, day] = data.visitDate.split("-").map(Number);
          const now = new Date();
          const dateWithTime = new Date(
            year,
            month - 1,
            day,
            now.getHours(),
            now.getMinutes(),
          );
          visitDate = dateWithTime.toISOString();
        } else {
          // Try to parse as is
          visitDate = new Date(data.visitDate).toISOString();
        }
      } else {
        visitDate = new Date().toISOString();
      }

      const payload = {
        patientId: data.patientId,
        employeeId: data.employeeId,
        visitDate,
        notes: data.notes,
      };

      if (mode === "edit" && initialData?.id) {
        await updateVisit({
          id: initialData.id,
          ...payload,
        }).unwrap();
        toast.success("Визит обновлен");
      } else {
        const visit = await createVisit(payload).unwrap();
        toast.success("Визит создан");

        // Если создаем из карточки пациента, редиректим туда
        if (prefilledPatientId) {
          router.push(
            `/cabinet/patients/${prefilledPatientId}/visits/${visit.id}`,
          );
        } else {
          router.push(`/cabinet/visits/${visit.id}`);
        }
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!prefilledPatientId && (
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Пациент *</FormLabel>
                <FormControl>
                  <PatientSelectField {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Врач *</FormLabel>
              <FormControl>
                <EmployeeSelectField {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visitDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Дата визита</FormLabel>
              <FormControl>
                <DatePickerField {...field} />
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
                <Textarea
                  placeholder="Жалобы пациента, анамнез, рекомендации..."
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Сохранение..."
              : mode === "edit"
                ? "Обновить визит"
                : "Начать прием"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
