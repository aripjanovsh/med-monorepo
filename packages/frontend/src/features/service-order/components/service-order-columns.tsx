"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { getPatientFullName, getPatientShortName } from "@/features/patients";
import {
  getEmployeeFullName,
  getEmployeeShortName,
} from "@/features/employees";

import type { ServiceOrderResponseDto } from "../service-order.dto";
import { SERVICE_TYPE_LABELS } from "../service-order.constants";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "./service-order-status-badge";
import { getEmployeeLastNameInitial } from "@/features/employees/employee.model";
import { UserAvatar } from "@/components/ui/user-avatar";

export const serviceOrderColumns: ColumnDef<ServiceOrderResponseDto>[] = [
  {
    accessorKey: "createdAt",
    header: "ДАТА",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="whitespace-nowrap text-sm">
          {format(date, "dd.MM.yyyy HH:mm", { locale: ru })}
        </div>
      );
    },
  },
  {
    accessorKey: "patient",
    header: "ПАЦИЕНТ",
    cell: ({ row }) => {
      const patientName = getPatientShortName(row.original.patient);
      return <div className="font-medium">{patientName}</div>;
    },
  },
  {
    accessorKey: "service",
    header: "УСЛУГА",
    cell: ({ row }) => {
      const service = row.original.service;
      const type = row.original.service.type;
      return (
        <div>
          <div className="font-medium text-sm">
            {service.name}{" "}
            <span className="text-xs text-muted-foreground">
              {type && `(${SERVICE_TYPE_LABELS[type]})`}
            </span>
          </div>
          {service.code && (
            <div className="text-xs text-muted-foreground">{service.code}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "doctor",
    header: "НАЗНАЧИЛ",
    cell: ({ row }) => {
      const doctorName = getEmployeeLastNameInitial(row.original.doctor);
      const avatarId = row.original.doctor.avatarId;
      return (
        <div className="flex flex-row gap-1 items-center">
          <UserAvatar
            avatarId={avatarId}
            name={doctorName}
            className="size-5 rounded-full"
            fallbackClassName="rounded-full text-xs"
          />

          <div className="text-sm">{doctorName}</div>
        </div>
      );
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
      if (!resultAt)
        return <div className="text-sm text-muted-foreground">—</div>;
      const date = new Date(resultAt);
      return (
        <div className="text-sm whitespace-nowrap">
          {format(date, "dd.MM.yyyy", { locale: ru })}
        </div>
      );
    },
  },
];
