"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, XCircle, Play } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ActionTabs } from "@/components/action-tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, DataTableToolbar } from "@/components/data-table";
import PageHeader from "@/components/layouts/page-header";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { useConfirmDialog } from "@/components/dialogs";
import { ROUTES, url } from "@/constants/route.constants";

import {
  useGetServiceOrdersQuery,
  useUpdateServiceOrderMutation,
  serviceOrderColumns,
  canCancelOrder,
  type ServiceOrderResponseDto,
  type OrderStatus,
} from "@/features/service-order";
import { StatusFacetedSelectField } from "@/features/service-order/components/status-faceted-select-field";
import { PaymentStatusFacetedSelectField } from "@/features/service-order/components/payment-status-faceted-select-field";
import { useGetDepartmentsQuery } from "@/features/master-data/master-data-departments.api";
import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";
import { DateRangeFilter } from "@/components/ui/date-range-filter";

export const ServiceOrdersPage = () => {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const [activeTab, setActiveTab] = useState("all");

  // DataTable state management with built-in debounce
  const { queryParams, handlers, values } = useDataTableState({
    defaultLimit: 20,
    defaultSorting: [{ id: "createdAt", desc: true }],
    sortFormat: "split",
    searchDebounceMs: 300,
  });

  // Reset to first page when activeTab changes
  useEffect(() => {
    handlers.pagination.onChangePage(1);
  }, [activeTab, handlers.pagination.onChangePage]);

  // Get filter values from columnFilters
  const statusFilter = values.columnFilters.find((f) => f.id === "status");
  const paymentStatusFilter = values.columnFilters.find(
    (f) => f.id === "paymentStatus"
  );
  const serviceTypeFilter = values.columnFilters.find(
    (f) => f.id === "serviceType"
  );
  const dateFromFilter = values.columnFilters.find((f) => f.id === "dateFrom");
  const dateToFilter = values.columnFilters.find((f) => f.id === "dateTo");

  const selectedStatuses = (statusFilter?.value as OrderStatus[]) || [];
  const selectedPaymentStatuses =
    (paymentStatusFilter?.value as string[]) || [];
  const selectedServiceTypes = (serviceTypeFilter?.value as string[]) || [];
  const dateFrom = dateFromFilter?.value as string | undefined;
  const dateTo = dateToFilter?.value as string | undefined;

  // Add filters to query params
  const finalQueryParams = useMemo(() => {
    const params: any = { ...queryParams };

    // Remove the filters object that useDataTableState adds
    delete params.filters;

    // Add department filter from tab selection
    if (activeTab !== "all") {
      params.departmentId = activeTab;
    }

    if (selectedStatuses.length > 0) {
      params.status = selectedStatuses.join(",");
    }
    if (selectedPaymentStatuses.length > 0) {
      params.paymentStatus = selectedPaymentStatuses.join(",");
    }
    if (selectedServiceTypes.length > 0) {
      params.serviceType = selectedServiceTypes.join(",");
    }

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
    selectedPaymentStatuses,
    selectedServiceTypes,
    dateFrom,
    dateTo,
  ]);

  const { data, isLoading, refetch } =
    useGetServiceOrdersQuery(finalQueryParams);

  const [updateServiceOrder] = useUpdateServiceOrderMutation();

  // Fetch departments for tabs
  const { data: departmentsData } = useGetDepartmentsQuery({ limit: 100 });
  const departments = departmentsData?.data || [];

  // Create tab items
  const tabItems = useMemo(() => {
    const items = [{ value: "all", label: "Все" }];
    departments.forEach((dept) => {
      items.push({ value: dept.id, label: dept.name });
    });
    return items;
  }, [departments]);

  const handleExecute = useCallback(
    (order: ServiceOrderResponseDto) => {
      router.push(`/cabinet/orders/${order.id}/execute`);
    },
    [router]
  );

  const handleCancel = useCallback(
    (order: ServiceOrderResponseDto) => {
      confirm({
        title: "Отменить назначение?",
        description: `Вы уверены, что хотите отменить назначение "${order.service.name}"?`,
        variant: "destructive",
        confirmText: "Отменить",
        onConfirm: async () => {
          try {
            await updateServiceOrder({
              id: order.id,
              status: "CANCELLED",
            }).unwrap();
            toast.success("Назначение отменено");
            refetch();
          } catch (error: any) {
            toast.error(error?.data?.message || "Ошибка при отмене назначения");
          }
        },
      });
    },
    [confirm, updateServiceOrder, refetch]
  );

  // Handlers for filters
  const handleStatusChange = useCallback(
    (value: string[] | undefined) => {
      const newFilters = values.columnFilters.filter((f) => f.id !== "status");
      if (value && value.length > 0) {
        newFilters.push({ id: "status", value: value as OrderStatus[] });
      }
      handlers.filters.onChange(newFilters);
    },
    [values.columnFilters, handlers.filters]
  );

  const handlePaymentStatusChange = useCallback(
    (value: string[] | undefined) => {
      const newFilters = values.columnFilters.filter(
        (f) => f.id !== "paymentStatus"
      );
      if (value && value.length > 0) {
        newFilters.push({ id: "paymentStatus", value });
      }
      handlers.filters.onChange(newFilters);
    },
    [values.columnFilters, handlers.filters]
  );

  const handleServiceTypeChange = useCallback(
    (value: string[] | undefined) => {
      const newFilters = values.columnFilters.filter(
        (f) => f.id !== "serviceType"
      );
      if (value && value.length > 0) {
        newFilters.push({ id: "serviceType", value });
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

  return (
    <>
      <LayoutHeader title="Назначения" />
      <CabinetContent className="space-y-6">
        <ActionTabs
          value={activeTab}
          onValueChange={setActiveTab}
          items={tabItems}
        />

        <DataTable
          columns={[
            ...serviceOrderColumns,
            {
              id: "actions",
              header: "ДЕЙСТВИЯ",
              cell: ({ row }) => {
                const order = row.original;
                const canCancel = canCancelOrder(order);
                const canExecute =
                  order.status === "ORDERED" || order.status === "IN_PROGRESS";

                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <span className="sr-only">Открыть меню</span>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            url(ROUTES.ORDER_DETAIL, { id: order.id })
                          )
                        }
                      >
                        <Eye />
                        Просмотр
                      </DropdownMenuItem>
                      {canExecute && (
                        <DropdownMenuItem onClick={() => handleExecute(order)}>
                          <Play />
                          Выполнить
                        </DropdownMenuItem>
                      )}
                      {canCancel && (
                        <DropdownMenuItem
                          onClick={() => handleCancel(order)}
                          className="text-destructive"
                        >
                          <XCircle />
                          Отменить
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              },
            },
          ]}
          data={data?.data || []}
          isLoading={isLoading}
          pagination={{
            ...handlers.pagination,
            total: data?.meta?.total || 0,
          }}
          sort={handlers.sorting}
          toolbar={(table) => (
            <DataTableToolbar
              table={table}
              searchKey="search"
              searchPlaceholder="Поиск по услуге или пациенту..."
              searchValue={values.searchImmediate}
              onSearchChange={handlers.search.onChange}
            >
              <DateRangeFilter
                dateFrom={dateFrom}
                dateTo={dateTo}
                onChange={handleDateChange}
              />
              <StatusFacetedSelectField
                value={selectedStatuses}
                onChange={handleStatusChange}
              />
              <PaymentStatusFacetedSelectField
                value={selectedPaymentStatuses}
                onChange={handlePaymentStatusChange}
              />
            </DataTableToolbar>
          )}
          onRowClick={(row) => {
            router.push(url(ROUTES.ORDER_DETAIL, { id: row.original.id }));
          }}
        />
      </CabinetContent>
    </>
  );
};
