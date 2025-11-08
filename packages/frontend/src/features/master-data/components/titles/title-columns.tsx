"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { Title } from "@/features/master-data/master-data.types";
import { formatDate } from "@/lib/date.utils";

export const titleColumns: ColumnDef<Title>[] = [
  {
    accessorKey: "name",
    header: "Название",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
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
          {isActive ? "Активная" : "Неактивная"}
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
