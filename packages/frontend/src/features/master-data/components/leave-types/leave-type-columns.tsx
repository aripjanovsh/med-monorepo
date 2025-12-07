"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { LeaveType } from "@/features/master-data/master-data.types";
import { formatDate } from "@/lib/date.utils";

export const leaveTypeColumns: ColumnDef<LeaveType>[] = [
  {
    accessorKey: "name",
    header: "Название",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.color && (
          <div
            className="size-3 rounded-full"
            style={{ backgroundColor: row.original.color }}
          />
        )}
        <span className="font-medium">{row.getValue("name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "code",
    header: "Код",
    size: 120,
    cell: ({ row }) => {
      const code = row.getValue("code") as string;
      return code ? (
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{code}</code>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "isPaid",
    header: "Оплачиваемый",
    size: 140,
    cell: ({ row }) => {
      const isPaid = row.getValue("isPaid") as boolean;
      return (
        <Badge variant={isPaid ? "default" : "secondary"}>
          {isPaid ? "Да" : "Нет"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Статус",
    size: 140,
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Активный" : "Неактивный"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Дата создания",
    size: 140,
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return formatDate(date, "dd.MM.yyyy");
    },
  },
];
