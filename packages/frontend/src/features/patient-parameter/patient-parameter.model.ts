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

export const formatParameterValue = (param: {
  valueNumeric?: number | null;
  valueText?: string | null;
  valueBoolean?: boolean | null;
  unit?: string | null;
}): string => {
  if (param.valueNumeric !== null && param.valueNumeric !== undefined) {
    return `${param.valueNumeric} ${param.unit ?? ""}`;
  }
  if (param.valueText) return param.valueText;
  if (param.valueBoolean !== null && param.valueBoolean !== undefined) {
    return param.valueBoolean ? "Да" : "Нет";
  }
  return "-";
};
