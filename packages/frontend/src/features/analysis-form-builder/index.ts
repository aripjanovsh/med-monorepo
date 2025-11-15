/**
 * Analysis Form Builder Feature
 *
 * Экспорт компонентов для работы с шаблонами анализов и результатами
 */

// Главные компоненты для трех режимов работы
export { AnalysisFormEditor } from "./components/analysis-form-editor";
export { AnalysisFormInteractive } from "./components/analysis-form-interactive";
export { AnalysisFormView } from "./components/analysis-form-view";

// Типы
export type {
  ParameterType,
  ReferenceRange,
  ReferenceRanges,
  AnalysisParameter,
  AnalysisSection,
  AnalysisTemplate,
  AnalysisResultRow,
  FilledAnalysisData,
  SavedAnalysisData,
  PatientGender,
  ReferenceStatus,
} from "./types/analysis-form.types";

// Константы
export {
  PARAMETER_TYPE_OPTIONS,
  REFERENCE_RANGE_GROUP_LABELS,
  REFERENCE_RANGE_GROUP_SHORT_LABELS,
  DEFAULT_REFERENCE_RANGE_GROUPS,
} from "./constants/analysis-form.constants";

// Утилиты
export {
  createNewParameter,
  createNewSection,
  createEmptyAnalysisTemplate,
  formatReferenceRange,
  getSimpleRange,
  updateSimpleRange,
  formatRangePreview,
  getApplicableRange,
  getReferenceStatus,
  formatReferenceRangeDisplay,
  formatValue,
  hasReferenceRanges,
} from "./utils/analysis-form.helpers";

// Миграционные утилиты
export { normalizeAnalysisTemplate } from "./utils/migration.helpers";
