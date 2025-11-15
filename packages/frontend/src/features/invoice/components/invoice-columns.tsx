"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Stethoscope } from "lucide-react";
import type { InvoiceListItemDto } from "../invoice.dto";
import { formatDate } from "@/lib/date.utils";
import { getInvoiceRemainingAmount } from "../invoice.model";
import { getPatientFullName } from "@/features/patients";
import { formatCurrency } from "@/lib/currency.utils";
import { InvoiceStatusBadge } from "./invoice-status-badge";

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
      <div>
        <div className="font-medium">
          {getPatientFullName(row.original.patient)}
        </div>
        {row.original.visit ? (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Stethoscope className="h-3 w-3" />С визитом
          </div>
        ) : (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            Прямая продажа
          </div>
        )}
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
    meta: {
      className: "text-right",
      headerClassName: "text-right",
    },
  },
  {
    accessorKey: "paidAmount",
    header: "Оплачено",
    cell: ({ row }) => (
      <div className="text-right">
        {formatCurrency(row.original.paidAmount)}
      </div>
    ),
    meta: {
      className: "text-right",
      headerClassName: "text-right",
    },
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const invoice = row.original;
      const remainingAmount = getInvoiceRemainingAmount(invoice);

      return (
        <div>
          <InvoiceStatusBadge status={invoice.status} />
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
