"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash, Stethoscope } from "lucide-react";
import {
  useGetServicesQuery,
  useDeleteServiceMutation,
} from "@/features/master-data/master-data-services.api";
import type { Service } from "@/features/master-data/master-data.types";
import { toast } from "sonner";
import PageHeader from "@/components/layouts/page-header";
import {
  DataTable,
  DataTableToolbar,
  DataTableEmptyState,
  DataTableErrorState,
} from "@/components/data-table";
import { serviceColumns } from "@/features/master-data/components/services/service-columns";
import { ServiceForm } from "@/features/master-data/components/services/service-form";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { useDialog } from "@/lib/dialog-manager";
import { useConfirmDialog } from "@/components/dialogs";

export default function ServicesPage() {
  const confirm = useConfirmDialog();
  const serviceFormDialog = useDialog(ServiceForm);

  // DataTable state management with built-in debounce
  const { queryParams, handlers, values } = useDataTableState({
    defaultLimit: 10,
    defaultSorting: [{ id: "createdAt", desc: true }],
    sortFormat: "split",
    searchDebounceMs: 500,
  });

  // Fetch services with managed state
  const {
    data: servicesResponse,
    isLoading,
    error,
    refetch,
  } = useGetServicesQuery(queryParams);

  const [deleteService] = useDeleteServiceMutation();

  const services = servicesResponse?.data || [];
  const totalServices = servicesResponse?.meta?.total || 0;

  // Handlers wrapped in useCallback
  const handleCreate = useCallback(() => {
    serviceFormDialog.open({
      onSuccess: () => {
        refetch();
      },
    });
  }, [serviceFormDialog, refetch]);

  const handleEdit = useCallback(
    (service: Service) => {
      serviceFormDialog.open({
        service,
        onSuccess: () => {
          refetch();
        },
      });
    },
    [serviceFormDialog, refetch],
  );

  const handleDelete = useCallback(
    (service: Service) => {
      confirm({
        title: "Удалить услугу?",
        description: `Вы уверены, что хотите удалить услугу "${service.name}"? Это действие нельзя отменить.`,
        variant: "destructive",
        confirmText: "Удалить",
        onConfirm: async () => {
          try {
            await deleteService(service.id).unwrap();
            toast.success("Услуга успешно удалена");
            refetch();
          } catch (error: any) {
            console.error("Error deleting service:", error);
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Ошибка при удалении услуги";
            toast.error(errorMessage);
          }
        },
      });
    },
    [confirm, deleteService, refetch],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Услуги"
        description="Управление медицинскими услугами"
        actions={
          <Button onClick={handleCreate}>
            <Plus />
            Добавить услугу
          </Button>
        }
      />

      <DataTable
        columns={[
          ...serviceColumns,
          {
            id: "actions",
            size: 100,
            cell: ({ row }) => {
              const service = row.original;

              return (
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(service)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(service)}
                  >
                    <Trash />
                  </Button>
                </div>
              );
            },
          },
        ]}
        data={services}
        isLoading={isLoading}
        pagination={{
          ...handlers.pagination,
          total: totalServices,
        }}
        sort={handlers.sorting}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchKey="name"
            searchPlaceholder="Поиск услуг..."
            searchValue={values.searchImmediate}
            onSearchChange={handlers.search.onChange}
          />
        )}
        emptyState={
          error ? (
            <DataTableErrorState
              title="Ошибка при загрузке услуг"
              error={error}
              onRetry={refetch}
            />
          ) : (
            <DataTableEmptyState
              title="Услуг пока нет"
              description="Добавьте первую услугу для начала работы"
              icon={Stethoscope}
              action={
                <Button onClick={handleCreate}>
                  <Plus />
                  Добавить услугу
                </Button>
              }
            />
          )
        }
      />
    </div>
  );
}
