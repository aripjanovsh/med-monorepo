export const VISIT_STATUS = {
  WAITING: "WAITING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
} as const;

export type VisitStatus = (typeof VISIT_STATUS)[keyof typeof VISIT_STATUS];

export const VISIT_STATUS_OPTIONS = [
  { value: "WAITING", label: "Ожидает" },
  { value: "IN_PROGRESS", label: "В процессе" },
  { value: "COMPLETED", label: "Завершен" },
  { value: "CANCELED", label: "Отменен" },
] as const;

export const VISIT_STATUS_LABELS: Record<string, string> = {
  WAITING: "Ожидает",
  IN_PROGRESS: "В процессе",
  COMPLETED: "Завершен",
  CANCELED: "Отменен",
};

export const VISIT_STATUS_COLORS: Record<
  string,
  "default" | "destructive" | "outline" | "secondary"
> = {
  WAITING: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "outline",
  CANCELED: "destructive",
};
