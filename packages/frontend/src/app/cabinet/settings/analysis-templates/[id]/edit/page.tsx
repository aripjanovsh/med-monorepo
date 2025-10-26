"use client";

import { use } from "react";

import { LayoutHeader } from "@/components/layouts/cabinet";
import { PageAnalysisTemplateForm } from "@/features/analysis-template";

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
        backHref={`/cabinet/settings/analysis-templates/${id}`}
      />
      <PageAnalysisTemplateForm mode="edit" templateId={id} />
    </div>
  );
}
