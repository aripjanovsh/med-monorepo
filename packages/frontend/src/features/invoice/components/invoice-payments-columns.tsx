import type { ColumnDef } from "@tanstack/react-table";
import type { PaymentResponseDto } from "../invoice.dto";
import { PAYMENT_METHOD_MAP } from "../invoice.constants";
import { getPaymentPaidByName } from "../invoice.model";
import { formatCurrency } from "@/lib/currency.utils";
import { formatDate } from "@/lib/date.utils";

export const invoicePaymentsColumns: ColumnDef<PaymentResponseDto>[] = [
  {
    accessorKey: "paidAt",
    header: "Дата",
    cell: ({ row }) => formatDate(row.original.paidAt, "dd.MM.yyyy HH:mm"),
  },
  {
    accessorKey: "paymentMethod",
    header: "Метод",
    cell: ({ row }) => {
      const methodInfo = PAYMENT_METHOD_MAP[row.original.paymentMethod];
      return (
        <span className="flex items-center gap-2">{methodInfo.label}</span>
      );
    },
  },
  {
    accessorKey: "paidBy",
    header: "Оплатил",
    cell: ({ row }) => getPaymentPaidByName(row.original),
  },
  {
    accessorKey: "amount",
    header: "Сумма",
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.original.amount)}
      </div>
    ),
    meta: {
      className: "text-right",
      headerClassName: "text-right",
    },
  },
];
