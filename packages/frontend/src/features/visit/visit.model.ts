import type { VisitResponseDto } from "./visit.dto";
import { VISIT_STATUS_LABELS } from "./visit.constants";

export const getVisitStatusLabel = (status: string): string => {
  return VISIT_STATUS_LABELS[status] || status;
};

export const getPatientFullName = (visit: VisitResponseDto): string => {
  const { firstName, middleName, lastName } = visit.patient;
  return [lastName, firstName, middleName].filter(Boolean).join(" ");
};

export const getEmployeeFullName = (visit: VisitResponseDto): string => {
  const { firstName, middleName, lastName } = visit.employee;
  return [lastName, firstName, middleName].filter(Boolean).join(" ");
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
