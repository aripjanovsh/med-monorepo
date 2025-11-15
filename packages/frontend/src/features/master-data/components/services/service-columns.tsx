"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { Service } from "@/features/master-data/master-data.types";
import { ServiceTypeEnumFrontend } from "@/features/master-data/master-data.types";
import { formatCurrency } from "@/lib/currency.utils";

export const SERVICE_TYPE_LABELS: Record<ServiceTypeEnumFrontend, string> = {
  [ServiceTypeEnumFrontend.CONSULTATION]: "Консультация",
  [ServiceTypeEnumFrontend.LAB]: "Лабораторные анализы",
  [ServiceTypeEnumFrontend.DIAGNOSTIC]: "Диагностика",
  [ServiceTypeEnumFrontend.PROCEDURE]: "Процедура",
  [ServiceTypeEnumFrontend.OTHER]: "Прочее",
};

export const serviceColumns: ColumnDef<Service>[] = [
  {
    accessorKey: "code",
    header: "Код",
    size: 100,
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue("code")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Название",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "type",
    header: "Тип",
    size: 180,
    cell: ({ row }) => {
      const type = row.getValue("type") as ServiceTypeEnumFrontend;
      return (
        <Badge variant="outline">{SERVICE_TYPE_LABELS[type] || type}</Badge>
      );
    },
  },
  {
    accessorKey: "department",
    header: "Отделение",
    cell: ({ row }) => {
      const department = row.original.department;
      return <div className="text-sm">{department?.name || "-"}</div>;
    },
  },
  {
    accessorKey: "price",
    header: "Цена",
    size: 140,
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return (
        <div className="text-sm">{price ? formatCurrency(price) : "-"}</div>
      );
    },
  },
  {
    accessorKey: "durationMin",
    header: "Длительность",
    size: 120,
    cell: ({ row }) => {
      const duration = row.getValue("durationMin") as number;
      return (
        <div className="text-sm">{duration ? `${duration} мин` : "-"}</div>
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
          {isActive ? "Активна" : "Неактивна"}
        </Badge>
      );
    },
  },
];
