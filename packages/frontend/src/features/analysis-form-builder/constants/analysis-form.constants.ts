/**
 * Analysis Form Builder Constants
 */

import type { ParameterType } from "../types/analysis-form.types";

export const PARAMETER_TYPE_OPTIONS: Array<{
  value: ParameterType;
  label: string;
}> = [
  { value: "NUMBER", label: "Число" },
  { value: "TEXT", label: "Текст" },
  { value: "BOOLEAN", label: "Да/Нет" },
];

export const REFERENCE_RANGE_GROUP_LABELS: Record<string, string> = {
  men: "Мужчины",
  women: "Женщины",
  children: "Дети",
  default: "Общий",
};

export const REFERENCE_RANGE_GROUP_SHORT_LABELS: Record<string, string> = {
  men: "М",
  women: "Ж",
  children: "Д",
  default: "Общий",
};

export const DEFAULT_REFERENCE_RANGE_GROUPS = [
  { key: "men", label: "Мужчины" },
  { key: "women", label: "Женщины" },
  { key: "children", label: "Дети" },
];
