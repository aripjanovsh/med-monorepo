"use client";

import { useState, useEffect, useMemo } from "react";
import type { ReactElement } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Input } from "@/components/ui/input";
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
  useQuickCreateVisitMutation,
} from "@/features/reception";
import type { QuickCreateVisitFormData } from "@/features/reception";
import { useGetPatientsQuery } from "@/features/patients";
import { useGetEmployeesQuery } from "@/features/employees";
import { useGetServicesQuery } from "@/features/master-data/master-data-services.api";

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
  const [quickCreateVisit, { isLoading }] = useQuickCreateVisitMutation();
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");

  // Fetch data for selects
  const { data: patientsData } = useGetPatientsQuery({
    page: 1,
    limit: 50,
    search: patientSearch,
  });
  const { data: employeesData } = useGetEmployeesQuery({
    page: 1,
    limit: 100,
    status: "ACTIVE",
  });
  const { data: servicesData } = useGetServicesQuery({
    page: 1,
    limit: 100,
    isActive: true,
  });

  const patients = useMemo(() => patientsData?.data ?? [], [patientsData]);
  const employees = useMemo(() => employeesData?.data ?? [], [employeesData]);
  const services = useMemo(() => servicesData?.data ?? [], [servicesData]);

  const form = useForm<QuickCreateVisitFormData>({
    resolver: yupResolver(quickCreateVisitFormSchema),
    defaultValues: {
      patientId: "",
      employeeId: "",
      serviceId: "",
      type: "WITHOUT_QUEUE",
      roomNumber: "",
      notes: "",
      createInvoice: false,
    },
  });

  const onSubmit = async (data: QuickCreateVisitFormData) => {
    try {
      const result = await quickCreateVisit(data).unwrap();

      toast.success("Визит создан успешно!", {
        description: result.invoice
          ? `Счет ${result.invoice.invoiceNumber} создан автоматически`
          : "Пациент добавлен в очередь",
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
            {/* Patient Select with Search */}
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Пациент *</FormLabel>
                  <Popover open={patientSearchOpen} onOpenChange={setPatientSearchOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? patients.find((p) => p.id === field.value)?.firstName +
                              " " +
                              patients.find((p) => p.id === field.value)?.lastName
                            : "Выберите пациента"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Поиск пациента..."
                          value={patientSearch}
                          onValueChange={setPatientSearch}
                        />
                        <CommandEmpty>Пациент не найден.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {patients.map((patient) => (
                            <CommandItem
                              key={patient.id}
                              value={`${patient.firstName} ${patient.lastName} ${patient.middleName ?? ""}`}
                              onSelect={() => {
                                field.onChange(patient.id);
                                setPatientSearchOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  patient.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {patient.lastName} {patient.firstName}{" "}
                              {patient.middleName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Employee Select */}
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Врач *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите врача" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.title?.name || "Врач"} {employee.lastName}{" "}
                          {employee.firstName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Service Select */}
            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Услуга *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите услугу" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-64">
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                          {service.price && (
                            <span className="ml-2 text-muted-foreground">
                              ({service.price.toLocaleString()} сум)
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Appointment Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип записи *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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

            {/* Room Number */}
            <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Номер кабинета</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="101"
                      {...field}
                    />
                  </FormControl>
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

            {/* Create Invoice Checkbox */}
            <FormField
              control={form.control}
              name="createInvoice"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Создать счет автоматически
                    </FormLabel>
                    <FormDescription>
                      Счет будет создан сразу при создании визита
                    </FormDescription>
                  </div>
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
