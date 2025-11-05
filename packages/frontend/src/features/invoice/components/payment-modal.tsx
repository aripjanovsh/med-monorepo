"use client";

import { useEffect, useState } from "react";
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
import { Loader2 } from "lucide-react";
import {
  type PaymentFormData,
  type InvoiceResponseDto,
  paymentFormSchema,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_METHOD,
  useAddPaymentMutation,
} from "@/features/invoice";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceResponseDto;
  onSuccess?: () => void;
}

export const PaymentModal = ({
  open,
  onOpenChange,
  invoice,
  onSuccess,
}: PaymentModalProps) => {
  const [addPayment, { isLoading }] = useAddPaymentMutation();
  const [change, setChange] = useState<number>(0);

  // Calculate remaining amount
  const remainingAmount = invoice.totalAmount - invoice.paidAmount;

  const form = useForm<PaymentFormData>({
    resolver: yupResolver(paymentFormSchema),
    defaultValues: {
      amount: remainingAmount,
      paymentMethod: PAYMENT_METHOD.CASH,
      transactionId: "",
      notes: "",
      receivedAmount: remainingAmount,
      change: 0,
    },
  });

  const watchAmount = form.watch("amount");
  const watchReceivedAmount = form.watch("receivedAmount");
  const watchPaymentMethod = form.watch("paymentMethod");

  // Calculate change for CASH payments
  useEffect(() => {
    if (watchPaymentMethod === PAYMENT_METHOD.CASH && watchReceivedAmount && watchAmount) {
      const calculatedChange = watchReceivedAmount - watchAmount;
      setChange(Math.max(0, calculatedChange));
      form.setValue("change", Math.max(0, calculatedChange));
    } else {
      setChange(0);
      form.setValue("change", 0);
    }
  }, [watchAmount, watchReceivedAmount, watchPaymentMethod, form]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      // Validate amount
      if (data.amount > remainingAmount) {
        toast.error("Сумма платежа превышает остаток по счету");
        return;
      }

      if (data.amount <= 0) {
        toast.error("Сумма должна быть больше нуля");
        return;
      }

      // Prepare request (exclude UI-only fields)
      const { receivedAmount, change: _, ...requestData } = data;

      await addPayment({
        invoiceId: invoice.id,
        data: requestData,
      }).unwrap();

      toast.success("Платеж принят успешно!", {
        description: `Сумма: ${data.amount.toLocaleString()} сум`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error("Ошибка при приеме платежа", {
        description: error?.data?.message || "Попробуйте еще раз",
      });
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset({
        amount: remainingAmount,
        paymentMethod: PAYMENT_METHOD.CASH,
        transactionId: "",
        notes: "",
        receivedAmount: remainingAmount,
        change: 0,
      });
      setChange(0);
    }
  }, [open, form, remainingAmount]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Принять оплату</DialogTitle>
          <DialogDescription>
            Счет {invoice.invoiceNumber} | Пациент: {invoice.patient.lastName}{" "}
            {invoice.patient.firstName}
          </DialogDescription>
        </DialogHeader>

        {/* Invoice Summary */}
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Сумма счета:</span>
            <span className="font-semibold">
              {invoice.totalAmount.toLocaleString()} сум
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Оплачено:</span>
            <span className="text-green-600 font-semibold">
              {invoice.paidAmount.toLocaleString()} сум
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium">Остаток:</span>
            <span className="font-bold text-lg">
              {remainingAmount.toLocaleString()} сум
            </span>
          </div>

          {/* Previous Payments */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="border-t pt-2 mt-2">
              <p className="text-sm text-muted-foreground mb-1">
                История платежей:
              </p>
              <div className="space-y-1">
                {invoice.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {PAYMENT_METHOD_OPTIONS.find(
                        (opt) => opt.value === payment.paymentMethod
                      )?.icon || ""}{" "}
                      {PAYMENT_METHOD_OPTIONS.find(
                        (opt) => opt.value === payment.paymentMethod
                      )?.label || payment.paymentMethod}
                    </span>
                    <span className="font-medium">
                      {payment.amount.toLocaleString()} сум
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payment Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Сумма платежа *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      max={remainingAmount}
                      min={0.01}
                      step="0.01"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Способ оплаты *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите способ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHOD_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span>{option.icon}</span>
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

            {/* Received Amount (for CASH only) */}
            {watchPaymentMethod === PAYMENT_METHOD.CASH && (
              <FormField
                control={form.control}
                name="receivedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Получено от клиента</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                        min={0}
                        step="0.01"
                      />
                    </FormControl>
                    <FormMessage />
                    {change > 0 && (
                      <p className="text-sm font-medium text-green-600">
                        Сдача: {change.toLocaleString()} сум
                      </p>
                    )}
                  </FormItem>
                )}
              />
            )}

            {/* Transaction ID (for CARD/ONLINE) */}
            {(watchPaymentMethod === PAYMENT_METHOD.CARD ||
              watchPaymentMethod === PAYMENT_METHOD.ONLINE) && (
              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID транзакции</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="TRX-123456"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                Принять платеж
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
