"use client";

import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
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
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import {
  quickCreateVisitFormSchema,
  APPOINTMENT_TYPE_OPTIONS,
  useCreateVisitMutation,
} from "@/features/reception";
import type { QuickCreateVisitFormData } from "@/features/reception";
import { PatientAutocompleteField } from "@/features/patients/components/patient-autocomplete-field";
import { EmployeeAutocompleteField } from "@/features/employees/components/employee-autocomplete-field";
import { ServiceAutocompleteField } from "@/features/master-data/components/service-autocomplete-field";

type QuickCreateVisitModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export const QuickCreateVisitModal = ({
  open,
  onOpenChange,
  onSuccess,
}: QuickCreateVisitModalProps) => {
  const [createVisit, { isLoading }] = useCreateVisitMutation();

  const form = useForm<QuickCreateVisitFormData>({
    resolver: yupResolver(quickCreateVisitFormSchema) as any,
    defaultValues: {
      patientId: "",
      employeeId: "",
      serviceId: "",
      type: "STANDARD",
      notes: undefined,
    },
  });

  const onSubmit = async (data: QuickCreateVisitFormData) => {
    try {
      await createVisit(data).unwrap();

      toast.success("Визит создан успешно!", {
        description: "Пациент добавлен в очередь",
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Create visit error:", error);
      toast.error("Ошибка при создании визита", {
        description: error?.data?.message || "Попробуйте еще раз",
      });
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Быстрое создание визита</DialogTitle>
          <DialogDescription>
            Создать визит для пациента без предварительной записи (walk-in)
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Patient Select with Autocomplete */}
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <PatientAutocompleteField
                  value={field.value}
                  onChange={field.onChange}
                  label="Пациент *"
                  required
                />
              )}
            />

            {/* Employee Select with Autocomplete */}
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <EmployeeAutocompleteField
                  value={field.value}
                  onChange={field.onChange}
                  label="Врач *"
                  required
                  status="ACTIVE"
                />
              )}
            />

            {/* Service Select with Autocomplete */}
            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <ServiceAutocompleteField
                  value={field.value}
                  onChange={field.onChange}
                  label="Услуга *"
                  required
                  isActive={true}
                />
              )}
            />

            {/* Appointment Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип записи*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {APPOINTMENT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full bg-${option.color}-500`}
                            />
                            <span>{option.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Примечание</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Дополнительная информация..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
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
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Создать визит
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
