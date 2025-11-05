"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer, Download, Trash2, CreditCard } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { InvoiceResponseDto } from "../invoice.dto";
import { PAYMENT_STATUS_MAP, PAYMENT_METHOD_MAP } from "../invoice.constants";
import {
  getInvoicePatientFullName,
  getEmployeeShortName,
  getPaymentPaidByName,
  getInvoiceRemainingAmount,
  canAddPayment,
  formatAmountWithCurrency,
  getInvoiceDisplayTitle,
} from "../invoice.model";
import { formatDate } from "@/lib/date.utils";
import { toast } from "sonner";
import { ROUTES } from "@/constants/route.constants";
import { useDeleteInvoiceMutation } from "../invoice.api";
import { PaymentModal } from "./payment-modal";
import PageHeader from "@/components/layouts/page-header";

const STATUS_COLOR_MAP = {
  red: "destructive",
  orange: "default",
  green: "secondary",
  gray: "outline",
} as const;

type InvoiceOverviewProps = {
  invoice: InvoiceResponseDto;
};

export function InvoiceOverview({
  invoice,
}: InvoiceOverviewProps): ReactElement {
  const router = useRouter();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();

  const handleDelete = async () => {
    try {
      await deleteInvoice(invoice.id).unwrap();
      toast.success("Счет удален");
      router.push(ROUTES.INVOICES);
    } catch (error: any) {
      toast.error("Ошибка при удалении счета", {
        description: error?.data?.message,
      });
    }
  };

  const statusInfo = PAYMENT_STATUS_MAP[invoice.status];
  const remainingAmount = getInvoiceRemainingAmount(invoice);
  const canAddPaymentToInvoice = canAddPayment(invoice);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={getInvoiceDisplayTitle(invoice)}
        description={`Создан ${formatDate(invoice.createdAt, "dd.MM.yyyy HH:mm")}`}
        actions={
          <div className="flex items-center gap-2">
            {canAddPaymentToInvoice && (
              <Button onClick={() => setShowPaymentModal(true)}>
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
              onClick={() => setShowDeleteDialog(true)}
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
                <div>
                  <p className="text-sm text-muted-foreground">Пациент</p>
                  <p className="font-medium">
                    {getInvoicePatientFullName(invoice.patient)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Статус</p>
                  <Badge
                    variant={
                      STATUS_COLOR_MAP[
                        statusInfo.color as keyof typeof STATUS_COLOR_MAP
                      ] || "secondary"
                    }
                  >
                    {statusInfo.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Создал</p>
                  <p className="font-medium">
                    {getEmployeeShortName(invoice.createdBy)}
                  </p>
                </div>
                {invoice.visit && (
                  <div>
                    <p className="text-sm text-muted-foreground">Визит</p>
                    <p className="font-medium">
                      {formatDate(invoice.visit.visitDate, "dd.MM.yyyy")}
                    </p>
                  </div>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Услуга</TableHead>
                    <TableHead className="text-right">Кол-во</TableHead>
                    <TableHead className="text-right">Цена</TableHead>
                    <TableHead className="text-right">Скидка</TableHead>
                    <TableHead className="text-right">Итого</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.service.name}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatAmountWithCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.discount > 0
                          ? formatAmountWithCurrency(item.discount)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatAmountWithCurrency(item.totalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payments */}
          {invoice.payments && invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>История платежей</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Метод</TableHead>
                      <TableHead>Оплатил</TableHead>
                      <TableHead className="text-right">Сумма</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.payments.map((payment) => {
                      const methodInfo =
                        PAYMENT_METHOD_MAP[payment.paymentMethod];
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {formatDate(payment.paidAt, "dd.MM.yyyy HH:mm")}
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-2">
                              {methodInfo.icon} {methodInfo.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getPaymentPaidByName(payment)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatAmountWithCurrency(payment.amount)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
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
                  {formatAmountWithCurrency(invoice.totalAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Оплачено</span>
                <span className="font-medium text-green-600">
                  {formatAmountWithCurrency(invoice.paidAmount)}
                </span>
              </div>
              {remainingAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">К оплате</span>
                  <span className="font-medium text-destructive">
                    {formatAmountWithCurrency(remainingAmount)}
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
                  {formatAmountWithCurrency(remainingAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        invoice={invoice}
        onSuccess={() => {
          toast.success("Платеж добавлен успешно");
          setShowPaymentModal(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить счет?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Счет {invoice.invoiceNumber} будет
              удален навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
