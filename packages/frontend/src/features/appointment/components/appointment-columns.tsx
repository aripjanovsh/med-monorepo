"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  UserCheck,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { AppointmentResponseDto } from "../appointment.dto";
import {
  getPatientFullName,
  getEmployeeFullName,
  isAppointmentEditable,
  canConfirmAppointment,
  canCheckInAppointment,
  canCancelAppointment,
} from "../appointment.model";
import { AppointmentStatusBadge } from "./appointment-status-badge";

export const createAppointmentColumns = (
  onEdit?: (appointment: AppointmentResponseDto) => void,
  onView?: (appointment: AppointmentResponseDto) => void,
  onDelete?: (appointment: AppointmentResponseDto) => void,
  onConfirm?: (appointment: AppointmentResponseDto) => void,
  onCheckIn?: (appointment: AppointmentResponseDto) => void,
  onCancel?: (appointment: AppointmentResponseDto) => void
): ColumnDef<AppointmentResponseDto>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Выбрать все"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Выбрать строку"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "scheduledAt",
    header: "ДАТА И ВРЕМЯ",
    cell: ({ row }) => {
      const date = new Date(row.original.scheduledAt);
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
      const appointment = row.original;
      const patientName = getPatientFullName(appointment.patient);
      return (
        <button
          type="button"
          className="font-medium text-left hover:text-blue-600 transition-colors"
          onClick={() => onView?.(appointment)}
        >
          {patientName}
        </button>
      );
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
    accessorKey: "service",
    header: "УСЛУГА",
    cell: ({ row }) => {
      const service = row.original.service;
      return (
        <div className="text-sm">{service ? service.name : "Не указана"}</div>
      );
    },
  },
  {
    accessorKey: "duration",
    header: "ДЛИТЕЛЬНОСТЬ",
    cell: ({ row }) => {
      return <div className="text-sm">{row.original.duration} мин</div>;
    },
  },
  {
    accessorKey: "status",
    header: "СТАТУС",
    cell: ({ row }) => (
      <AppointmentStatusBadge status={row.original.status} />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const appointment = row.original;
      const editable = isAppointmentEditable(appointment);
      const canConfirm = canConfirmAppointment(appointment);
      const canCheckIn = canCheckInAppointment(appointment);
      const canCancel = canCancelAppointment(appointment);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Открыть меню</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView?.(appointment)}>
              <Eye className="mr-2 h-4 w-4" />
              Просмотр
            </DropdownMenuItem>
            {editable && (
              <DropdownMenuItem onClick={() => onEdit?.(appointment)}>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {canConfirm && (
              <DropdownMenuItem onClick={() => onConfirm?.(appointment)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Подтвердить
              </DropdownMenuItem>
            )}
            {canCheckIn && (
              <DropdownMenuItem onClick={() => onCheckIn?.(appointment)}>
                <UserCheck className="mr-2 h-4 w-4" />
                Отметить прибытие
              </DropdownMenuItem>
            )}
            {canCancel && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onCancel?.(appointment)}
                  className="text-orange-600"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Отменить
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(appointment)}
              className="text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
