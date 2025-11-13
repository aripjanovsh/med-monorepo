// Appointment Types
export const APPOINTMENT_TYPE = {
  STANDARD: "STANDARD",
  WITHOUT_QUEUE: "WITHOUT_QUEUE",
  EMERGENCY: "EMERGENCY",
} as const;

export const APPOINTMENT_TYPE_OPTIONS = [
  {
    value: APPOINTMENT_TYPE.STANDARD,
    label: "Стандартная запись",
    color: "blue",
  },
  { value: APPOINTMENT_TYPE.EMERGENCY, label: "Экстренная", color: "red" },
] as const;

// Doctor Status
export const DOCTOR_STATUS = {
  FREE: "FREE",
  BUSY: "BUSY",
  BREAK: "BREAK",
  FINISHED: "FINISHED",
} as const;

export const DOCTOR_STATUS_OPTIONS = [
  { value: DOCTOR_STATUS.FREE, label: "Свободен", color: "green", icon: "✓" },
  { value: DOCTOR_STATUS.BUSY, label: "Занят", color: "red", icon: "⏱" },
  { value: DOCTOR_STATUS.BREAK, label: "Перерыв", color: "orange", icon: "☕" },
  {
    value: DOCTOR_STATUS.FINISHED,
    label: "Завершил",
    color: "gray",
    icon: "✓",
  },
] as const;

// Doctor Status Map
export const DOCTOR_STATUS_MAP: Record<
  "FREE" | "BUSY" | "BREAK" | "FINISHED",
  { label: string; color: string; icon: string }
> = {
  FREE: { label: "Свободен", color: "green", icon: "✓" },
  BUSY: { label: "Занят", color: "red", icon: "⏱" },
  BREAK: { label: "Перерыв", color: "orange", icon: "☕" },
  FINISHED: { label: "Завершил", color: "gray", icon: "✓" },
};

// Appointment Type Map
export const APPOINTMENT_TYPE_MAP: Record<
  "STANDARD" | "WITHOUT_QUEUE" | "EMERGENCY",
  { label: string; color: string }
> = {
  STANDARD: { label: "Стандартная запись", color: "blue" },
  WITHOUT_QUEUE: { label: "Без очереди", color: "green" },
  EMERGENCY: { label: "Экстренная", color: "red" },
};

// Wait Time Thresholds (minutes)
export const WAIT_TIME_THRESHOLDS = {
  NORMAL: 15,
  WARNING: 30,
  CRITICAL: 45,
} as const;

// Wait Time Colors
export const getWaitTimeColor = (minutes: number): string => {
  if (minutes < WAIT_TIME_THRESHOLDS.NORMAL) return "green";
  if (minutes < WAIT_TIME_THRESHOLDS.WARNING) return "yellow";
  if (minutes < WAIT_TIME_THRESHOLDS.CRITICAL) return "orange";
  return "red";
};

// API Tag
export const RECEPTION_API_TAG = "Reception" as const;

// Query Keys
export const RECEPTION_QUERY_KEYS = {
  all: ["reception"] as const,
  stats: (date?: string) =>
    [...RECEPTION_QUERY_KEYS.all, "stats", date] as const,
  queue: () => [...RECEPTION_QUERY_KEYS.all, "queue"] as const,
  doctors: (date?: string, departmentId?: string) =>
    [...RECEPTION_QUERY_KEYS.all, "doctors", date, departmentId] as const,
} as const;

// Refresh Intervals (ms)
export const REFRESH_INTERVALS = {
  STATS: 30000, // 30 seconds
  QUEUE: 10000, // 10 seconds
  DOCTORS: 60000, // 1 minute
} as const;
