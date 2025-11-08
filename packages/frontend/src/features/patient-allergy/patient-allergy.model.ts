export type AllergySeverity = 'MILD' | 'MODERATE' | 'SEVERE';

export type PatientAllergy = {
  id: string;
  patientId: string;
  visitId?: string;
  recordedById: string;
  substance: string;
  reaction?: string;
  severity?: AllergySeverity;
  note?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePatientAllergyRequest = {
  patientId: string;
  visitId?: string;
  recordedById: string;
  substance: string;
  reaction?: string;
  severity?: AllergySeverity;
  note?: string;
};

export type UpdatePatientAllergyRequest = Partial<CreatePatientAllergyRequest>;

export const getAllergySeverityLabel = (severity?: AllergySeverity | string): string => {
  switch (severity) {
    case "MILD":
      return "Легкая";
    case "MODERATE":
      return "Средняя";
    case "SEVERE":
      return "Тяжелая";
    default:
      return "-";
  }
};
