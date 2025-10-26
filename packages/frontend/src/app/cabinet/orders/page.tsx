"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import PageHeader from "@/components/layouts/page-header";
import { useDebounce } from "@/hooks/use-debounce";

import {
  useGetServiceOrdersQuery,
  useUpdateServiceOrderMutation,
  createServiceOrderColumns,
  ServiceOrderFiltersComponent,
  type ServiceOrderResponseDto,
} from "@/features/service-order";
import type { ServiceOrderFilters } from "@/features/service-order/components/service-order-filters";

export default function ServiceOrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [filters, setFilters] = useState<ServiceOrderFilters>({});
  
  const debouncedSearch = useDebounce(filters.search, 300);

  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit: pageSize,
    };

    if (filters.status) params.status = filters.status;
    if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
    if (filters.serviceType) params.serviceType = filters.serviceType;
    if (debouncedSearch) params.search = debouncedSearch;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom.toISOString();
    if (filters.dateTo) params.dateTo = filters.dateTo.toISOString();

    return params;
  }, [page, pageSize, filters.status, filters.paymentStatus, filters.serviceType, debouncedSearch, filters.dateFrom, filters.dateTo]);

  const { data, isLoading, refetch } = useGetServiceOrdersQuery(queryParams);

  const [updateServiceOrder] = useUpdateServiceOrderMutation();

  const handleView = (order: ServiceOrderResponseDto) => {
    router.push(`/cabinet/orders/${order.id}`);
  };

  const handleExecute = (order: ServiceOrderResponseDto) => {
    router.push(`/cabinet/orders/${order.id}/execute`);
  };

  const handleCancel = async (order: ServiceOrderResponseDto) => {
    if (!confirm(`Отменить назначение "${order.service.name}"?`)) return;

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
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  const columns = createServiceOrderColumns(handleView, handleCancel, handleExecute);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Назначения"
        description="Просмотр и управление назначениями услуг"
      />

      <ServiceOrderFiltersComponent
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pagination={{
          page,
          limit: pageSize,
          total: data?.meta?.total || 0,
          onChangePage: setPage,
          onChangeLimit: setPageSize,
        }}
      />
    </div>
  );
}
