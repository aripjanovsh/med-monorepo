export const ANALYSIS_TEMPLATE_CATEGORY_OPTIONS = [
  { value: "BLOOD", label: "Кровь" },
  { value: "URINE", label: "Моча" },
  { value: "BIOCHEMISTRY", label: "Биохимия" },
  { value: "OTHER", label: "Другое" },
] as const;

export const PARAMETER_TYPE_OPTIONS = [
  { value: "NUMBER", label: "Число" },
  { value: "TEXT", label: "Текст" },
  { value: "BOOLEAN", label: "Да/Нет" },
] as const;

export const ANALYSIS_TEMPLATE_CATEGORY = {
  BLOOD: "BLOOD",
  URINE: "URINE",
  BIOCHEMISTRY: "BIOCHEMISTRY",
  OTHER: "OTHER",
} as const;

export const PARAMETER_TYPE = {
  NUMBER: "NUMBER",
  TEXT: "TEXT",
  BOOLEAN: "BOOLEAN",
} as const;

export const DEMOGRAPHIC_GROUPS = {
  MEN: "men",
  WOMEN: "women",
  CHILDREN: "children",
} as const;

export const DEMOGRAPHIC_GROUP_LABELS = {
  men: "Мужчины",
  women: "Женщины",
  children: "Дети",
} as const;

export type AnalysisTemplateCategory =
  (typeof ANALYSIS_TEMPLATE_CATEGORY)[keyof typeof ANALYSIS_TEMPLATE_CATEGORY];

export type ParameterType =
  (typeof PARAMETER_TYPE)[keyof typeof PARAMETER_TYPE];

export type DemographicGroup =
  (typeof DEMOGRAPHIC_GROUPS)[keyof typeof DEMOGRAPHIC_GROUPS];

// Preset templates for quick creation
export const PRESET_TEMPLATES = [
  {
    name: "Общий анализ крови",
    code: "OAK",
    category: ANALYSIS_TEMPLATE_CATEGORY.BLOOD,
    description: "Базовый анализ крови для оценки общего состояния здоровья",
    parameters: [
      {
        name: "Гемоглобин",
        unit: "г/л",
        type: PARAMETER_TYPE.NUMBER,
        referenceRanges: {
          men: { min: 130, max: 160 },
          women: { min: 120, max: 150 },
          children: { min: 100, max: 140 },
        },
        isRequired: true,
      },
      {
        name: "Эритроциты",
        unit: "×10¹²/л",
        type: PARAMETER_TYPE.NUMBER,
        referenceRanges: {
          men: { min: 4.4, max: 5.0 },
          women: { min: 3.8, max: 4.5 },
          children: { min: 3.5, max: 4.5 },
        },
        isRequired: true,
      },
      {
        name: "Лейкоциты",
        unit: "×10⁹/л",
        type: PARAMETER_TYPE.NUMBER,
        referenceRanges: {
          men: { min: 4.0, max: 9.0 },
          women: { min: 4.0, max: 9.0 },
          children: { min: 5.0, max: 12.0 },
        },
        isRequired: true,
      },
    ],
  },
  {
    name: "Биохимия крови базовая",
    code: "BIO",
    category: ANALYSIS_TEMPLATE_CATEGORY.BIOCHEMISTRY,
    description: "Основные биохимические показатели",
    parameters: [
      {
        name: "Глюкоза",
        unit: "ммоль/л",
        type: PARAMETER_TYPE.NUMBER,
        referenceRanges: {
          men: { min: 3.3, max: 5.5 },
          women: { min: 3.3, max: 5.5 },
          children: { min: 3.3, max: 5.5 },
        },
        isRequired: true,
      },
      {
        name: "Креатинин",
        unit: "мкмоль/л",
        type: PARAMETER_TYPE.NUMBER,
        referenceRanges: {
          men: { min: 80, max: 115 },
          women: { min: 53, max: 97 },
          children: { min: 27, max: 62 },
        },
        isRequired: true,
      },
    ],
  },
  {
    name: "Общий анализ мочи",
    code: "OAM",
    category: ANALYSIS_TEMPLATE_CATEGORY.URINE,
    description: "Исследование физических и химических свойств мочи",
    parameters: [
      {
        name: "Цвет",
        unit: "",
        type: PARAMETER_TYPE.TEXT,
        isRequired: true,
      },
      {
        name: "Прозрачность",
        unit: "",
        type: PARAMETER_TYPE.TEXT,
        isRequired: true,
      },
      {
        name: "Белок",
        unit: "г/л",
        type: PARAMETER_TYPE.NUMBER,
        referenceRanges: {
          men: { min: 0, max: 0.14 },
          women: { min: 0, max: 0.14 },
          children: { min: 0, max: 0.14 },
        },
        isRequired: false,
      },
    ],
  },
] as const;
