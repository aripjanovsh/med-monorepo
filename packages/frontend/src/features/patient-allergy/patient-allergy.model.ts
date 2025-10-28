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
