"use client";

import { useParams } from "next/navigation";
import { LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageEmployeeForm } from "@/features/employees/components/page-employee-form";
import { useGetEmployeeQuery } from "@/features/employees";
import { Loader2 } from "lucide-react";

export default function EditEmployeePage() {
  const params = useParams();
  const employeeId = params.id as string;

  const {
    data: employee,
    isLoading,
    error,
  } = useGetEmployeeQuery(employeeId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LayoutHeader backHref="/cabinet/employees" backTitle="Сотрудники" />
        <PageHeader title="Редактирование сотрудника" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="space-y-6">
        <LayoutHeader backHref="/cabinet/employees" backTitle="Сотрудники" />
        <PageHeader title="Редактирование сотрудника" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500">
              Ошибка при загрузке данных сотрудника
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LayoutHeader backHref="/cabinet/employees" backTitle="Сотрудники" />
      <PageHeader 
        title={`Редактирование: ${employee.firstName} ${employee.lastName}`} 
      />
      <PageEmployeeForm employee={employee} mode="edit" />
    </div>
  );
}
