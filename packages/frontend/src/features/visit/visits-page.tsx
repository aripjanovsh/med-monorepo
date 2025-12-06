"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus, Eye, Trash } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DataTable,
  DataTableToolbar,
  DataTableEmptyState,
  DataTableErrorState,
} from "@/components/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type VisitResponseDto,
  type VisitStatus,
  visitColumns,
  useGetVisitsQuery,
  useDeleteVisitMutation,
  VisitFormDialog,
  VISIT_STATUS,
} from "@/features/visit";
import { useDialog } from "@/lib/dialog-manager";
import { ROUTES, url } from "@/constants/route.constants";
import { useConfirmDialog } from "@/components/dialogs";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { LayoutHeader, CabinetContent } from "@/components/layouts/cabinet";
import { ActionTabs } from "@/components/action-tabs";
import { VisitStatusFacetedSelectField } from "./components/visit-status-faceted-select-field";
import { EmployeeFacetedSelectField } from "./components/employee-faceted-select-field";
import { DateRangeFilter } from "@/components/ui/date-range-filter";

const STATUS_TABS = [
  { value: "all", label: "Все визиты" },
  { value: VISIT_STATUS.WAITING, label: "Ожидают" },
  { value: VISIT_STATUS.IN_PROGRESS, label: "В процессе" },
  { value: VISIT_STATUS.COMPLETED, label: "Завершены" },
  { value: VISIT_STATUS.CANCELED, label: "Отменены" },
];

export const VisitsPage = () => {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const visitDialog = useDialog(VisitFormDialog);
  const [activeTab, setActiveTab] = useState<string>("all");

  const { queryParams, handlers, setters, values } = useDataTableState({
    defaultLimit: 20,
    defaultSorting: [{ id: "visitDate", desc: true }],
    sortFormat: "split",
    searchDebounceMs: 300,
  });

  // Reset to first page when activeTab changes
  useEffect(() => {
    setters.setPage(1);
  }, [activeTab, setters]);

  // Get filter values from columnFilters
  const statusFilter = values.columnFilters.find((f) => f.id === "status");
  const employeeFilter = values.columnFilters.find(
    (f) => f.id === "employeeId"
  );
  const dateFromFilter = values.columnFilters.find((f) => f.id === "dateFrom");
  const dateToFilter = values.columnFilters.find((f) => f.id === "dateTo");

  const selectedStatuses = (statusFilter?.value as VisitStatus[]) || [];
  const selectedEmployees = (employeeFilter?.value as string[]) || [];
  const dateFrom = dateFromFilter?.value as string | undefined;
  const dateTo = dateToFilter?.value as string | undefined;

  // Build final query params with filters
  const finalQueryParams = useMemo(() => {
    const params: Record<string, unknown> = { ...queryParams };

    // Remove the filters object that useDataTableState adds
    delete params.filters;

    // Add status filter from tabs or faceted filter
    if (activeTab !== "all") {
      params.status = activeTab;
    } else if (selectedStatuses.length > 0) {
      params.status = selectedStatuses.join(",");
    }

    // Add employee filter
    if (selectedEmployees.length > 0) {
      params.employeeId = selectedEmployees.join(",");
    }

    // Add date filters
    if (dateFrom) {
      params.dateFrom = dateFrom;
    }
    if (dateTo) {
      params.dateTo = dateTo;
    }

    return params;
  }, [
    queryParams,
    activeTab,
    selectedStatuses,
    selectedEmployees,
    dateFrom,
    dateTo,
  ]);

  const { data, isLoading, error, refetch } =
    useGetVisitsQuery(finalQueryParams);
  const [deleteVisit] = useDeleteVisitMutation();

  // Filter handlers
  const handleStatusChange = useCallback(
    (value: string[]) => {
      const newFilters = values.columnFilters.filter((f) => f.id !== "status");
      if (value.length > 0) {
        newFilters.push({ id: "status", value });
      }
      handlers.filters.onChange(newFilters);
    },
    [values.columnFilters, handlers.filters]
  );

  const handleEmployeeChange = useCallback(
    (value: string[]) => {
      const newFilters = values.columnFilters.filter(
        (f) => f.id !== "employeeId"
      );
      if (value.length > 0) {
        newFilters.push({ id: "employeeId", value });
      }
      handlers.filters.onChange(newFilters);
    },
    [values.columnFilters, handlers.filters]
  );

  const handleDateChange = useCallback(
    (newDateFrom?: string, newDateTo?: string) => {
      const newFilters = values.columnFilters.filter(
        (f) => f.id !== "dateFrom" && f.id !== "dateTo"
      );
      if (newDateFrom) {
        newFilters.push({ id: "dateFrom", value: newDateFrom });
      }
      if (newDateTo) {
        newFilters.push({ id: "dateTo", value: newDateTo });
      }
      handlers.filters.onChange(newFilters);
    },
    [values.columnFilters, handlers.filters]
  );

  const handleDeleteVisit = useCallback(
    async (visit: VisitResponseDto) => {
      confirm({
        title: "Удалить визит?",
        description: `Вы уверены, что хотите удалить визит? Это действие нельзя отменить.`,
        variant: "destructive",
        confirmText: "Удалить",
        onConfirm: async () => {
          try {
            await deleteVisit(visit.id).unwrap();
            toast.success("Визит успешно удален");
            refetch();
          } catch (error: any) {
            console.error("Error deleting visit:", error);
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Ошибка при удалении визита";
            toast.error(errorMessage);
          }
        },
      });
    },
    [confirm, deleteVisit, refetch]
  );

  const visits = data?.data || [];
  const total = data?.meta?.total || 0;

  return (
    <>
      <LayoutHeader
        title="Визиты"
        right={
          <Button
            onClick={() =>
              visitDialog.open({
                mode: "create",
                onSuccess: refetch,
              })
            }
          >
            <Plus />
            Начать прием
          </Button>
        }
      />
      <CabinetContent className="space-y-6">
        <ActionTabs
          value={activeTab}
          onValueChange={setActiveTab}
          items={STATUS_TABS}
        />

        <DataTable
          columns={[
            ...visitColumns,
            {
              id: "actions",
              cell: ({ row }) => {
                const visit = row.original;

                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Открыть меню</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Действия</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            url(ROUTES.VISIT_DETAIL, { id: visit.id })
                          )
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Просмотр
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteVisit(visit)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              },
            },
          ]}
          data={visits}
          isLoading={isLoading}
          pagination={{
            ...handlers.pagination,
            total,
          }}
          sort={handlers.sorting}
          toolbar={(table) => (
            <DataTableToolbar
              table={table}
              searchKey="search"
              searchPlaceholder="Поиск по пациенту..."
              searchValue={values.searchImmediate}
              onSearchChange={handlers.search.onChange}
            >
              <DateRangeFilter
                dateFrom={dateFrom}
                dateTo={dateTo}
                onChange={handleDateChange}
              />
              <EmployeeFacetedSelectField
                value={selectedEmployees}
                onChange={handleEmployeeChange}
              />
              {activeTab === "all" && (
                <VisitStatusFacetedSelectField
                  value={selectedStatuses}
                  onChange={handleStatusChange}
                />
              )}
            </DataTableToolbar>
          )}
          emptyState={
            error ? (
              <DataTableErrorState
                title="Ошибка при загрузке визитов"
                error={error}
                onRetry={refetch}
              />
            ) : (
              <DataTableEmptyState
                title="Визиты не найдены"
                description="Попробуйте изменить параметры поиска"
              />
            )
          }
          onRowClick={(row) =>
            router.push(url(ROUTES.VISIT_DETAIL, { id: row.original.id }))
          }
        />
      </CabinetContent>
    </>
  );
};
