"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash, Palmtree } from "lucide-react";
import {
  useGetLeaveTypesQuery,
  useDeleteLeaveTypeMutation,
} from "@/features/master-data/master-data-leave-types.api";
import type { LeaveType } from "@/features/master-data/master-data.types";
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
import { leaveTypeColumns } from "@/features/master-data/components/leave-types/leave-type-columns";
import { LeaveTypeForm } from "@/features/master-data/components/leave-types/leave-type-form";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { useDialog } from "@/lib/dialog-manager";
import { useConfirmDialog } from "@/components/dialogs";

export default function LeaveTypesPage() {
  const confirm = useConfirmDialog();
  const leaveTypeFormDialog = useDialog(LeaveTypeForm);

  const { queryParams, handlers, values } = useDataTableState({
    defaultLimit: 20,
    defaultSorting: [{ id: "order", desc: false }],
    sortFormat: "split",
    searchDebounceMs: 500,
  });

  const {
    data: leaveTypesResponse,
    isLoading,
    error,
    refetch,
  } = useGetLeaveTypesQuery(queryParams);

  const [deleteLeaveType] = useDeleteLeaveTypeMutation();

  const leaveTypes = leaveTypesResponse?.data || [];
  const totalLeaveTypes = leaveTypesResponse?.meta?.total || 0;

  const handleCreate = useCallback(() => {
    leaveTypeFormDialog.open({
      onSuccess: () => {
        refetch();
      },
    });
  }, [leaveTypeFormDialog, refetch]);

  const handleEdit = useCallback(
    (leaveType: LeaveType) => {
      leaveTypeFormDialog.open({
        leaveType,
        onSuccess: () => {
          refetch();
        },
      });
    },
    [leaveTypeFormDialog, refetch]
  );

  const handleDelete = useCallback(
    (leaveType: LeaveType) => {
      confirm({
        title: "Удалить тип отпуска?",
        description: `Вы уверены, что хотите удалить тип отпуска "${leaveType.name}"? Это действие нельзя отменить.`,
        variant: "destructive",
        confirmText: "Удалить",
        onConfirm: async () => {
          try {
            await deleteLeaveType(leaveType.id).unwrap();
            toast.success("Тип отпуска успешно удалён");
            refetch();
          } catch (error: any) {
            console.error("Error deleting leave type:", error);
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Ошибка при удалении типа отпуска";
            toast.error(errorMessage);
          }
        },
      });
    },
    [confirm, deleteLeaveType, refetch]
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
              { label: "Типы отпусков" },
            ]}
          />
        }
      />
      <CabinetContent className="space-y-6">
        <PageHeader
          title="Типы отпусков"
          description="Управление типами отпусков и отсутствий сотрудников"
          actions={
            <Button onClick={handleCreate}>
              <Plus />
              Добавить тип отпуска
            </Button>
          }
        />

        <DataTable
          columns={[
            ...leaveTypeColumns,
            {
              id: "actions",
              size: 100,
              cell: ({ row }) => {
                const leaveType = row.original;

                return (
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(leaveType)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(leaveType)}
                    >
                      <Trash />
                    </Button>
                  </div>
                );
              },
            },
          ]}
          data={leaveTypes}
          isLoading={isLoading}
          pagination={{
            ...handlers.pagination,
            total: totalLeaveTypes,
          }}
          sort={handlers.sorting}
          toolbar={(table) => (
            <DataTableToolbar
              table={table}
              searchKey="name"
              searchPlaceholder="Поиск типов отпусков..."
              searchValue={values.searchImmediate}
              onSearchChange={handlers.search.onChange}
            />
          )}
          emptyState={
            error ? (
              <DataTableErrorState
                title="Ошибка при загрузке типов отпусков"
                error={error}
                onRetry={refetch}
              />
            ) : (
              <DataTableEmptyState
                title="Типов отпусков пока нет"
                description="Добавьте первый тип отпуска для начала работы"
                icon={Palmtree}
                action={
                  <Button onClick={handleCreate}>
                    <Plus />
                    Добавить тип отпуска
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
