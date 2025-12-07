"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date.utils";
import type { EmployeeAvailabilityDto } from "../employee-availability.dto";
import { WEEKDAYS_BY_INDEX } from "@/features/employees/employee.constants";

export const employeeAvailabilityColumns: ColumnDef<EmployeeAvailabilityDto>[] =
  [
    {
      accessorKey: "startTime",
      header: "Время",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.startTime} - {row.original.endTime}
        </span>
      ),
    },
    {
      accessorKey: "repeatOn",
      header: "Дни недели",
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.repeatOn.map((day) => (
            <Badge key={day} variant="secondary" className="text-xs">
              {WEEKDAYS_BY_INDEX[day]}
            </Badge>
          ))}
        </div>
      ),
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
      accessorKey: "isActive",
      header: "Статус",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Активно" : "Неактивно"}
        </Badge>
      ),
    },
  ];
