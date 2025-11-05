"use client";

import { useState, useMemo, useEffect } from "react";
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
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, CreditCard } from "lucide-react";
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
import { MultiPaymentForm } from "./multi-payment-form";

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
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedServices, setSelectedServices] = useState<
    Map<string, Service>
  >(new Map());

  const form = useForm<InvoiceFormData>({
    resolver: yupResolver(invoiceFormSchema),
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

  // Calculate total
  const total = useMemo(() => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => {
      const service = selectedServices.get(item.serviceId);
      if (!service) return sum;
      const price = Number(item.unitPrice ?? service.price ?? 0);
      const quantity = Number(item.quantity ?? 1);
      const discount = Number(item.discount ?? 0);
      const itemTotal = price * quantity - discount;
      return sum + itemTotal;
    }, 0);
  }, [items, selectedServices]);

  // Prefill form when visitData changes
  useEffect(() => {
    if (visitData && open) {
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
      setShowPaymentForm(false);
      setCreatedInvoiceId(null);
      setSelectedServices(new Map());
    }
  }, [open, form]);

  const handleCreateInvoice = async (data: InvoiceFormData) => {
    try {
      // Clean up empty optional fields
      const cleanData = {
        ...data,
        notes: data.notes || undefined,
        dueDate: data.dueDate || undefined,
      };

      const result = await createInvoice(cleanData).unwrap();

      setCreatedInvoiceId(result.id);
      setTotalAmount(total);
      setShowPaymentForm(true);

      toast.success("Счет создан!", {
        description: `Номер: ${result.invoiceNumber}. Переход к оплате...`,
      });
    } catch (error: any) {
      console.error("Create invoice error:", error);
      toast.error("Ошибка при создании счета", {
        description: error?.data?.message || "Попробуйте еще раз",
      });
    }
  };

  const handlePaymentSuccess = () => {
    toast.success("Оплата успешно проведена!");
    form.reset();
    setShowPaymentForm(false);
    setCreatedInvoiceId(null);
    setTotalAmount(0);
    onOpenChange(false);
    onSuccess?.();
  };

  const formatPatientName = (patient: VisitData["patient"]) => {
    return [patient.lastName, patient.firstName, patient.middleName]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <>
      <Sheet open={open && !showPaymentForm} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto w-full md:max-w-6xl">
          <SheetHeader>
            <SheetTitle>Создать счет и оплатить</SheetTitle>
            <SheetDescription>
              {visitData
                ? `Пациент: ${formatPatientName(visitData.patient)}`
                : "Добавьте услуги для выставления счета"}
            </SheetDescription>
          </SheetHeader>

          <SheetBody>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleCreateInvoice)}
                className="mt-4 space-y-4"
              >
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
                            <TableHead className="min-w-[200px]">
                              Услуга
                            </TableHead>
                            <TableHead className="w-20 text-center">
                              Кол-во
                            </TableHead>
                            <TableHead className="w-28 text-right">
                              Цена
                            </TableHead>
                            <TableHead className="w-28 text-right">
                              Скидка
                            </TableHead>
                            <TableHead className="w-32 text-right">
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
                                <TableCell className="py-2">
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
                                <TableCell className="py-2">
                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.quantity`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="1"
                                            className="h-9 text-center"
                                            {...field}
                                            onChange={(e) =>
                                              field.onChange(
                                                Number(e.target.value)
                                              )
                                            }
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </TableCell>
                                <TableCell className="py-2">
                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.unitPrice`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0"
                                            className="h-9 text-right"
                                            placeholder={
                                              selectedService?.price?.toString() ??
                                              "0"
                                            }
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                              field.onChange(
                                                e.target.value
                                                  ? Number(e.target.value)
                                                  : undefined
                                              )
                                            }
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </TableCell>
                                <TableCell className="py-2">
                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.discount`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0"
                                            className="h-9 text-right"
                                            {...field}
                                            onChange={(e) =>
                                              field.onChange(
                                                Number(e.target.value)
                                              )
                                            }
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </TableCell>
                                <TableCell className="py-2 text-right font-medium">
                                  {itemTotal.toLocaleString()} сум
                                </TableCell>
                                <TableCell className="py-2">
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

                {/* Total and Actions */}
                <div className="sticky bottom-0 -mx-6 -mb-6 border-t bg-background px-6 py-4">
                  <div className="mb-4 flex items-center justify-between">
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
                </div>
              </form>
            </Form>
          </SheetBody>
        </SheetContent>
      </Sheet>

      {/* Payment Form Modal */}
      {createdInvoiceId && (
        <MultiPaymentForm
          open={showPaymentForm}
          onOpenChange={setShowPaymentForm}
          invoiceId={createdInvoiceId}
          totalAmount={totalAmount}
          onSuccess={handlePaymentSuccess}
          onCancel={() => {
            setShowPaymentForm(false);
            onOpenChange(false);
          }}
        />
      )}
    </>
  );
};
