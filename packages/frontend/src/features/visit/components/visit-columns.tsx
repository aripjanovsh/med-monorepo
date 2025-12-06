"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { VisitResponseDto } from "../visit.dto";
import { VisitStatusBadge } from "./visit-status-badge";
import { getPatientShortName } from "@/features/patients/patient.model";
import {
  getEmployeeShortName,
  getEmployeeTitle,
} from "@/features/employees/employee.model";
import { Calendar, Clock } from "lucide-react";
import { formatMinutes, formatFullDate } from "@/lib/date.utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import Link from "next/link";
import { url, ROUTES } from "@/constants/route.constants";

export const visitColumns: ColumnDef<VisitResponseDto>[] = [
  {
    accessorKey: "visitDate",
    header: "ДАТА",
    enableSorting: true,
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-sm">
        {formatFullDate(row.original.visitDate)}
      </div>
    ),
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
    header: "ДАТА",
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => {
      const visit = row.original;
      return (
        <div className="whitespace-nowrap">
          {formatFullDate(visit.visitDate)}
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
    cell: ({ row }) => {
      const visit = row.original;
      return <VisitStatusBadge status={visit.status} />;
    },
  },
];

export const employeeVisitColumns: ColumnDef<VisitResponseDto>[] = [
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
    accessorKey: "visitDate",
    header: "ДАТА",
    cell: ({ row }) => {
      const visit = row.original;
      return (
        <div className="flex items-center whitespace-nowrap">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          {formatFullDate(visit.visitDate)}
        </div>
      );
    },
  },
  // время ожидания
  {
    accessorKey: "waitingTimeMinute",
    header: "ВРЕМЯ ОЖИДАНИЯ",
    cell: ({ row }) => {
      const visit = row.original;
      return <div>{formatMinutes(visit.waitingTimeMinutes)}</div>;
    },
  },
  // время визита
  {
    accessorKey: "serviceTimeMinutes",
    header: "ВРЕМЯ ВИЗИТА",
    cell: ({ row }) => {
      const visit = row.original;
      return <div>{formatMinutes(visit.serviceTimeMinutes)}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "СТАТУС",
    cell: ({ row }) => {
      const visit = row.original;
      return <VisitStatusBadge status={visit.status} />;
    },
  },
];
