/**
 * Form Builder Types
 * Типы для конструктора медицинских форм
 */

/**
 * Типы полей формы
 */
export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "tags"
  | "date";

/**
 * Тип шаблона протокола
 */
export type TemplateType = "richtext" | "formbuilder";

/**
 * Базовое поле формы
 */
export type FormField = {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: string | boolean | string[] | number;
  required?: boolean;
  readonly?: boolean;
  width?: number; // процент ширины (например, 50)
  inline?: boolean; // расположение в строку
  options?: string[]; // для select, tags, radio
  visibleIf?: {
    // условие отображения
    fieldId: string;
    value: unknown;
  };
};

/**
 * Секция формы
 */
export type FormSection = {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
};

/**
 * Содержимое Form Builder протокола
 */
export type FormBuilderContent = {
  version: number;
  sections: FormSection[];
};

/**
 * Содержимое Rich Text протокола
 */
export type RichTextContent = {
  version?: number;
  content: string; // JSON string from editor
};

/**
 * Объединенный тип содержимого протокола
 */
export type ProtocolContent = FormBuilderContent | RichTextContent;

/**
 * Type guards для определения типа контента
 */
export const isFormBuilderContent = (
  content: unknown
): content is FormBuilderContent => {
  if (!content || typeof content !== "object") return false;
  const obj = content as Record<string, unknown>;
  return (
    typeof obj.version === "number" &&
    Array.isArray(obj.sections) &&
    obj.sections.every(
      (section: unknown) =>
        section !== null &&
        typeof section === "object" &&
        "id" in section &&
        "title" in section &&
        "fields" in section &&
        Array.isArray((section as FormSection).fields)
    )
  );
};

export const isRichTextContent = (
  content: unknown
): content is RichTextContent => {
  if (!content || typeof content !== "object") return false;
  const obj = content as Record<string, unknown>;
  return typeof obj.content === "string";
};

/**
 * Опции поля для select, radio, tags
 */
export type FieldOption = {
  value: string;
  label: string;
};

/**
 * Конфигурация поля для редактора
 */
export type FieldConfig = {
  type: FieldType;
  label: string;
  description?: string;
  icon?: string;
  defaultProps?: Partial<FormField>;
};

/**
 * Заполненные данные формы (для врача)
 */
export type FormFieldValue = string | boolean | string[] | number | null;

export type FilledFormData = Record<string, FormFieldValue>;
