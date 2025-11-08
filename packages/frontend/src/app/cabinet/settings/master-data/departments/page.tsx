"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash, Building2 } from "lucide-react";
import {
  useGetDepartmentsQuery,
  useDeleteDepartmentMutation,
} from "@/features/master-data/master-data-departments.api";
import type { Department } from "@/features/master-data/master-data.types";
import { toast } from "sonner";
import PageHeader from "@/components/layouts/page-header";
import {
  DataTable,
  DataTableToolbar,
  DataTableEmptyState,
  DataTableErrorState,
} from "@/components/data-table";
import { departmentColumns } from "@/features/master-data/components/departments/department-columns";
import { DepartmentForm } from "@/features/master-data/components/departments/department-form";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { useDialog } from "@/lib/dialog-manager";
import { useConfirmDialog } from "@/components/dialogs";

export default function DepartmentsPage() {
  const confirm = useConfirmDialog();
  const departmentFormDialog = useDialog(DepartmentForm);

  // DataTable state management with built-in debounce
  const { queryParams, handlers, values } = useDataTableState({
    defaultLimit: 10,
    defaultSorting: [{ id: "createdAt", desc: true }],
    sortFormat: "split",
    searchDebounceMs: 500,
  });

  // Fetch departments with managed state
  const {
    data: departmentsResponse,
    isLoading,
    error,
    refetch,
  } = useGetDepartmentsQuery(queryParams);

  const [deleteDepartment] = useDeleteDepartmentMutation();

  const departments = departmentsResponse?.data || [];
  const totalDepartments = departmentsResponse?.meta?.total || 0;

  // Handlers wrapped in useCallback
  const handleCreate = useCallback(() => {
    departmentFormDialog.open({
      onSuccess: () => {
        refetch();
      },
    });
  }, [departmentFormDialog, refetch]);

  const handleEdit = useCallback(
    (department: Department) => {
      departmentFormDialog.open({
        department,
        onSuccess: () => {
          refetch();
        },
      });
    },
    [departmentFormDialog, refetch]
  );

  const handleDelete = useCallback(
    (department: Department) => {
      confirm({
        title: "Удалить отделение?",
        description: `Вы уверены, что хотите удалить отделение "${department.name}"? Это действие нельзя отменить.`,
        variant: "destructive",
        confirmText: "Удалить",
        onConfirm: async () => {
          try {
            await deleteDepartment(department.id).unwrap();
            toast.success("Отделение успешно удалено");
            refetch();
          } catch (error: any) {
            console.error("Error deleting department:", error);
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Ошибка при удалении отделения";
            toast.error(errorMessage);
          }
        },
      });
    },
    [confirm, deleteDepartment, refetch]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Отделения"
        description="Управление отделениями медицинской организации"
        actions={
          <Button onClick={handleCreate}>
            <Plus />
            Добавить отделение
          </Button>
        }
      />

      <DataTable
        columns={[
          ...departmentColumns,
          {
            id: "actions",
            size: 100,
            cell: ({ row }) => {
              const department = row.original;

              return (
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(department)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(department)}
                  >
                    <Trash />
                  </Button>
                </div>
              );
            },
          },
        ]}
        data={departments}
        isLoading={isLoading}
        pagination={{
          ...handlers.pagination,
          total: totalDepartments,
        }}
        sort={handlers.sorting}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchKey="name"
            searchPlaceholder="Поиск отделений..."
            searchValue={values.searchImmediate}
            onSearchChange={handlers.search.onChange}
          />
        )}
        emptyState={
          error ? (
            <DataTableErrorState
              title="Ошибка при загрузке отделений"
              error={error}
              onRetry={refetch}
            />
          ) : (
            <DataTableEmptyState
              title="Отделений пока нет"
              description="Добавьте первое отделение для начала работы"
              icon={Building2}
              action={
                <Button onClick={handleCreate}>
                  <Plus />
                  Добавить отделение
                </Button>
              }
            />
          )
        }
      />
    </div>
  );
}
