import * as yup from "yup";
import { APPOINTMENT_TYPE } from "./reception.constants";

// Quick Create Visit Form Schema (UI)
export const quickCreateVisitFormSchema = yup.object({
  patientId: yup.string().required("Выберите пациента"),
  employeeId: yup.string().required("Выберите врача"),
  serviceId: yup.string().required("Выберите услугу"),
  type: yup
    .string()
    .oneOf(Object.values(APPOINTMENT_TYPE), "Выберите тип записи")
    .default(APPOINTMENT_TYPE.WITHOUT_QUEUE),
  roomNumber: yup.string().optional(),
  notes: yup.string().optional(),
  createInvoice: yup.boolean().default(false),
});

// Quick Create Visit Request Schema (API)
export const quickCreateVisitRequestSchema = yup.object({
  patientId: yup.string().required(),
  employeeId: yup.string().required(),
  serviceId: yup.string().required(),
  type: yup
    .string()
    .oneOf(Object.values(APPOINTMENT_TYPE))
    .default(APPOINTMENT_TYPE.WITHOUT_QUEUE),
  roomNumber: yup.string().optional(),
  notes: yup.string().optional(),
  createInvoice: yup.boolean().default(false),
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

// Type inference
export type QuickCreateVisitFormData = yup.InferType<typeof quickCreateVisitFormSchema>;
export type DashboardStatsQueryData = yup.InferType<typeof dashboardStatsQuerySchema>;
export type DoctorScheduleQueryData = yup.InferType<typeof doctorScheduleQuerySchema>;
