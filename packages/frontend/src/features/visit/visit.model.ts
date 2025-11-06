import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { VisitResponseDto } from "./visit.dto";
import { VISIT_STATUS_LABELS } from "./visit.constants";

export const getVisitStatusLabel = (status: string): string => {
  return VISIT_STATUS_LABELS[status] || status;
};

export const isVisitEditable = (visit: VisitResponseDto): boolean => {
  return visit.status === "IN_PROGRESS";
};

export const canCompleteVisit = (visit: VisitResponseDto): boolean => {
  return visit.status === "IN_PROGRESS";
};

export const canCancelVisit = (visit: VisitResponseDto): boolean => {
  return visit.status === "IN_PROGRESS";
};

export const formatVisitDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, "dd.MM.yyyy HH:mm", { locale: ru });
};
