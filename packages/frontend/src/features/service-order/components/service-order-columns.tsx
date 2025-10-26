"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, XCircle, Play } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { ServiceOrderResponseDto } from "../service-order.dto";
import {
  getPatientFullName,
  getDoctorFullName,
  canCancelOrder,
} from "../service-order.model";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SERVICE_TYPE_LABELS,
} from "../service-order.constants";

const getStatusVariant = (status: string) => {
  switch (status) {
    case "ORDERED":
      return "default";
    case "IN_PROGRESS":
      return "secondary";
    case "COMPLETED":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
};

const getPaymentVariant = (status: string) => {
  switch (status) {
    case "PAID":
      return "default";
    case "UNPAID":
      return "destructive";
    case "PARTIALLY_PAID":
      return "secondary";
    default:
      return "outline";
  }
};

export const createServiceOrderColumns = (
  onView?: (order: ServiceOrderResponseDto) => void,
  onCancel?: (order: ServiceOrderResponseDto) => void,
  onExecute?: (order: ServiceOrderResponseDto) => void
): ColumnDef<ServiceOrderResponseDto>[] => [
  {
    accessorKey: "createdAt",
    header: "ДАТА",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="whitespace-nowrap text-sm">
          {format(date, "dd.MM.yyyy", { locale: ru })}
        </div>
      );
    },
  },
  {
    accessorKey: "patient",
    header: "ПАЦИЕНТ",
    cell: ({ row }) => {
      const order = row.original;
      const patientName = getPatientFullName(order);
      return (
        <button
          className="font-medium text-left hover:text-blue-600 transition-colors"
          onClick={() => onView?.(order)}
        >
          {patientName}
        </button>
      );
    },
  },
  {
    accessorKey: "service",
    header: "УСЛУГА",
    cell: ({ row }) => {
      const service = row.original.service;
      return (
        <div>
          <div className="font-medium text-sm">{service.name}</div>
          {service.code && (
            <div className="text-xs text-muted-foreground">{service.code}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "service.type",
    header: "ТИП",
    cell: ({ row }) => {
      const type = row.original.service.type;
      return (
        <div className="text-sm">
          {type ? SERVICE_TYPE_LABELS[type] || type : "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "department",
    header: "ОТДЕЛЕНИЕ",
    cell: ({ row }) => {
      const department = row.original.department;
      return <div className="text-sm">{department?.name || "—"}</div>;
    },
  },
  {
    accessorKey: "doctor",
    header: "НАЗНАЧИЛ",
    cell: ({ row }) => {
      const doctorName = getDoctorFullName(row.original);
      return <div className="text-sm">{doctorName}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "СТАТУС",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={getStatusVariant(status)}>
          {ORDER_STATUS_LABELS[status]}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "ОПЛАТА",
    cell: ({ row }) => {
      const paymentStatus = row.original.paymentStatus;
      return (
        <Badge variant={getPaymentVariant(paymentStatus)}>
          {PAYMENT_STATUS_LABELS[paymentStatus]}
        </Badge>
      );
    },
  },
  {
    accessorKey: "resultAt",
    header: "ВЫПОЛНЕНО",
    cell: ({ row }) => {
      const resultAt = row.original.resultAt;
      if (!resultAt) return <div className="text-sm text-muted-foreground">—</div>;
      const date = new Date(resultAt);
      return (
        <div className="text-sm whitespace-nowrap">
          {format(date, "dd.MM.yyyy", { locale: ru })}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "ДЕЙСТВИЯ",
    cell: ({ row }) => {
      const order = row.original;
      const canCancel = canCancelOrder(order);
      const canExecute = order.status === "ORDERED" || order.status === "IN_PROGRESS";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Открыть меню</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView?.(order)}>
              <Eye className="mr-2 h-4 w-4" />
              Просмотр
            </DropdownMenuItem>
            {canExecute && (
              <DropdownMenuItem onClick={() => onExecute?.(order)}>
                <Play className="mr-2 h-4 w-4" />
                Выполнить
              </DropdownMenuItem>
            )}
            {canCancel && (
              <DropdownMenuItem
                onClick={() => onCancel?.(order)}
                className="text-red-600"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Отменить
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
