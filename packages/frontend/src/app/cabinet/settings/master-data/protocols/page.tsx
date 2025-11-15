"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Pencil, Trash, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layouts/page-header";
import {
  DataTable,
  DataTableToolbar,
  DataTableEmptyState,
  DataTableErrorState,
} from "@/components/data-table";
import {
  useGetProtocolTemplatesQuery,
  useDeleteProtocolTemplateMutation,
  useUpdateProtocolTemplateMutation,
  protocolTemplateColumns,
} from "@/features/protocol-template";
import type { ProtocolTemplateResponseDto } from "@/features/protocol-template";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { useConfirmDialog } from "@/components/dialogs";
import { ROUTES, url } from "@/constants/route.constants";

export default function ProtocolsPage() {
  const router = useRouter();
  const confirm = useConfirmDialog();

  // DataTable state management with built-in debounce
  const { queryParams, handlers, values } = useDataTableState({
    defaultLimit: 10,
    defaultSorting: [{ id: "updatedAt", desc: true }],
    sortFormat: "split",
    searchDebounceMs: 500,
  });

  // Fetch protocols with managed state
  const { data, isLoading, error, refetch } =
    useGetProtocolTemplatesQuery(queryParams);

  const [deleteProtocol] = useDeleteProtocolTemplateMutation();
  const [updateProtocol, { isLoading: isToggling }] =
    useUpdateProtocolTemplateMutation();

  const protocols = data?.data ?? [];
  const totalProtocols = data?.meta?.total || 0;

  // Handlers wrapped in useCallback
  const handleCreate = useCallback(() => {
    router.push(ROUTES.PROTOCOL_TEMPLATE_CREATE);
  }, [router]);

  const handleEdit = useCallback(
    (protocol: ProtocolTemplateResponseDto) => {
      router.push(url(ROUTES.PROTOCOL_TEMPLATE_EDIT, { id: protocol.id }));
    },
    [router],
  );

  const handleDuplicate = useCallback(
    (protocol: ProtocolTemplateResponseDto) => {
      toast.info("Дублирование протоколов пока не реализовано");
    },
    [],
  );

  const handleToggleActive = useCallback(
    async (protocol: ProtocolTemplateResponseDto) => {
      try {
        await updateProtocol({
          id: protocol.id,
          data: { isActive: !protocol.isActive },
        }).unwrap();
        toast.success(
          protocol.isActive ? "Протокол деактивирован" : "Протокол активирован",
        );
        refetch();
      } catch (error: any) {
        console.error("Error toggling protocol status:", error);
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "Ошибка при изменении статуса";
        toast.error(errorMessage);
      }
    },
    [updateProtocol, refetch],
  );

  const handleDelete = useCallback(
    (protocol: ProtocolTemplateResponseDto) => {
      confirm({
        title: "Удалить протокол?",
        description: `Вы уверены, что хотите удалить протокол "${protocol.name}"? Это действие нельзя отменить.`,
        variant: "destructive",
        confirmText: "Удалить",
        onConfirm: async () => {
          try {
            const result = await deleteProtocol(protocol.id).unwrap();
            toast.success(result.message ?? "Протокол успешно удален");
            refetch();
          } catch (error: any) {
            console.error("Error deleting protocol:", error);
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Ошибка при удалении протокола";
            toast.error(errorMessage);
          }
        },
      });
    },
    [confirm, deleteProtocol, refetch],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Шаблоны протоколов"
        description="Управление шаблонами медицинских протоколов"
        actions={
          <Button onClick={handleCreate}>
            <Plus />
            Добавить протокол
          </Button>
        }
      />

      <DataTable
        columns={[
          ...protocolTemplateColumns,
          {
            id: "actions",
            size: 180,
            cell: ({ row }) => {
              const protocol = row.original;

              return (
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(protocol)}
                    title="Редактировать"
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDuplicate(protocol)}
                    title="Дублировать"
                  >
                    <Copy />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleActive(protocol)}
                    disabled={isToggling}
                    title={
                      protocol.isActive ? "Деактивировать" : "Активировать"
                    }
                  >
                    {protocol.isActive ? (
                      <EyeOff className="text-gray-400" />
                    ) : (
                      <Eye className="text-green-600" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600"
                    onClick={() => handleDelete(protocol)}
                    title="Удалить"
                  >
                    <Trash />
                  </Button>
                </div>
              );
            },
          },
        ]}
        data={protocols}
        isLoading={isLoading}
        pagination={{
          ...handlers.pagination,
          total: totalProtocols,
        }}
        sort={handlers.sorting}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchKey="name"
            searchPlaceholder="Поиск протоколов..."
            searchValue={values.searchImmediate}
            onSearchChange={handlers.search.onChange}
          />
        )}
        emptyState={
          error ? (
            <DataTableErrorState
              title="Ошибка при загрузке протоколов"
              error={error}
              onRetry={refetch}
            />
          ) : (
            <DataTableEmptyState
              title="Протоколов пока нет"
              description="Создайте первый шаблон протокола для начала работы"
              icon={FileText}
              action={
                <Button onClick={handleCreate}>
                  <Plus />
                  Создать протокол
                </Button>
              }
            />
          )
        }
        onRowClick={(row) => handleEdit(row.original)}
      />
    </div>
  );
}
