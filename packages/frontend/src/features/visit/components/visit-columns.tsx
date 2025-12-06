"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { VisitResponseDto } from "../visit.dto";
import { formatVisitDate } from "../visit.model";
import { VisitStatusBadge } from "./visit-status-badge";
import { getPatientShortName } from "@/features/patients/patient.model";
import {
  getEmployeeShortName,
  getEmployeeTitle,
} from "@/features/employees/employee.model";
import { Calendar, Clock } from "lucide-react";
import { formatMinutes } from "@/lib/date.utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import Link from "next/link";
import { url, ROUTES } from "@/constants/route.constants";

export const visitColumns: ColumnDef<VisitResponseDto>[] = [
  {
    accessorKey: "visitDate",
    header: "ДАТА ВИЗИТА",
    enableSorting: true,
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
      const patientName = getPatientShortName(visit.patient as any);
      return (
        <div>
          <Link
            href={url(ROUTES.PATIENT_DETAIL, { id: visit.patient?.id })}
            className="font-medium hover:underline"
          >
            {patientName}
          </Link>
          {visit.patient?.patientId && (
            <div className="text-xs text-muted-foreground">
              {visit.patient.patientId}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "employee",
    header: "ВРАЧ",
    cell: ({ row }) => {
      const employee = row.original.employee;
      const fullName = getEmployeeShortName(employee as any);
      const title = getEmployeeTitle(employee as any);

      return (
        <div className="flex items-center space-x-3">
          <UserAvatar
            avatarId={employee?.avatarId}
            name={fullName}
            className="h-8"
            size={24}
          />
          <div>
            <Link
              href={url(ROUTES.EMPLOYEE_DETAIL, { id: employee?.id })}
              className="font-medium hover:underline"
            >
              {fullName}
            </Link>
            <div className="text-xs text-muted-foreground">{title}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "waitingTimeMinutes",
    header: "ОЖИДАНИЕ",
    cell: ({ row }) => {
      const minutes = row.original.waitingTimeMinutes;
      if (minutes === undefined || minutes === null) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="flex items-center gap-1 text-sm whitespace-nowrap">
          <Clock className="h-3 w-3 text-muted-foreground" />
          {formatMinutes(minutes)}
        </div>
      );
    },
  },
  {
    accessorKey: "serviceTimeMinutes",
    header: "ПРИЕМ",
    cell: ({ row }) => {
      const minutes = row.original.serviceTimeMinutes;
      if (minutes === undefined || minutes === null) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="flex items-center gap-1 text-sm whitespace-nowrap">
          <Clock className="h-3 w-3 text-muted-foreground" />
          {formatMinutes(minutes)}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "СТАТУС",
    cell: ({ row }) => <VisitStatusBadge status={row.original.status} />,
  },
];

// Упрощенные колонки для визитов пациента (используются в PatientVisits компоненте)
export const patientVisitColumns: ColumnDef<VisitResponseDto>[] = [
  {
    accessorKey: "visitDate",
    header: "Дата визита",
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => {
      const visit = row.original;
      const formattedDate = formatVisitDate(visit.visitDate);
      return <div className="whitespace-nowrap">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "employee",
    header: "Врач",
    cell: ({ row }) => {
      const visit = row.original;
      const employeeName = getEmployeeFullName(visit.employee);
      return <div>{employeeName}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const visit = row.original;
      return <VisitStatusBadge status={visit.status} />;
    },
  },
];

export const employeeVisitColumns: ColumnDef<VisitResponseDto>[] = [
  {
    accessorKey: "patient",
    header: "Пациент",
    cell: ({ row }) => {
      const visit = row.original;
      const patientName = visit.patient
        ? getPatientFullName(visit.patient)
        : "Не указан";

      return (
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-medium">{patientName}</div>
            {visit.patient?.patientId && (
              <div className="text-sm text-muted-foreground">
                {visit.patient.patientId}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "visitDate",
    header: "Дата визита",
    cell: ({ row }) => {
      const visit = row.original;
      return (
        <div className="flex items-center whitespace-nowrap">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          {formatVisitDate(visit.visitDate)}
        </div>
      );
    },
  },
  // время ожидания
  {
    accessorKey: "waitingTimeMinute",
    header: "Время ожидания",
    cell: ({ row }) => {
      const visit = row.original;
      return <div>{formatMinutes(visit.waitingTimeMinutes)}</div>;
    },
  },
  // время визита
  {
    accessorKey: "serviceTimeMinutes",
    header: "Время визита",
    cell: ({ row }) => {
      const visit = row.original;
      return <div>{formatMinutes(visit.serviceTimeMinutes)}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const visit = row.original;
      return <VisitStatusBadge status={visit.status} />;
    },
  },
];
