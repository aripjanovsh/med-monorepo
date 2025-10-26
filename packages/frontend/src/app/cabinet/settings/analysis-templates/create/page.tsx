"use client";

import { LayoutHeader } from "@/components/layouts/cabinet";
import { PageAnalysisTemplateForm } from "@/features/analysis-template";

export default function CreateAnalysisTemplatePage() {
  return (
    <div className="space-y-6">
      <LayoutHeader
        title="Создать шаблон анализа"
        backHref="/cabinet/settings/analysis-templates"
      />
      <PageAnalysisTemplateForm mode="create" />
    </div>
  );
}
