"use client";

import { useMemo } from "react";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import Link from "next/link";

import { ROUTES, url } from "@/constants/route.constants";

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

  // DataTable state management
  const visitsState = useDataTableState({
    defaultLimit: 20,
    defaultSorting: [
      {
        desc: true,
        id: "date",
      },
    ],
    sortFormat: "split",
    searchDebounceMs: 500,
  });

  const { data, isLoading } = useGetVisitsQuery(
    { employeeId: employee.id, ...visitsState.queryParams },
    { skip: !employee.id }
  );

  const visits = data?.data || [];
  const totalVisits = data?.meta?.total || 0;

  // Columns with actions
  const columns = useMemo(
    () => [
      ...employeeVisitColumns,
      {
        id: "actions",
        cell: ({ row }: { row: any }) => {
          const visit = row.original;
          return (
            <div className="text-right">
              <Button variant="outline" size="sm" asChild>
                <Link href={url(ROUTES.VISIT_DETAIL, { id: visit.id })}>
                  Открыть
                </Link>
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
        pagination={{
          ...visitsState.handlers.pagination,
          total: totalVisits,
        }}
        sort={visitsState.handlers.sorting}
        emptyState={
          <DataTableEmptyState
            title="Визитов пока нет"
            description="У этого врача пока нет проведенных визитов"
            icon={Calendar}
          />
        }
        onRowClick={(row) => {
          router.push(url(ROUTES.VISIT_DETAIL, { id: row.original.id }));
        }}
      />
    </>
  );
};
