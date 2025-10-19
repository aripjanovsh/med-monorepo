"use client";

import { use } from "react";
import { useGetEmployeeQuery } from "@/features/employees";
import { EmployeeProfile } from "@/features/employees/components/detail/employee-profile";

export default function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: employee, isLoading } = useGetEmployeeQuery(id as string, {
    skip: !id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Загрузка данных сотрудника...
          </p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  return (
    <div className="space-y-6">
      <EmployeeProfile employee={employee} />
    </div>
  );
}
