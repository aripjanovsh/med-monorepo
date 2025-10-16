"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmployeeResponseDto } from "../employee.dto";
import {
  WEEK_DAYS,
  WEEK_DAYS_SHORT,
} from "../employee.constants";
import { cn } from "@/lib/utils";

export const createEmployeeColumns = (
  onEditEmployee?: (employee: EmployeeResponseDto) => void,
  onViewEmployee?: (employee: EmployeeResponseDto) => void,
  onDeleteEmployee?: (employee: EmployeeResponseDto) => void
): ColumnDef<EmployeeResponseDto>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "ИМЯ",
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={employee?.avatar as any}
              alt={employee?.firstName}
            />
            <AvatarFallback>
              {employee?.firstName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <button
              className="font-medium text-left hover:text-blue-600 transition-colors"
              onClick={() => onViewEmployee?.(employee)}
            >
              {employee.firstName} {employee.lastName}
            </button>
            <div className="text-sm text-muted-foreground">
              {employee.title?.name}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "contact",
    header: "КОНТАКТЫ",
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div>
          <div className="font-medium">{employee.phone}</div>
          <div className="text-sm text-blue-600 hover:text-blue-800">
            <a href={`mailto:${employee.email}`}>{employee.email}</a>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "workingDays",
    header: "РАБОЧИЕ ДНИ",
    cell: ({ row }) => {
      const workingDays = row.original.workSchedule;
      return (
        <div className="flex space-x-1">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className={cn(
                "size-7 rounded-full flex items-center justify-center text-xs font-medium",
                workingDays?.[day]
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {WEEK_DAYS_SHORT?.[day]}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "assignedTreatment",
    header: "НАЗНАЧЕННЫЕ УСЛУГИ",
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="text-muted-foreground">
          {employee.serviceTypes?.map((st) => st.name).join(", ")}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const employee = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Действия</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(employee.id)}
            >
              Копировать ID сотрудника
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewEmployee?.(employee)}>
              Просмотр профиля
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditEmployee?.(employee)}>
              Редактировать сотрудника
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDeleteEmployee?.(employee)}
            >
              Удалить сотрудника
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Default columns without edit functionality for backwards compatibility
export const employeeColumns = createEmployeeColumns();
