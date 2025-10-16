export interface Patient {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: PatientGender;
  address: string;
  medicalHistory: string;
  assignedDoctor: string;
  lastVisit?: string;
  nextAppointment?: string;
  status: PatientStatus;
  emergencyContact: EmergencyContact;
  // Extended fields for detailed view
  insurance?: InsuranceInfo;
  allergies: Allergy[];
  medications: Medication[];
  vaccinations: Vaccination[];
  medicalRecords: MedicalRecord[];
  testResults: TestResult[];
  appointments: Appointment[];
  documents: MedicalDocument[];
  vitalSigns: VitalSign[];
  diagnoses: Diagnosis[];
  notes: PatientNote[];
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  expiryDate: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  severity: "MILD" | "MODERATE" | "SEVERE";
  reaction: string;
  dateIdentified: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  status: "ACTIVE" | "DISCONTINUED" | "COMPLETED";
  notes?: string;
}

export interface Vaccination {
  id: string;
  vaccine: string;
  dateAdministered: string;
  administeredBy: string;
  lotNumber?: string;
  nextDue?: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  type: "CONSULTATION" | "PROCEDURE" | "SURGERY" | "EMERGENCY";
  doctor: string;
  department: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  followUpRequired: boolean;
  followUpDate?: string;
}

export interface TestResult {
  id: string;
  testName: string;
  category: "BLOOD" | "URINE" | "IMAGING" | "BIOPSY" | "OTHER";
  date: string;
  orderedBy: string;
  results: TestResultValue[];
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  notes?: string;
  attachments?: string[];
}

export interface TestResultValue {
  parameter: string;
  value: string | number;
  unit: string;
  referenceRange: string;
  status: "NORMAL" | "HIGH" | "LOW" | "CRITICAL";
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  type: "CONSULTATION" | "FOLLOW_UP" | "PROCEDURE" | "SURGERY";
  doctor: string;
  department: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  duration: number; // in minutes
  notes?: string;
  reason: string;
}

export interface MedicalDocument {
  id: string;
  name: string;
  type: "REPORT" | "IMAGE" | "PRESCRIPTION" | "REFERRAL" | "OTHER";
  uploadDate: string;
  uploadedBy: string;
  fileUrl: string;
  fileSize: number;
  description?: string;
}

export interface VitalSign {
  id: string;
  date: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  recordedBy: string;
}

export interface Diagnosis {
  id: string;
  code: string; // ICD-10 code
  name: string;
  type: "PRIMARY" | "SECONDARY" | "DIFFERENTIAL";
  status: "ACTIVE" | "RESOLVED" | "CHRONIC";
  dateOfDiagnosis: string;
  diagnosedBy: string;
  notes?: string;
}

export interface PatientNote {
  id: string;
  date: string;
  author: string;
  type: "CLINICAL" | "ADMINISTRATIVE" | "PERSONAL";
  content: string;
  isPrivate: boolean;
}

export type PatientGender = "MALE" | "FEMALE" | "OTHER";
export type PatientStatus = "ACTIVE" | "INACTIVE" | "PENDING";

export interface PatientStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
}
