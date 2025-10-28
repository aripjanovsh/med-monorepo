export type ParameterSource = 'MANUAL' | 'LAB' | 'DEVICE' | 'IMPORT';

export type PatientParameter = {
  id: string;
  patientId: string;
  visitId?: string;
  serviceOrderId?: string;
  parameterCode: string;
  valueNumeric?: number;
  valueText?: string;
  valueBoolean?: boolean;
  valueJson?: any;
  unit?: string;
  measuredAt: string;
  recordedById: string;
  source: ParameterSource;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePatientParameterRequest = {
  patientId: string;
  visitId?: string;
  serviceOrderId?: string;
  parameterCode: string;
  valueNumeric?: number;
  valueText?: string;
  valueBoolean?: boolean;
  valueJson?: any;
  unit?: string;
  measuredAt?: string;
  recordedById: string;
  source?: ParameterSource;
};

export type UpdatePatientParameterRequest = Partial<Omit<CreatePatientParameterRequest, 'patientId' | 'recordedById'>>;
