"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus, Eye, Edit, Trash } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DataTable,
  DataTableToolbar,
  DataTableEmptyState,
  DataTableErrorState,
} from "@/components/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type VisitResponseDto,
  visitColumns,
  useGetVisitsQuery,
  useDeleteVisitMutation,
  isVisitEditable,
} from "@/features/visit";
import { ROUTES, url } from "@/constants/route.constants";
import PageHeader from "@/components/layouts/page-header";
import { useConfirmDialog } from "@/components/dialogs";
import { useDataTableState } from "@/hooks/use-data-table-state";

export default function VisitsPage() {
  const router = useRouter();
  const confirm = useConfirmDialog();

  const { queryParams, handlers, values } = useDataTableState({
    defaultLimit: 10,
    defaultSorting: [{ id: "visitDate", desc: true }],
    sortFormat: "split",
  });

  const { data, isLoading, error, refetch } = useGetVisitsQuery(queryParams);
  const [deleteVisit] = useDeleteVisitMutation();

  const handleDeleteVisit = useCallback(
    async (visit: VisitResponseDto) => {
      confirm({
        title: "Удалить визит?",
        description: `Вы уверены, что хотите удалить визит? Это действие нельзя отменить.`,
        variant: "destructive",
        confirmText: "Удалить",
        onConfirm: async () => {
          try {
            await deleteVisit(visit.id).unwrap();
            toast.success("Визит успешно удален");
            refetch();
          } catch (error: any) {
            console.error("Error deleting visit:", error);
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Ошибка при удалении визита";
            toast.error(errorMessage);
          }
        },
      });
    },
    [confirm, deleteVisit, refetch],
  );

  const visits = data?.data || [];
  const total = data?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Визиты"
        description="Управление медицинскими визитами пациентов"
        actions={
          <Button asChild>
            <Link href={ROUTES.VISIT_CREATE}>
              <Plus />
              Начать прием
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={[
          ...visitColumns,
          {
            id: "actions",
            cell: ({ row }) => {
              const visit = row.original;
              const editable = isVisitEditable(visit);

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Открыть меню</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Действия</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(url(ROUTES.VISIT_DETAIL, { id: visit.id }))
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Просмотр
                    </DropdownMenuItem>
                    {editable && (
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(url(ROUTES.VISIT_EDIT, { id: visit.id }))
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Редактировать
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteVisit(visit)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            },
          },
        ]}
        data={visits}
        isLoading={isLoading}
        pagination={{
          ...handlers.pagination,
          total,
        }}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchKey="patient"
            searchPlaceholder="Поиск по пациенту..."
            searchValue={values.searchImmediate}
            onSearchChange={handlers.search.onChange}
          />
        )}
        emptyState={
          error ? (
            <DataTableErrorState
              title="Ошибка при загрузке визитов"
              error={error}
              onRetry={refetch}
            />
          ) : (
            <DataTableEmptyState
              title="Визиты не найдены"
              description="Попробуйте изменить параметры поиска"
            />
          )
        }
        onRowClick={(row) =>
          router.push(url(ROUTES.VISIT_DETAIL, { id: row.original.id }))
        }
      />
    </div>
  );
}
