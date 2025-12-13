"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { UserCheck, Loader2, User, UserX } from "lucide-react";
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
import {
  getEmployeeShortName,
  getEmployeeTitle,
} from "@/features/employees/employee.model";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { AppointmentResponseDto } from "@/features/appointment/appointment.dto";

type AppointmentsTableColumnsProps = {
  onArrived: (appointment: AppointmentResponseDto) => void;
  onNoShow: (appointment: AppointmentResponseDto) => void;
  processingId: string | null;
};

export const getTodayAppointmentsColumns = ({
  onArrived,
  onNoShow,
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
      const employeeTitle = getEmployeeTitle(employee as any);

      return (
        <div className="flex items-center space-x-3">
          <UserAvatar
            avatarId={employee?.avatarId}
            name={employeeName}
            className="h-8"
            size={24}
          />
          <div className="min-w-0">
            <Link
              href={url(ROUTES.EMPLOYEE_DETAIL, {
                id: employee?.id,
              })}
              className="font-medium hover:underline truncate block"
              onClick={(e) => e.stopPropagation()}
            >
              {employeeName}
            </Link>
            <div className="text-xs text-muted-foreground truncate">
              {employeeTitle}
            </div>
          </div>
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
    id: "actions",
    header: () => <div className="text-right">Действия</div>,
    cell: ({ row }) => {
      const appointment = row.original;
      const isProcessing = processingId === appointment.id;
      const scheduledTime = parseISO(appointment.scheduledAt);
      const now = new Date();
      // Show "No Show" if appointment time has passed (simple check)
      const canMarkNoShow = now > scheduledTime;

      return (
        <div className="flex items-center justify-end gap-1">
          {canMarkNoShow && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNoShow(appointment);
                  }}
                  disabled={isProcessing || processingId !== null}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <UserX className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Пациент не пришёл</TooltipContent>
            </Tooltip>
          )}

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
