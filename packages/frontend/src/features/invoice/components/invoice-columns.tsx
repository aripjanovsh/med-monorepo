"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Stethoscope } from "lucide-react";
import type { InvoiceListItemDto } from "../invoice.dto";
import { formatDate, formatFullDate } from "@/lib/date.utils";
import { getInvoiceRemainingAmount } from "../invoice.model";
import { getPatientFullName, getPatientShortName } from "@/features/patients";
import { formatCurrency } from "@/lib/currency.utils";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import Link from "next/link";
import { ROUTES, url } from "@/constants/route.constants";

export const invoiceColumns: ColumnDef<InvoiceListItemDto>[] = [
  {
    accessorKey: "createdAt",
    header: "ДАТА",
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-sm">
        {formatFullDate(row.original.createdAt)}
      </div>
    ),
  },
  {
    accessorKey: "invoiceNumber",
    header: "НОМЕР СЧЕТА",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.invoiceNumber}</div>
    ),
  },
  {
    accessorKey: "patient",
    header: "ПАЦИЕНТ",
    cell: ({ row }) => {
      const invoice = row.original;
      const patientName = getPatientShortName(invoice.patient);
      return (
        <div>
          <Link
            href={url(ROUTES.PATIENT_DETAIL, { id: invoice.patient?.id })}
            className="font-medium hover:underline"
          >
            {patientName}
          </Link>
          {invoice.patient?.patientId && (
            <div className="text-xs text-muted-foreground">
              {invoice.patient.patientId}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: "СУММА",
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
    header: "ОПЛАЧЕНО",
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
    header: "СТАТУС",
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
