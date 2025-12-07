"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import type { EmployeeResponseDto } from "../employee.dto";
import {
  getEmployeeFullName,
  getEmployeePhone,
  getEmployeeTitle,
  getEmployeeStatusDisplay,
} from "../employee.model";

export const employeeColumns: ColumnDef<EmployeeResponseDto>[] = [
  {
    accessorKey: "firstName",
    header: "ИМЯ",
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => {
      const employee = row.original;
      const fullName = getEmployeeFullName(employee);
      const title = getEmployeeTitle(employee);

      return (
        <div className="flex items-center space-x-3">
          <UserAvatar
            avatarId={employee.avatarId}
            name={fullName}
            className="h-10 w-10"
            size={40}
          />
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
    accessorKey: "status",
    header: "СТАТУС",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <Badge variant={employee.status === "ACTIVE" ? "default" : "secondary"}>
          {getEmployeeStatusDisplay(employee.status)}
        </Badge>
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
      const fullName = getEmployeeFullName(employee);
      const title = getEmployeeTitle(employee);

      return (
        <div className="flex items-center space-x-3">
          <UserAvatar
            avatarId={employee.avatarId}
            name={fullName}
            className="h-10 w-10"
            size={40}
          />
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
