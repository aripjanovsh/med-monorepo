"use client";

import { use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";

import { LoadingState, ErrorState } from "@/components/states";
import { LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageBreadcrumbs } from "@/components/layouts/page-breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useGetAnalysisTemplateQuery,
  getParameterTypeLabel,
  formatReferenceRange,
  getTotalParametersCount,
  getRequiredParametersCount,
  getOptionalParametersCount,
  type AnalysisParameterDto,
  type AnalysisTemplateContentDto,
} from "@/features/analysis-template";
import { url, ROUTES } from "@/constants/route.constants";

export default function AnalysisTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const {
    data: template,
    isLoading,
    error,
    refetch,
  } = useGetAnalysisTemplateQuery(id);

  const handleEdit = useCallback(() => {
    router.push(url(ROUTES.ANALYSIS_TEMPLATE_EDIT, { id }));
  }, [router, id]);

  if (isLoading) {
    return <LoadingState title="Загрузка шаблона анализа..." />;
  }

  if (error || !template) {
    return (
      <ErrorState
        title="Шаблон анализа не найден"
        description="Возможно, шаблон был удален или у вас нет доступа к нему"
        onRetry={refetch}
        onBack={() => router.push(ROUTES.ANALYSIS_TEMPLATES)}
        backLabel="Вернуться к списку"
      />
    );
  }

  // Parse template content (supports both old and new formats)
  const getAllParameters = (): AnalysisParameterDto[] => {
    try {
      const data = JSON.parse(template.content);
      if (Array.isArray(data)) {
        // Old format
        return data;
      }
      // New format with sections
      return (data as AnalysisTemplateContentDto).sections.flatMap(
        (section) => section.parameters
      );
    } catch {
      return [];
    }
  };

  const allParameters = getAllParameters();
  const requiredParams = allParameters.filter((p) => p.isRequired);
  const optionalParams = allParameters.filter((p) => !p.isRequired);

  const totalCount = getTotalParametersCount(template);
  const requiredCount = getRequiredParametersCount(template);
  const optionalCount = getOptionalParametersCount(template);

  return (
    <div className="space-y-6">
      <LayoutHeader
        backHref={ROUTES.ANALYSIS_TEMPLATES}
        backTitle="Шаблоны анализов"
      />
      <PageHeader
        title={template.name}
        description={template.description || "Просмотр шаблона анализа"}
        actions={
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Редактировать
          </Button>
        }
      />
      <PageBreadcrumbs
        items={[
          { label: "Настройки", href: "/cabinet/settings" },
          { label: "Справочные данные", href: "/cabinet/settings/master-data" },
          { label: "Шаблоны анализов", href: ROUTES.ANALYSIS_TEMPLATES },
          { label: template.name },
        ]}
      />

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Код</p>
            <Badge variant="outline" className="mt-1">
              {template.code}
            </Badge>
          </div>
          {template.description && (
            <div>
              <p className="text-sm text-muted-foreground">Описание</p>
              <p className="mt-1">{template.description}</p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Всего параметров</p>
              <p className="text-2xl font-bold mt-1">{totalCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Обязательных</p>
              <p className="text-2xl font-bold mt-1">{requiredCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Опциональных</p>
              <p className="text-2xl font-bold mt-1">{optionalCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Показатели анализа</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Все ({totalCount})</TabsTrigger>
              <TabsTrigger value="required">
                Обязательные ({requiredCount})
              </TabsTrigger>
              <TabsTrigger value="optional">
                Опциональные ({optionalCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {allParameters.map((param) => (
                <ParameterCard key={param.id} parameter={param} />
              ))}
            </TabsContent>

            <TabsContent value="required" className="space-y-4 mt-4">
              {requiredParams.map((param) => (
                <ParameterCard key={param.id} parameter={param} />
              ))}
            </TabsContent>

            <TabsContent value="optional" className="space-y-4 mt-4">
              {optionalParams.map((param) => (
                <ParameterCard key={param.id} parameter={param} />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

const ParameterCard = ({ parameter }: { parameter: AnalysisParameterDto }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Parameter Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{parameter.name}</h4>
              {parameter.unit && (
                <Badge variant="outline" className="text-xs">
                  {parameter.unit}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {getParameterTypeLabel(parameter.type)}
              </Badge>
              {parameter.isRequired && (
                <Badge variant="destructive" className="text-xs">
                  Обязательно
                </Badge>
              )}
            </div>
          </div>

          {/* Reference Ranges */}
          {parameter.type === "NUMBER" && parameter.referenceRanges && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Референсные значения:</p>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(parameter.referenceRanges)
                  .filter(([key]) => key !== "default")
                  .map(([key, range]) => {
                    if (!range || (!range.min && !range.max)) return null;

                    const labels: Record<string, string> = {
                      men: "Мужчины",
                      women: "Женщины",
                      children: "Дети",
                    };

                    return (
                      <div key={key}>
                        <p className="text-xs text-muted-foreground">
                          {labels[key] || key}
                        </p>
                        <p className="text-sm">
                          {formatReferenceRange(
                            range.min,
                            range.max,
                            parameter.unit
                          )}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
