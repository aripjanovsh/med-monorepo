"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FileText, Activity, Calendar } from "lucide-react";

import type { EmployeeResponseDto } from "@/features/employees/employee.dto";
import { useGetVisitsQuery } from "@/features/visit";
import type { VisitResponseDto } from "@/features/visit/visit.dto";
import { LoadingState } from "@/components/states";
import { DataTable } from "@/components/data-table/data-table";
import { employeeVisitColumns } from "@/features/visit/components/visit-columns";

type EmployeeVisitsProps = {
  employee: EmployeeResponseDto;
};

export const EmployeeVisits = ({ employee }: EmployeeVisitsProps) => {
  const { data, isLoading } = useGetVisitsQuery(
    { employeeId: employee.id, limit: 100 },
    { skip: !employee.id }
  );

  const visits = data?.data || [];
  const total = data?.meta?.total || 0;

  if (isLoading) {
    return <LoadingState title="Загрузка визитов..." />;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Всего визитов</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">В процессе</p>
                <p className="text-2xl font-bold">
                  {
                    visits.filter(
                      (v: VisitResponseDto) => v.status === "IN_PROGRESS"
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Завершено</p>
                <p className="text-2xl font-bold">
                  {
                    visits.filter(
                      (v: VisitResponseDto) => v.status === "COMPLETED"
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visits Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Визиты врача
          </CardTitle>
          <CardDescription>История визитов ({total})</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={employeeVisitColumns} data={visits} />
        </CardContent>
      </Card>
    </div>
  );
};
