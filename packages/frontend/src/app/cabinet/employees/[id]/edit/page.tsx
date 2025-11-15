"use client";

import { useParams, useRouter } from "next/navigation";
import { LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageEmployeeForm } from "@/features/employees/components/page-employee-form";
import { useGetEmployeeQuery } from "@/features/employees";
import { LoadingState, ErrorState } from "@/components/states";
import { ROUTES } from "@/constants/route.constants";

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;

  const { data: employee, isLoading, error } = useGetEmployeeQuery(employeeId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LayoutHeader backHref={ROUTES.EMPLOYEES} backTitle="Сотрудники" />
        <PageHeader title="Редактирование сотрудника" />
        <LoadingState title="Загрузка данных сотрудника..." />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="space-y-6">
        <LayoutHeader backHref={ROUTES.EMPLOYEES} backTitle="Сотрудники" />
        <PageHeader title="Редактирование сотрудника" />
        <ErrorState
          title="Сотрудник не найден"
          description="Не удалось загрузить данные сотрудника."
          onBack={() => router.push(ROUTES.EMPLOYEES)}
          backLabel="Вернуться к списку сотрудников"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LayoutHeader backHref={ROUTES.EMPLOYEES} backTitle="Сотрудники" />
      <PageHeader
        title={`Редактирование: ${employee.firstName} ${employee.lastName}`}
      />
      <PageEmployeeForm employee={employee} mode="edit" />
    </div>
  );
}
