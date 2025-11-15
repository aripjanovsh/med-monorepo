import type {
  AnalysisTemplateResponseDto,
  AnalysisParameterDto,
  ParameterTypeDto,
  AnalysisTemplateContentDto,
} from "./analysis-template.dto";
import { PARAMETER_TYPE_OPTIONS } from "./analysis-template.constants";

/**
 * Получить все параметры из шаблона (поддержка обоих форматов)
 */
const getAllParameters = (content: string): AnalysisParameterDto[] => {
  try {
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      // Старый формат
      return data;
    }
    // Новый формат с секциями
    return (data as AnalysisTemplateContentDto).sections.flatMap(
      (section) => section.parameters,
    );
  } catch {
    return [];
  }
};

/**
 * Get display label for parameter type
 */
export const getParameterTypeLabel = (type: ParameterTypeDto): string => {
  const option = PARAMETER_TYPE_OPTIONS.find((opt) => opt.value === type);
  return option?.label ?? type;
};

/**
 * Get display name for analysis template
 */
export const getAnalysisTemplateDisplayName = (
  template: AnalysisTemplateResponseDto,
): string => {
  return `${template.name} (${template.code})`;
};

/**
 * Check if parameter has reference ranges defined
 */
export const hasReferenceRanges = (
  parameter: AnalysisParameterDto,
): boolean => {
  if (!parameter.referenceRanges) {
    return false;
  }

  const { men, women, children } = parameter.referenceRanges;

  return Boolean(
    men?.min !== undefined ||
      men?.max !== undefined ||
      women?.min !== undefined ||
      women?.max !== undefined ||
      children?.min !== undefined ||
      children?.max !== undefined,
  );
};

/**
 * Format reference range as string
 */
export const formatReferenceRange = (
  min?: number,
  max?: number,
  unit?: string,
): string => {
  const minStr = min !== undefined ? min.toString() : "—";
  const maxStr = max !== undefined ? max.toString() : "—";
  const unitStr = unit ? ` ${unit}` : "";

  return `${minStr} - ${maxStr}${unitStr}`;
};

/**
 * Get required parameters count
 */
export const getRequiredParametersCount = (
  template: AnalysisTemplateResponseDto,
): number => {
  const allParameters = getAllParameters(template.content);
  return allParameters.filter((param) => param.isRequired).length;
};

/**
 * Get optional parameters count
 */
export const getOptionalParametersCount = (
  template: AnalysisTemplateResponseDto,
): number => {
  const allParameters = getAllParameters(template.content);
  return allParameters.filter((param) => !param.isRequired).length;
};

/**
 * Get total parameters count
 */
export const getTotalParametersCount = (
  template: AnalysisTemplateResponseDto,
): number => {
  return getAllParameters(template.content).length;
};

/**
 * Format template content JSON for better readability
 */
export const formatTemplateContent = (content: string): string => {
  try {
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return content;
  }
};
