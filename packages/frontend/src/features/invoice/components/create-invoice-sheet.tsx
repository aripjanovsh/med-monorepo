"use client";

import { useState, useMemo } from "react";
import type { ReactElement } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Trash2, ChevronsUpDown, Check } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  invoiceFormSchema,
  useCreateInvoiceMutation,
} from "@/features/invoice";
import type { InvoiceFormData } from "@/features/invoice";
import { useGetPatientsQuery } from "@/features/patients";
import { useGetServicesQuery } from "@/features/master-data/master-data-services.api";

type CreateInvoiceSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (invoiceId: string) => void;
};

export const CreateInvoiceSheet = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateInvoiceSheetProps): ReactElement => {
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");

  // Fetch data
  const { data: patientsData } = useGetPatientsQuery({
    page: 1,
    limit: 50,
    search: patientSearch,
  });
  const { data: servicesData } = useGetServicesQuery({
    page: 1,
    limit: 100,
    isActive: true,
  });

  const patients = useMemo(() => patientsData?.data ?? [], [patientsData]);
  const services = useMemo(() => servicesData?.data ?? [], [servicesData]);

  const form = useForm<InvoiceFormData>({
    resolver: yupResolver(invoiceFormSchema),
    defaultValues: {
      patientId: "",
      visitId: "",
      items: [{ serviceId: "", quantity: 1, discount: 0 }],
      notes: undefined,
      dueDate: undefined,
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const selectedPatientId = form.watch("patientId");
  const items = form.watch("items");

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId),
    [patients, selectedPatientId]
  );

  // Calculate total
  const total = useMemo(() => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => {
      const service = services.find((s) => s.id === item.serviceId);
      if (!service) return sum;
      const price = Number(item.unitPrice ?? service.price ?? 0);
      const quantity = Number(item.quantity ?? 1);
      const discount = Number(item.discount ?? 0);
      const itemTotal = price * quantity - discount;
      return sum + itemTotal;
    }, 0);
  }, [items, services]);

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      // Clean up empty optional fields
      const cleanData = {
        ...data,
        notes: data.notes || undefined,
        dueDate: data.dueDate || undefined,
      };

      const result = await createInvoice(cleanData).unwrap();

      toast.success("Счет создан успешно!", {
        description: `Номер счета: ${result.invoiceNumber}`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.(result.id);
    } catch (error: any) {
      console.error("Create invoice error:", error);
      toast.error("Ошибка при создании счета", {
        description: error?.data?.message || "Попробуйте еще раз",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Создать счет</SheetTitle>
          <SheetDescription>
            Выберите пациента и добавьте услуги для выставления счета
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Patient Select */}
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
                          {selectedPatient
                            ? `${selectedPatient.lastName} ${selectedPatient.firstName} ${selectedPatient.middleName ?? ""}`
                            : "Выберите пациента"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Поиск пациента..."
                          value={patientSearch}
                          onValueChange={setPatientSearch}
                        />
                        <CommandList>
                          <CommandEmpty>Пациент не найден</CommandEmpty>
                          <CommandGroup>
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
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Services */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Услуги</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ serviceId: "", quantity: 1, discount: 0, unitPrice: undefined })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить услугу
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.serviceId`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Услуга *</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                const selectedSvc = services.find(
                                  (s) => s.id === value
                                );
                                if (selectedSvc && !items[index]?.unitPrice) {
                                  form.setValue(
                                    `items.${index}.unitPrice`,
                                    selectedSvc.price
                                  );
                                }
                              }}
                              value={field.value}
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

                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="mt-8"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Количество *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Цена</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Авто"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value ? Number(e.target.value) : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.discount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Скидка</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            {/* Total */}
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Итого:</span>
              <span>{total.toLocaleString()} сум</span>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Примечания</FormLabel>
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
                Создать счет
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
