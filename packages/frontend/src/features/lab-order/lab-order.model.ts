import type { LabOrderResponseDto } from "./lab-order.dto";
import { LAB_STATUS_LABELS } from "./lab-order.constants";

export const getLabStatusLabel = (status: string): string => {
  return LAB_STATUS_LABELS[status] || status;
};

export const canUpdateLabStatus = (
  labOrder: LabOrderResponseDto,
  currentUserRole: string
): boolean => {
  return ["DOCTOR", "NURSE", "ADMIN"].includes(currentUserRole);
};
