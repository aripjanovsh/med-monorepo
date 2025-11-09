"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { convertDtoToFormData } from "../utils/template.helpers";

import { useGetAnalysisTemplateQuery } from "../analysis-template.api";
import { AnalysisTemplateForm } from "./analysis-template-form";

type PageAnalysisTemplateFormProps = {
  mode: "create" | "edit";
  templateId?: string;
};

export const PageAnalysisTemplateForm = ({
  mode,
  templateId,
}: PageAnalysisTemplateFormProps) => {
  const router = useRouter();

  const {
    data: template,
    isLoading,
    error,
  } = useGetAnalysisTemplateQuery(templateId!, {
    skip: mode === "create" || !templateId,
  });

  const handleSuccess = () => {
    router.push("/cabinet/settings/analysis-templates");
  };

  const handleCancel = () => {
    router.push("/cabinet/settings/analysis-templates");
  };

  // Prepare initialData before any conditional returns (Rules of Hooks)
  const initialData = useMemo(
    () =>
      mode === "edit" && template
        ? convertDtoToFormData(template)
        : undefined,
    [mode, template]
  );

  if (mode === "edit" && isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (mode === "edit" && error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Ошибка загрузки шаблона анализа</p>
      </div>
    );
  }

  if (mode === "edit" && !template) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Шаблон анализа не найден</p>
      </div>
    );
  }

  return (
    <AnalysisTemplateForm
      mode={mode}
      initialData={initialData}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};
