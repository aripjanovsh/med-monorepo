"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useGetAnalysisTemplatesQuery,
  useDeleteAnalysisTemplateMutation,
  analysisTemplateColumns,
  ANALYSIS_TEMPLATE_CATEGORY_OPTIONS,
  type AnalysisTemplateResponseDto,
} from "@/features/analysis-template";
import { url, ROUTES } from "@/constants/route.constants";
import { LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageBreadcrumbs } from "@/components/layouts/page-breadcrumbs";
import { useConfirmDialog } from "@/components/dialogs";
import { useDataTableState } from "@/hooks/use-data-table-state";

const CATEGORY_FILTER_OPTIONS = [
  { value: "ALL", label: "Все категории" },
  ...ANALYSIS_TEMPLATE_CATEGORY_OPTIONS,
];

export default function AnalysisTemplatesPage() {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const { queryParams, handlers, setters, values } = useDataTableState({
    defaultLimit: 50,
    defaultSorting: [{ id: "name", desc: false }],
    searchDebounceMs: 300,
  });

  // Reset to first page when category changes
  useEffect(() => {
    setters.setPage(1);
  }, [selectedCategory, setters]);

  // Add category filter to query params
  const finalQueryParams = useMemo(() => {
    const category = selectedCategory === "ALL" ? undefined : selectedCategory;
    return {
      ...queryParams,
      ...(category && { category }),
    };
  }, [queryParams, selectedCategory]);

  const {
    data: templatesData,
    isLoading,
    error,
    refetch,
  } = useGetAnalysisTemplatesQuery(finalQueryParams);

  const [deleteTemplate] = useDeleteAnalysisTemplateMutation();

  const handleEdit = useCallback(
    (template: AnalysisTemplateResponseDto) => {
      router.push(url(ROUTES.ANALYSIS_TEMPLATE_EDIT, { id: template.id }));
    },
    [router]
  );

  const handleDelete = useCallback(
    async (template: AnalysisTemplateResponseDto) => {
      confirm({
        title: "Удалить шаблон?",
        description: `Вы уверены, что хотите удалить шаблон "${template.name}"? Это действие нельзя отменить.`,
        variant: "destructive",
        confirmText: "Удалить",
        onConfirm: async () => {
          try {
            await deleteTemplate(template.id).unwrap();
            toast.success("Шаблон анализа успешно удален");
            refetch();
          } catch (error: any) {
            console.error("Error deleting template:", error);
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Ошибка при удалении шаблона";
            toast.error(errorMessage);
          }
        },
      });
    },
    [confirm, deleteTemplate, refetch]
  );

  const templates = templatesData?.data || [];
  const totalTemplates = templatesData?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <LayoutHeader
        backHref="/cabinet/settings/master-data"
        backTitle="Справочные данные"
      />
      <PageHeader
        title="Шаблоны анализов"
        description="Управление шаблонами лабораторных анализов"
        actions={
          <Button asChild>
            <Link href={ROUTES.ANALYSIS_TEMPLATE_CREATE}>
              <Plus />
              Создать шаблон
            </Link>
          </Button>
        }
      />
      <PageBreadcrumbs
        items={[
          { label: "Настройки", href: "/cabinet/settings" },
          { label: "Справочные данные", href: "/cabinet/settings/master-data" },
          { label: "Шаблоны анализов" },
        ]}
      />

      <DataTable
        columns={[
          ...analysisTemplateColumns,
          {
            id: "actions",
            cell: ({ row }) => {
              const template = row.original;

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
                    <DropdownMenuItem onClick={() => handleEdit(template)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Редактировать
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(template)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            },
          },
        ]}
        data={templates}
        isLoading={isLoading}
        pagination={{
          ...handlers.pagination,
          total: totalTemplates,
        }}
        sort={handlers.sorting}
        toolbar={(table) => (
          <div className="flex gap-4">
            <div className="flex-1">
              <DataTableToolbar
                table={table}
                searchKey="name"
                searchPlaceholder="Поиск по названию, коду или описанию..."
                searchValue={values.searchImmediate}
                onSearchChange={handlers.search.onChange}
              />
            </div>
            <div className="w-48">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_FILTER_OPTIONS.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        emptyState={
          error ? (
            <DataTableErrorState
              title="Ошибка при загрузке шаблонов"
              error={error}
              onRetry={refetch}
            />
          ) : (
            <DataTableEmptyState
              title="Шаблоны не найдены"
              description="Попробуйте изменить параметры поиска или создайте первый шаблон анализа"
            />
          )
        }
        onRowClick={(row) => {
          router.push(
            url(ROUTES.ANALYSIS_TEMPLATE_DETAIL, { id: row.original.id })
          );
        }}
      />
    </div>
  );
}
