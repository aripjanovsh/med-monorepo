/**
 * Analysis Form Builder Types
 *
 * Типы для работы с шаблонами анализов и результатами
 */

// Типы данных параметров
export type ParameterType = "NUMBER" | "TEXT" | "BOOLEAN";

// Референсный диапазон для одной группы
export type ReferenceRange = {
  min?: number;
  max?: number;
};

// Референсные диапазоны для разных групп (мужчины, женщины, дети, общий)
export type ReferenceRanges = Record<string, ReferenceRange>;

// Параметр анализа в шаблоне
export type AnalysisParameter = {
  id: string;
  name: string;
  unit?: string;
  type: ParameterType;
  referenceRanges?: ReferenceRanges;
  isRequired: boolean;
};

// Секция параметров анализа
export type AnalysisSection = {
  id: string;
  title: string;
  description?: string;
  parameters: AnalysisParameter[];
};

// Структура шаблона анализа (для Editor)
export type AnalysisTemplate = {
  version: number;
  sections: AnalysisSection[];
};

// Строка результата анализа
export type AnalysisResultRow = {
  parameterId: string;
  parameterName: string;
  value: string | number | boolean;
  unit?: string;
  normalRange?: string; // Для отображения
  referenceRanges?: ReferenceRanges;
};

// Заполненные данные анализа (для Interactive и View)
export type FilledAnalysisData = {
  templateId: string;
  templateName: string;
  rows: AnalysisResultRow[];
};

// Сохраненные данные анализа (полная структура для БД)
export type SavedAnalysisData = {
  templateId: string;
  templateName: string;
  templateContent: AnalysisTemplate; // Полный шаблон анализа
  filledData: FilledAnalysisData; // Заполненные результаты
  metadata: {
    filledAt: string;
    patientId: string;
    serviceOrderId?: string;
  };
};

// Пол пациента для вычисления референсных значений
export type PatientGender = "MALE" | "FEMALE";

// Статус значения относительно нормы
export type ReferenceStatus = "NORMAL" | "HIGH" | "LOW" | "UNKNOWN";
