"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash,
  ToggleLeft,
  ToggleRight,
  Languages,
} from "lucide-react";
import {
  useGetLanguagesQuery,
  useDeleteLanguageMutation,
  useToggleLanguageStatusMutation,
} from "@/features/master-data/master-data-languages.api";
import type { Language } from "@/features/master-data/master-data.types";
import { toast } from "sonner";
import { LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageBreadcrumbs } from "@/components/layouts/page-breadcrumbs";
import {
  DataTable,
  DataTableToolbar,
  DataTableEmptyState,
  DataTableErrorState,
} from "@/components/data-table";
import { languageColumns } from "@/features/master-data/components/languages/language-columns";
import { LanguageForm } from "@/features/master-data/components/languages/language-form";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { useDialog } from "@/lib/dialog-manager";
import { useConfirmDialog } from "@/components/dialogs";

export default function LanguagesPage() {
  const confirm = useConfirmDialog();
  const languageFormDialog = useDialog(LanguageForm);

  // DataTable state management with built-in debounce
  const { queryParams, handlers, values } = useDataTableState({
    defaultLimit: 10,
    defaultSorting: [{ id: "createdAt", desc: true }],
    sortFormat: "split",
    searchDebounceMs: 500,
  });

  // Fetch languages with managed state
  const {
    data: languagesResponse,
    isLoading,
    error,
    refetch,
  } = useGetLanguagesQuery(queryParams);

  const [deleteLanguage] = useDeleteLanguageMutation();
  const [toggleLanguageStatus, { isLoading: isToggling }] =
    useToggleLanguageStatusMutation();

  const languages = languagesResponse?.data || [];
  const totalLanguages = languagesResponse?.meta?.total || 0;

  // Handlers wrapped in useCallback
  const handleCreate = useCallback(() => {
    languageFormDialog.open({
      onSuccess: () => {
        refetch();
      },
    });
  }, [languageFormDialog, refetch]);

  const handleEdit = useCallback(
    (language: Language) => {
      languageFormDialog.open({
        language,
        onSuccess: () => {
          refetch();
        },
      });
    },
    [languageFormDialog, refetch]
  );

  const handleToggleStatus = useCallback(
    async (language: Language) => {
      try {
        await toggleLanguageStatus(language.id).unwrap();
        toast.success("Статус языка успешно изменен");
        refetch();
      } catch (error: any) {
        console.error("Error toggling language status:", error);
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "Ошибка при изменении статуса языка";
        toast.error(errorMessage);
      }
    },
    [toggleLanguageStatus, refetch]
  );

  const handleDelete = useCallback(
    (language: Language) => {
      confirm({
        title: "Удалить язык?",
        description: `Вы уверены, что хотите удалить язык "${language.name}"? Это действие нельзя отменить.`,
        variant: "destructive",
        confirmText: "Удалить",
        onConfirm: async () => {
          try {
            await deleteLanguage(language.id).unwrap();
            toast.success("Язык успешно удален");
            refetch();
          } catch (error: any) {
            console.error("Error deleting language:", error);
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Ошибка при удалении языка";
            toast.error(errorMessage);
          }
        },
      });
    },
    [confirm, deleteLanguage, refetch]
  );

  return (
    <div className="space-y-6">
      <LayoutHeader
        backHref="/cabinet/settings/master-data"
        backTitle="Справочные данные"
      />
      <PageHeader
        title="Языки"
        description="Управление языками системы"
        actions={
          <Button onClick={handleCreate}>
            <Plus />
            Добавить язык
          </Button>
        }
      />
      <PageBreadcrumbs
        items={[
          { label: "Настройки", href: "/cabinet/settings" },
          { label: "Справочные данные", href: "/cabinet/settings/master-data" },
          { label: "Языки" },
        ]}
      />

      <DataTable
        columns={[
          ...languageColumns,
          {
            id: "actions",
            size: 140,
            cell: ({ row }) => {
              const language = row.original;

              return (
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(language)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleStatus(language)}
                    disabled={isToggling}
                    title={
                      language.isActive ? "Деактивировать" : "Активировать"
                    }
                  >
                    {language.isActive ? (
                      <ToggleRight className="text-green-600" />
                    ) : (
                      <ToggleLeft className="text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600"
                    onClick={() => handleDelete(language)}
                  >
                    <Trash />
                  </Button>
                </div>
              );
            },
          },
        ]}
        data={languages}
        isLoading={isLoading}
        pagination={{
          ...handlers.pagination,
          total: totalLanguages,
        }}
        sort={handlers.sorting}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchKey="name"
            searchPlaceholder="Поиск языков..."
            searchValue={values.searchImmediate}
            onSearchChange={handlers.search.onChange}
          />
        )}
        emptyState={
          error ? (
            <DataTableErrorState
              title="Ошибка при загрузке языков"
              error={error}
              onRetry={refetch}
            />
          ) : (
            <DataTableEmptyState
              title="Языков пока нет"
              description="Добавьте первый язык для начала работы"
              icon={Languages}
              action={
                <Button onClick={handleCreate}>
                  <Plus />
                  Добавить язык
                </Button>
              }
            />
          )
        }
      />
    </div>
  );
}
