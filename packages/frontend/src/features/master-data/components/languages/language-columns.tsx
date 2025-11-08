"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { Language } from "@/features/master-data/master-data.types";
import { formatDate } from "@/lib/date.utils";

export const languageColumns: ColumnDef<Language>[] = [
  {
    accessorKey: "name",
    header: "Название",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "code",
    header: "Код",
    size: 100,
    cell: ({ row }) => {
      const code = row.getValue("code") as string;
      return (
        <div className="font-mono text-sm">
          {code ? (
            <Badge variant="outline">{code.toUpperCase()}</Badge>
          ) : (
            "-"
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "nativeName",
    header: "Родное название",
    cell: ({ row }) => {
      const nativeName = row.getValue("nativeName") as string;
      return <div className="max-w-[200px] truncate">{nativeName || "-"}</div>;
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
