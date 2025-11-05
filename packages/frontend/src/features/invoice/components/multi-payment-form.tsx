"use client";

import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Banknote, CreditCard, Smartphone, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAddPaymentMutation } from "@/features/invoice";

type PaymentMethod = "CASH" | "CARD" | "ONLINE" | "TRANSFER";

type PaymentEntry = {
  method: PaymentMethod;
  amount: number;
};

type MultiPaymentFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  totalAmount: number;
  onSuccess: () => void;
  onCancel: () => void;
};

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
  open,
  onOpenChange,
  invoiceId,
  totalAmount,
  onSuccess,
  onCancel,
}: MultiPaymentFormProps) => {
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addPayment] = useAddPaymentMutation();

  const totalPaid = useMemo(() => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const remaining = useMemo(() => {
    return totalAmount - totalPaid;
  }, [totalAmount, totalPaid]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setPayments([]);
      setSelectedMethod(null);
      setAmount("");
    }
  }, [open]);

  const handleAddPayment = () => {
    if (!selectedMethod || !amount || Number(amount) <= 0) {
      toast.error("Выберите метод оплаты и введите сумму");
      return;
    }

    const paymentAmount = Number(amount);

    if (paymentAmount > remaining) {
      toast.error("Сумма превышает остаток к оплате");
      return;
    }

    setPayments([...payments, { method: selectedMethod, amount: paymentAmount }]);
    setAmount("");
    setSelectedMethod(null);
  };

  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleQuickFill = () => {
    if (selectedMethod && remaining > 0) {
      setAmount(remaining.toString());
    }
  };

  const handleSubmit = async () => {
    if (remaining > 0) {
      toast.error("Не вся сумма оплачена", {
        description: `Осталось оплатить: ${remaining.toLocaleString()} сум`,
      });
      return;
    }

    if (payments.length === 0) {
      toast.error("Добавьте хотя бы один платеж");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create payment records for each payment
      for (const payment of payments) {
        await addPayment({
          invoiceId,
          data: {
            amount: payment.amount,
            paymentMethod: payment.method,
          },
        }).unwrap();
      }

      toast.success("Все платежи успешно проведены!");
      setPayments([]);
      onSuccess();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error("Ошибка при проведении оплаты", {
        description: error?.data?.message || "Попробуйте еще раз",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    const config = PAYMENT_METHODS.find((m) => m.value === method);
    if (!config) return null;
    const Icon = config.icon;
    return <Icon className={`h-4 w-4 ${config.color}`} />;
  };

  const getMethodLabel = (method: PaymentMethod) => {
    return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Оплата счета</DialogTitle>
          <DialogDescription>
            Выберите способ(ы) оплаты и введите суммы
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Сумма счета:</span>
                  <span className="font-medium">
                    {totalAmount.toLocaleString()} сум
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Оплачено:</span>
                  <span className="font-medium text-green-600">
                    {totalPaid.toLocaleString()} сум
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Осталось:</span>
                  <span className={remaining > 0 ? "text-red-600" : "text-green-600"}>
                    {remaining.toLocaleString()} сум
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods Selection */}
          <div className="space-y-3">
            <Label>Добавить платеж</Label>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.value;
                return (
                  <Button
                    key={method.value}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setSelectedMethod(method.value)}
                  >
                    <Icon className={`mr-2 h-4 w-4 ${isSelected ? "" : method.color}`} />
                    {method.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          {selectedMethod && (
            <div className="space-y-3">
              <Label htmlFor="amount">Сумма</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddPayment();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleQuickFill}>
                  Весь остаток
                </Button>
                <Button type="button" onClick={handleAddPayment}>
                  Добавить
                </Button>
              </div>
            </div>
          )}

          {/* Payments List */}
          {payments.length > 0 && (
            <div className="space-y-2">
              <Label>Платежи:</Label>
              <div className="space-y-2">
                {payments.map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {getMethodIcon(payment.method)}
                      <span className="font-medium">
                        {getMethodLabel(payment.method)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">
                        {payment.amount.toLocaleString()} сум
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePayment(index)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Badge */}
          {remaining === 0 && payments.length > 0 && (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-green-500 bg-green-50 p-3 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Сумма полностью оплачена!</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || remaining > 0 || payments.length === 0}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Обработка..." : "Оплачено"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
