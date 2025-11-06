"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmployeeResponseDto } from "../employee.dto";
import { WEEK_DAYS, WEEK_DAYS_SHORT } from "../employee.constants";
import {
  getEmployeeAvatarUrl,
  getEmployeeFullName,
  getEmployeeInitials,
  getEmployeePhone,
  getEmployeeTitle,
} from "../employee.model";
import { cn } from "@/lib/utils";

export const employeeColumns: ColumnDef<EmployeeResponseDto>[] = [
  {
    accessorKey: "firstName",
    header: "ИМЯ",
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => {
      const employee = row.original;
      const avatarUrl = getEmployeeAvatarUrl(employee);
      const fullName = getEmployeeFullName(employee);
      const initials = getEmployeeInitials(employee);
      const title = getEmployeeTitle(employee);

      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{fullName}</div>
            <div className="text-sm text-muted-foreground">{title}</div>
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
      const phone = getEmployeePhone(employee);
      const email = employee.email;

      return (
        <div>
          <div className="font-medium">{phone}</div>
          {email && (
            <div className="text-sm text-blue-600 hover:text-blue-800">
              <a href={`mailto:${email}`}>{email}</a>
            </div>
          )}
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

// Колонки для врачей пациента (используются в PatientDoctors компоненте)
export const patientDoctorColumns: ColumnDef<EmployeeResponseDto>[] = [
  {
    accessorKey: "firstName",
    header: "Врач",
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => {
      const employee = row.original;
      const avatarUrl = getEmployeeAvatarUrl(employee);
      const fullName = getEmployeeFullName(employee);
      const initials = getEmployeeInitials(employee);
      const title = getEmployeeTitle(employee);

      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{fullName}</div>
            <div className="text-sm text-muted-foreground">{title}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Телефон",
    cell: ({ row }) => {
      const employee = row.original;
      return getEmployeePhone(employee);
    },
  },
  {
    accessorKey: "status",
    header: "Статус",
    width: 100,
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <Badge variant={employee.status === "ACTIVE" ? "default" : "secondary"}>
          {employee.status === "ACTIVE" ? "Активен" : "Неактивен"}
        </Badge>
      );
    },
  },
];
