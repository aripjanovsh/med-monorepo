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
  type EmployeeResponseDto,
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
import { TitleFacetedSelectField } from "@/features/master-data/components";
import { useGetDepartmentsQuery } from "@/features/master-data/master-data-departments.api";
import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";

const ALL_TAB_VALUE = "all";

export const EmployeesPage = () => {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const [activeTab, setActiveTab] = useState(ALL_TAB_VALUE);

  // Fetch departments for tabs
  const { data: departmentsData } = useGetDepartmentsQuery({
    limit: 100,
    isActive: true,
  });

  // DataTable state management with built-in debounce
  const { queryParams, handlers, setters, values } = useDataTableState({
    defaultLimit: 20,
    defaultSorting: [
      {
        desc: true,
        id: "createdAt",
      },
    ],
    sortFormat: "split",
    searchDebounceMs: 500,
  });

  // Get department filter from active tab
  const getDepartmentFilter = (tab: string): string | undefined => {
    if (tab === ALL_TAB_VALUE) return undefined;
    return tab;
  };

  // Get filter values from columnFilters
  const titleFilter = values.columnFilters.find((f) => f.id === "titleId");
  const selectedTitles = (titleFilter?.value as string[]) || [];

  // Build department tabs
  const departments = departmentsData?.data ?? [];
  const departmentTabs = [
    { value: ALL_TAB_VALUE, label: "Все сотрудники" },
    ...departments.map((dept) => ({
      value: dept.id,
      label: dept.name,
    })),
  ];

  // Reset to first page when activeTab changes
  useEffect(() => {
    setters.setPage(1);
  }, [activeTab, setters]);

  // Add department and title filters to query params
  const finalQueryParams = useMemo(() => {
    const departmentId = getDepartmentFilter(activeTab);
    return {
      ...queryParams,
      ...(departmentId && { departmentId }),
      ...(selectedTitles.length > 0 && {
        titleId: selectedTitles.join(","),
      }),
    };
  }, [queryParams, activeTab, selectedTitles]);

  // Fetch employees with managed state
  const {
    data: employeesData,
    isLoading: isLoadingEmployees,
    error: employeesError,
    refetch: refetchEmployees,
  } = useGetEmployeesQuery(finalQueryParams);

  const [deleteEmployee] = useDeleteEmployeeMutation();

  const handleEditEmployee = useCallback(
    (employee: EmployeeResponseDto) => {
      router.push(url(ROUTES.EMPLOYEE_EDIT, { id: employee.id }));
    },
    [router]
  );

  const handleViewEmployee = useCallback(
    (employee: EmployeeResponseDto) => {
      router.push(url(ROUTES.EMPLOYEE_DETAIL, { id: employee.id }));
    },
    [router]
  );

  const handleDeleteEmployee = useCallback(
    async (employee: EmployeeResponseDto) => {
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

  // Handlers for filters
  const handleTitleChange = useCallback(
    (value: string[]) => {
      const newFilters = values.columnFilters.filter((f) => f.id !== "titleId");
      if (value.length > 0) {
        newFilters.push({ id: "titleId", value });
      }
      handlers.filters.onChange(newFilters);
    },
    [values.columnFilters, handlers.filters]
  );

  return (
    <>
      <LayoutHeader
        title="Сотрудники"
        right={
          <Button asChild>
            <Link href={ROUTES.EMPLOYEE_CREATE}>
              <Plus />
              Добавить сотрудника
            </Link>
          </Button>
        }
      />
      <CabinetContent className="space-y-6">
        {/* <EmployeesQuickStats /> */}

        <ActionTabs
          value={activeTab}
          onValueChange={setActiveTab}
          items={departmentTabs}
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleViewEmployee(employee);
                        }}
                      >
                        Просмотр профиля
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEditEmployee(employee);
                        }}
                      >
                        Редактировать сотрудника
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteEmployee(employee);
                        }}
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
            >
              <TitleFacetedSelectField
                value={selectedTitles}
                onChange={handleTitleChange}
              />
            </DataTableToolbar>
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
      </CabinetContent>
    </>
  );
};
