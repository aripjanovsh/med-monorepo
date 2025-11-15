"use client";

import { useCallback } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ProfileField } from "@/components/ui/profile-field";
import { DataTable } from "@/components/data-table";
import { Printer, Download, Trash2, CreditCard } from "lucide-react";
import type { InvoiceResponseDto } from "../invoice.dto";
import {
  getInvoiceRemainingAmount,
  canAddPayment,
  getInvoiceDisplayTitle,
} from "../invoice.model";
import { getPatientFullName } from "@/features/patients";
import { getEmployeeShortName } from "@/features/employees";
import { formatCurrency } from "@/lib/currency.utils";
import { formatDate } from "@/lib/date.utils";
import { toast } from "sonner";
import { ROUTES } from "@/constants/route.constants";
import { useDeleteInvoiceMutation } from "../invoice.api";
import { MultiPaymentForm } from "./multi-payment-form";
import { invoiceItemsColumns } from "./invoice-items-columns";
import { invoicePaymentsColumns } from "./invoice-payments-columns";
import { useConfirmDialog } from "@/components/dialogs";
import { useDialog } from "@/lib/dialog-manager";
import PageHeader from "@/components/layouts/page-header";
import { InvoiceStatusBadge } from "./invoice-status-badge";

type InvoiceOverviewProps = {
  invoice: InvoiceResponseDto;
};

export function InvoiceOverview({
  invoice,
}: InvoiceOverviewProps): ReactElement {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const paymentDialog = useDialog(MultiPaymentForm);
  const [deleteInvoice] = useDeleteInvoiceMutation();

  const remainingAmount = getInvoiceRemainingAmount(invoice);
  const canAddPaymentToInvoice = canAddPayment(invoice);

  const handleDelete = useCallback(() => {
    confirm({
      title: "Удалить счет?",
      description: `Это действие нельзя отменить. Счет ${invoice.invoiceNumber} будет удален навсегда.`,
      variant: "destructive",
      confirmText: "Удалить",
      onConfirm: async () => {
        try {
          await deleteInvoice(invoice.id).unwrap();
          toast.success("Счет удален");
          router.push(ROUTES.INVOICES);
        } catch (error: any) {
          toast.error("Ошибка при удалении счета", {
            description: error?.data?.message,
          });
        }
      },
    });
  }, [confirm, deleteInvoice, invoice.id, invoice.invoiceNumber, router]);

  const handleAddPayment = useCallback(() => {
    paymentDialog.open({
      invoiceId: invoice.id,
    });
  }, [paymentDialog, invoice.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={getInvoiceDisplayTitle(invoice)}
        titleSuffix={<InvoiceStatusBadge status={invoice.status} />}
        description={`Создан ${formatDate(invoice.createdAt, "dd.MM.yyyy HH:mm")}`}
        actions={
          <div className="flex items-center gap-2">
            {canAddPaymentToInvoice && (
              <Button onClick={handleAddPayment}>
                <CreditCard className="mr-2 h-4 w-4" />
                Добавить платеж
              </Button>
            )}
            <Button variant="outline" size="icon" title="Печать">
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" title="Скачать">
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Удалить"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient & Status */}
          <Card>
            <CardHeader>
              <CardTitle>Информация о счете</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <ProfileField
                  label="Пациент"
                  value={getPatientFullName(invoice.patient)}
                />
                <ProfileField
                  label="Создал"
                  value={getEmployeeShortName(invoice.createdBy)}
                />
                {invoice.visit && (
                  <ProfileField
                    label="Визит"
                    value={formatDate(invoice.visit.visitDate, "dd.MM.yyyy")}
                  />
                )}
              </div>

              {invoice.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Примечания
                    </p>
                    <p className="text-sm">{invoice.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Услуги</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={invoiceItemsColumns}
                data={invoice.items}
                isLoading={false}
                hidePagination
              />
            </CardContent>
          </Card>

          {/* Payments */}
          {invoice.payments && invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>История платежей</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={invoicePaymentsColumns}
                  data={invoice.payments}
                  isLoading={false}
                  hidePagination
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Итого</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Сумма счета</span>
                <span className="font-medium">
                  {formatCurrency(invoice.totalAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Оплачено</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(invoice.paidAmount)}
                </span>
              </div>
              {remainingAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">К оплате</span>
                  <span className="font-medium text-destructive">
                    {formatCurrency(remainingAmount)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Остаток</span>
                <span
                  className={
                    remainingAmount > 0 ? "text-destructive" : "text-green-600"
                  }
                >
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
