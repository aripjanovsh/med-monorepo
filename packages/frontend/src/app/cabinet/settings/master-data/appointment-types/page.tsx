"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash, Calendar } from "lucide-react";
import {
  useGetAppointmentTypesQuery,
  useDeleteAppointmentTypeMutation,
} from "@/features/master-data/master-data-appointment-types.api";
import type { AppointmentType } from "@/features/master-data/master-data.types";
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
import { appointmentTypeColumns } from "@/features/master-data/components/appointment-types/appointment-type-columns";
import { AppointmentTypeForm } from "@/features/master-data/components/appointment-types/appointment-type-form";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { useDialog } from "@/lib/dialog-manager";
import { useConfirmDialog } from "@/components/dialogs";

export default function AppointmentTypesPage() {
  const confirm = useConfirmDialog();
  const formDialog = useDialog(AppointmentTypeForm);

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
  } = useGetAppointmentTypesQuery(queryParams);

  const [deleteAppointmentType] = useDeleteAppointmentTypeMutation();

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
    (item: AppointmentType) => {
      formDialog.open({
        appointmentType: item,
        onSuccess: () => {
          refetch();
        },
      });
    },
    [formDialog, refetch]
  );

  const handleDelete = useCallback(
    (item: AppointmentType) => {
      confirm({
        title: "Удалить тип приёма?",
        description: `Вы уверены, что хотите удалить тип "${item.name}"? Это действие нельзя отменить.`,
        variant: "destructive",
        confirmText: "Удалить",
        onConfirm: async () => {
          try {
            await deleteAppointmentType(item.id).unwrap();
            toast.success("Тип приёма успешно удален");
            refetch();
          } catch (error: any) {
            console.error("Error deleting appointment type:", error);
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Ошибка при удалении типа приёма";
            toast.error(errorMessage);
          }
        },
      });
    },
    [confirm, deleteAppointmentType, refetch]
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
              { label: "Типы приёма" },
            ]}
          />
        }
      />
      <CabinetContent className="space-y-6">
        <PageHeader
          title="Типы приёма"
          description="Управление типами записи на приём"
          actions={
            <Button onClick={handleCreate}>
              <Plus />
              Добавить тип
            </Button>
          }
        />

        <DataTable
          columns={[
            ...appointmentTypeColumns,
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
              searchPlaceholder="Поиск типов приёма..."
              searchValue={values.searchImmediate}
              onSearchChange={handlers.search.onChange}
            />
          )}
          emptyState={
            error ? (
              <DataTableErrorState
                title="Ошибка при загрузке типов приёма"
                error={error}
                onRetry={refetch}
              />
            ) : (
              <DataTableEmptyState
                title="Типов приёма пока нет"
                description="Добавьте первый тип приёма для начала работы"
                icon={Calendar}
                action={
                  <Button onClick={handleCreate}>
                    <Plus />
                    Добавить тип
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
