"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";

import type { EmployeeResponseDto } from "@/features/employees/employee.dto";
import { useGetVisitsQuery } from "@/features/visit";
import { employeeVisitColumns } from "@/features/visit/components/visit-columns";
import { DataTable, DataTableEmptyState } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layouts/page-header";

type EmployeeVisitsProps = {
  employee: EmployeeResponseDto;
};

export const EmployeeVisits = ({ employee }: EmployeeVisitsProps) => {
  const router = useRouter();
  const { data, isLoading } = useGetVisitsQuery(
    { employeeId: employee.id, limit: 100 },
    { skip: !employee.id }
  );

  const visits = data?.data || [];

  // Columns with actions
  const columns = useMemo(
    () => [
      ...employeeVisitColumns,
      {
        id: "actions",
        header: () => <div className="text-right">Действия</div>,
        cell: ({ row }: { row: any }) => {
          const visit = row.original;
          return (
            <div className="text-right">
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`/cabinet/patients/${visit.patient?.id}/visits/${visit.id}`}
                >
                  Открыть
                </a>
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
      <PageHeader title="История визитов" />

      <DataTable
        columns={columns}
        data={visits}
        isLoading={isLoading}
        emptyState={
          <DataTableEmptyState
            title="Визитов пока нет"
            description="У этого врача пока нет проведенных визитов"
            icon={Calendar}
          />
        }
        onRowClick={(row) => {
          router.push(
            `/cabinet/patients/${row.original.patient?.id}/visits/${row.original.id}`
          );
        }}
      />
    </>
  );
};
