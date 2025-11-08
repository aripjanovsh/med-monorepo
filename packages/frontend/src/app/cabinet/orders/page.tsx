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
import { DataTable } from "@/components/data-table/data-table";
import PageHeader from "@/components/layouts/page-header";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { useConfirmDialog } from "@/components/dialogs";
import { ROUTES, url } from "@/constants/route.constants";

import {
  useGetServiceOrdersQuery,
  useUpdateServiceOrderMutation,
  serviceOrderColumns,
  ServiceOrderFiltersComponent,
  canCancelOrder,
  type ServiceOrderResponseDto,
} from "@/features/service-order";
import type { ServiceOrderFilters } from "@/features/service-order/components/service-order-filters";

export default function ServiceOrdersPage() {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const [filters, setFilters] = useState<ServiceOrderFilters>({});

  const { queryParams, handlers } = useDataTableState({
    defaultLimit: 20,
    defaultSorting: [{ id: "createdAt", desc: true }],
    sortFormat: "split",
    searchDebounceMs: 300,
  });

  const finalQueryParams = useMemo(() => {
    const params: any = { ...queryParams };

    if (filters.status) params.status = filters.status;
    if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
    if (filters.serviceType) params.serviceType = filters.serviceType;
    if (filters.search) params.search = filters.search;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom.toISOString();
    if (filters.dateTo) params.dateTo = filters.dateTo.toISOString();

    return params;
  }, [queryParams, filters]);

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

  const handleResetFilters = useCallback(() => {
    setFilters({});
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Назначения"
        description="Просмотр и управление назначениями услуг"
      />

      <ServiceOrderFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onReset={handleResetFilters}
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
        onRowClick={(row) => {
          router.push(url(ROUTES.ORDER_DETAIL, { id: row.original.id }));
        }}
      />
    </div>
  );
}
