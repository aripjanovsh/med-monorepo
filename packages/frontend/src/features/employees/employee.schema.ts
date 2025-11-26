/**
 * Form schemas and types for Employee forms
 * Uses yup validation with InferType pattern
 */

import * as yup from "yup";
import { EMPLOYEE_STATUS, GENDER, WORKING_DAYS } from "./employee.constants";
import { VALIDATION_MESSAGES } from "@/lib/validation-messages";
import { WorkScheduleDto, WorkScheduleDay } from "./employee.dto";

// WorkSchedule day schema - validates from/to only if any value is provided
export const workScheduleDaySchema = yup
  .object({
    from: yup.string().optional(),
    to: yup.string().optional(),
  })
  .test(
    "work-schedule-day",
    "Время работы должно быть заполнено полностью",
    function (value) {
      // If no value or null, validation passes (day is not active)
      if (!value || value === null) {
        return true;
      }

      const { from, to } = value;

      // If both are empty, validation passes (day is not active)
      if (!from && !to) {
        return true;
      }

      // If one is filled but not the other, validation fails
      if (from && !to) {
        return this.createError({
          path: `${this.path}.to`,
          message: "Конец времени обязателен",
        });
      }

      if (!from && to) {
        return this.createError({
          path: `${this.path}.from`,
          message: "Начало времени обязательно",
        });
      }

      // Validate time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

      if (from && !timeRegex.test(from)) {
        return this.createError({
          path: `${this.path}.from`,
          message: "Неверный формат времени (ЧЧ:ММ)",
        });
      }

      if (to && !timeRegex.test(to)) {
        return this.createError({
          path: `${this.path}.to`,
          message: "Неверный формат времени (ЧЧ:ММ)",
        });
      }

      return true;
    }
  );

// WorkSchedule schema
export const workScheduleSchema = yup.object({
  monday: workScheduleDaySchema.nullable().optional(),
  tuesday: workScheduleDaySchema.nullable().optional(),
  wednesday: workScheduleDaySchema.nullable().optional(),
  thursday: workScheduleDaySchema.nullable().optional(),
  friday: workScheduleDaySchema.nullable().optional(),
  saturday: workScheduleDaySchema.nullable().optional(),
  sunday: workScheduleDaySchema.nullable().optional(),
});

// Working day schema (legacy - keeping for backwards compatibility if needed)
export const workingDaySchema = yup.object({
  day: yup.string().oneOf(Object.values(WORKING_DAYS)).required(),
  active: yup.boolean().required(),
});

// Base employee form schema
export const employeeFormSchema = yup.object({
  // Core required fields
  firstName: yup.string().required(VALIDATION_MESSAGES.FIRST_NAME_REQUIRED),
  lastName: yup.string().required(VALIDATION_MESSAGES.LAST_NAME_REQUIRED),
  middleName: yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  hireDate: yup.string(),

  dateOfBirth: yup
    .string()
    .required(VALIDATION_MESSAGES.REQUIRED)
    .test("age", VALIDATION_MESSAGES.DATE_OF_BIRTH_FUTURE, function (value) {
      if (!value) return true;
      const birthDate = new Date(value);
      const today = new Date();
      return birthDate <= today;
    }),
  gender: yup
    .string()
    .transform((value) => (value === "" ? undefined : value))
    .required(VALIDATION_MESSAGES.REQUIRED)
    .oneOf(Object.values(GENDER)),

  // Passport information - conditional validation
  passport: yup.string().optional(),
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

  // Contact information
  email: yup.string().optional().email(VALIDATION_MESSAGES.EMAIL_INVALID),
  phone: yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  secondaryPhone: yup.string(),
  workPhone: yup.string(),
  userAccountPhone: yup.string().when("createUserAccount", {
    is: true,
    then: (schema) =>
      schema
        .required("Телефон обязателен для создания аккаунта")
        .test(
          "phone-format",
          VALIDATION_MESSAGES.PHONE_MIN,
          (value) => !value || value.length >= 10
        ),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Employment Details
  titleId: yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  salary: yup.number().min(0, "Salary must be positive"),

  // Work details
  workSchedule: workScheduleSchema.optional(),

  // Languages
  primaryLanguageId: yup.string(),
  secondaryLanguageId: yup.string(),

  // Notifications
  textNotificationsEnabled: yup.boolean().default(false),

  // Address
  countryId: yup.string(),
  regionId: yup.string(),
  cityId: yup.string(),
  districtId: yup.string(),
  address: yup.string(),
  // UI-only field for LocationSelectField
  locationHierarchy: yup.object().optional(),

  // Additional Info
  notes: yup.string(),

  createUserAccount: yup.boolean().default(false),
  userAccountRoleIds: yup
    .array()
    .of(yup.string().required())
    .default([])
    .when("createUserAccount", {
      is: true,
      then: (schema) => schema.min(1, "Выберите хотя бы одну роль"),
      otherwise: (schema) => schema.notRequired(),
    }),
});

// Create employee request schema (for API requests)
export const createEmployeeRequestSchema = yup.object({
  // Required fields
  employeeId: yup.string().required("Employee ID is required"),
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  middleName: yup.string(),
  hireDate: yup.string(),
  status: yup.string().oneOf(Object.values(EMPLOYEE_STATUS)).default("ACTIVE"),

  // Optional fields
  userId: yup.string(),
  dateOfBirth: yup.string(),
  gender: yup.string().oneOf(Object.values(GENDER)),

  // Passport information
  passportSeries: yup.string(),
  passportNumber: yup.string(),
  passportIssuedBy: yup.string(),
  passportIssueDate: yup.string(),
  passportExpiryDate: yup.string(),
  email: yup.string().email("Invalid email format"),
  phone: yup.string(),
  secondaryPhone: yup.string(),
  workPhone: yup.string(),
  titleId: yup.string(),
  salary: yup.number().min(0, "Salary must be positive"),
  workSchedule: workScheduleSchema.optional(),
  primaryLanguageId: yup.string(),
  secondaryLanguageId: yup.string(),
  textNotificationsEnabled: yup.boolean().default(false),
  notes: yup.string(),

  // Address fields
  countryId: yup.string(),
  regionId: yup.string(),
  cityId: yup.string(),
  districtId: yup.string(),
  address: yup.string(),

  // User account fields (optional, backend only receives them if provided)
  userAccountPhone: yup.string(),
  userAccountRoleIds: yup.array().of(yup.string().required()),
});

// Update employee request schema
export const updateEmployeeRequestSchema = createEmployeeRequestSchema
  .partial()
  .shape({
    id: yup.string().required("Employee ID is required for updates"),
  });

// Update employee status schema
export const updateEmployeeStatusRequestSchema = yup.object({
  status: yup
    .string()
    .oneOf(Object.values(EMPLOYEE_STATUS))
    .required("Status is required"),
});

// Query parameters schema
export const employeesQueryParamsSchema = yup.object({
  limit: yup.number().positive().integer(),
  page: yup.number().positive().integer(),
  search: yup.string(),
  sortBy: yup.string(),
  sortOrder: yup.string().oneOf(["asc", "desc"]),
  status: yup.string().oneOf(Object.values(EMPLOYEE_STATUS)),
});

// Inferred types from schemas
export type WorkingDayFormData = yup.InferType<typeof workingDaySchema>;
export type EmployeeFormData = yup.InferType<typeof employeeFormSchema>;
export type CreateEmployeeFormData = yup.InferType<
  typeof createEmployeeRequestSchema
>;
export type UpdateEmployeeFormData = yup.InferType<
  typeof updateEmployeeRequestSchema
>;
export type UpdateEmployeeStatusFormData = yup.InferType<
  typeof updateEmployeeStatusRequestSchema
>;
export type EmployeesQueryParamsFormData = yup.InferType<
  typeof employeesQueryParamsSchema
>;
