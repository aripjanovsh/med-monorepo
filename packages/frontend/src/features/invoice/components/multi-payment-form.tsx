"use client";

import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import type { DialogProps } from "@/lib/dialog-manager/dialog-manager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Banknote,
  CreditCard,
  Smartphone,
  Building2,
  Zap,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAddPaymentMutation, useGetInvoiceQuery } from "@/features/invoice";
import { formatCurrency } from "@/lib/currency.utils";

type PaymentMethod = "CASH" | "CARD" | "ONLINE" | "TRANSFER";

type MultiPaymentFormOwnProps = {
  invoiceId: string;
};

type MultiPaymentFormProps = MultiPaymentFormOwnProps & DialogProps;

const PAYMENT_METHODS = [
  {
    value: "CASH" as PaymentMethod,
    label: "Наличные",
    icon: Banknote,
    color: "text-green-600",
  },
  {
    value: "CARD" as PaymentMethod,
    label: "Карта",
    icon: CreditCard,
    color: "text-blue-600",
  },
  {
    value: "ONLINE" as PaymentMethod,
    label: "Онлайн",
    icon: Smartphone,
    color: "text-purple-600",
  },
  {
    value: "TRANSFER" as PaymentMethod,
    label: "Перевод",
    icon: Building2,
    color: "text-orange-600",
  },
] as const;

export const MultiPaymentForm = ({
  invoiceId,
  open,
  onOpenChange,
}: MultiPaymentFormProps): ReactElement => {
  const { data: invoice, isLoading: isLoadingInvoice } =
    useGetInvoiceQuery(invoiceId);
  const [payments, setPayments] = useState<Map<PaymentMethod, number>>(
    new Map(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addPayment] = useAddPaymentMutation();

  const totalAmount = invoice?.totalAmount ?? 0;
  const paidAmount = invoice?.paidAmount ?? 0;
  const totalPaid = Array.from(payments.values()).reduce(
    (sum, amount) => sum + amount,
    0,
  );
  const remaining = totalAmount - paidAmount - totalPaid;

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setPayments(new Map());
    }
  }, [open]);

  const handleAddPaymentMethod = (method: PaymentMethod) => {
    const newPayments = new Map(payments);
    newPayments.set(method, 0);
    setPayments(newPayments);
  };

  const handleRemovePaymentMethod = (method: PaymentMethod) => {
    const newPayments = new Map(payments);
    newPayments.delete(method);
    setPayments(newPayments);
  };

  const handlePaymentChange = (
    method: PaymentMethod,
    amount: number | null,
  ) => {
    const newPayments = new Map(payments);

    if (amount === null || amount === 0) {
      newPayments.set(method, 0);
    } else {
      newPayments.set(method, amount);
    }
    setPayments(newPayments);
  };

  const handleQuickFill = (method: PaymentMethod, percentage: number) => {
    // Calculate remaining for this specific method
    // Add back current amount to get true remaining
    const currentMethodAmount = payments.get(method) ?? 0;
    const remainingForMethod = remaining + currentMethodAmount;

    const amount = Math.round((remainingForMethod * percentage) / 100);
    if (amount > 0) {
      handlePaymentChange(method, amount);
    }
  };

  const getAvailableMethods = () => {
    return PAYMENT_METHODS.filter((method) => !payments.has(method.value));
  };

  const getActiveMethods = () => {
    return PAYMENT_METHODS.filter((method) => payments.has(method.value));
  };

  const handleSubmit = async () => {
    const activePayments = Array.from(payments.entries()).filter(
      ([_, amount]) => amount > 0,
    );

    if (activePayments.length === 0) {
      toast.error("Добавьте хотя бы один платеж");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create payment records for each payment with amount > 0
      for (const [method, amount] of activePayments) {
        await addPayment({
          invoiceId,
          data: {
            amount,
            paymentMethod: method,
          },
        }).unwrap();
      }

      const message =
        remaining > 0
          ? `Оплачено ${formatCurrency(totalPaid)}. Остаток: ${formatCurrency(remaining)}`
          : "Счет полностью оплачен!";

      toast.success(message);
      setPayments(new Map());
      onOpenChange(false);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error("Ошибка при проведении оплаты", {
        description: error?.data?.message || "Попробуйте еще раз",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Оплата счета</DialogTitle>
          <DialogDescription>
            {invoice ? `Счет ${invoice.invoiceNumber}` : "Загрузка..."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isLoadingInvoice ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Summary */}
              <Card>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Сумма счета:
                      </span>
                      <span className="font-medium">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Уже оплачено:
                      </span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(paidAmount)}
                      </span>
                    </div>
                    {payments.size > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Добавлено платежей:
                        </span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(totalPaid)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Осталось оплатить:</span>
                      <span
                        className={
                          remaining > 0 ? "text-red-600" : "text-green-600"
                        }
                      >
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method Selection Buttons */}
              <div className="space-y-3">
                <Label>Выберите тип оплаты</Label>
                <div className="flex flex-wrap gap-2">
                  {getAvailableMethods().map((method) => {
                    const Icon = method.icon;
                    return (
                      <Button
                        key={method.value}
                        type="button"
                        variant="outline"
                        size="lg"
                        className="gap-2 rounded-full"
                        onClick={() => handleAddPaymentMethod(method.value)}
                        disabled={remaining === 0}
                      >
                        <Plus className="h-4 w-4" />
                        {method.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Active Payment Methods */}
              {getActiveMethods().length > 0 && (
                <div className="space-y-3">
                  <Label>Платежи</Label>
                  <div className="space-y-3">
                    {getActiveMethods().map((method) => {
                      const currentAmount = payments.get(method.value) ?? 0;
                      const maxAllowed = remaining + currentAmount;

                      return (
                        <div
                          key={method.value}
                          className="space-y-2 rounded-lg border border-border p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold font-gilroy">
                                {method.label}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-6"
                              onClick={() =>
                                handleRemovePaymentMethod(method.value)
                              }
                            >
                              <X />
                            </Button>
                          </div>

                          <div className="flex gap-2">
                            <div className="flex-1">
                              <CurrencyInput
                                value={currentAmount || null}
                                onChange={(amount) =>
                                  handlePaymentChange(method.value, amount)
                                }
                                placeholder="Введите сумму"
                                max={maxAllowed}
                                autoFocus
                              />
                            </div>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                className="px-2"
                                onClick={() =>
                                  handleQuickFill(method.value, 25)
                                }
                                disabled={remaining === 0}
                                title="25% остатка"
                              >
                                25%
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="px-2"
                                onClick={() =>
                                  handleQuickFill(method.value, 50)
                                }
                                disabled={remaining === 0}
                                title="50% остатка"
                              >
                                50%
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="px-2"
                                onClick={() =>
                                  handleQuickFill(method.value, 100)
                                }
                                disabled={remaining === 0}
                                title="Весь остаток"
                              >
                                <Zap />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || isLoadingInvoice}
          >
            Отмена
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              isLoadingInvoice ||
              !Array.from(payments.values()).some((amount) => amount > 0)
            }
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Обработка..." : "Оплатить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
