/**
 * Form schemas and types for Employee forms
 * Uses yup validation with InferType pattern
 */

import * as yup from "yup";
import { EMPLOYEE_STATUS, GENDER, WORKING_DAYS } from "./employee.constants";
import { VALIDATION_MESSAGES } from "@/lib/validation-messages";
import { WorkScheduleDto, WorkScheduleDay } from "./employee.dto";

// WorkSchedule day schema
export const workScheduleDaySchema: yup.ObjectSchema<WorkScheduleDay> =
  yup.object({
    from: yup
      .string()
      .matches(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:MM)"
      )
      .required(),
    to: yup
      .string()
      .matches(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:MM)"
      )
      .required(),
  });

// WorkSchedule schema
export const workScheduleSchema: yup.ObjectSchema<WorkScheduleDto> = yup.object(
  {
    monday: workScheduleDaySchema.nullable().optional(),
    tuesday: workScheduleDaySchema.nullable().optional(),
    wednesday: workScheduleDaySchema.nullable().optional(),
    thursday: workScheduleDaySchema.nullable().optional(),
    friday: workScheduleDaySchema.nullable().optional(),
    saturday: workScheduleDaySchema.nullable().optional(),
    sunday: workScheduleDaySchema.nullable().optional(),
  }
);

// Working day schema (legacy - keeping for backwards compatibility if needed)
export const workingDaySchema = yup.object({
  day: yup.string().oneOf(Object.values(WORKING_DAYS)).required(),
  active: yup.boolean().required(),
});

// Base employee form schema
export const employeeFormSchema = yup.object({
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
  hireDate: yup.string(),

  // Optional core fields
  employeeId: yup.string(),
  dateOfBirth: yup.string(),
  gender: yup.string().oneOf(Object.values(GENDER)),
  
  // Passport information
  passportSeries: yup.string(),
  passportNumber: yup.string(),
  passportIssuedBy: yup.string(),
  passportIssueDate: yup.string(),
  passportExpiryDate: yup.string(),

  // Contact information
  email: yup.string().email(VALIDATION_MESSAGES.EMAIL_INVALID),
  phone: yup.string(),
  secondaryPhone: yup.string(),
  workPhone: yup.string(),
  userAccountPhone: yup.string().when("createUserAccount", {
    is: true,
    then: (schema) =>
      schema.required("Телефон обязателен для создания аккаунта"),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Employment Details
  titleId: yup.string(),
  salary: yup.number().min(0, "Salary must be positive"),
  terminationDate: yup.string(),

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

  // Form-specific fields for UI
  serviceTypeIds: yup.array().of(yup.string().required()).default([]),
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
  terminationDate: yup.string(),
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
