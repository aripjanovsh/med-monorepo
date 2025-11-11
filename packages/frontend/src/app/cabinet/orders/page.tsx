"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, XCircle, Play } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DataTable,
  DataTableToolbar,
} from "@/components/data-table";
import PageHeader from "@/components/layouts/page-header";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { useConfirmDialog } from "@/components/dialogs";
import { ROUTES, url } from "@/constants/route.constants";
import {
  DepartmentFacetedSelectField,
} from "@/features/master-data/components";

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
import { ServiceTypeFacetedSelectField } from "@/features/service-order/components/service-type-faceted-select-field";

export default function ServiceOrdersPage() {
  const router = useRouter();
  const confirm = useConfirmDialog();

  // DataTable state management with built-in debounce
  const { queryParams, handlers, values } = useDataTableState({
    defaultLimit: 20,
    defaultSorting: [{ id: "createdAt", desc: true }],
    sortFormat: "split",
    searchDebounceMs: 300,
  });

  // Get filter values from columnFilters
  const statusFilter = values.columnFilters.find((f) => f.id === "status");
  const departmentFilter = values.columnFilters.find((f) => f.id === "departmentId");
  const paymentStatusFilter = values.columnFilters.find((f) => f.id === "paymentStatus");
  const serviceTypeFilter = values.columnFilters.find((f) => f.id === "serviceType");

  const selectedStatuses = (statusFilter?.value as OrderStatus[]) || [];
  const selectedDepartments = (departmentFilter?.value as string[]) || [];
  const selectedPaymentStatuses = (paymentStatusFilter?.value as string[]) || [];
  const selectedServiceTypes = (serviceTypeFilter?.value as string[]) || [];

  // Add filters to query params
  const finalQueryParams = useMemo(() => {
    const params: any = { ...queryParams };
    
    // Remove the filters object that useDataTableState adds
    delete params.filters;
    
    if (selectedStatuses.length > 0) {
      params.status = selectedStatuses.join(",");
    }
    if (selectedDepartments.length > 0) {
      params.departmentId = selectedDepartments.join(",");
    }
    if (selectedPaymentStatuses.length > 0) {
      params.paymentStatus = selectedPaymentStatuses.join(",");
    }
    if (selectedServiceTypes.length > 0) {
      params.serviceType = selectedServiceTypes.join(",");
    }

    return params;
  }, [queryParams, selectedStatuses, selectedDepartments, selectedPaymentStatuses, selectedServiceTypes]);

  const { data, isLoading, refetch } = useGetServiceOrdersQuery(finalQueryParams);

  const [updateServiceOrder] = useUpdateServiceOrderMutation();

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

  const handleDepartmentChange = useCallback(
    (value: string[] | undefined) => {
      const newFilters = values.columnFilters.filter((f) => f.id !== "departmentId");
      if (value && value.length > 0) {
        newFilters.push({ id: "departmentId", value });
      }
      handlers.filters.onChange(newFilters);
    },
    [values.columnFilters, handlers.filters]
  );

  const handlePaymentStatusChange = useCallback(
    (value: string[] | undefined) => {
      const newFilters = values.columnFilters.filter((f) => f.id !== "paymentStatus");
      if (value && value.length > 0) {
        newFilters.push({ id: "paymentStatus", value });
      }
      handlers.filters.onChange(newFilters);
    },
    [values.columnFilters, handlers.filters]
  );

  const handleServiceTypeChange = useCallback(
    (value: string[] | undefined) => {
      const newFilters = values.columnFilters.filter((f) => f.id !== "serviceType");
      if (value && value.length > 0) {
        newFilters.push({ id: "serviceType", value });
      }
      handlers.filters.onChange(newFilters);
    },
    [values.columnFilters, handlers.filters]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Назначения"
        description="Просмотр и управление назначениями услуг"
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
              const canExecute = order.status === "ORDERED" || order.status === "IN_PROGRESS";

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Открыть меню</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(url(ROUTES.ORDER_DETAIL, { id: order.id }))
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Просмотр
                    </DropdownMenuItem>
                    {canExecute && (
                      <DropdownMenuItem onClick={() => handleExecute(order)}>
                        <Play className="mr-2 h-4 w-4" />
                        Выполнить
                      </DropdownMenuItem>
                    )}
                    {canCancel && (
                      <DropdownMenuItem
                        onClick={() => handleCancel(order)}
                        className="text-destructive"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
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
            <StatusFacetedSelectField
              value={selectedStatuses}
              onChange={handleStatusChange}
            />
            <PaymentStatusFacetedSelectField
              value={selectedPaymentStatuses}
              onChange={handlePaymentStatusChange}
            />
            <ServiceTypeFacetedSelectField
              value={selectedServiceTypes}
              onChange={handleServiceTypeChange}
            />
            <DepartmentFacetedSelectField
              value={selectedDepartments}
              onChange={handleDepartmentChange}
            />
          </DataTableToolbar>
        )}
        onRowClick={(row) => {
          router.push(url(ROUTES.ORDER_DETAIL, { id: row.original.id }));
        }}
      />
    </div>
  );
}
