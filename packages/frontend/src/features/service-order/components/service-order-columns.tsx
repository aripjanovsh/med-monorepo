"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { getPatientFullName } from "@/features/patients";
import { getEmployeeFullName } from "@/features/employees";

import type { ServiceOrderResponseDto } from "../service-order.dto";
import { SERVICE_TYPE_LABELS } from "../service-order.constants";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "./service-order-status-badge";

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
      return <OrderStatusBadge status={row.original.status} />;
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "ОПЛАТА",
    cell: ({ row }) => {
      return <PaymentStatusBadge status={row.original.paymentStatus} />;
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
