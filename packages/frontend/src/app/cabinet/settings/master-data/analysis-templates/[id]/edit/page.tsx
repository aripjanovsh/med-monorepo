"use client";

import { use } from "react";

import { LayoutHeader } from "@/components/layouts/cabinet";
import { PageAnalysisTemplateForm } from "@/features/analysis-template";
import { url, ROUTES } from "@/constants/route.constants";

export default function EditAnalysisTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <LayoutHeader
        title="Редактировать шаблон анализа"
        backHref={url(ROUTES.ANALYSIS_TEMPLATE_DETAIL, { id })}
      />
      <PageAnalysisTemplateForm mode="edit" templateId={id} />
    </div>
  );
}
