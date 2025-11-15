/**
 * Analysis Form Editor
 *
 * Компонент для редактирования структуры шаблона анализа.
 *
 * @example
 * ```tsx
 * <AnalysisFormEditor
 *   template={analysisTemplate}
 *   onChange={(template) => {
 *     // Сохранить обновленный шаблон
 *   }}
 * />
 * ```
 */

"use client";

import type { AnalysisTemplate } from "../types/analysis-form.types";
import { SectionsEditor } from "./internal/sections-editor";

type AnalysisFormEditorProps = {
  template: AnalysisTemplate;
  onChange: (template: AnalysisTemplate) => void;
};

export const AnalysisFormEditor = ({
  template,
  onChange,
}: AnalysisFormEditorProps) => {
  return (
    <SectionsEditor
      sections={template.sections}
      onSectionsChange={(sections) => onChange({ ...template, sections })}
    />
  );
};
