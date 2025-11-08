"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { InvoiceListItemDto } from "../invoice.dto";
import { PAYMENT_STATUS_MAP } from "../invoice.constants";
import { formatDate } from "@/lib/date.utils";
import { getInvoiceRemainingAmount } from "../invoice.model";
import { getPatientFullName } from "@/features/patients";
import { formatCurrency } from "@/lib/currency.utils";

const STATUS_COLOR_MAP = {
  red: "destructive",
  orange: "default",
  green: "secondary",
  gray: "outline",
} as const;

export const invoiceColumns: ColumnDef<InvoiceListItemDto>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Номер счета",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.invoiceNumber}</div>
    ),
  },
  {
    accessorKey: "patient",
    header: "Пациент",
    cell: ({ row }) => (
      <div className="font-medium">
        {getPatientFullName(row.original.patient)}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Дата",
    cell: ({ row }) => (
      <div className="text-sm">
        {formatDate(row.original.createdAt, "dd.MM.yyyy")}
      </div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Сумма",
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.original.totalAmount)}
      </div>
    ),
  },
  {
    accessorKey: "paidAmount",
    header: "Оплачено",
    cell: ({ row }) => (
      <div className="text-right">
        {formatCurrency(row.original.paidAmount)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const invoice = row.original;
      const statusInfo = PAYMENT_STATUS_MAP[invoice.status];
      const remainingAmount = getInvoiceRemainingAmount(invoice);

      return (
        <div>
          <Badge
            variant={
              STATUS_COLOR_MAP[
                statusInfo.color as keyof typeof STATUS_COLOR_MAP
              ] || "secondary"
            }
          >
            {statusInfo.label}
          </Badge>
          {remainingAmount > 0 && invoice.status !== "PAID" && (
            <div className="mt-1 text-xs text-muted-foreground">
              Осталось: {formatCurrency(remainingAmount)}
            </div>
          )}
        </div>
      );
    },
  },
];
