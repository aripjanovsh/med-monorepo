"use client";

import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import type { DialogProps } from "@/lib/dialog-manager/dialog-manager";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { StepperInput } from "@/components/ui/stepper-input";
import { Loader2, Plus, Trash2, CreditCard, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  invoiceFormSchema,
  useCreateInvoiceMutation,
} from "@/features/invoice";
import type { InvoiceFormData } from "@/features/invoice";
import { ServiceAutocompleteField } from "@/features/master-data/components";
import type { Service } from "@/features/master-data/master-data.types";
import { useGetVisitsQuery } from "@/features/visit";
import { MultiPaymentForm } from "./multi-payment-form";
import { PatientAutocompleteField } from "@/features/patients/components/patient-autocomplete-field";
import { useDialog } from "@/lib/dialog-manager";
import { formatDate } from "@/lib/date.utils";
import { getEmployeeFullName } from "@/features/employees/employee.model";
import { Select, SelectItem, SelectValue } from "@/components/ui/select";
import { SelectField } from "@/components/fields/select-field";
import { formatCurrency } from "@/lib/currency.utils";

type ServiceOrder = {
  id: string;
  service: {
    id: string;
    name: string;
    price: number;
  };
  paymentStatus: string;
  status: string;
};

type VisitData = {
  id: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
  };
  serviceOrders?: ServiceOrder[];
};

type CreateInvoiceWithPaymentSheetOwnProps = {
  visitData?: VisitData | null;
  onSuccess?: () => void;
};

type CreateInvoiceWithPaymentSheetProps =
  CreateInvoiceWithPaymentSheetOwnProps & DialogProps;

export const CreateInvoiceWithPaymentSheet = ({
  open,
  onOpenChange,
  visitData,
  onSuccess,
}: CreateInvoiceWithPaymentSheetProps): ReactElement => {
  const [createInvoice, { isLoading: isCreatingInvoice }] =
    useCreateInvoiceMutation();
  const paymentDialog = useDialog(MultiPaymentForm);
  const [selectedServices, setSelectedServices] = useState<
    Map<string, Service>
  >(new Map());
  const [isWithVisit, setIsWithVisit] = useState(Boolean(visitData));

  const form = useForm<InvoiceFormData>({
    resolver: yupResolver(invoiceFormSchema) as any,
    defaultValues: {
      patientId: "",
      visitId: "",
      items: [],
      notes: undefined,
      dueDate: undefined,
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = form.watch("items");
  const patientId = form.watch("patientId");
  const { data: patientVisits } = useGetVisitsQuery(
    patientId ? ({ patientId, limit: 100 } as any) : undefined,
    { skip: !patientId }
  );

  // Calculate total immediately without useMemo
  const total = items.reduce((sum, item) => {
    const service = selectedServices.get(item.serviceId);
    if (!service) return sum;
    const price = Number(item.unitPrice ?? service.price ?? 0);
    const quantity = Number(item.quantity ?? 1);
    const discount = Number(item.discount ?? 0);
    const itemTotal = price * quantity - discount;
    return sum + itemTotal;
  }, 0);

  // Update toggle when visitData changes
  useEffect(() => {
    if (visitData) {
      setIsWithVisit(true);
    }
  }, [visitData]);

  // Prefill form when visitData changes
  useEffect(() => {
    if (visitData && open && isWithVisit) {
      // Set patient and visit
      form.setValue("patientId", visitData.patient.id);
      form.setValue("visitId", visitData.id);

      // Set unpaid service orders
      if (visitData.serviceOrders && visitData.serviceOrders.length > 0) {
        const unpaidServices = visitData.serviceOrders
          .filter((so: ServiceOrder) => so.paymentStatus === "UNPAID")
          .map((so: ServiceOrder) => ({
            serviceId: so.service.id,
            serviceOrderId: so.id,
            quantity: 1,
            unitPrice: so.service.price,
            discount: 0,
          }));

        // Populate selectedServices map
        const servicesMap = new Map<string, Service>();
        visitData.serviceOrders
          .filter((so: ServiceOrder) => so.paymentStatus === "UNPAID")
          .forEach((so: ServiceOrder) => {
            servicesMap.set(so.service.id, so.service as unknown as Service);
          });
        setSelectedServices(servicesMap);

        form.setValue("items", unpaidServices);
      }
    }
  }, [visitData, open, form]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedServices(new Map());
      setIsWithVisit(Boolean(visitData));
    }
  }, [open, form, visitData]);

  // Clear visitId when switching to "without visit" mode
  useEffect(() => {
    if (!isWithVisit) {
      form.setValue("visitId", undefined);
    } else if (visitData) {
      form.setValue("visitId", visitData.id);
    }
  }, [isWithVisit, visitData, form]);

  const handleCreateInvoice = async (data: InvoiceFormData) => {
    try {
      // Clean up empty optional fields
      const cleanData = {
        ...data,
        visitId: isWithVisit ? data.visitId : undefined,
        notes: data.notes || undefined,
        dueDate: data.dueDate || undefined,
      };

      const result = await createInvoice(cleanData).unwrap();

      toast.success("Счет создан!", {
        description: `Номер: ${result.invoiceNumber}. Переход к оплате...`,
      });

      // Open payment dialog
      paymentDialog.open({
        invoiceId: result.id,
      });

      // Reset form and close invoice creation sheet
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Create invoice error:", error);
      toast.error("Ошибка при создании счета", {
        description: error?.data?.message || "Попробуйте еще раз",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full md:max-w-6xl">
        <SheetHeader>
          <SheetTitle>Создание счета</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateInvoice)}
            className="h-full flex flex-col"
          >
            <SheetBody>
              <div className="space-y-4">
                {/* Patient Selector - Always Required */}
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <PatientAutocompleteField
                        label="Пациент"
                        placeholder="Выберите пациента"
                        {...field}
                        onChange={(value: string | undefined) => {
                          field.onChange(value);
                          // Clear visit when patient changes
                          form.setValue("visitId", "");
                        }}
                      />
                    </FormItem>
                  )}
                />

                {/* Visit Selector - Only when patient is selected */}
                {patientId && !visitData && (
                  <FormField
                    control={form.control}
                    name="visitId"
                    render={({ field }) => (
                      <SelectField
                        label="Визит (опционально)"
                        placeholder="Выберите визит"
                        options={[
                          ...(patientVisits?.data?.map((visit) => ({
                            value: visit.id,
                            label: `${formatDate(visit.visitDate, "dd.MM.yyyy")} - ${getEmployeeFullName(visit.employee)}`,
                          })) || []),
                        ]}
                        {...field}
                      />
                    )}
                  />
                )}

                {/* Services Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">Услуги</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        append({
                          serviceId: "",
                          quantity: 1,
                          discount: 0,
                          unitPrice: undefined,
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Добавить
                    </Button>
                  </div>

                  {fields.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Нет услуг. Добавьте услуги для создания счета.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Услуга</TableHead>
                            <TableHead className="w-[120px] text-center">
                              Кол-во
                            </TableHead>
                            <TableHead className="w-[200px] text-right">
                              Цена
                            </TableHead>
                            <TableHead className="w-[200px] text-right">
                              Скидка
                            </TableHead>
                            <TableHead className="w-[150px] text-right">
                              Сумма
                            </TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fields.map((field, index) => {
                            const selectedService = selectedServices.get(
                              items[index]?.serviceId
                            );
                            const price = Number(
                              items[index]?.unitPrice ??
                                selectedService?.price ??
                                0
                            );
                            const quantity = Number(
                              items[index]?.quantity ?? 1
                            );
                            const discount = Number(
                              items[index]?.discount ?? 0
                            );
                            const itemTotal = price * quantity - discount;

                            return (
                              <TableRow key={field.id}>
                                <TableCell>
                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.serviceId`}
                                    render={({ field: formField }) => (
                                      <FormItem>
                                        <FormControl>
                                          <ServiceAutocompleteField
                                            value={formField.value}
                                            onChange={(value) => {
                                              formField.onChange(value);
                                            }}
                                            onServiceSelected={(service) => {
                                              setSelectedServices((prev) => {
                                                const newMap = new Map(prev);
                                                newMap.set(service.id, service);
                                                return newMap;
                                              });
                                              if (!items[index]?.unitPrice) {
                                                form.setValue(
                                                  `items.${index}.unitPrice`,
                                                  service.price
                                                );
                                              }
                                            }}
                                            placeholder="Выберите услугу"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </TableCell>
                                <TableCell>
                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.quantity`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <StepperInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            min={1}
                                            className="h-9"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </TableCell>
                                <TableCell className="w-[120px]">
                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.unitPrice`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <CurrencyInput
                                            value={field.value ?? null}
                                            onChange={field.onChange}
                                            placeholder={
                                              selectedService?.price?.toString() ??
                                              "0"
                                            }
                                            className="h-9"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </TableCell>
                                <TableCell>
                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.discount`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <CurrencyInput
                                            value={field.value}
                                            onChange={(value) =>
                                              field.onChange(value ?? 0)
                                            }
                                            placeholder="0"
                                            className="h-9"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(itemTotal)}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => remove(index)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            </SheetBody>

            <SheetFooter className="flex flex-row justify-between">
              {/* Total and Actions */}

              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="text-base font-medium text-muted-foreground">
                  Итого к оплате:
                </span>
                <span className="text-2xl font-bold text-primary">
                  {total.toLocaleString()} сум
                </span>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isCreatingInvoice}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingInvoice || fields.length === 0}
                  size="default"
                >
                  {isCreatingInvoice ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Создание...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Перейти к оплате
                    </>
                  )}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
