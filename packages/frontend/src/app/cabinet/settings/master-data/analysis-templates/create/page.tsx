"use client";

import { LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageBreadcrumbs } from "@/components/layouts/page-breadcrumbs";
import { PageAnalysisTemplateForm } from "@/features/analysis-template";
import { ROUTES } from "@/constants/route.constants";

export default function CreateAnalysisTemplatePage() {
  return (
    <div className="space-y-6">
      <LayoutHeader
        backHref={ROUTES.ANALYSIS_TEMPLATES}
        backTitle="Шаблоны анализов"
      />
      <PageHeader
        title="Создать шаблон анализа"
        description="Создание нового шаблона лабораторного анализа"
      />
      <PageBreadcrumbs
        items={[
          { label: "Настройки", href: "/cabinet/settings" },
          { label: "Справочные данные", href: "/cabinet/settings/master-data" },
          { label: "Шаблоны анализов", href: ROUTES.ANALYSIS_TEMPLATES },
          { label: "Создать" },
        ]}
      />
      <PageAnalysisTemplateForm mode="create" />
    </div>
  );
}
