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
    accessorKey: "daysCount",
    header: "Дни отсуствие",
    cell: ({ row }) => {
      if (!row.original.until) return 1;
      const start = new Date(row.original.startsOn);
      const end = new Date(row.original.until);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    },
  },
  {
    accessorKey: "startsOn",
    header: "Период",
    cell: ({ row }) => (
      <span>
        {formatDate(row.original.startsOn, "dd.MM.yyyy")}
        {row.original.until &&
          ` — ${formatDate(row.original.until, "dd.MM.yyyy")}`}
      </span>
    ),
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
