"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Loader2 } from "lucide-react";
import {
  useGetDepartmentsQuery,
  useDeleteDepartmentMutation,
} from "@/features/master-data/master-data-departments.api";
import { Department } from "@/features/master-data/master-data.types";
import { toast } from "sonner";
import PageHeader from "@/components/layouts/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { createDepartmentColumns } from "@/features/master-data/components/departments/department-columns";
import { DepartmentForm } from "@/features/master-data/components/departments/department-form";
import { useDebounce } from "@/hooks/use-debounce";

export default function DepartmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // API hooks
  const {
    data: departmentsResponse,
    isLoading,
    error,
    refetch,
  } = useGetDepartmentsQuery({
    page,
    limit,
    search: debouncedSearchTerm || undefined,
  });

  const [deleteDepartment, { isLoading: isDeleting }] =
    useDeleteDepartmentMutation();

  const departments = departmentsResponse?.data || [];
  const meta = departmentsResponse?.meta;

  // Handlers
  const handleCreate = () => {
    setEditingDepartment(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDepartment(id).unwrap();
      toast.success("Отделение успешно удалено");
      refetch();
    } catch (error) {
      toast.error("Ошибка при удалении отделения");
      console.error("Error deleting department:", error);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    refetch();
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingDepartment(null);
  };

  // Column definitions
  const departmentColumns = createDepartmentColumns(
    handleEdit,
    handleDelete,
    isDeleting
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Отделения"
        description="Управление отделениями медицинской организации"
        backUrl="/cabinet/settings/master-data"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить отделение
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Поиск отделений..."
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
          columns={departmentColumns}
          data={departments}
          isLoading={isLoading}
          pagination={{
            page,
            limit,
            total: meta?.total || 0,
          }}
          emptyState="Отделения не найдены"
        />
      )}

      {/* Form Dialog */}
      <DepartmentForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        department={editingDepartment}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
