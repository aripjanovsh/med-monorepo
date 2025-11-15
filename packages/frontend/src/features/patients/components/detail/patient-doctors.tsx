"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope } from "lucide-react";
import Link from "next/link";

import { PatientResponseDto } from "@/features/patients/patient.dto";
import { useGetEmployeesQuery } from "@/features/employees";
import { patientDoctorColumns } from "@/features/employees/components/employee-columns";
import { DataTable, DataTableEmptyState } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layouts/page-header";

interface PatientDoctorsProps {
  patient: PatientResponseDto;
}

export function PatientDoctors({ patient }: PatientDoctorsProps) {
  const router = useRouter();
  const { data, isLoading } = useGetEmployeesQuery(
    { patientId: patient.id, limit: 100 },
    { skip: !patient.id },
  );

  const doctors = data?.data || [];
  const total = data?.meta?.total || 0;

  // Columns with actions
  const columns = useMemo(
    () => [
      ...patientDoctorColumns,
      {
        id: "actions",
        header: () => <div className="text-right">Действия</div>,
        cell: ({ row }: { row: any }) => {
          const doctor = row.original;
          return (
            <div className="text-right">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/cabinet/employees/${doctor.id}`}>Открыть</Link>
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader title="Врачи пациента" />

      <DataTable
        columns={columns}
        data={doctors}
        isLoading={isLoading}
        emptyState={
          <DataTableEmptyState
            title="Нет врачей"
            description="У этого пациента пока нет закрепленных врачей"
            icon={Stethoscope}
          />
        }
        onRowClick={(row) => {
          router.push(`/cabinet/employees/${row.original.id}`);
        }}
      />
    </>
  );
}
