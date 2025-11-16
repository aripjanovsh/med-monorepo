"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import type { VisitResponseDto } from "../visit.dto";
import { formatVisitDate } from "../visit.model";
import { VisitStatusBadge } from "./visit-status-badge";
import {
  getPatientFullName,
  getPatientInitials,
} from "@/features/patients/patient.model";
import { getEmployeeFullName } from "@/features/employees/employee.model";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { url, ROUTES } from "@/constants/route.constants";

export const visitColumns: ColumnDef<VisitResponseDto>[] = [
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
      const patientName = getPatientFullName(row.original.patient);
      return <div className="font-medium">{patientName}</div>;
    },
  },
  {
    accessorKey: "employee",
    header: "ВРАЧ",
    cell: ({ row }) => {
      const employeeName = getEmployeeFullName(row.original.employee);
      return <div className="text-sm">{employeeName}</div>;
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
      const initials = visit.patient ? getPatientInitials(visit.patient) : "?";

      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{patientName}</div>
            {visit.patient?.patientId && (
              <div className="text-sm text-muted-foreground">
                #{visit.patient.patientId}
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
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const visit = row.original;
      return <VisitStatusBadge status={visit.status} />;
    },
  },
];
