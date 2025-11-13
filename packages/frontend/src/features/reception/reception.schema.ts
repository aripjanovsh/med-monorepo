import * as yup from "yup";
import { APPOINTMENT_TYPE } from "./reception.constants";

// Quick Create Visit Form Schema (UI)
export const quickCreateVisitFormSchema = yup.object({
  patientId: yup.string().required("Выберите пациента"),
  employeeId: yup.string().required("Выберите врача"),
  serviceId: yup.string(),
  type: yup
    .string()
    .oneOf(Object.values(APPOINTMENT_TYPE), "Выберите тип записи")
    .default(APPOINTMENT_TYPE.STANDARD),
  notes: yup
    .string()
    .optional()
    .transform((value) => value || undefined),
});

// Quick Create Visit Request Schema (API)
export const quickCreateVisitRequestSchema = yup.object({
  patientId: yup.string().required(),
  employeeId: yup.string().required(),
  serviceId: yup.string().required(),
  type: yup
    .string()
    .oneOf(Object.values(APPOINTMENT_TYPE))
    .default(APPOINTMENT_TYPE.STANDARD),
  roomNumber: yup.string().optional(),
  notes: yup.string().optional(),
});

// Dashboard Stats Query Schema
export const dashboardStatsQuerySchema = yup.object({
  date: yup.string().optional(), // ISO 8601
});

// Doctor Schedule Query Schema
export const doctorScheduleQuerySchema = yup.object({
  date: yup.string().optional(),
  departmentId: yup.string().optional(),
});

// Type inference with explicit optional fields
export type QuickCreateVisitFormData = {
  patientId: string;
  employeeId: string;
  serviceId: string;
  type: "STANDARD" | "WITHOUT_QUEUE" | "EMERGENCY";
  notes?: string | undefined;
};
export type DashboardStatsQueryData = yup.InferType<
  typeof dashboardStatsQuerySchema
>;
export type DoctorScheduleQueryData = yup.InferType<
  typeof doctorScheduleQuerySchema
>;
