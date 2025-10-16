"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Loader2 } from "lucide-react";
import {
  useGetTitlesQuery,
  useDeleteTitleMutation,
} from "@/features/master-data/master-data-titles.api";
import { Title } from "@/features/master-data/master-data.types";
import { toast } from "sonner";
import PageHeader from "@/components/layouts/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { createTitleColumns } from "@/features/master-data/components/titles/title-columns";
import { TitleForm } from "@/features/master-data/components/titles/title-form";
import { useDebounce } from "@/hooks/use-debounce";

export default function TitlesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState<Title | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // API hooks
  const {
    data: titlesResponse,
    isLoading,
    error,
    refetch,
  } = useGetTitlesQuery({
    page,
    limit,
    search: debouncedSearchTerm || undefined,
  });

  const [deleteTitle, { isLoading: isDeleting }] = useDeleteTitleMutation();

  const titles = titlesResponse?.data || [];
  const meta = titlesResponse?.meta;

  // Handlers
  const handleCreate = () => {
    setEditingTitle(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTitle(id).unwrap();
      toast.success("Должность успешно удалена");
      refetch();
    } catch (error) {
      toast.error("Ошибка при удалении должности");
      console.error("Error deleting title:", error);
    }
  };

  const handleEdit = (title: Title) => {
    setEditingTitle(title);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    refetch();
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTitle(null);
  };

  // Column definitions
  const titleColumns = createTitleColumns(handleEdit, handleDelete, isDeleting);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Должности"
        description="Управление должностями сотрудников"
        backUrl="/cabinet/settings/master-data"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить должность
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Поиск должностей..."
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
          columns={titleColumns}
          data={titles}
          isLoading={isLoading}
          pagination={{
            page,
            limit,
            total: meta?.total || 0,
          }}
          emptyState="Должности не найдены"
        />
      )}

      {/* Form Dialog */}
      <TitleForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        title={editingTitle}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
