/**
 * Form Builder Feature
 * 
 * Экспорт компонентов для работы с конструктором медицинских форм
 */

// Главные компоненты для трех режимов работы
export { FormBuilderEditor } from "./components/form-builder-editor";
export { FormBuilderInteractive } from "./components/form-builder-interactive";
export { FormBuilderView } from "./components/form-builder-view";

// Типы
export type {
  FieldType,
  FormField,
  FormSection,
  FormBuilderContent,
  FilledFormData,
  FormFieldValue,
  FilledProtocol,
  FieldConfig,
} from "./types/form-builder.types";

export { isFormBuilderContent } from "./types/form-builder.types";

// Утилиты
export {
  FIELD_CONFIGS,
  createNewSection,
  createNewField,
  createEmptyFormBuilderContent,
  validateFormBuilderContent,
  serializeFormBuilderContent,
  deserializeFormBuilderContent,
  getInitialFormData,
  formatJson,
  // Хелперы для манипуляций с контентом
  moveItem,
  updateSection,
  deleteSection,
  addFieldToSection,
  updateField,
  deleteField,
  moveSection,
  moveFieldInSection,
} from "./utils/form-builder.helpers";
