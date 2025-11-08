import { nanoid } from "nanoid";
import type {
  FormField,
  FormSection,
  FormBuilderContent,
  FieldType,
  FieldConfig,
  FilledFormData,
} from "../types/form-builder.types";

/**
 * Конфигурация доступных типов полей
 */
export const FIELD_CONFIGS: Record<FieldType, FieldConfig> = {
  text: {
    type: "text",
    label: "Текстовое поле",
    description: "Однострочное текстовое поле",
    defaultProps: {
      type: "text",
      label: "Новое поле",
      placeholder: "Введите текст",
      required: false,
    },
  },
  textarea: {
    type: "textarea",
    label: "Текстовая область",
    description: "Многострочное текстовое поле",
    defaultProps: {
      type: "textarea",
      label: "Описание",
      placeholder: "Введите описание",
      required: false,
    },
  },
  number: {
    type: "number",
    label: "Числовое поле",
    description: "Поле для ввода чисел",
    defaultProps: {
      type: "number",
      label: "Число",
      placeholder: "Введите число",
      required: false,
    },
  },
  select: {
    type: "select",
    label: "Выпадающий список",
    description: "Список с выбором одного значения",
    defaultProps: {
      type: "select",
      label: "Выберите значение",
      options: ["Вариант 1", "Вариант 2", "Вариант 3"],
      required: false,
    },
  },
  radio: {
    type: "radio",
    label: "Радио-кнопки",
    description: "Группа радио-кнопок для выбора",
    defaultProps: {
      type: "radio",
      label: "Выберите один вариант",
      options: ["Да", "Нет"],
      required: false,
    },
  },
  checkbox: {
    type: "checkbox",
    label: "Чекбокс",
    description: "Переключатель да/нет",
    defaultProps: {
      type: "checkbox",
      label: "Согласен",
      defaultValue: false,
      required: false,
    },
  },
  tags: {
    type: "tags",
    label: "Теги",
    description: "Множественный выбор из списка",
    defaultProps: {
      type: "tags",
      label: "Выберите теги",
      options: ["Тег 1", "Тег 2", "Тег 3"],
      required: false,
    },
  },
  date: {
    type: "date",
    label: "Дата",
    description: "Поле выбора даты",
    defaultProps: {
      type: "date",
      label: "Выберите дату",
      required: false,
    },
  },
};

/**
 * Создать новую секцию
 */
export const createNewSection = (title = "Новая секция"): FormSection => ({
  id: nanoid(),
  title,
  description: "",
  fields: [],
});

/**
 * Создать новое поле
 */
export const createNewField = (type: FieldType): FormField => {
  const config = FIELD_CONFIGS[type];
  return {
    id: nanoid(),
    type,
    label: config.defaultProps?.label ?? "Новое поле",
    placeholder: config.defaultProps?.placeholder,
    options: config.defaultProps?.options,
    defaultValue: config.defaultProps?.defaultValue,
    required: config.defaultProps?.required ?? false,
  };
};

/**
 * Создать пустой Form Builder контент
 */
export const createEmptyFormBuilderContent = (): FormBuilderContent => ({
  version: 1,
  sections: [],
});

/**
 * Валидация Form Builder контента
 */
export const validateFormBuilderContent = (
  content: FormBuilderContent
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!content.sections || content.sections.length === 0) {
    errors.push("Должна быть хотя бы одна секция");
  }

  const sectionIds = new Set<string>();
  const fieldIds = new Set<string>();

  for (const section of content.sections) {
    if (!section.title?.trim()) {
      errors.push(`Секция с ID ${section.id} не имеет названия`);
    }

    if (sectionIds.has(section.id)) {
      errors.push(`Дублирующийся ID секции: ${section.id}`);
    }
    sectionIds.add(section.id);

    if (!section.fields || section.fields.length === 0) {
      errors.push(`Секция "${section.title}" не содержит полей`);
    }

    for (const field of section.fields ?? []) {
      if (!field.label?.trim()) {
        errors.push(`Поле с ID ${field.id} не имеет названия`);
      }

      if (fieldIds.has(field.id)) {
        errors.push(`Дублирующийся ID поля: ${field.id}`);
      }
      fieldIds.add(field.id);

      if (["select", "radio", "tags"].includes(field.type)) {
        if (!field.options || field.options.length === 0) {
          errors.push(`Поле "${field.label}" должно иметь варианты выбора`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Сериализовать Form Builder контент в JSON
 */
export const serializeFormBuilderContent = (
  content: FormBuilderContent
): string => {
  return JSON.stringify(content, null, 2);
};

/**
 * Десериализовать Form Builder контент из JSON
 */
export const deserializeFormBuilderContent = (
  json: string
): FormBuilderContent => {
  try {
    return JSON.parse(json) as FormBuilderContent;
  } catch {
    return createEmptyFormBuilderContent();
  }
};

/**
 * Переместить элемент в массиве
 */
export const moveItem = <T>(
  array: T[],
  fromIndex: number,
  toIndex: number
): T[] => {
  const newArray = [...array];
  const [removed] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, removed);
  return newArray;
};

/**
 * Обновить секцию
 */
export const updateSection = (
  content: FormBuilderContent,
  sectionId: string,
  updates: Partial<FormSection>
): FormBuilderContent => {
  return {
    ...content,
    sections: content.sections.map((section) =>
      section.id === sectionId ? { ...section, ...updates } : section
    ),
  };
};

/**
 * Удалить секцию
 */
export const deleteSection = (
  content: FormBuilderContent,
  sectionId: string
): FormBuilderContent => {
  return {
    ...content,
    sections: content.sections.filter((section) => section.id !== sectionId),
  };
};

/**
 * Добавить поле в секцию
 */
export const addFieldToSection = (
  content: FormBuilderContent,
  sectionId: string,
  field: FormField
): FormBuilderContent => {
  return {
    ...content,
    sections: content.sections.map((section) =>
      section.id === sectionId
        ? { ...section, fields: [...section.fields, field] }
        : section
    ),
  };
};

/**
 * Обновить поле
 */
export const updateField = (
  content: FormBuilderContent,
  sectionId: string,
  fieldId: string,
  updates: Partial<FormField>
): FormBuilderContent => {
  return {
    ...content,
    sections: content.sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            fields: section.fields.map((field) =>
              field.id === fieldId ? { ...field, ...updates } : field
            ),
          }
        : section
    ),
  };
};

/**
 * Удалить поле
 */
export const deleteField = (
  content: FormBuilderContent,
  sectionId: string,
  fieldId: string
): FormBuilderContent => {
  return {
    ...content,
    sections: content.sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            fields: section.fields.filter((field) => field.id !== fieldId),
          }
        : section
    ),
  };
};

/**
 * Переместить секцию
 */
export const moveSection = (
  content: FormBuilderContent,
  fromIndex: number,
  toIndex: number
): FormBuilderContent => {
  return {
    ...content,
    sections: moveItem(content.sections, fromIndex, toIndex),
  };
};

/**
 * Переместить поле в секции
 */
export const moveFieldInSection = (
  content: FormBuilderContent,
  sectionId: string,
  fromIndex: number,
  toIndex: number
): FormBuilderContent => {
  return {
    ...content,
    sections: content.sections.map((section) =>
      section.id === sectionId
        ? { ...section, fields: moveItem(section.fields, fromIndex, toIndex) }
        : section
    ),
  };
};

/**
 * Получить начальные значения для формы на основе template
 */
export const getInitialFormData = (
  content: FormBuilderContent
): FilledFormData => {
  const data: FilledFormData = {};

  for (const section of content.sections) {
    for (const field of section.fields) {
      if (field.defaultValue !== undefined) {
        data[field.id] = field.defaultValue;
      }
    }
  }

  return data;
};

/**
 * Форматировать JSON для отображения
 */
export const formatJson = (json: string): string => {
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch {
    return json;
  }
};
