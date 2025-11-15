export const APPOINTMENT_STATUS = {
  SCHEDULED: "SCHEDULED",
  CONFIRMED: "CONFIRMED",
  IN_QUEUE: "IN_QUEUE",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
} as const;

export type AppointmentStatus =
  (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Запланирован",
  CONFIRMED: "Подтвержден",
  IN_QUEUE: "В очереди",
  IN_PROGRESS: "Идет прием",
  COMPLETED: "Завершен",
  CANCELLED: "Отменен",
  NO_SHOW: "Не явился",
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  CONFIRMED:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  IN_QUEUE:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  IN_PROGRESS:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  COMPLETED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  NO_SHOW:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

export const APPOINTMENT_STATUS_OPTIONS = Object.entries(
  APPOINTMENT_STATUS_LABELS,
).map(([value, label]) => ({
  value,
  label,
}));
