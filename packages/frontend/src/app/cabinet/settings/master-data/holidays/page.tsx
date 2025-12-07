"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash, PartyPopper } from "lucide-react";
import {
  useGetHolidaysQuery,
  useDeleteHolidayMutation,
} from "@/features/master-data/master-data-holidays.api";
import type { Holiday } from "@/features/master-data/master-data.types";
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
import { holidayColumns } from "@/features/master-data/components/holidays/holiday-columns";
import { HolidayForm } from "@/features/master-data/components/holidays/holiday-form";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { useDialog } from "@/lib/dialog-manager";
import { useConfirmDialog } from "@/components/dialogs";

export default function HolidaysPage() {
  const confirm = useConfirmDialog();
  const holidayFormDialog = useDialog(HolidayForm);

  const { queryParams, handlers, values } = useDataTableState({
    defaultLimit: 20,
    defaultSorting: [{ id: "startsOn", desc: true }],
    sortFormat: "split",
    searchDebounceMs: 500,
  });

  const {
    data: holidaysResponse,
    isLoading,
    error,
    refetch,
  } = useGetHolidaysQuery(queryParams);

  const [deleteHoliday] = useDeleteHolidayMutation();

  const holidays = holidaysResponse?.data || [];
  const totalHolidays = holidaysResponse?.meta?.total || 0;

  const handleCreate = useCallback(() => {
    holidayFormDialog.open({
      onSuccess: () => {
        refetch();
      },
    });
  }, [holidayFormDialog, refetch]);

  const handleEdit = useCallback(
    (holiday: Holiday) => {
      holidayFormDialog.open({
        holiday,
        onSuccess: () => {
          refetch();
        },
      });
    },
    [holidayFormDialog, refetch]
  );

  const handleDelete = useCallback(
    (holiday: Holiday) => {
      confirm({
        title: "Удалить праздник?",
        description: `Вы уверены, что хотите удалить праздник "${holiday.name}"? Это действие нельзя отменить.`,
        variant: "destructive",
        confirmText: "Удалить",
        onConfirm: async () => {
          try {
            await deleteHoliday(holiday.id).unwrap();
            toast.success("Праздник успешно удалён");
            refetch();
          } catch (error: any) {
            console.error("Error deleting holiday:", error);
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Ошибка при удалении праздника";
            toast.error(errorMessage);
          }
        },
      });
    },
    [confirm, deleteHoliday, refetch]
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
              { label: "Праздники" },
            ]}
          />
        }
      />
      <CabinetContent className="space-y-6">
        <PageHeader
          title="Праздники"
          description="Управление праздничными и нерабочими днями"
          actions={
            <Button onClick={handleCreate}>
              <Plus />
              Добавить праздник
            </Button>
          }
        />

        <DataTable
          columns={[
            ...holidayColumns,
            {
              id: "actions",
              size: 100,
              cell: ({ row }) => {
                const holiday = row.original;

                return (
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(holiday)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(holiday)}
                    >
                      <Trash />
                    </Button>
                  </div>
                );
              },
            },
          ]}
          data={holidays}
          isLoading={isLoading}
          pagination={{
            ...handlers.pagination,
            total: totalHolidays,
          }}
          sort={handlers.sorting}
          toolbar={(table) => (
            <DataTableToolbar
              table={table}
              searchKey="name"
              searchPlaceholder="Поиск праздников..."
              searchValue={values.searchImmediate}
              onSearchChange={handlers.search.onChange}
            />
          )}
          emptyState={
            error ? (
              <DataTableErrorState
                title="Ошибка при загрузке праздников"
                error={error}
                onRetry={refetch}
              />
            ) : (
              <DataTableEmptyState
                title="Праздников пока нет"
                description="Добавьте первый праздник для начала работы"
                icon={PartyPopper}
                action={
                  <Button onClick={handleCreate}>
                    <Plus />
                    Добавить праздник
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
