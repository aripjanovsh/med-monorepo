"use client";

import { LayoutHeader } from "@/components/layouts/cabinet";
import { PageAnalysisTemplateForm } from "@/features/analysis-template";
import { ROUTES } from "@/constants/route.constants";

export default function CreateAnalysisTemplatePage() {
  return (
    <div className="space-y-6">
      <LayoutHeader
        title="Создать шаблон анализа"
        backHref={ROUTES.ANALYSIS_TEMPLATES}
      />
      <PageAnalysisTemplateForm mode="create" />
    </div>
  );
}
