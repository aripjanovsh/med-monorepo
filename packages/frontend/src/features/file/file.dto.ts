export enum FileCategory {
  AVATAR = "AVATAR",
  LOGO = "LOGO",
  DOCUMENT = "DOCUMENT",
  ANALYSIS_RESULT = "ANALYSIS_RESULT",
  XRAY = "XRAY",
  ULTRASOUND = "ULTRASOUND",
  CT_SCAN = "CT_SCAN",
  MRI = "MRI",
  ECG = "ECG",
  PRESCRIPTION = "PRESCRIPTION",
  MEDICAL_HISTORY = "MEDICAL_HISTORY",
  INSURANCE_CARD = "INSURANCE_CARD",
  REFERRAL = "REFERRAL",
  CONSENT_FORM = "CONSENT_FORM",
  GENERAL = "GENERAL",
}

export enum FileEntityType {
  PATIENT = "PATIENT",
  SERVICE_ORDER = "SERVICE_ORDER",
  EMPLOYEE = "EMPLOYEE",
  VISIT = "VISIT",
  INVOICE = "INVOICE",
}

export type UploadFileDto = {
  category: FileCategory;
  title?: string;
  description?: string;
  entityType?: FileEntityType;
  entityId?: string;
};

export type FileResponseDto = {
  id: string;
  filename: string;
  storedName: string;
  path: string;
  mimeType: string;
  size: number;
  title?: string;
  description?: string;
  category: FileCategory;
  width?: number;
  height?: number;
  uploadedById: string;
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
  };
  uploadedAt: string;
  entityType?: FileEntityType;
  entityId?: string;
  deletedAt?: string;
  deletedById?: string;
};

export type FileQueryDto = {
  entityType?: FileEntityType;
  entityId?: string;
  category?: FileCategory;
  uploadedById?: string;
  page?: number;
  limit?: number;
};

export type UpdateFileDto = {
  title?: string;
  description?: string;
  category?: FileCategory;
};

export type ImageTransformOptions = {
  width?: number;
  height?: number;
  fit?: "cover" | "contain" | "fill";
  quality?: number;
};
