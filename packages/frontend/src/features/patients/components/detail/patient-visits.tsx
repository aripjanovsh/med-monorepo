"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, DataTableEmptyState } from "@/components/data-table";
import PageHeader from "@/components/layouts/page-header";
import { useDialog } from "@/lib/dialog-manager";
import { useGetVisitsQuery, VisitFormDialog } from "@/features/visit";
import { patientVisitColumns } from "@/features/visit/components/visit-columns";

type PatientVisitsProps = {
  patientId: string;
};

export const PatientVisits = ({ patientId }: PatientVisitsProps) => {
  const router = useRouter();
  const visitDialog = useDialog(VisitFormDialog);

  const { data, isLoading, refetch } = useGetVisitsQuery({
    patientId,
    page: 1,
    limit: 50,
  });

  const visits = data?.data || [];

  const handleOpenVisitDialog = () => {
    visitDialog.open({
      mode: "create",
      patientId,
      onSuccess: refetch,
    });
  };

  // Columns with actions
  const columns = useMemo(
    () => [
      ...patientVisitColumns,
      {
        id: "actions",
        header: () => <div className="text-right">Действия</div>,
        cell: ({ row }: { row: any }) => {
          const visit = row.original;
          return (
            <div className="text-right">
              <Button variant="outline" size="sm" asChild>
                <a href={`/cabinet/patients/${patientId}/visits/${visit.id}`}>
                  Открыть
                </a>
              </Button>
            </div>
          );
        },
      },
    ],
    [patientId]
  );

  return (
    <>
      <PageHeader
        title="История визитов"
        actions={
          <Button onClick={handleOpenVisitDialog}>
            <Plus />
            Записать на прием
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={visits}
        isLoading={isLoading}
        emptyState={
          <DataTableEmptyState
            title="Визитов пока нет"
            description="Начните с записи пациента на прием"
            icon={Calendar}
            action={
              <Button onClick={handleOpenVisitDialog}>
                <Plus />
                Записать на прием
              </Button>
            }
          />
        }
        onRowClick={(row) => {
          router.push(`/cabinet/patients/${patientId}/visits/${row.original.id}`);
        }}
      />
    </>
  );
};
