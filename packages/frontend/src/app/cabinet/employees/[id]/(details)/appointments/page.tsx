"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useGetEmployeeQuery } from "@/features/employees";
import { EmployeeAppointments } from "@/features/employees/components/detail/employee-appointments";
import { LoadingState, ErrorState } from "@/components/states";
import { ROUTES } from "@/constants/route.constants";

export default function EmployeeAppointmentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const {
    data: employee,
    isLoading,
    error,
    refetch,
  } = useGetEmployeeQuery(id as string, {
    skip: !id,
  });

  if (isLoading) {
    return <LoadingState title="Загрузка данных сотрудника..." />;
  }

  if (error || !employee) {
    return (
      <ErrorState
        title="Сотрудник не найден"
        description="Сотрудник, которого вы ищете, не существует или был удален."
        onRetry={refetch}
        onBack={() => router.push(ROUTES.EMPLOYEES)}
        backLabel="Вернуться к списку сотрудников"
      />
    );
  }

  return (
    <div className="space-y-6">
      <EmployeeAppointments employee={employee} />
    </div>
  );
}
