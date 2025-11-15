import type { PaginatedResponseDto } from "@/types/api.types";

// Queue Item Response
export interface QueueItemResponseDto {
  position: number;
  appointment: {
    id: string;
    scheduledAt: string;
    checkInAt?: string;
    status: string;
    roomNumber?: string;
  };
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
  };
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    title?: {
      name: string;
    };
    department?: {
      id: string;
      name: string;
      code: string;
    };
  };
  waitTime: number; // minutes
  estimatedWaitTime: number; // minutes
}

// Doctor Schedule Response
export interface DoctorScheduleResponseDto {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    title?: {
      name: string;
    };
  };
  department?: {
    id: string;
    name: string;
    code: string;
  };
  schedule: {
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  };
  appointments: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    canceled: number;
  };
  currentVisit?: {
    id: string;
    patient: {
      firstName: string;
      lastName: string;
      middleName?: string;
    };
    startedAt: string; // ISO 8601
  };
  status: "FREE" | "BUSY" | "BREAK" | "FINISHED";
}

// Quick Create Visit Request
export interface QuickCreateVisitRequestDto {
  patientId: string;
  employeeId: string;
  serviceId: string;
  type: "STANDARD" | "WITHOUT_QUEUE" | "EMERGENCY";
  roomNumber?: string;
  notes?: string;
  createInvoice?: boolean;
}

// Quick Create Visit Response
export interface QuickCreateVisitResponseDto {
  visit: {
    id: string;
    patientId: string;
    employeeId: string;
    status: string;
    notes?: string;
    createdAt: string;
  };
  appointment: {
    id: string;
    scheduledAt: string;
    checkInAt?: string;
    status: string;
    roomNumber?: string;
  };
  invoice?: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    status: string;
  };
}

// Doctor Schedule Query
export interface DoctorScheduleQueryDto {
  date?: string; // ISO 8601
  departmentId?: string;
}
