"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Loader2 } from "lucide-react";
import {
  useGetServiceTypesQuery,
  useDeleteServiceTypeMutation,
} from "@/features/master-data/master-data-service-types.api";
import { ServiceType } from "@/features/master-data/master-data.types";
import { toast } from "sonner";
import PageHeader from "@/components/layouts/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { createServiceTypeColumns } from "@/features/master-data/components/service-types/service-type-columns";
import { ServiceTypeForm } from "@/features/master-data/components/service-types/service-type-form";
import { useDebounce } from "@/hooks/use-debounce";

export default function ServiceTypesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingServiceType, setEditingServiceType] =
    useState<ServiceType | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // API hooks
  const {
    data: serviceTypesResponse,
    isLoading,
    error,
    refetch,
  } = useGetServiceTypesQuery({
    page,
    limit,
    search: debouncedSearchTerm || undefined,
  });

  const [deleteServiceType, { isLoading: isDeleting }] =
    useDeleteServiceTypeMutation();

  const serviceTypes = serviceTypesResponse?.data || [];
  const meta = serviceTypesResponse?.meta;

  // Handlers
  const handleCreate = () => {
    setEditingServiceType(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteServiceType(id).unwrap();
      toast.success("Тип услуги успешно удален");
      refetch();
    } catch (error) {
      toast.error("Ошибка при удалении типа услуги");
      console.error("Error deleting service type:", error);
    }
  };

  const handleEdit = (serviceType: ServiceType) => {
    setEditingServiceType(serviceType);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    refetch();
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingServiceType(null);
  };

  // Column definitions
  const serviceTypeColumns = createServiceTypeColumns(
    handleEdit,
    handleDelete,
    isDeleting,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Типы услуг"
        description="Управление типами медицинских услуг"
        backUrl="/cabinet/settings/master-data"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить тип услуги
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Поиск типов услуг..."
          className="w-full max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Фильтры
          </Button>
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500">Ошибка при загрузке данных</p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="mt-2"
            >
              Повторить
            </Button>
          </div>
        </div>
      ) : (
        <DataTable
          columns={serviceTypeColumns}
          data={serviceTypes}
          isLoading={isLoading}
          pagination={{
            page,
            limit,
            total: meta?.total || 0,
          }}
          emptyState="Типы услуг не найдены"
        />
      )}

      {/* Form Dialog */}
      <ServiceTypeForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        serviceType={editingServiceType}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
