"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Pencil, Trash, Briefcase } from "lucide-react";
import {
  useGetTitlesQuery,
  useDeleteTitleMutation,
} from "@/features/master-data/master-data-titles.api";
import type { Title } from "@/features/master-data/master-data.types";
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
import { titleColumns } from "@/features/master-data/components/titles/title-columns";
import { TitleForm } from "@/features/master-data/components/titles/title-form";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { useDialog } from "@/lib/dialog-manager";
import { useConfirmDialog } from "@/components/dialogs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TitlesPage() {
  const confirm = useConfirmDialog();
  const titleFormDialog = useDialog(TitleForm);

  // DataTable state management with built-in debounce
  const { queryParams, handlers, values } = useDataTableState({
    defaultLimit: 10,
    defaultSorting: [{ id: "createdAt", desc: true }],
    sortFormat: "split",
    searchDebounceMs: 500,
  });

  // Fetch titles with managed state
  const {
    data: titlesResponse,
    isLoading,
    error,
    refetch,
  } = useGetTitlesQuery(queryParams);

  const [deleteTitle] = useDeleteTitleMutation();

  const titles = titlesResponse?.data || [];
  const totalTitles = titlesResponse?.meta?.total || 0;

  // Handlers wrapped in useCallback
  const handleCreate = useCallback(() => {
    titleFormDialog.open({
      onSuccess: () => {
        refetch();
      },
    });
  }, [titleFormDialog, refetch]);

  const handleEdit = useCallback(
    (title: Title) => {
      titleFormDialog.open({
        title,
        onSuccess: () => {
          refetch();
        },
      });
    },
    [titleFormDialog, refetch]
  );

  const handleDelete = useCallback(
    (title: Title) => {
      confirm({
        title: "Удалить должность?",
        description: `Вы уверены, что хотите удалить должность "${title.name}"? Это действие нельзя отменить.`,
        variant: "destructive",
        confirmText: "Удалить",
        onConfirm: async () => {
          try {
            await deleteTitle(title.id).unwrap();
            toast.success("Должность успешно удалена");
            refetch();
          } catch (error: any) {
            console.error("Error deleting title:", error);
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Ошибка при удалении должности";
            toast.error(errorMessage);
          }
        },
      });
    },
    [confirm, deleteTitle, refetch]
  );

  return (
    <div className="space-y-6">
      <LayoutHeader
        backHref="/cabinet/settings/master-data"
        backTitle="Справочные данные"
      />
      <PageHeader
        title="Должности"
        description="Управление должностями сотрудников"
        actions={
          <Button onClick={handleCreate}>
            <Plus />
            Добавить должность
          </Button>
        }
      />
      <PageBreadcrumbs
        items={[
          { label: "Настройки", href: "/cabinet/settings" },
          { label: "Справочные данные", href: "/cabinet/settings/master-data" },
          { label: "Должности" },
        ]}
      />

      <DataTable
        columns={[
          ...titleColumns,
          {
            id: "actions",
            size: 100,
            cell: ({ row }) => {
              const title = row.original;

              return (
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(title)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(title)}
                  >
                    <Trash />
                  </Button>
                </div>
              );
            },
          },
        ]}
        data={titles}
        isLoading={isLoading}
        pagination={{
          ...handlers.pagination,
          total: totalTitles,
        }}
        sort={handlers.sorting}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchKey="name"
            searchPlaceholder="Поиск должностей..."
            searchValue={values.searchImmediate}
            onSearchChange={handlers.search.onChange}
          />
        )}
        emptyState={
          error ? (
            <DataTableErrorState
              title="Ошибка при загрузке должностей"
              error={error}
              onRetry={refetch}
            />
          ) : (
            <DataTableEmptyState
              title="Должностей пока нет"
              description="Добавьте первую должность для начала работы"
              icon={Briefcase}
              action={
                <Button onClick={handleCreate}>
                  <Plus />
                  Добавить должность
                </Button>
              }
            />
          )
        }
      />
    </div>
  );
}
