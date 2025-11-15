/**
 * Analysis Form Builder Helpers
 *
 * Утилиты для работы с шаблонами анализов и результатами
 */

import type {
  AnalysisParameter,
  AnalysisSection,
  AnalysisTemplate,
  ReferenceRange,
  ReferenceRanges,
  ReferenceStatus,
  PatientGender,
} from "../types/analysis-form.types";
import { REFERENCE_RANGE_GROUP_SHORT_LABELS } from "../constants/analysis-form.constants";

/**
 * Создать новый параметр
 */
export const createNewParameter = (): AnalysisParameter => ({
  id: Date.now().toString(),
  name: "",
  unit: "",
  type: "NUMBER",
  referenceRanges: {},
  isRequired: false,
});

/**
 * Создать новую секцию
 */
export const createNewSection = (): AnalysisSection => ({
  id: Date.now().toString(),
  title: "",
  description: "",
  parameters: [],
});

/**
 * Создать пустой шаблон анализа
 */
export const createEmptyAnalysisTemplate = (): AnalysisTemplate => ({
  version: 1,
  sections: [],
});

/**
 * Форматировать референсный диапазон для отображения
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
 * Получить простой диапазон из множественных референсных диапазонов
 * Приоритет: default > первый доступный
 */
export const getSimpleRange = (ranges?: ReferenceRanges): ReferenceRange => {
  if (!ranges || Object.keys(ranges).length === 0) {
    return {};
  }

  // Приоритет default
  if (ranges.default) {
    return ranges.default;
  }

  // Иначе первый непустой диапазон
  const firstRange = Object.values(ranges).find(
    (r) => r && (r.min !== undefined || r.max !== undefined),
  );

  return firstRange || {};
};

/**
 * Обновить простой диапазон
 */
export const updateSimpleRange = (
  currentRanges: ReferenceRanges | undefined,
  field: "min" | "max",
  value: number | undefined,
): ReferenceRanges => {
  const ranges = currentRanges || {};

  // Если есть расширенные диапазоны, обновляем первый
  if (Object.keys(ranges).length > 0) {
    const firstKey = Object.keys(ranges)[0];
    return {
      ...ranges,
      [firstKey]: {
        ...ranges[firstKey],
        [field]: value,
      },
    };
  }

  // Создаем default диапазон
  return {
    default: { [field]: value },
  };
};

/**
 * Форматировать превью референсных диапазонов
 */
export const formatRangePreview = (ranges?: ReferenceRanges): string => {
  if (!ranges || Object.keys(ranges).length === 0) {
    return "Нет диапазонов";
  }

  return (
    Object.entries(ranges)
      .slice(0, 3)
      .map(([key, range]) => {
        const label = REFERENCE_RANGE_GROUP_SHORT_LABELS[key] || key;
        const min = range.min !== undefined ? range.min : "—";
        const max = range.max !== undefined ? range.max : "—";
        return `${label}: ${min}-${max}`;
      })
      .join(", ") + (Object.keys(ranges).length > 3 ? "..." : "")
  );
};

/**
 * Определить подходящий референсный диапазон на основе пола и возраста
 */
export const getApplicableRange = (
  ranges: ReferenceRanges | undefined,
  gender?: PatientGender,
  age?: number,
): ReferenceRange | null => {
  if (!ranges) return null;

  // Если возраст указан и пациент ребенок (< 18 лет), используем детские нормы
  if (age !== undefined && age < 18 && ranges.children) {
    return ranges.children;
  }

  // Используем нормы по полу
  if (gender === "MALE" && ranges.men) {
    return ranges.men;
  }

  if (gender === "FEMALE" && ranges.women) {
    return ranges.women;
  }

  // Fallback на default
  if (ranges.default) {
    return ranges.default;
  }

  // Fallback на мужские нормы, если есть
  if (ranges.men) {
    return ranges.men;
  }

  // Fallback на женские нормы, если есть
  if (ranges.women) {
    return ranges.women;
  }

  // Fallback на детские нормы, если есть
  if (ranges.children) {
    return ranges.children;
  }

  return null;
};

/**
 * Определить статус значения относительно референсного диапазона
 */
export const getReferenceStatus = (
  value: string | number | boolean,
  range: ReferenceRange | null,
): ReferenceStatus => {
  // Если нет диапазона
  if (!range) {
    return "UNKNOWN";
  }

  // Если значение не число или не может быть преобразовано в число
  if (typeof value === "boolean") {
    return "UNKNOWN";
  }

  // Если пустая строка
  if (value === "" || value === null || value === undefined) {
    return "UNKNOWN";
  }

  const numValue = Number(value);

  if (isNaN(numValue)) {
    return "UNKNOWN";
  }

  // Если нет ни минимума, ни максимума
  if (range.min === undefined && range.max === undefined) {
    return "UNKNOWN";
  }

  // Если есть максимум и значение превышает
  if (range.max !== undefined && numValue > range.max) {
    return "HIGH";
  }

  // Если есть минимум и значение ниже
  if (range.min !== undefined && numValue < range.min) {
    return "LOW";
  }

  return "NORMAL";
};

/**
 * Форматировать референсный диапазон для отображения в таблице
 */
export const formatReferenceRangeDisplay = (
  range: ReferenceRange | null,
): string => {
  if (!range) return "—";

  const { min, max } = range;

  if (min !== undefined && max !== undefined) {
    return `${min}–${max}`;
  }

  if (min !== undefined) {
    return `> ${min}`;
  }

  if (max !== undefined) {
    return `< ${max}`;
  }

  return "—";
};

/**
 * Форматировать значение для отображения
 */
export const formatValue = (value: string | number | boolean): string => {
  if (typeof value === "boolean") {
    return value ? "Да" : "Нет";
  }
  return String(value);
};

/**
 * Проверка наличия референсных диапазонов
 */
export const hasReferenceRanges = (parameter: AnalysisParameter): boolean => {
  if (!parameter.referenceRanges) {
    return false;
  }

  return Object.values(parameter.referenceRanges).some(
    (range) => range && (range.min !== undefined || range.max !== undefined),
  );
};
