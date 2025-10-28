"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Edit } from "lucide-react";

import { LayoutHeader } from "@/components/layouts/cabinet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useGetAnalysisTemplateQuery,
  getParameterTypeLabel,
  formatReferenceRange,
  type AnalysisParameterDto,
} from "@/features/analysis-template";

export default function AnalysisTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: template, isLoading, error } = useGetAnalysisTemplateQuery(id);

  const handleEdit = () => {
    router.push(`/cabinet/settings/analysis-templates/${id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LayoutHeader
          title="Шаблон анализа"
          backHref="/cabinet/settings/analysis-templates"
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="space-y-6">
        <LayoutHeader
          title="Шаблон анализа"
          backHref="/cabinet/settings/analysis-templates"
        />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-destructive">Шаблон анализа не найден</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const requiredParams = template.parameters.filter((p) => p.isRequired);
  const optionalParams = template.parameters.filter((p) => !p.isRequired);

  return (
    <div className="space-y-6">
      {/* Header */}
      <LayoutHeader
        title={template.name}
        backHref="/cabinet/settings/analysis-templates"
        right={
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Редактировать
          </Button>
        }
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
              <p className="text-2xl font-bold mt-1">
                {template.parameters.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Обязательных</p>
              <p className="text-2xl font-bold mt-1">{requiredParams.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Опциональных</p>
              <p className="text-2xl font-bold mt-1">{optionalParams.length}</p>
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
              <TabsTrigger value="all">
                Все ({template.parameters.length})
              </TabsTrigger>
              <TabsTrigger value="required">
                Обязательные ({requiredParams.length})
              </TabsTrigger>
              <TabsTrigger value="optional">
                Опциональные ({optionalParams.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {template.parameters.map((param) => (
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
