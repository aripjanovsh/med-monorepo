"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus, UserCheck, UserX } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DataTable,
  DataTableToolbar,
  DataTableEmptyState,
  DataTableErrorState,
} from "@/components/data-table";
import { employeeColumns } from "@/features/employees/components/employee-columns";
import {
  type Employee,
  useGetEmployeesQuery,
  useDeleteEmployeeMutation,
} from "@/features/employees";
import { url, ROUTES } from "@/constants/route.constants";
import { ActionTabs } from "@/components/action-tabs";
import PageHeader from "@/components/layouts/page-header";
import { useConfirmDialog } from "@/components/dialogs";
import { useDataTableState } from "@/hooks/use-data-table-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function EmployeesPage() {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const [activeTab, setActiveTab] = useState("all");

  // DataTable state management with built-in debounce
  const { queryParams, handlers, setters, values } = useDataTableState({
    defaultLimit: 10,
    defaultSorting: [{ id: "firstName", desc: false }],
    sortFormat: "split",
    searchDebounceMs: 500,
  });

  // Map activeTab to role filter
  const getRoleFilter = (tab: string) => {
    switch (tab) {
      case "doctors":
        return "DOCTOR";
      case "nurses":
        return "NURSE";
      case "other":
        return "OTHER";
      default:
        return undefined;
    }
  };

  // Reset to first page when activeTab changes
  useEffect(() => {
    setters.setPage(1);
  }, [activeTab, setters]);

  // Add role filter to query params
  const finalQueryParams = useMemo(() => {
    const role = getRoleFilter(activeTab);
    return {
      ...queryParams,
      ...(role && { role }),
    };
  }, [queryParams, activeTab]);

  // Fetch employees with managed state
  const {
    data: employeesData,
    isLoading: isLoadingEmployees,
    error: employeesError,
    refetch: refetchEmployees,
  } = useGetEmployeesQuery(finalQueryParams);

  const [deleteEmployee] = useDeleteEmployeeMutation();

  const handleEditEmployee = useCallback(
    (employee: Employee) => {
      router.push(url(ROUTES.EMPLOYEE_EDIT, { id: employee.id }));
    },
    [router]
  );

  const handleViewEmployee = useCallback(
    (employee: Employee) => {
      router.push(url(ROUTES.EMPLOYEE_DETAIL, { id: employee.id }));
    },
    [router]
  );

  const handleDeleteEmployee = useCallback(
    async (employee: Employee) => {
      confirm({
        title: "Удалить сотрудника?",
        description: `Вы уверены, что хотите удалить сотрудника ${
          employee.firstName || employee.id
        }? Это действие нельзя отменить.`,
        variant: "destructive",
        confirmText: "Удалить",
        onConfirm: async () => {
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
        },
      });
    },
    [confirm, deleteEmployee, refetchEmployees]
  );

  const employees = employeesData?.data || [];
  const totalEmployees = employeesData?.meta?.total || 0;

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
          { value: "all", label: "Все сотрудники" },
          { value: "doctors", label: "Врачи" },
          { value: "nurses", label: "Медсестры" },
          { value: "other", label: "Прочие" },
        ]}
      />

      <DataTable
        columns={[
          ...employeeColumns,
          {
            id: "actions",
            cell: ({ row }) => {
              const employee = row.original;

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Действия</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => handleViewEmployee(employee)}
                    >
                      Просмотр профиля
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleEditEmployee(employee)}
                    >
                      Редактировать сотрудника
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteEmployee(employee)}
                    >
                      Удалить сотрудника
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            },
          },
        ]}
        data={employees}
        isLoading={isLoadingEmployees}
        pagination={{
          ...handlers.pagination,
          total: totalEmployees,
        }}
        sort={handlers.sorting}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchKey="firstName"
            searchPlaceholder="Поиск по имени..."
            searchValue={values.searchImmediate}
            onSearchChange={handlers.search.onChange}
          />
        )}
        emptyState={
          employeesError ? (
            <DataTableErrorState
              title="Ошибка при загрузке сотрудников"
              error={employeesError}
              onRetry={refetchEmployees}
            />
          ) : (
            <DataTableEmptyState
              title="Сотрудники не найдены"
              description="Попробуйте изменить параметры поиска или фильтры"
            />
          )
        }
        onRowClick={(row) => {
          router.push(url(ROUTES.EMPLOYEE_DETAIL, { id: row.original.id }));
        }}
      />
    </div>
  );
}
