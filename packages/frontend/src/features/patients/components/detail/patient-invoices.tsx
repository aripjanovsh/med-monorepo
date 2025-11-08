"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import Link from "next/link";

import type { PatientResponseDto } from "@/features/patients/patient.dto";
import { useGetInvoicesQuery } from "@/features/invoice";
import { invoiceColumns } from "@/features/invoice/components/invoice-columns";
import { DataTable, DataTableEmptyState } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layouts/page-header";

interface PatientInvoicesProps {
  patient: PatientResponseDto;
}

export function PatientInvoices({ patient }: PatientInvoicesProps) {
  const router = useRouter();
  const { data, isLoading } = useGetInvoicesQuery(
    { patientId: patient.id, sortBy: "createdAt", sortOrder: "desc", limit: 100 },
    { skip: !patient.id }
  );

  const invoices = data?.data || [];

  // Columns with actions
  const columns = useMemo(
    () => [
      ...invoiceColumns,
      {
        id: "actions",
        header: () => <div className="text-right">Действия</div>,
        cell: ({ row }: { row: any }) => {
          const invoice = row.original;
          return (
            <div className="text-right">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/cabinet/invoices/${invoice.id}`}>Открыть</Link>
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
      <PageHeader title="Счета пациента" />

      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        emptyState={
          <DataTableEmptyState
            title="Нет счетов"
            description="У этого пациента пока нет выставленных счетов"
            icon={FileText}
          />
        }
        onRowClick={(row) => {
          router.push(`/cabinet/invoices/${row.original.id}`);
        }}
      />
    </>
  );
}
