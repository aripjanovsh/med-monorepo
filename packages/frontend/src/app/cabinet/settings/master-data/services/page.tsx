"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Loader2 } from "lucide-react";
import {
  useGetServicesQuery,
  useDeleteServiceMutation,
} from "@/features/master-data/master-data-services.api";
import { Service } from "@/features/master-data/master-data.types";
import { toast } from "sonner";
import PageHeader from "@/components/layouts/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { createServiceColumns } from "@/features/master-data/components/services/service-columns";
import { ServiceForm } from "@/features/master-data/components/services/service-form";
import { useDebounce } from "@/hooks/use-debounce";

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // API hooks
  const {
    data: servicesResponse,
    isLoading,
    error,
    refetch,
  } = useGetServicesQuery({
    page,
    limit,
    search: debouncedSearchTerm || undefined,
  });

  const [deleteService, { isLoading: isDeleting }] =
    useDeleteServiceMutation();

  const services = servicesResponse?.data || [];
  const meta = servicesResponse?.meta;

  // Handlers
  const handleCreate = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id).unwrap();
      toast.success("Услуга успешно удалена");
      refetch();
    } catch (error) {
      toast.error("Ошибка при удалении услуги");
      console.error("Error deleting service:", error);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    refetch();
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingService(null);
  };

  // Column definitions
  const serviceColumns = createServiceColumns(
    handleEdit,
    handleDelete,
    isDeleting
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Услуги"
        description="Управление медицинскими услугами"
        backUrl="/cabinet/settings/master-data"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить услугу
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Поиск услуг..."
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
          columns={serviceColumns}
          data={services}
          isLoading={isLoading}
          pagination={{
            page,
            limit,
            total: meta?.total || 0,
          }}
          emptyState="Услуги не найдены"
        />
      )}

      {/* Form Dialog */}
      <ServiceForm
        open={isFormOpen}
        onClose={handleFormClose}
        service={editingService}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
