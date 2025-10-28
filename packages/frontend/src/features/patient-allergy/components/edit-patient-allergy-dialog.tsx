"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { useUpdatePatientAllergyMutation } from "../patient-allergy.api";
import { toast } from "sonner";
import type { AllergySeverity, PatientAllergy } from "../patient-allergy.model";

type EditPatientAllergyFormData = {
  substance: string;
  reaction?: string;
  severity?: AllergySeverity;
  note?: string;
};

type EditPatientAllergyDialogProps = {
  allergy: PatientAllergy;
};

export const EditPatientAllergyDialog = ({
  allergy,
}: EditPatientAllergyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [updatePatientAllergy, { isLoading }] = useUpdatePatientAllergyMutation();

  const form = useForm<EditPatientAllergyFormData>({
    defaultValues: {
      substance: allergy.substance,
      reaction: allergy.reaction || "",
      severity: allergy.severity,
      note: allergy.note || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        substance: allergy.substance,
        reaction: allergy.reaction || "",
        severity: allergy.severity,
        note: allergy.note || "",
      });
    }
  }, [open, allergy, form]);

  const handleSubmit = async (data: EditPatientAllergyFormData) => {
    try {
      await updatePatientAllergy({
        id: allergy.id,
        data,
      }).unwrap();

      toast.success("Аллергия обновлена");
      setOpen(false);
    } catch (error) {
      toast.error("Ошибка при обновлении аллергии");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать аллергию</DialogTitle>
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
                    value={field.value}
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
                    <Textarea {...field} placeholder="Дополнительная информация" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
