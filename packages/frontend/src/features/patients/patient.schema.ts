/**
 * Form schemas and types for Patient forms
 * Uses yup validation with InferType pattern
 */

import * as yup from "yup";
import { PATIENT_STATUS, GENDER } from "./patient.constants";
import { VALIDATION_MESSAGES } from "@/lib/validation-messages";

// Base patient form schema
export const patientFormSchema = yup.object({
  // Core required fields
  firstName: yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  lastName: yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  middleName: yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  dateOfBirth: yup
    .string()
    .required(VALIDATION_MESSAGES.REQUIRED)
    .test("age", VALIDATION_MESSAGES.DATE_OF_BIRTH_FUTURE, function (value) {
      if (!value) return false;
      const birthDate = new Date(value);
      const today = new Date();
      return birthDate <= today;
    }),
  gender: yup
    .string()
    .oneOf(Object.values(GENDER))
    .required(VALIDATION_MESSAGES.REQUIRED),

  // Passport information - conditional validation
  passportSeries: yup
    .string()
    .test(
      "passport-series-required",
      VALIDATION_MESSAGES.REQUIRED,
      function (value) {
        const parent = this.parent as any;
        const passportFields = [
          parent.passportNumber,
          parent.passportIssuedBy,
          parent.passportIssueDate,
          parent.passportExpiryDate,
        ];

        const hasAnyPassportData =
          passportFields.some(
            (field) => field && field.toString().trim() !== ""
          ) ||
          (value && value.toString().trim() !== "");

        if (!hasAnyPassportData) {
          return true; // No passport data, validation passes
        }

        return !!(value && value.toString().trim() !== "");
      }
    ),
  passportNumber: yup
    .string()
    .test(
      "passport-number-required",
      VALIDATION_MESSAGES.REQUIRED,
      function (value) {
        const parent = this.parent as any;
        const passportFields = [
          parent.passportSeries,
          parent.passportIssuedBy,
          parent.passportIssueDate,
          parent.passportExpiryDate,
        ];

        const hasAnyPassportData =
          passportFields.some(
            (field) => field && field.toString().trim() !== ""
          ) ||
          (value && value.toString().trim() !== "");

        if (!hasAnyPassportData) {
          return true; // No passport data, validation passes
        }

        return !!(value && value.toString().trim() !== "");
      }
    ),
  passportIssuedBy: yup
    .string()
    .test(
      "passport-issued-by-required",
      VALIDATION_MESSAGES.REQUIRED,
      function (value) {
        const parent = this.parent as any;
        const passportFields = [
          parent.passportSeries,
          parent.passportNumber,
          parent.passportIssueDate,
          parent.passportExpiryDate,
        ];

        const hasAnyPassportData =
          passportFields.some(
            (field) => field && field.toString().trim() !== ""
          ) ||
          (value && value.toString().trim() !== "");

        if (!hasAnyPassportData) {
          return true; // No passport data, validation passes
        }

        return !!(value && value.toString().trim() !== "");
      }
    ),
  passportIssueDate: yup
    .string()
    .test(
      "passport-issue-date-required",
      VALIDATION_MESSAGES.REQUIRED,
      function (value) {
        const parent = this.parent as any;
        const passportFields = [
          parent.passportSeries,
          parent.passportNumber,
          parent.passportIssuedBy,
          parent.passportExpiryDate,
        ];

        const hasAnyPassportData =
          passportFields.some(
            (field) => field && field.toString().trim() !== ""
          ) ||
          (value && value.toString().trim() !== "");

        if (!hasAnyPassportData) {
          return true; // No passport data, validation passes
        }

        return !!(value && value.toString().trim() !== "");
      }
    ),
  passportExpiryDate: yup
    .string()
    .test(
      "passport-expiry-date-required",
      VALIDATION_MESSAGES.REQUIRED,
      function (value) {
        const parent = this.parent as any;
        const passportFields = [
          parent.passportSeries,
          parent.passportNumber,
          parent.passportIssuedBy,
          parent.passportIssueDate,
        ];

        const hasAnyPassportData =
          passportFields.some(
            (field) => field && field.toString().trim() !== ""
          ) ||
          (value && value.toString().trim() !== "");

        if (!hasAnyPassportData) {
          return true; // No passport data, validation passes
        }

        return !!(value && value.toString().trim() !== "");
      }
    ),

  // Optional core fields
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

  // UI helper field for LocationSelectField
  locationHierarchy: yup.object().shape({
    countryId: yup.string(),
    regionId: yup.string(),
    cityId: yup.string(),
    districtId: yup.string(),
    selectedId: yup.string(),
  }),

  // Simple contact fields
  phone: yup
    .string()
    .required(VALIDATION_MESSAGES.REQUIRED)
    .test(
      "phone-format",
      VALIDATION_MESSAGES.PHONE_MIN,
      (value) => !value || value.length >= 10
    ),
  secondaryPhone: yup.string(),
  email: yup.string().optional().email(VALIDATION_MESSAGES.EMAIL_INVALID),

  // Additional fields
  notes: yup.string(),
});

// Create patient request schema (for API requests)
export const createPatientRequestSchema = yup.object({
  // Required fields
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  middleName: yup.string(),
  dateOfBirth: yup.string().required("Date of birth is required"),
  gender: yup
    .string()
    .oneOf(Object.values(GENDER))
    .required("Gender is required"),

  // Passport information
  passportSeries: yup
    .string()
    .test(
      "passport-series-required",
      "Passport series is required when any passport information is provided",
      function (value) {
        const parent = this.parent as any;
        const passportFields = [
          parent.passportNumber,
          parent.passportIssuedBy,
          parent.passportIssueDate,
          parent.passportExpiryDate,
        ];

        const hasAnyPassportData =
          passportFields.some(
            (field) => field && field.toString().trim() !== ""
          ) ||
          (value && value.toString().trim() !== "");

        if (!hasAnyPassportData) {
          return true; // No passport data, validation passes
        }

        return !!(value && value.toString().trim() !== "");
      }
    ),
  passportNumber: yup
    .string()
    .test(
      "passport-number-required",
      "Passport number is required when any passport information is provided",
      function (value) {
        const parent = this.parent as any;
        const passportFields = [
          parent.passportSeries,
          parent.passportIssuedBy,
          parent.passportIssueDate,
          parent.passportExpiryDate,
        ];

        const hasAnyPassportData =
          passportFields.some(
            (field) => field && field.toString().trim() !== ""
          ) ||
          (value && value.toString().trim() !== "");

        if (!hasAnyPassportData) {
          return true; // No passport data, validation passes
        }

        return !!(value && value.toString().trim() !== "");
      }
    ),
  passportIssuedBy: yup
    .string()
    .test(
      "passport-issued-by-required",
      "Passport issued by is required when any passport information is provided",
      function (value) {
        const parent = this.parent as any;
        const passportFields = [
          parent.passportSeries,
          parent.passportNumber,
          parent.passportIssueDate,
          parent.passportExpiryDate,
        ];

        const hasAnyPassportData =
          passportFields.some(
            (field) => field && field.toString().trim() !== ""
          ) ||
          (value && value.toString().trim() !== "");

        if (!hasAnyPassportData) {
          return true; // No passport data, validation passes
        }

        return !!(value && value.toString().trim() !== "");
      }
    ),
  passportIssueDate: yup
    .string()
    .test(
      "passport-issue-date-required",
      "Passport issue date is required when any passport information is provided",
      function (value) {
        const parent = this.parent as any;
        const passportFields = [
          parent.passportSeries,
          parent.passportNumber,
          parent.passportIssuedBy,
          parent.passportExpiryDate,
        ];

        const hasAnyPassportData =
          passportFields.some(
            (field) => field && field.toString().trim() !== ""
          ) ||
          (value && value.toString().trim() !== "");

        if (!hasAnyPassportData) {
          return true; // No passport data, validation passes
        }

        return !!(value && value.toString().trim() !== "");
      }
    ),
  passportExpiryDate: yup
    .string()
    .test(
      "passport-expiry-date-required",
      "Passport expiry date is required when any passport information is provided",
      function (value) {
        const parent = this.parent as any;
        const passportFields = [
          parent.passportSeries,
          parent.passportNumber,
          parent.passportIssuedBy,
          parent.passportIssueDate,
        ];

        const hasAnyPassportData =
          passportFields.some(
            (field) => field && field.toString().trim() !== ""
          ) ||
          (value && value.toString().trim() !== "");

        if (!hasAnyPassportData) {
          return true; // No passport data, validation passes
        }

        return !!(value && value.toString().trim() !== "");
      }
    ),

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

  // Simple contact fields
  phone: yup
    .string()
    .required(VALIDATION_MESSAGES.REQUIRED)
    .test(
      "phone-format",
      VALIDATION_MESSAGES.PHONE_MIN,
      (value) => !value || value.length >= 10
    ),
  secondaryPhone: yup.string(),
  email: yup.string().optional().email(VALIDATION_MESSAGES.EMAIL_INVALID),
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
});

// Patient by ID query schema
export const patientByIdQuerySchema = yup.object({});

// Inferred types from schemas
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

// Quick create patient schema (minimal required fields)
export const patientQuickCreateSchema = yup.object({
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
  gender: yup.string().oneOf(Object.values(GENDER)).required("Пол обязателен"),
  primaryPhone: yup
    .string()
    .required(VALIDATION_MESSAGES.PHONE_REQUIRED)
    .min(10, VALIDATION_MESSAGES.PHONE_MIN),
});

export type PatientQuickCreateData = yup.InferType<
  typeof patientQuickCreateSchema
>;
