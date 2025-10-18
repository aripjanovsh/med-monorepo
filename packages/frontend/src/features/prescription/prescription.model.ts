import type { PrescriptionResponseDto } from "./prescription.dto";

export const getEmployeeFullName = (
  prescription: PrescriptionResponseDto
): string => {
  const { firstName, middleName, lastName } = prescription.createdBy;
  return [lastName, firstName, middleName].filter(Boolean).join(" ");
};

export const formatPrescriptionDisplay = (
  prescription: PrescriptionResponseDto
): string => {
  const parts = [prescription.name];
  if (prescription.dosage) parts.push(prescription.dosage);
  if (prescription.frequency) parts.push(prescription.frequency);
  return parts.join(" • ");
};
