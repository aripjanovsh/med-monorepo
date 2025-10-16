"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { createEmployeeColumns } from "@/features/employees/components/employee-columns";
import {
  Employee,
  useGetEmployeesQuery,
  useGetEmployeeStatsQuery,
  useDeleteEmployeeMutation,
} from "@/features/employees";
import { Input } from "@/components/ui/input";
import { getEmployeeDetailRoute, ROUTES } from "@/constants/route.constants";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { ActionTabs } from "@/components/action-tabs";
import PageHeader from "@/components/layouts/page-header";
import Link from "next/link";

export default function EmployeesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("doctors");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    data: employeesData,
    isLoading: isLoadingEmployees,
    error: employeesError,
    refetch: refetchEmployees,
  } = useGetEmployeesQuery({
    page,
    limit,
    search: debouncedSearchTerm,
    sortBy: "firstName",
    sortOrder: "asc",
  });

  const { data: statsData, isLoading: isLoadingStats } =
    useGetEmployeeStatsQuery({});

  const [deleteEmployee] = useDeleteEmployeeMutation();

  const handleEditEmployee = (employee: Employee) => {
    router.push(`/cabinet/employees/${employee.id}/edit`);
  };

  const handleViewEmployee = (employee: Employee) => {
    router.push(getEmployeeDetailRoute(employee.id));
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (
      !confirm(
        `Вы уверены, что хотите удалить сотрудника ${
          employee.firstName || employee.id
        }?`
      )
    ) {
      return;
    }

    try {
      await deleteEmployee(employee.id).unwrap();
      toast.success("Сотрудник успешно удален!");
      refetchEmployees();
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Ошибка при удалении сотрудника";
      toast.error(errorMessage);
    }
  };

  const employeeColumns = createEmployeeColumns(
    handleEditEmployee,
    handleViewEmployee,
    handleDeleteEmployee
  );

  const employees = employeesData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Сотрудники"
        actions={
          <Button asChild>
            <Link href={ROUTES.EMPLOYEE_CREATE}>
              <Plus />
              Добавить сотрудника
            </Link>
          </Button>
        }
      />

      <ActionTabs
        value={activeTab}
        onValueChange={setActiveTab}
        items={[
          { value: "doctors", label: "Врачи" },
          { value: "nurses", label: "Сестры" },
          { value: "general", label: "Обслуживание" },
        ]}
      />

      {activeTab === "doctors" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Поиск врачей по имени..."
              className="w-full max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Filter />
                Фильтры
              </Button>
            </div>
          </div>

          {isLoadingEmployees ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : employeesError ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-500">Ошибка при загрузке данных</p>
                <Button
                  onClick={() => refetchEmployees()}
                  variant="outline"
                  className="mt-2"
                >
                  Повторить
                </Button>
              </div>
            </div>
          ) : (
            <DataTable
              columns={employeeColumns}
              data={employees}
              pagination={{
                page,
                limit,
                total: employeesData?.meta?.total || 0,
              }}
            />
          )}
        </div>
      )}

    </div>
  );
}
