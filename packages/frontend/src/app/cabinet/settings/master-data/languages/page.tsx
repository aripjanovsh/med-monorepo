"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Loader2, Languages } from "lucide-react";
import {
  useGetLanguagesQuery,
  useDeleteLanguageMutation,
  useToggleLanguageStatusMutation,
} from "@/features/master-data/master-data-languages.api";
import { Language } from "@/features/master-data/master-data.types";
import { toast } from "sonner";
import PageHeader from "@/components/layouts/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { createLanguageColumns } from "@/features/master-data/components/languages/language-columns";
import { LanguageForm } from "@/features/master-data/components/languages/language-form";
import { useDebounce } from "@/hooks/use-debounce";

export default function LanguagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // API hooks
  const {
    data: languagesResponse,
    isLoading,
    error,
    refetch,
  } = useGetLanguagesQuery({
    page,
    limit,
    search: debouncedSearchTerm || undefined,
  });

  const [deleteLanguage, { isLoading: isDeleting }] = useDeleteLanguageMutation();
  const [toggleLanguageStatus, { isLoading: isToggling }] = useToggleLanguageStatusMutation();

  const languages = languagesResponse?.data || [];
  const meta = languagesResponse?.meta;

  // Handlers
  const handleCreate = () => {
    setEditingLanguage(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLanguage(id).unwrap();
      toast.success("Язык успешно удален");
      refetch();
    } catch (error) {
      toast.error("Ошибка при удалении языка");
      console.error("Error deleting language:", error);
    }
  };

  const handleEdit = (language: Language) => {
    setEditingLanguage(language);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleLanguageStatus(id).unwrap();
      toast.success("Статус языка успешно изменен");
      refetch();
    } catch (error) {
      toast.error("Ошибка при изменении статуса языка");
      console.error("Error toggling language status:", error);
    }
  };

  const handleFormSuccess = () => {
    refetch();
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingLanguage(null);
  };

  // Column definitions
  const languageColumns = createLanguageColumns(
    handleEdit,
    handleDelete,
    handleToggleStatus,
    isDeleting,
    isToggling
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Языки"
        description="Управление языками системы"
        backUrl="/cabinet/settings/master-data"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить язык
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Поиск языков..."
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
          columns={languageColumns}
          data={languages}
          isLoading={isLoading}
          pagination={{
            page,
            limit,
            total: meta?.total || 0,
          }}
          emptyState="Языки не найдены"
        />
      )}

      {/* Form Dialog */}
      <LanguageForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        language={editingLanguage}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
