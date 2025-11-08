"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { Department } from "@/features/master-data/master-data.types";
import { getEmployeeFullName } from "@/features/employees";
import { formatDate } from "@/lib/date.utils";

export const departmentColumns: ColumnDef<Department>[] = [
  {
    accessorKey: "name",
    header: "Название",
    cell: ({ row }) => (
      <>
        <div className="font-medium">{row.getValue("name")}</div>
        <div className="text-xs text-muted-foreground">
          {row.getValue("code")}
        </div>
      </>
    ),
  },
  {
    accessorKey: "head",
    header: "Заведующий",
    cell: ({ row }) => {
      const head = row.original.head;
      if (!head) return <div className="text-muted-foreground">-</div>;

      return <div className="text-sm">{getEmployeeFullName(head)}</div>;
    },
  },
  {
    accessorKey: "description",
    header: "Описание",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return <div className="max-w-[300px] truncate">{description || "-"}</div>;
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
          {isActive ? "Активное" : "Неактивное"}
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
