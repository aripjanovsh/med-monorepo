import type { FilledFormData } from "@/features/form-builder";

/**
 * Полный контекст протокола, сохраняемый в Visit.protocolData
 * Включает в себя как шаблон (templateContent), так и заполненные данные (filledData)
 * Это позволяет переиспользовать заполненные протоколы в других визитах
 */
export type SavedProtocolData = {
  // ID шаблона протокола для reference
  templateId: string;
  // Название шаблона на момент заполнения
  templateName: string;
  // Полный JSON content form-builder шаблона
  templateContent: string;
  // Заполненные данные (FilledFormData)
  filledData: FilledFormData;
  // Метаинформация
  metadata: {
    // Дата заполнения
    filledAt: string;
    // ID пациента для валидации
    patientId: string;
    // ID визита где был заполнен протокол
    visitId: string;
  };
};

/**
 * Опция для выбора ранее заполненного протокола
 */
export type FilledProtocolOption = {
  visitId: string;
  visitDate: string;
  templateName: string;
  doctorName: string;
  protocolData: SavedProtocolData;
};
