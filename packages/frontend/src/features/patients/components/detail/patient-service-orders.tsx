"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import Link from "next/link";

import type { PatientResponseDto } from "@/features/patients/patient.dto";
import { useGetServiceOrdersQuery } from "@/features/service-order";
import { DataTable, DataTableEmptyState } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layouts/page-header";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date.utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { ServiceOrderResponseDto } from "@/features/service-order/service-order.dto";

interface PatientServiceOrdersProps {
  patient: PatientResponseDto;
}

const STATUS_MAP = {
  ORDERED: { label: "Назначено", variant: "default" },
  IN_PROGRESS: { label: "В процессе", variant: "secondary" },
  COMPLETED: { label: "Выполнено", variant: "secondary" },
  CANCELLED: { label: "Отменено", variant: "destructive" },
} as const;

const PAYMENT_STATUS_MAP = {
  UNPAID: { label: "Не оплачено", variant: "destructive" },
  PAID: { label: "Оплачено", variant: "secondary" },
  PARTIALLY_PAID: { label: "Частично оплачено", variant: "default" },
  REFUNDED: { label: "Возвращено", variant: "outline" },
} as const;

const serviceOrderColumns: ColumnDef<ServiceOrderResponseDto>[] = [
  {
    accessorKey: "service",
    header: "Услуга",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.service.name}</div>
        {row.original.service.code && (
          <div className="text-sm text-muted-foreground">
            {row.original.service.code}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "department",
    header: "Отделение",
    cell: ({ row }) => (
      <div>{row.original.department?.name || "—"}</div>
    ),
  },
  {
    accessorKey: "doctor",
    header: "Врач",
    cell: ({ row }) => {
      const doctor = row.original.doctor;
      return (
        <div>
          {doctor.lastName} {doctor.firstName[0]}.
          {doctor.middleName?.[0] ? ` ${doctor.middleName[0]}.` : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const statusInfo = STATUS_MAP[row.original.status];
      return (
        <Badge variant={statusInfo.variant as any}>
          {statusInfo.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Оплата",
    cell: ({ row }) => {
      const statusInfo = PAYMENT_STATUS_MAP[row.original.paymentStatus];
      return (
        <Badge variant={statusInfo.variant as any}>
          {statusInfo.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Дата назначения",
    cell: ({ row }) => (
      <div className="text-sm">
        {formatDate(row.original.createdAt, "dd.MM.yyyy HH:mm")}
      </div>
    ),
  },
];

export function PatientServiceOrders({ patient }: PatientServiceOrdersProps) {
  const router = useRouter();
  const { data, isLoading } = useGetServiceOrdersQuery(
    { patientId: patient.id, sortBy: "createdAt", sortOrder: "desc", limit: 100 },
    { skip: !patient.id }
  );

  const serviceOrders = data?.data || [];

  // Columns with actions
  const columns = useMemo(
    () => [
      ...serviceOrderColumns,
      {
        id: "actions",
        header: () => <div className="text-right">Действия</div>,
        cell: ({ row }: { row: any }) => {
          const order = row.original;
          return (
            <div className="text-right">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/cabinet/orders/${order.id}`}>Открыть</Link>
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <>
      <PageHeader title="Назначения пациента" />

      <DataTable
        columns={columns}
        data={serviceOrders}
        isLoading={isLoading}
        emptyState={
          <DataTableEmptyState
            title="Нет назначений"
            description="У этого пациента пока нет назначений"
            icon={ClipboardList}
          />
        }
        onRowClick={(row) => {
          router.push(`/cabinet/orders/${row.original.id}`);
        }}
      />
    </>
  );
}
