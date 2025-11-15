import type { ColumnDef } from "@tanstack/react-table";
import type { InvoiceItemResponseDto } from "../invoice.dto";
import { formatCurrency } from "@/lib/currency.utils";

export const invoiceItemsColumns: ColumnDef<InvoiceItemResponseDto>[] = [
  {
    accessorKey: "service",
    header: "Услуга",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.service.name}</p>
        {row.original.description && (
          <p className="text-sm text-muted-foreground">
            {row.original.description}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Кол-во",
    cell: ({ row }) => (
      <div className="text-right">{row.original.quantity}</div>
    ),
    meta: {
      className: "text-right",
      headerClassName: "text-right",
    },
  },
  {
    accessorKey: "unitPrice",
    header: "Цена",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.original.unitPrice)}</div>
    ),
    meta: {
      className: "text-right",
      headerClassName: "text-right",
    },
  },
  {
    accessorKey: "discount",
    header: "Скидка",
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.discount > 0
          ? formatCurrency(row.original.discount)
          : "-"}
      </div>
    ),
    meta: {
      className: "text-right",
      headerClassName: "text-right",
    },
  },
  {
    accessorKey: "totalPrice",
    header: "Итого",
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.original.totalPrice)}
      </div>
    ),
    meta: {
      className: "text-right",
      headerClassName: "text-right",
    },
  },
];
