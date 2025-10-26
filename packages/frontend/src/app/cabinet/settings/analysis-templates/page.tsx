"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/data-table/data-table";
import { useDebounce } from "@/hooks/use-debounce";

import {
  useGetAnalysisTemplatesQuery,
  useDeleteAnalysisTemplateMutation,
  createAnalysisTemplateColumns,
  ANALYSIS_TEMPLATE_CATEGORY_OPTIONS,
  type AnalysisTemplateResponseDto,
} from "@/features/analysis-template";

const CATEGORY_FILTER_OPTIONS = [
  { value: "ALL", label: "Все категории" },
  ...ANALYSIS_TEMPLATE_CATEGORY_OPTIONS,
];

export default function AnalysisTemplatesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  const queryParams = {
    search: debouncedSearch,
    category: selectedCategory === "ALL" ? undefined : (selectedCategory as any),
    page: 1,
    limit: 50,
  };

  const { data, isLoading, error, refetch } =
    useGetAnalysisTemplatesQuery(queryParams);

  const [deleteTemplate] = useDeleteAnalysisTemplateMutation();

  const handleView = (template: AnalysisTemplateResponseDto) => {
    router.push(`/cabinet/settings/analysis-templates/${template.id}`);
  };

  const handleEdit = (template: AnalysisTemplateResponseDto) => {
    router.push(`/cabinet/settings/analysis-templates/${template.id}/edit`);
  };

  const handleDelete = async (template: AnalysisTemplateResponseDto) => {
    if (!confirm(`Удалить шаблон "${template.name}"?`)) {
      return;
    }

    try {
      await deleteTemplate(template.id).unwrap();
      toast.success("Шаблон анализа успешно удален");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message ?? "Ошибка при удалении шаблона");
    }
  };

  const handleCreate = () => {
    router.push("/cabinet/settings/analysis-templates/create");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Шаблоны анализов</h1>
            <p className="text-muted-foreground">
              Управление шаблонами лабораторных анализов
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Шаблоны анализов</h1>
            <p className="text-muted-foreground">
              Управление шаблонами лабораторных анализов
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-destructive mb-4">Ошибка загрузки шаблонов</p>
              <Button onClick={() => refetch()}>Повторить</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const templates = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Шаблоны анализов</h1>
          <p className="text-muted-foreground">
            Управление шаблонами лабораторных анализов
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Создать шаблон
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию, коду или описанию..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
        </CardContent>
      </Card>

      {/* Data Table */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Шаблоны не найдены. Создайте первый шаблон анализа.
              </p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Создать шаблон
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={createAnalysisTemplateColumns(
            handleView,
            handleEdit,
            handleDelete
          )}
          data={templates}
        />
      )}
    </div>
  );
}
