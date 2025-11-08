"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { getPatientFullName } from "@/features/patients";
import { getEmployeeFullName } from "@/features/employees";

import type { ServiceOrderResponseDto } from "../service-order.dto";
import {
  getOrderStatusVariant,
  getPaymentStatusVariant,
} from "../service-order.model";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SERVICE_TYPE_LABELS,
} from "../service-order.constants";

export const serviceOrderColumns: ColumnDef<ServiceOrderResponseDto>[] = [
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
      const patientName = getPatientFullName(row.original.patient);
      return <div className="font-medium">{patientName}</div>;
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
      const doctorName = getEmployeeFullName(row.original.doctor);
      return <div className="text-sm">{doctorName}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "СТАТУС",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={getOrderStatusVariant(status)}>
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
        <Badge variant={getPaymentStatusVariant(paymentStatus)}>
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
];
