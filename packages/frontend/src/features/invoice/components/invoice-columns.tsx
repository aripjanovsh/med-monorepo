"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Trash, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { InvoiceListItemDto } from "../invoice.dto";
import { PAYMENT_STATUS_MAP } from "../invoice.constants";
import { formatDate } from "@/lib/date.utils";
import Link from "next/link";
import { getInvoiceDetailRoute } from "@/constants/route.constants";

const STATUS_COLOR_MAP = {
  red: "destructive",
  orange: "default",
  green: "secondary",
  gray: "outline",
} as const;

export type InvoiceTableActions = {
  onDelete: (invoice: InvoiceListItemDto) => void;
  onAddPayment: (invoice: InvoiceListItemDto) => void;
};

export const createInvoiceColumns = (
  actions: InvoiceTableActions
): ColumnDef<InvoiceListItemDto>[] => [
  {
    accessorKey: "invoiceNumber",
    header: "Номер счета",
    cell: ({ row }) => {
      const invoice = row.original;

      return (
        <Link
          href={getInvoiceDetailRoute(invoice.id)}
          className="font-medium hover:underline"
        >
          {invoice.invoiceNumber}
        </Link>
      );
    },
  },
  {
    accessorKey: "patient",
    header: "Пациент",
    cell: ({ row }) => {
      const invoice = row.original;
      const patient = invoice.patient;

      return (
        <div className="font-medium">
          {patient.lastName} {patient.firstName}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Дата",
    cell: ({ row }) => {
      const invoice = row.original;
      return (
        <div className="text-sm">
          {formatDate(invoice.createdAt, "dd.MM.yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Сумма",
    cell: ({ row }) => {
      const invoice = row.original;
      return (
        <div className="text-right font-medium">
          {invoice.totalAmount.toLocaleString()} сум
        </div>
      );
    },
  },
  {
    accessorKey: "paidAmount",
    header: "Оплачено",
    cell: ({ row }) => {
      const invoice = row.original;
      return (
        <div className="text-right">
          {invoice.paidAmount.toLocaleString()} сум
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const invoice = row.original;
      const statusInfo = PAYMENT_STATUS_MAP[invoice.status];
      const remainingAmount = invoice.totalAmount - invoice.paidAmount;

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
              Осталось: {remainingAmount.toLocaleString()} сум
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invoice = row.original;
      const canAddPayment =
        invoice.status !== "PAID" && invoice.status !== "REFUNDED";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Открыть меню</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={getInvoiceDetailRoute(invoice.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Просмотр
              </Link>
            </DropdownMenuItem>
            {canAddPayment && (
              <DropdownMenuItem onClick={() => actions.onAddPayment(invoice)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Добавить платеж
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => actions.onDelete(invoice)}
              className="text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
