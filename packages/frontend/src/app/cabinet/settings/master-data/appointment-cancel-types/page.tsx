"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash, Ban } from "lucide-react";
import {
  useGetAppointmentCancelTypesQuery,
  useDeleteAppointmentCancelTypeMutation,
} from "@/features/master-data/master-data-appointment-cancel-types.api";
import type { AppointmentCancelType } from "@/features/master-data/master-data.types";
import { toast } from "sonner";
import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageBreadcrumbs } from "@/components/layouts/page-breadcrumbs";
import {
  DataTable,
  DataTableToolbar,
  DataTableEmptyState,
  DataTableErrorState,
} from "@/components/data-table";
import { appointmentCancelTypeColumns } from "@/features/master-data/components/appointment-cancel-types/appointment-cancel-type-columns";
import { AppointmentCancelTypeForm } from "@/features/master-data/components/appointment-cancel-types/appointment-cancel-type-form";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { useDialog } from "@/lib/dialog-manager";
import { useConfirmDialog } from "@/components/dialogs";

export default function AppointmentCancelTypesPage() {
  const confirm = useConfirmDialog();
  const formDialog = useDialog(AppointmentCancelTypeForm);

  const { queryParams, handlers, values } = useDataTableState({
    defaultLimit: 20,
    defaultSorting: [{ id: "order", desc: false }],
    sortFormat: "split",
    searchDebounceMs: 500,
  });

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useGetAppointmentCancelTypesQuery(queryParams);

  const [deleteCancelType] = useDeleteAppointmentCancelTypeMutation();

  const items = response?.data || [];
  const total = response?.meta?.total || 0;

  const handleCreate = useCallback(() => {
    formDialog.open({
      onSuccess: () => {
        refetch();
      },
    });
  }, [formDialog, refetch]);

  const handleEdit = useCallback(
    (item: AppointmentCancelType) => {
      formDialog.open({
        appointmentCancelType: item,
        onSuccess: () => {
          refetch();
        },
      });
    },
    [formDialog, refetch]
  );

  const handleDelete = useCallback(
    (item: AppointmentCancelType) => {
      confirm({
        title: "Удалить причину отмены?",
        description: `Вы уверены, что хотите удалить причину "${item.name}"? Это действие нельзя отменить.`,
        variant: "destructive",
        confirmText: "Удалить",
        onConfirm: async () => {
          try {
            await deleteCancelType(item.id).unwrap();
            toast.success("Причина отмены успешно удалена");
            refetch();
          } catch (error: any) {
            console.error("Error deleting cancel type:", error);
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Ошибка при удалении причины отмены";
            toast.error(errorMessage);
          }
        },
      });
    },
    [confirm, deleteCancelType, refetch]
  );

  return (
    <>
      <LayoutHeader
        border
        left={
          <PageBreadcrumbs
            items={[
              { label: "Настройки", href: "/cabinet/settings" },
              {
                label: "Справочные данные",
                href: "/cabinet/settings/master-data",
              },
              { label: "Причины отмены" },
            ]}
          />
        }
      />
      <CabinetContent className="space-y-6">
        <PageHeader
          title="Причины отмены приёма"
          description="Управление причинами отмены записей на приём"
          actions={
            <Button onClick={handleCreate}>
              <Plus />
              Добавить причину
            </Button>
          }
        />

        <DataTable
          columns={[
            ...appointmentCancelTypeColumns,
            {
              id: "actions",
              size: 100,
              cell: ({ row }) => {
                const item = row.original;

                return (
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash />
                    </Button>
                  </div>
                );
              },
            },
          ]}
          data={items}
          isLoading={isLoading}
          pagination={{
            ...handlers.pagination,
            total,
          }}
          sort={handlers.sorting}
          toolbar={(table) => (
            <DataTableToolbar
              table={table}
              searchKey="name"
              searchPlaceholder="Поиск причин отмены..."
              searchValue={values.searchImmediate}
              onSearchChange={handlers.search.onChange}
            />
          )}
          emptyState={
            error ? (
              <DataTableErrorState
                title="Ошибка при загрузке причин отмены"
                error={error}
                onRetry={refetch}
              />
            ) : (
              <DataTableEmptyState
                title="Причин отмены пока нет"
                description="Добавьте первую причину отмены для начала работы"
                icon={Ban}
                action={
                  <Button onClick={handleCreate}>
                    <Plus />
                    Добавить причину
                  </Button>
                }
              />
            )
          }
        />
      </CabinetContent>
    </>
  );
}
