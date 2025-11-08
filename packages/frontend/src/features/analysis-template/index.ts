// Types
export type {
  AnalysisTemplateResponseDto,
  CreateAnalysisTemplateRequestDto,
  UpdateAnalysisTemplateRequestDto,
  AnalysisTemplatesQueryParamsDto,
  AnalysisTemplatesListResponseDto,
  AnalysisParameterDto,
  ParameterTypeDto,
} from "./analysis-template.dto";

export type {
  AnalysisTemplateFormData,
  CreateAnalysisTemplateRequestData,
  UpdateAnalysisTemplateRequestData,
} from "./analysis-template.schema";

export type {
  AnalysisTemplateCategory,
  ParameterType,
  DemographicGroup,
} from "./analysis-template.constants";

// Schemas
export {
  analysisTemplateFormSchema,
  createAnalysisTemplateRequestSchema,
  updateAnalysisTemplateRequestSchema,
} from "./analysis-template.schema";

// Constants
export {
  ANALYSIS_TEMPLATE_CATEGORY_OPTIONS,
  PARAMETER_TYPE_OPTIONS,
  ANALYSIS_TEMPLATE_CATEGORY,
  PARAMETER_TYPE,
  DEMOGRAPHIC_GROUPS,
  DEMOGRAPHIC_GROUP_LABELS,
  PRESET_TEMPLATES,
} from "./analysis-template.constants";

// Model utilities
export {
  getParameterTypeLabel,
  getAnalysisTemplateDisplayName,
  hasReferenceRanges,
  formatReferenceRange,
  getRequiredParametersCount,
  getOptionalParametersCount,
} from "./analysis-template.model";

// API hooks
export {
  useGetAnalysisTemplatesQuery,
  useGetAnalysisTemplateQuery,
  useCreateAnalysisTemplateMutation,
  useUpdateAnalysisTemplateMutation,
  useDeleteAnalysisTemplateMutation,
} from "./analysis-template.api";

// Components
export { analysisTemplateColumns } from "./components/analysis-template-columns";
export { AnalysisTemplateForm } from "./components/analysis-template-form";
export { PageAnalysisTemplateForm } from "./components/page-analysis-template-form";
