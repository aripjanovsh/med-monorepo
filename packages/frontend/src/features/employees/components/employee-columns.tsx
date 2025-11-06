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
import { WEEK_DAYS, WEEK_DAYS_SHORT } from "../employee.constants";
import { cn } from "@/lib/utils";

export const employeeColumns: ColumnDef<EmployeeResponseDto>[] = [
  {
    accessorKey: "firstName",
    header: "ИМЯ",
    enableSorting: true,
    enableHiding: false,
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
            <div className="font-medium">
              {employee.firstName} {employee.lastName}
            </div>
            <div className="text-sm text-muted-foreground">
              {employee.title?.name}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "КОНТАКТЫ",
    enableSorting: false,
    enableHiding: false,
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
    accessorKey: "workSchedule",
    header: "РАБОЧИЕ ДНИ",
    enableSorting: false,
    enableHiding: false,
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
];
