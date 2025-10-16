/**
 * Form schemas and types for Patient forms
 * Uses yup validation with InferType pattern
 */

import * as yup from "yup";
import {
  PATIENT_STATUS,
  GENDER,
  CONTACT_RELATION,
  CONTACT_TYPE,
} from "./patient.constants";
import { VALIDATION_MESSAGES } from "@/lib/validation-messages";

// Patient Contact schema
export const patientContactSchema = yup.object({
  id: yup.string().optional(),
  relation: yup.string().oneOf(Object.values(CONTACT_RELATION)).optional(),
  type: yup.string().oneOf(Object.values(CONTACT_TYPE)).required("Тип контакта обязателен"),
  firstName: yup.string().optional(),
  lastName: yup.string().optional(),
  primaryPhone: yup
    .string()
    .required("Основной телефон обязателен")
    .min(10, "Телефон должен содержать минимум 10 цифр"),
  secondaryPhone: yup.string(),
  email: yup.string().email("Неверный формат email"),
  address: yup.string(),
  city: yup.string(),
  state: yup.string(),
  country: yup.string(),
  textNotificationsEnabled: yup.boolean().default(false),
  emailNotificationsEnabled: yup.boolean().default(false),
});

// Base patient form schema
export const patientFormSchema = yup.object({
  // Core required fields
  firstName: yup
    .string()
    .min(2, VALIDATION_MESSAGES.FIRST_NAME_MIN)
    .required(VALIDATION_MESSAGES.FIRST_NAME_REQUIRED),
  lastName: yup
    .string()
    .min(2, VALIDATION_MESSAGES.LAST_NAME_MIN)
    .required(VALIDATION_MESSAGES.LAST_NAME_REQUIRED),
  middleName: yup.string(),
  dateOfBirth: yup
    .string()
    .required("Дата рождения обязательна")
    .test("age", "Дата рождения не может быть в будущем", function (value) {
      if (!value) return false;
      const birthDate = new Date(value);
      const today = new Date();
      return birthDate <= today;
    }),
  gender: yup
    .string()
    .oneOf(Object.values(GENDER))
    .required("Пол обязателен"),
  
  // Passport information
  passportSeries: yup.string(),
  passportNumber: yup.string(),
  passportIssuedBy: yup.string(),
  passportIssueDate: yup.string(),
  passportExpiryDate: yup.string(),

  // Optional core fields
  patientId: yup.string(),
  status: yup
    .string()
    .oneOf(Object.values(PATIENT_STATUS))
    .default("ACTIVE"),

  // Language IDs (new fields)
  primaryLanguageId: yup.string(),
  secondaryLanguageId: yup.string(),
  
  // Address IDs (new fields)
  countryId: yup.string(),
  regionId: yup.string(),
  cityId: yup.string(),
  districtId: yup.string(),
  address: yup.string(), // Specific street address
  
  // UI helper field for LocationSelectField
  locationHierarchy: yup.object().shape({
    countryId: yup.string(),
    regionId: yup.string(),
    cityId: yup.string(),
    districtId: yup.string(),
    selectedId: yup.string(),
  }),

  // Related data
  contacts: yup
    .array()
    .of(patientContactSchema)
    .default([])
    .min(1, "Необходимо добавить хотя бы один контакт"),
  doctorIds: yup.array().of(yup.string().required()).default([]),

  // Additional fields
  notes: yup.string(),

  // System fields (handled by backend)
  createdBy: yup.string(),
});

// Create patient request schema (for API requests)
export const createPatientRequestSchema = yup.object({
  // Required fields
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  middleName: yup.string(),
  dateOfBirth: yup.string().required("Date of birth is required"),
  gender: yup.string().oneOf(Object.values(GENDER)).required("Gender is required"),
  createdBy: yup.string().required("Created by is required"),
  
  // Passport information
  passportSeries: yup.string(),
  passportNumber: yup.string(),
  passportIssuedBy: yup.string(),
  passportIssueDate: yup.string(),
  passportExpiryDate: yup.string(),

  // Optional fields
  patientId: yup.string(),
  status: yup.string().oneOf(Object.values(PATIENT_STATUS)).default("ACTIVE"),
  
  // Language IDs (new fields)
  primaryLanguageId: yup.string(),
  secondaryLanguageId: yup.string(),
  
  // Address IDs (new fields)
  countryId: yup.string(),
  regionId: yup.string(),
  cityId: yup.string(),
  districtId: yup.string(),
  address: yup.string(), // Specific street address

  // Related data
  contacts: yup.array().of(
    yup.object({
      relation: yup.string().oneOf(Object.values(CONTACT_RELATION)).required(),
      type: yup.string().oneOf(Object.values(CONTACT_TYPE)).required(),
      firstName: yup.string(),
      lastName: yup.string(),
      primaryPhone: yup.string().required("Primary phone is required"),
      secondaryPhone: yup.string(),
      address: yup.string(),
      city: yup.string(),
      state: yup.string(),
      country: yup.string(),
      textNotificationsEnabled: yup.boolean().default(false),
      emailNotificationsEnabled: yup.boolean().default(false),
    })
  ),
  doctorIds: yup.array().of(yup.string().required()),
});

// Update patient request schema
export const updatePatientRequestSchema = createPatientRequestSchema
  .partial()
  .shape({
    id: yup.string().required("Patient ID is required for updates"),
    excludePatientId: yup.string(),
  });

// Update patient status schema
export const updatePatientStatusRequestSchema = yup.object({
  status: yup
    .string()
    .oneOf(Object.values(PATIENT_STATUS))
    .required("Status is required"),
  organizationId: yup.string(),
});

// Query parameters schema
export const patientsQueryParamsSchema = yup.object({
  limit: yup.number().positive().integer(),
  page: yup.number().positive().integer(),
  search: yup.string(),
  sortBy: yup.string(),
  sortOrder: yup.string().oneOf(["asc", "desc"]),
  status: yup.string().oneOf(Object.values(PATIENT_STATUS)),
  gender: yup.string().oneOf(Object.values(GENDER)),
  organizationId: yup.string(),
});

// Patient by ID query schema
export const patientByIdQuerySchema = yup.object({
  organizationId: yup.string(),
});

// Inferred types from schemas
export type PatientContactFormData = yup.InferType<typeof patientContactSchema>;
export type PatientFormData = yup.InferType<typeof patientFormSchema>;
export type CreatePatientFormData = yup.InferType<
  typeof createPatientRequestSchema
>;
export type UpdatePatientFormData = yup.InferType<
  typeof updatePatientRequestSchema
>;
export type UpdatePatientStatusFormData = yup.InferType<
  typeof updatePatientStatusRequestSchema
>;
export type PatientsQueryParamsFormData = yup.InferType<
  typeof patientsQueryParamsSchema
>;
export type PatientByIdQueryFormData = yup.InferType<
  typeof patientByIdQuerySchema
>;

// Utility types for partial form states
export type PatientFormStep1 = Pick<
  PatientFormData,
  | "firstName"
  | "lastName"
  | "middleName"
  | "patientId"
  | "dateOfBirth"
  | "gender"
  | "status"
  | "passportSeries"
  | "passportNumber"
  | "passportIssuedBy"
  | "passportIssueDate"
  | "passportExpiryDate"
>;

export type PatientFormStep1Extended = PatientFormStep1 & {
  primaryLanguageId?: string;
  secondaryLanguageId?: string;
  countryId?: string;
  regionId?: string;
  cityId?: string;
  districtId?: string;
  address?: string;
  locationHierarchy?: {
    countryId?: string;
    regionId?: string;
    cityId?: string;
    districtId?: string;
    selectedId?: string;
  };
};

export type PatientFormStep2 = Pick<
  PatientFormData,
  "contacts"
>;

export type PatientFormStep3 = Pick<
  PatientFormData,
  "doctorIds"
>;

export type PatientFormStep4 = Pick<
  PatientFormData,
  "status"
>;
