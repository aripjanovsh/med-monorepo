import type {
  AppointmentResponseDto,
  SimplePatientDto,
  SimpleEmployeeDto,
} from "./appointment.dto";
import type { AppointmentStatus } from "./appointment.constants";
import {
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUS_LABELS,
} from "./appointment.constants";

export const getAppointmentStatusLabel = (
  status: AppointmentStatus,
): string => {
  return APPOINTMENT_STATUS_LABELS[status] || status;
};

export const getPatientFullName = (patient: SimplePatientDto): string => {
  const parts = [patient.lastName, patient.firstName, patient.middleName];
  return parts.filter(Boolean).join(" ");
};

export const getEmployeeFullName = (employee: SimpleEmployeeDto): string => {
  const parts = [employee.lastName, employee.firstName, employee.middleName];
  return parts.filter(Boolean).join(" ");
};

export const isAppointmentEditable = (
  appointment: AppointmentResponseDto,
): boolean => {
  const nonEditableStatuses: AppointmentStatus[] = [
    APPOINTMENT_STATUS.COMPLETED,
    APPOINTMENT_STATUS.CANCELLED,
    APPOINTMENT_STATUS.NO_SHOW,
  ];
  return !nonEditableStatuses.includes(appointment.status);
};

export const canConfirmAppointment = (
  appointment: AppointmentResponseDto,
): boolean => {
  return appointment.status === APPOINTMENT_STATUS.SCHEDULED;
};

export const canCheckInAppointment = (
  appointment: AppointmentResponseDto,
): boolean => {
  const checkInStatuses: AppointmentStatus[] = [
    APPOINTMENT_STATUS.SCHEDULED,
    APPOINTMENT_STATUS.CONFIRMED,
  ];
  return checkInStatuses.includes(appointment.status);
};

export const canStartAppointment = (
  appointment: AppointmentResponseDto,
): boolean => {
  const startStatuses: AppointmentStatus[] = [
    APPOINTMENT_STATUS.CONFIRMED,
    APPOINTMENT_STATUS.IN_QUEUE,
  ];
  return startStatuses.includes(appointment.status);
};

export const canCompleteAppointment = (
  appointment: AppointmentResponseDto,
): boolean => {
  return appointment.status === APPOINTMENT_STATUS.IN_PROGRESS;
};

export const canCancelAppointment = (
  appointment: AppointmentResponseDto,
): boolean => {
  const nonCancelableStatuses: AppointmentStatus[] = [
    APPOINTMENT_STATUS.COMPLETED,
    APPOINTMENT_STATUS.CANCELLED,
    APPOINTMENT_STATUS.NO_SHOW,
  ];
  return !nonCancelableStatuses.includes(appointment.status);
};

export const canMarkNoShow = (
  appointment: AppointmentResponseDto,
): boolean => {
  const noShowStatuses: AppointmentStatus[] = [
    APPOINTMENT_STATUS.SCHEDULED,
    APPOINTMENT_STATUS.CONFIRMED,
  ];
  return noShowStatuses.includes(appointment.status);
};

export const formatAppointmentDateTime = (dateTime: string): string => {
  const date = new Date(dateTime);
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatAppointmentDate = (dateTime: string): string => {
  const date = new Date(dateTime);
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export const formatAppointmentTime = (dateTime: string): string => {
  const date = new Date(dateTime);
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
