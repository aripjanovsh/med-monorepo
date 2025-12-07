"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/date.utils";
import type { EmployeeLeaveDaysDto } from "../employee-leave-days.dto";

export const employeeLeaveDaysColumns: ColumnDef<EmployeeLeaveDaysDto>[] = [
  {
    accessorKey: "leaveType",
    header: "Тип",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.leaveType?.color && (
          <div
            className="size-3 rounded-full"
            style={{ backgroundColor: row.original.leaveType.color }}
          />
        )}
        <span className="font-medium">
          {row.original.leaveType?.name || "-"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "startsOn",
    header: "Начало",
    cell: ({ row }) => formatDate(row.original.startsOn, "dd.MM.yyyy"),
  },
  {
    accessorKey: "until",
    header: "Окончание",
    cell: ({ row }) => formatDate(row.original.until, "dd.MM.yyyy"),
  },
  {
    accessorKey: "note",
    header: "Примечание",
    cell: ({ row }) => (
      <span className="text-muted-foreground max-w-[200px] truncate block">
        {row.original.note || "-"}
      </span>
    ),
  },
];
