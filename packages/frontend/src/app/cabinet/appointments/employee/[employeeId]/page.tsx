"use client";

import { use } from "react";
import { FilteredAppointmentsPage } from "@/features/appointment/filtered-appointments-page";
import { useGetEmployeeQuery } from "@/features/employees/employee.api";

export default function EmployeeAppointmentsPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = use(params);
  const { data: employee } = useGetEmployeeQuery(employeeId);

  const employeeName = employee
    ? `${employee.lastName} ${employee.firstName}`.trim()
    : undefined;

  return (
    <FilteredAppointmentsPage
      employeeId={employeeId}
      employeeName={employeeName}
    />
  );
}
