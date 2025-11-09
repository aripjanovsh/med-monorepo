/**
 * Analysis Template Helpers
 * Вспомогательные функции для работы с шаблонами анализов
 */

import {
  normalizeAnalysisTemplate,
  type AnalysisTemplate,
} from "@/features/analysis-form-builder";
import type { AnalysisTemplateResponseDto } from "../analysis-template.dto";
import type { AnalysisTemplateFormData } from "../analysis-template.schema";

/**
 * Конвертировать DTO из API в данные формы
 * Автоматически мигрирует старый формат в новый
 */
export const convertDtoToFormData = (
  dto: AnalysisTemplateResponseDto
): AnalysisTemplateFormData => {
  // Парсим content (JSON string) и нормализуем формат
  const contentData = JSON.parse(dto.content);
  const template = normalizeAnalysisTemplate(contentData);

  return {
    id: dto.id,
    name: dto.name,
    code: dto.code,
    description: dto.description || "",
    template,
  };
};

/**
 * Конвертировать данные формы в DTO для API
 */
export const convertFormDataToDto = (
  formData: AnalysisTemplateFormData
): {
  name: string;
  code: string;
  description?: string;
  content: string;
} => {
  return {
    name: formData.name,
    code: formData.code,
    description: formData.description,
    content: JSON.stringify(formData.template),
  };
};
