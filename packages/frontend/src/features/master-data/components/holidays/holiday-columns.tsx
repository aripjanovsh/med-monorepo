"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { Holiday } from "@/features/master-data/master-data.types";
import { formatDate } from "@/lib/date.utils";

export const holidayColumns: ColumnDef<Holiday>[] = [
  {
    accessorKey: "name",
    header: "Название",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "startsOn",
    header: "Начало",
    size: 120,
    cell: ({ row }) => {
      const date = row.getValue("startsOn") as string;
      return formatDate(date, "dd.MM.yyyy");
    },
  },
  {
    accessorKey: "until",
    header: "Окончание",
    size: 120,
    cell: ({ row }) => {
      const date = row.getValue("until") as string;
      return formatDate(date, "dd.MM.yyyy");
    },
  },
  {
    accessorKey: "note",
    header: "Примечание",
    cell: ({ row }) => {
      const note = row.getValue("note") as string;
      return <div className="max-w-[250px] truncate">{note || "-"}</div>;
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
];
