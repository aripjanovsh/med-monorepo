"use client";

import { useMemo } from "react";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import Link from "next/link";

import type { EmployeeResponseDto } from "@/features/employees/employee.dto";
import { useGetPatientsQuery } from "@/features/patients";
import { employeePatientColumns } from "@/features/patients/components/patient-columns";
import { DataTable, DataTableEmptyState } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layouts/page-header";

type EmployeePatientsProps = {
  employee: EmployeeResponseDto;
};

export const EmployeePatients = ({ employee }: EmployeePatientsProps) => {
  const router = useRouter();

  // DataTable state management
  const patientsState = useDataTableState({
    defaultLimit: 20,
    defaultSorting: [
      {
        desc: false,
        id: "firstName",
      },
    ],
    sortFormat: "split",
    searchDebounceMs: 500,
  });

  const { data, isLoading } = useGetPatientsQuery(
    { doctorId: employee.id, ...patientsState.queryParams },
    { skip: !employee.id }
  );

  const assignedPatients = data?.data || [];
  const total = data?.meta?.total || 0;

  // Columns with actions
  const columns = useMemo(
    () => [
      ...employeePatientColumns,
      {
        id: "actions",
        header: () => <div className="text-right">Действия</div>,
        cell: ({ row }: { row: any }) => {
          const patient = row.original;
          return (
            <div className="text-right">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/cabinet/patients/${patient.id}`}>Открыть</Link>
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
      <PageHeader title="Пациенты врача" />

      <DataTable
        columns={columns}
        data={assignedPatients}
        isLoading={isLoading}
        pagination={{
          ...patientsState.handlers.pagination,
          total,
        }}
        sort={patientsState.handlers.sorting}
        emptyState={
          <DataTableEmptyState
            title="Нет пациентов"
            description="У этого врача пока нет закрепленных пациентов"
            icon={Users}
          />
        }
        onRowClick={(row) => {
          router.push(`/cabinet/patients/${row.original.id}`);
        }}
      />
    </>
  );
};
