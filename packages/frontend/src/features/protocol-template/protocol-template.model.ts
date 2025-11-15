import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { ProtocolTemplateResponseDto } from "./protocol-template.dto";

export const getProtocolTemplateDisplayName = (
  protocol: ProtocolTemplateResponseDto,
): string => {
  return protocol.name;
};

export const isProtocolTemplateActive = (
  protocol: ProtocolTemplateResponseDto,
): boolean => {
  return protocol.isActive;
};

export const formatProtocolTemplateDate = (
  date: string | Date,
  formatString = "dd MMM yyyy",
): string => {
  try {
    return format(new Date(date), formatString, { locale: ru });
  } catch {
    return "—";
  }
};

export const validateProtocolContent = (content: string): boolean => {
  try {
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
};

export const formatProtocolContent = (content: string): string => {
  try {
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return content;
  }
};

export const getProtocolTemplateStatusLabel = (isActive: boolean): string => {
  return isActive ? "Активен" : "Неактивен";
};

export const getProtocolTemplateStatusVariant = (
  isActive: boolean,
): "default" | "secondary" => {
  return isActive ? "default" : "secondary";
};
