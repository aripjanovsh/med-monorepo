"use client";

import { use } from "react";

import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageBreadcrumbs } from "@/components/layouts/page-breadcrumbs";
import { PageAnalysisTemplateForm } from "@/features/analysis-template";
import { url, ROUTES } from "@/constants/route.constants";

export default function EditAnalysisTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

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
              { label: "Шаблоны анализов", href: ROUTES.ANALYSIS_TEMPLATES },
              { label: "Редактировать" },
            ]}
          />
        }
      />
      <CabinetContent className="space-y-6">
        <PageHeader
          title="Редактировать шаблон анализа"
          description="Редактирование шаблона лабораторного анализа"
        />
        <PageAnalysisTemplateForm mode="edit" templateId={id} />
      </CabinetContent>
    </>
  );
}
