"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import type { DialogProps } from "@/lib/dialog-manager/dialog-manager";
import { useCreatePatientAllergyMutation } from "../patient-allergy.api";
import { toast } from "sonner";
import type { AllergySeverity } from "../patient-allergy.model";

type AddPatientAllergyFormData = {
  substance: string;
  reaction?: string;
  severity?: AllergySeverity;
  note?: string;
};

/**
 * Пропсы для AddPatientAllergyDialog (без базовых DialogProps)
 */
type AddPatientAllergyDialogOwnProps = {
  patientId: string;
  recordedById: string;
  visitId?: string;
};

/**
 * Полные пропсы с DialogProps
 */
type AddPatientAllergyDialogProps = AddPatientAllergyDialogOwnProps &
  DialogProps;

export const AddPatientAllergyDialog = ({
  patientId,
  recordedById,
  visitId,
  open,
  onOpenChange,
}: AddPatientAllergyDialogProps) => {
  const [createPatientAllergy, { isLoading }] =
    useCreatePatientAllergyMutation();

  const form = useForm<AddPatientAllergyFormData>({
    defaultValues: {
      substance: "",
      reaction: "",
      severity: undefined,
      note: "",
    },
  });

  const handleSubmit = async (data: AddPatientAllergyFormData) => {
    try {
      await createPatientAllergy({
        patientId,
        visitId,
        recordedById,
        ...data,
      }).unwrap();

      toast.success("Аллергия успешно добавлена");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Ошибка при добавлении аллергии");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить аллергию</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="substance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Аллерген *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Пенициллин, пыльца и т.д." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reaction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Реакция</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Сыпь, отек и т.д." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Степень тяжести</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите степень" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MILD">Легкая</SelectItem>
                      <SelectItem value="MODERATE">Средняя</SelectItem>
                      <SelectItem value="SEVERE">Тяжелая</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Примечание</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Дополнительная информация"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Добавление..." : "Добавить"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
