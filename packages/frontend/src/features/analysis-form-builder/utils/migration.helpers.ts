/**
 * Migration helpers for analysis templates
 */

import type { AnalysisTemplate } from "../types/analysis-form.types";

/**
 * Нормализовать данные из API
 * Все данные в БД уже в новом формате с секциями
 */
export const normalizeAnalysisTemplate = (data: unknown): AnalysisTemplate => {
  // Просто приводим к нужному типу, т.к. все данные уже в правильном формате
  if (
    typeof data === "object" &&
    data !== null &&
    "version" in data &&
    "sections" in data
  ) {
    return data as AnalysisTemplate;
  }

  // Если данные некорректны, возвращаем пустой шаблон
  console.error("Invalid analysis template format:", data);
  return {
    version: 1,
    sections: [],
  };
};
