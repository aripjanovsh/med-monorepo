"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { UserCheck, Loader2, User } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTES, url } from "@/constants/route.constants";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
} from "@/features/appointment/appointment.constants";
import { getPatientShortName } from "@/features/patients/patient.model";
import { getEmployeeShortName } from "@/features/employees/employee.model";
import type { AppointmentResponseDto } from "@/features/appointment/appointment.dto";

type AppointmentsTableColumnsProps = {
  onArrived: (appointment: AppointmentResponseDto) => void;
  processingId: string | null;
};

export const getTodayAppointmentsColumns = ({
  onArrived,
  processingId,
}: AppointmentsTableColumnsProps): ColumnDef<AppointmentResponseDto>[] => [
  {
    accessorKey: "scheduledAt",
    header: "Время",
    size: 80,
    cell: ({ row }) => {
      const scheduledTime = parseISO(row.original.scheduledAt);
      return (
        <div className="flex flex-col items-center justify-center h-10 w-14 rounded-lg bg-primary/10">
          <span className="text-sm font-bold text-primary">
            {format(scheduledTime, "HH:mm")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "patient",
    header: "Пациент",
    cell: ({ row }) => {
      const patient = row.original.patient;
      const patientName = getPatientShortName(patient as any);

      return (
        <div className="min-w-0">
          <Link
            href={url(ROUTES.PATIENT_DETAIL, { id: patient?.id })}
            className="font-medium hover:underline truncate block"
            onClick={(e) => e.stopPropagation()}
          >
            {patientName}
          </Link>
          {patient?.patientId && (
            <div className="text-xs text-muted-foreground">
              {patient.patientId}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "employee",
    header: "Врач",
    cell: ({ row }) => {
      const employee = row.original.employee;
      const employeeName = getEmployeeShortName(employee as any);

      return (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <User className="h-3 w-3" />
          <span className="truncate">{employeeName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "service",
    header: "Услуга",
    cell: ({ row }) => {
      const service = row.original.service;
      return service ? (
        <span className="text-sm text-muted-foreground truncate block max-w-[200px]">
          {service.name}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          className={APPOINTMENT_STATUS_COLORS[status]}
          variant="secondary"
        >
          {APPOINTMENT_STATUS_LABELS[status]}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Действия</div>,
    cell: ({ row }) => {
      const appointment = row.original;
      const isProcessing = processingId === appointment.id;

      return (
        <div className="flex items-center justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onArrived(appointment);
                }}
                disabled={isProcessing || processingId !== null}
                className="gap-1.5"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}
                Пришёл
              </Button>
            </TooltipTrigger>
            <TooltipContent>Создать визит и добавить в очередь</TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
];
