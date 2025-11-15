"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Calendar } from "lucide-react";

import type { EmployeeResponseDto } from "@/features/employees/employee.dto";
import { useGetPatientsQuery } from "@/features/patients";
import type { PatientResponseDto } from "@/features/patients/patient.dto";
import { LoadingState } from "@/components/states";
import { DataTable } from "@/components/data-table/data-table";
import { employeePatientColumns } from "@/features/patients/components/patient-columns";

type EmployeePatientsProps = {
  employee: EmployeeResponseDto;
};

export const EmployeePatients = ({ employee }: EmployeePatientsProps) => {
  const { data, isLoading } = useGetPatientsQuery(
    { doctorId: employee.id, limit: 100 },
    { skip: !employee.id },
  );

  const assignedPatients = data?.data || [];
  const total = data?.meta?.total || 0;

  if (isLoading) {
    return <LoadingState title="Загрузка пациентов..." />;
  }

  return (
    <div className="space-y-6">
      {/* Patient Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Всего пациентов</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">С последним визитом</p>
                <p className="text-2xl font-bold">
                  {
                    assignedPatients.filter(
                      (p: PatientResponseDto) => p.lastVisitedAt,
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Пациенты врача
          </CardTitle>
          <CardDescription>Закрепленные пациенты ({total})</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={employeePatientColumns} data={assignedPatients} />
        </CardContent>
      </Card>
    </div>
  );
};
