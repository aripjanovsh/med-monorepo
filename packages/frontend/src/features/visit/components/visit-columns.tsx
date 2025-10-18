"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { VisitResponseDto } from "../visit.dto";
import { getPatientFullName, getEmployeeFullName } from "../visit.model";
import { VisitStatusBadge } from "./visit-status-badge";

export const createVisitColumns = (
  onEdit?: (visit: VisitResponseDto) => void,
  onView?: (visit: VisitResponseDto) => void,
  onDelete?: (visit: VisitResponseDto) => void
): ColumnDef<VisitResponseDto>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Выбрать все"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Выбрать строку"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "visitDate",
    header: "ДАТА ВИЗИТА",
    cell: ({ row }) => {
      const date = new Date(row.original.visitDate);
      return (
        <div className="whitespace-nowrap">
          {format(date, "dd.MM.yyyy HH:mm", { locale: ru })}
        </div>
      );
    },
  },
  {
    accessorKey: "patient",
    header: "ПАЦИЕНТ",
    cell: ({ row }) => {
      const visit = row.original;
      const patientName = getPatientFullName(visit);
      return (
        <button
          className="font-medium text-left hover:text-blue-600 transition-colors"
          onClick={() => onView?.(visit)}
        >
          {patientName}
        </button>
      );
    },
  },
  {
    accessorKey: "employee",
    header: "ВРАЧ",
    cell: ({ row }) => {
      const employeeName = getEmployeeFullName(row.original);
      return <div className="text-sm">{employeeName}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "СТАТУС",
    cell: ({ row }) => <VisitStatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const visit = row.original;
      const isEditable = visit.status === "IN_PROGRESS";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Открыть меню</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView?.(visit)}>
              <Eye className="mr-2 h-4 w-4" />
              Просмотр
            </DropdownMenuItem>
            {isEditable && (
              <DropdownMenuItem onClick={() => onEdit?.(visit)}>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete?.(visit)}
              className="text-red-600"
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
