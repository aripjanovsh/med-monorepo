import type {
  AnalysisTemplateResponseDto,
  AnalysisParameterDto,
  ParameterTypeDto,
} from "./analysis-template.dto";
import { PARAMETER_TYPE_OPTIONS } from "./analysis-template.constants";

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
  template: AnalysisTemplateResponseDto
): string => {
  return `${template.name} (${template.code})`;
};

/**
 * Check if parameter has reference ranges defined
 */
export const hasReferenceRanges = (parameter: AnalysisParameterDto): boolean => {
  if (!parameter.referenceRanges) {
    return false;
  }

  const { men, women, children } = parameter.referenceRanges;

  return Boolean(
    (men?.min !== undefined || men?.max !== undefined) ||
    (women?.min !== undefined || women?.max !== undefined) ||
    (children?.min !== undefined || children?.max !== undefined)
  );
};

/**
 * Format reference range as string
 */
export const formatReferenceRange = (
  min?: number,
  max?: number,
  unit?: string
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
  template: AnalysisTemplateResponseDto
): number => {
  return template.parameters.filter((param) => param.isRequired).length;
};

/**
 * Get optional parameters count
 */
export const getOptionalParametersCount = (
  template: AnalysisTemplateResponseDto
): number => {
  return template.parameters.filter((param) => !param.isRequired).length;
};
